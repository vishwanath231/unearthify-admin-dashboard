import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export type ArtDetail = {
  id: string;
  categoryId: string;
  artFormId: string;
  language: string;
  state: string;
  materials: string;
  region: string;
  famousArtist: string;
  performers: string;
  typicalLength: string;
  origin: string;
  website: string;
};


const STORAGE_KEY = "art_details";
const EDIT_KEY = "art_detail_editing";

export default function AddArtDetail() {
  const empty: ArtDetail = {
  id: "",
  categoryId: "",
  artFormId: "",
  language: "",
  state: "",
  materials: "",
  region: "",
  famousArtist: "",
  performers: "",
  typicalLength: "",
  origin: "",
  website: "",
};

type Category = { id: string; name: string };
type ArtForm = { id: string; name: string; categoryId: string };

const [categories, setCategories] = useState<Category[]>([]);
const [artForms, setArtForms] = useState<ArtForm[]>([]);
  const [form, setForm] = useState<ArtDetail>(empty);
  const [editing, setEditing] = useState<ArtDetail | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
  const catData = localStorage.getItem("art_categories");
  const artData = localStorage.getItem("art_forms");

  setCategories(catData ? JSON.parse(catData) : []);
  setArtForms(artData ? JSON.parse(artData) : []);
}, []);

const filteredArtForms = artForms.filter(
  (a) => a.categoryId === form.categoryId
);


  useEffect(() => {
    const editData = localStorage.getItem(EDIT_KEY);
    if (editData) {
      const parsed = JSON.parse(editData);
      setEditing(parsed);
      setForm(parsed);
    }

    const handler = () => {
      const data = localStorage.getItem(EDIT_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setEditing(parsed);
        setForm(parsed);
      }
    };

    window.addEventListener("artdetail-edit", handler);
    return () => window.removeEventListener("artdetail-edit", handler);
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit() {
    const urlRegex = /^https?:\/\/.+/;

    if (!urlRegex.test(form.website)) {
      toast.error("Website must start with http:// or https://");
      return;
    }

    if (
  !form.categoryId ||
  !form.artFormId ||
  !form.language ||
  !form.state
)
 {
      toast.error("Fill all required fields");
      return;
    }

    const existing = localStorage.getItem(STORAGE_KEY);
    const details: ArtDetail[] = existing ? JSON.parse(existing) : [];

    let updated: ArtDetail[];

    if (editing) {
      updated = details.map((d) =>
        d.id === editing.id ? { ...form, id: editing.id } : d
      );
      toast.success("Details updated");
      localStorage.removeItem(EDIT_KEY);
      setEditing(null);
    } else {
      updated = [...details, { ...form, id: Date.now().toString() }];
      toast.success("Details added");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("artdetails-updated"));
    navigate("/art-details");

    setForm(empty);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-8">
      {/* Basic */}
      <div className="space-y-4">
  <h2 className="font-semibold text-gray-700">Basic Information</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    {/* CATEGORY */}
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">Category</label>
      <select
        value={form.categoryId}
        onChange={(e) =>
          setForm({ ...form, categoryId: e.target.value, artFormId: "" })
        }
        className="input mt-1"
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>

    {/* ART TYPE */}
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">Art Type</label>
      <select
        value={form.artFormId}
        onChange={(e) =>
          setForm({ ...form, artFormId: e.target.value })
        }
        className="input mt-1"
        disabled={!form.categoryId}
      >
        <option value="">Select art type</option>
        {filteredArtForms.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>

  </div>
</div>


      {/* Classification */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">Classification</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Language</label>
            <input
              name="language"
              placeholder="Eg: Malayalam"
              className="input mt-1"
              value={form.language}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">State</label>
            <input
              name="state"
              placeholder="Eg: Kerala"
              className="input mt-1"
              value={form.state}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Materials</label>
            <input
              name="materials"
              placeholder="Eg: Bamboo, natural pigments,  fabrics"
              className="input mt-1"
              value={form.materials}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Region</label>
            <input
              name="region"
              placeholder="Eg: South Region"
              className="input mt-1"
              value={form.region}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Artists */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">Artists & Performance</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Famous Artist</label>
            <input
              name="famousArtist"
              placeholder="Eg: Kalamandalam Gopi"
              className="input mt-1"
              value={form.famousArtist}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Contemporary Performers
            </label>
            <input
              name="performers"
              placeholder="Eg: Modern Kathakali artists"
              className="input mt-1"
              value={form.performers}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Typical Length</label>
            <input
              name="typicalLength"
              placeholder="Eg: 2 to 4 hours"
              className="input mt-1"
              value={form.typicalLength}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Origin</label>
            <input
              name="origin"
              placeholder="Eg: Kerala temples and royal courts"
              className="input mt-1"
              value={form.origin}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">Reference</h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Website Link</label>
          <input
            name="website"
            placeholder="Eg: https://kathakali.org"
            className="input mt-1"
            value={form.website}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Action */}
       <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate("/art-details")}
          className="px-5 py-2 bg-[#83261D] text-white border rounded-lg">
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="px-5 py-2 bg-[#83261D] text-white rounded-lg">
          {editing ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}
