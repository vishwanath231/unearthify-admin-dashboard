/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, ChangeEvent } from "react";
import CreatableSelect from "react-select/creatable";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { getAllCategoriesApi } from "../../api/artCategoryApi";
import api from "../../api/axios";

type Category = {
  _id: string;
  name: string;
  description: string;
  image: string;
};

type ArtType = {
  _id: string;
  name: string;
  description: string;
  image: File | null;
};

export default function AddCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryInput, setCategoryInput] = useState("");

  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImageError, setCategoryImageError] = useState("");
  const categoryFileRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  const [artTypes, setArtTypes] = useState<ArtType[]>([
    { id: Date.now().toString(), name: "", description: "", image: null },
  ]);

  /* ---------- LOAD ---------- */

  useEffect(() => {
    async function load() {
      const res = await getAllCategoriesApi();
      setCategories(res.data.data);
    }
    load();
  }, []);

  useEffect(() => {
  return () => {
    if (categoryImage) URL.revokeObjectURL(URL.createObjectURL(categoryImage));
    artTypes.forEach(a => {
      if (a.image) URL.revokeObjectURL(URL.createObjectURL(a.image));
    });
  };
}, [categoryImage, artTypes]);

  const categoryOptions = categories.map((c) => ({
    value: c._id,
    label: c.name,
  }));

  /* ---------- CATEGORY SELECT ---------- */
  function handleCategorySelect(option: any) {
    if (!option) {
      setSelectedCategory(null);
      setCategoryDescription("");
      setCategoryImage(null);
      return;
    }

    // NEW CATEGORY
    if (option.__isNew__) {
      const exists = categories.find(
        (c) => c.name.toLowerCase() === option.label.toLowerCase()
      );

      if (exists) {
        toast.error("Category already exists");
        setSelectedCategory(null);
        return;
      }

      setSelectedCategory({ label: option.label, isNew: true });
      setCategoryDescription("");
      setCategoryImage(null);
    }

    // EXISTING CATEGORY
    else {
      const found = categories.find((c) => c._id === option.value);
      if (!found) return;

      setSelectedCategory({ value: found._id, label: found.name });
      setCategoryDescription(found.description);
      setArtTypes([
        { id: Date.now().toString(), name: "", description: "", image: null },
      ]);

      setCategoryImageError("");
    }
  }

  /* ---------- CATEGORY IMAGE ---------- */
  function handleCategoryImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setCategoryImageError("Image must be less than 2MB");
      return;
    }

    setCategoryImage(file);
    setCategoryImageError("");
  }

  function removeCategoryImage() {
    setCategoryImage(null);
    setCategoryImageError("");
    if (categoryFileRef.current) categoryFileRef.current.value = "";
  }

  /* ---------- ART TYPES ---------- */
  function updateArtType(id: string, key: keyof ArtType, value: any) {
    setArtTypes((prev) =>
      prev.map((a) => (a._id === id ? { ...a, [key]: value } : a))
    );
  }

  function handleArtImage(id: string, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    updateArtType(id, "image", file);
  }

  function addArtType() {
    setArtTypes((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", description: "", image: null },
    ]);
  }

  function removeArtType(id: string) {
    setArtTypes((prev) => prev.filter((a) => a._id !== id));
  }

  /* ---------- SUBMIT ---------- */
  async function handleSubmit() {
    if (!selectedCategory) {
      toast.error("Select or create category");
      return;
    }

    if (!categoryDescription.trim()) {
      toast.error("Category description required");
      return;
    }

    if (selectedCategory?.isNew && !categoryImage) {
      toast.error("Category image required");
      return;
    }

    for (let i = 0; i < artTypes.length; i++) {
      if (!artTypes[i].name || !artTypes[i].description || !artTypes[i].image) {
        toast.error("All art type fields required");
        return;
      }
    }

    try {
      const formData = new FormData();

      formData.append("categoryName", selectedCategory.label);
      formData.append("categoryDescription", categoryDescription);

      // category image
      if (categoryImage) {
        formData.append("categoryImage", categoryImage);
      }

      // art types text
      const artPayload = artTypes.map((a) => ({
        name: a.name,
        description: a.description,
      }));

      formData.append("artTypes", JSON.stringify(artPayload));

      artTypes.forEach((a) => {
        if (a.image) formData.append("image", a.image);
      });

      if (!selectedCategory.isNew) {
        toast.error("Select a new category only. Existing coming next step.");
        return;
      }

      await api.post("/categories", formData);

      toast.success("Category created");
      navigate("/categories");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-8">
      {/* CATEGORY */}
      <div className="border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-lg">Category</h2>

        <div className="space-y-1 relative">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
              Select or Create Category
            </label>

            <div className="group relative cursor-pointer">
              <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold rounded-full bg-gray-200 text-gray-700">
                i
              </span>

              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 scale-0 group-hover:scale-100 transition-transform origin-top bg-black text-white text-xs rounded-lg px-3 py-2 z-50 shadow-lg">
                Choose an existing category or type a new one to create it.
                <br />
                If you create a new category, description and image will be
                required.
              </div>
            </div>
          </div>

          <CreatableSelect
            isClearable
            options={categoryOptions}
            value={selectedCategory}
            inputValue={categoryInput}
            onInputChange={(val) => setCategoryInput(val)}
            onChange={handleCategorySelect}
            placeholder="Select or type category..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Category Description</label>
          <textarea
            disabled={selectedCategory && !selectedCategory.isNew}
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            className="input h-24 disabled:bg-gray-100"
            placeholder="Category description"
          />
        </div>

        {selectedCategory?.isNew && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Category Image</label>

            <div className="flex items-center gap-4">
              <label className="px-4 py-2 border rounded cursor-pointer bg-gray-50">
                Choose Image
                <input
                  ref={categoryFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImage}
                  className="hidden"
                />
              </label>

              {categoryImage && (
                <div className="relative w-24 h-24">
                  <img
                    src={URL.createObjectURL(categoryImage)}
                    className="w-full h-full object-cover rounded border"
                  />
                  <button
                    onClick={removeCategoryImage}
                    className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full">
                    ×
                  </button>
                </div>
              )}
            </div>

            {categoryImageError && (
              <p className="text-red-500 text-sm">{categoryImageError}</p>
            )}
          </div>
        )}
      </div>

      {/* ART TYPES */}
      <div className="border rounded-xl p-5 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Art Types</h2>
          <button
            onClick={addArtType}
            className="bg-[#83261D] text-white px-3 py-1 rounded text-sm">
            + Assign another art type
          </button>
        </div>

        {artTypes.map((art) => (
          <div key={art._id} className="border rounded-lg p-4 space-y-3">
            {artTypes.length > 1 && (
              <div className="flex justify-end">
                <button
                  onClick={() => removeArtType(art._id)}
                  className="text-red-600 text-sm">
                  Remove
                </button>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">Art Type Name</label>
              <input
                value={art.name}
                onChange={(e) => updateArtType(art._id, "name", e.target.value)}
                className="input"
                placeholder="Art type name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Art Type Description
              </label>
              <textarea
                value={art.description}
                onChange={(e) =>
                  updateArtType(art._id, "description", e.target.value)
                }
                className="input h-24"
                placeholder="Art type description"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Art Type Image</label>

              <div className="flex items-center gap-4">
                <label className="px-4 py-2 border rounded cursor-pointer bg-gray-50">
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleArtImage(art._id, e)}
                    className="hidden"
                  />
                </label>

                {art.image && (
                  <div className="relative w-24 h-24">
                    <img
                      src={URL.createObjectURL(art.image)}
                      className="w-full h-full object-cover rounded border"
                    />
                    <button
                      onClick={() => updateArtType(art.id, "image", null)}
                      className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full">
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ACTION */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate("/categories")}
          className="px-5 py-2 bg-[#83261D] text-white border rounded-lg">
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="px-5 py-2 bg-[#83261D] text-white rounded-lg">
          Save
        </button>
      </div>
    </div>
  );
}
