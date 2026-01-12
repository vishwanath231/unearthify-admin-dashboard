import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
};

const STORAGE_KEY = "art_categories";
const EDIT_KEY = "art_category_editing";

export default function AddCategory() {
  const empty: Category = { id: "", name: "", description: "", image: "" };

  const [form, setForm] = useState<Category>(empty);
  const [preview, setPreview] = useState<string>("");
  const [editing, setEditing] = useState<Category | null>(null);
  const navigate = useNavigate();

  const fileRef = useRef<HTMLInputElement | null>(null);

  /* 🔥 Load edit data if exists */
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

    window.addEventListener("category-edit", handler);
    return () => window.removeEventListener("category-edit", handler);
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
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
    if (!form.name || !form.description || !form.image) {
      toast.error("All fields are required");
      return;
    }

    const existing = localStorage.getItem(STORAGE_KEY);
    const categories: Category[] = existing ? JSON.parse(existing) : [];

    let updated: Category[];

    if (editing) {
      updated = categories.map((c) =>
        c.id === editing.id ? { ...form, id: editing.id } : c
      );
      toast.success("Category updated");
      localStorage.removeItem(EDIT_KEY);
      setEditing(null);
    } else {
      updated = [...categories, { ...form, id: Date.now().toString() }];
      toast.success("Category added");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("categories-updated"));
    navigate("/categories-list");

    setForm(empty);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="relative bg-white p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Art Category Name</label>
            <input
              name="name"
              placeholder="Eg: Dance"
              className="input mt-1"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Upload Category Image</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="input mt-1"
              onChange={handleImage}
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium">Category Description</label>
            <textarea
              name="description"
              placeholder="Eg: Dance is a cultural art form..."
              className="input mt-1 min-h-[100px]"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="md:col-span-2 bg-[#83261D] text-white py-2 rounded">
            {editing ? "Update Category" : "Add Category"}
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
