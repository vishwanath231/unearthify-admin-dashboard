import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export type ArtForm = {
  id: string;
  name: string;
  image: string;
  categoryId: string;
};

const STORAGE_KEY = "art_forms";
const EDIT_KEY = "art_form_editing";

export default function AddArtType() {
  const empty: ArtForm = { id: "", name: "", image: "", categoryId: "" };

  const [form, setForm] = useState<ArtForm>(empty);
  const [preview, setPreview] = useState<string>("");
  const [editing, setEditing] = useState<ArtForm | null>(null);
  const navigate = useNavigate();

  const fileRef = useRef<HTMLInputElement | null>(null);

  /* 🔥 load edit data */
  useEffect(() => {
    const editData = localStorage.getItem(EDIT_KEY);
    if (editData) {
      const parsed = JSON.parse(editData);
      setEditing(parsed);
      setForm(parsed);
      setPreview(parsed.image);
    }

    const handler = () => {
      const data = localStorage.getItem(EDIT_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setEditing(parsed);
        setForm(parsed);
        setPreview(parsed.image);
      }
    };

    window.addEventListener("artform-edit", handler);
    return () => window.removeEventListener("artform-edit", handler);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!form.name || !form.categoryId || !form.image) {
      toast.error("All fields are required");
      return;
    }

    const existing = localStorage.getItem(STORAGE_KEY);
    const forms: ArtForm[] = existing ? JSON.parse(existing) : [];

    let updated: ArtForm[];

    if (editing) {
      updated = forms.map((f) =>
        f.id === editing.id ? { ...form, id: editing.id } : f
      );
      toast.success("Art form updated");
      localStorage.removeItem(EDIT_KEY);
      setEditing(null);
    } else {
      updated = [...forms, { ...form, id: Date.now().toString() }];
      toast.success("Art form added");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("artforms-updated"));
    navigate("/arttypes-list");

    setForm(empty);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Art Form Name</label>
            <input
              name="name"
              placeholder="Eg: Kathakali"
              className="input mt-1"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Upload Art Form Image</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="input mt-1"
              onChange={handleImage}
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium">Category</label>
            <input
              name="categoryId"
              placeholder="Eg: Classical Dance"
              className="input mt-1"
              value={form.categoryId}
              onChange={handleChange}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="md:col-span-2 bg-[#83261D] text-white py-2 rounded">
            {editing ? "Update Art Form" : "Add Art Form"}
          </button>
        </div>

        <div className="flex items-center justify-center border rounded bg-gray-50 min-h-[200px]">
          {preview ? (
            <img
              src={preview}
              className="max-h-[200px] object-contain rounded"
            />
          ) : (
            <p className="text-gray-400 text-sm">Image preview</p>
          )}
        </div>
      </div>
    </div>
  );
}
