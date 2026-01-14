import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { createArtDetailApi } from "../../api/artDetailApi";
import api from "../../api/artDetailApi";

type ArtForm = {
  _id: string;
  name: string;
};

type Category = {
  _id: string;
  name: string;
  artTypes: ArtForm[];
};

export default function AddArtDetail() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [artForms, setArtForms] = useState<ArtForm[]>([]);

  const [form, setForm] = useState({
    categoryId: "",
    artTypeId: "",
    language: "",
    state: "",
    materials: "",
    region: "",
    famousArtist: "",
    performers: "",
    typicalLength: "",
    origin: "",
    website: "",
  });

  /* ===== LOAD CATEGORIES ===== */
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data);
      } catch {
        toast.error("Failed to load categories");
      }
    }

    loadCategories();
  }, []);

  /* ===== CATEGORY CHANGE ===== */
  function handleCategoryChange(categoryId: string) {
    const selected = categories.find((c) => c._id === categoryId);

    setForm({ ...form, categoryId, artTypeId: "" });
    setArtForms(selected ? selected.artTypes : []);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ===== SUBMIT ===== */
  async function handleSubmit() {
    try {
      await createArtDetailApi({
        categoryId: form.categoryId,
        artTypeId: form.artTypeId,
        language: form.language,
        state: form.state,
        materials: form.materials,
        region: form.region,
        famousArtist: form.famousArtist,
        contemporaryPerformers: form.performers,
        typicalLength: form.typicalLength,
        origin: form.origin,
        websiteLink: form.website,
      });

      toast.success("Art detail added");
      navigate("/art-details");
    } catch {
      toast.error("Create failed");
    }
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
        onChange={ (e) => handleCategoryChange(e.target.value)}
        className="input mt-1"
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>

    {/* ART TYPE */}
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">Art Type</label>
      <select
        value={form.artTypeId}
        onChange={(e) =>
          setForm({ ...form, artTypeId: e.target.value })
        }
        className="input mt-1"
        disabled={!form.categoryId}
      >
        <option value="">Select art type</option>
        {artForms.map((a) => (
          <option key={a._id} value={a._id}>
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
          {/* {editing ? "Update" : "Save"} */}Save
        </button>
      </div>
    </div>
  );
}
