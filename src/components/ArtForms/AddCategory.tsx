/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, ChangeEvent } from "react";
import CreatableSelect from "react-select/creatable";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router";

type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
};

type ArtType = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export default function AddCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryInput, setCategoryInput] = useState("");

  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [categoryImageError, setCategoryImageError] = useState("");
  const categoryFileRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state as any;

  const [artTypes, setArtTypes] = useState<ArtType[]>([
    { id: Date.now().toString(), name: "", description: "", image: "" },
  ]);

  /* ---------- LOAD ---------- */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("art_categories") || "[]");
    setCategories(stored);

    if (editData) {
      setSelectedCategory({
        value: editData.id,
        label: editData.name,
      });
      setCategoryDescription(editData.description);
      setCategoryImage(editData.image);
    }
  }, []);

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  /* ---------- CATEGORY SELECT ---------- */
  function handleCategorySelect(option: any) {
    if (!option) {
      setSelectedCategory(null);
      setCategoryDescription("");
      setCategoryImage("");
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
      setCategoryImage("");
    }

    // EXISTING CATEGORY
    else {
  const found = categories.find((c) => c.id === option.value);
  if (!found) return;

  setSelectedCategory({ value: found.id, label: found.name });
  setCategoryDescription(found.description);
  setCategoryImage(found.image);

  // ✅ RESET art types cleanly
  setArtTypes([
    { id: Date.now().toString(), name: "", description: "", image: "" },
  ]);

  // ✅ clear old errors
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setCategoryImage(reader.result as string);
      setCategoryImageError("");
    };
    reader.readAsDataURL(file);
  }

  function removeCategoryImage() {
    setCategoryImage("");
    setCategoryImageError("");
    if (categoryFileRef.current) categoryFileRef.current.value = "";
  }

  /* ---------- ART TYPES ---------- */
  function updateArtType(id: string, key: keyof ArtType, value: string) {
    setArtTypes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [key]: value } : a))
    );
  }

  function handleArtImage(id: string, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateArtType(id, "image", reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function addArtType() {
    setArtTypes((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", description: "", image: "" },
    ]);
  }

  function removeArtType(id: string) {
    setArtTypes((prev) => prev.filter((a) => a.id !== id));
  }

  /* ---------- SUBMIT ---------- */
 function handleSubmit() {
  console.log("SUBMIT HIT", selectedCategory, artTypes);

  if (!selectedCategory) {
    toast.error("Select or create category");
    return;
  }

  if (selectedCategory.isNew === true) {
    if (!categoryDescription.trim()) {
      toast.error("Category description required");
      return;
    }
    if (!categoryImage) {
      toast.error("Category image required");
      return;
    }
  }

  for (let i = 0; i < artTypes.length; i++) {
    const art = artTypes[i];
    if (!art.name.trim()) {
      toast.error(`Art type ${i + 1}: name required`);
      return;
    }
    if (!art.description.trim()) {
      toast.error(`Art type ${i + 1}: description required`);
      return;
    }
    if (!art.image) {
      toast.error(`Art type ${i + 1}: image required`);
      return;
    }
  }

  let categoryId = selectedCategory.value;

  if (selectedCategory.isNew === true) {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: selectedCategory.label,
      description: categoryDescription,
      image: categoryImage,
    };

    const updated = [...categories, newCategory];
    localStorage.setItem("art_categories", JSON.stringify(updated));

    categoryId = newCategory.id;
  }

  const storedForms = JSON.parse(localStorage.getItem("art_forms") || "[]");

  const newForms = artTypes.map((a) => ({
    id: Date.now().toString() + Math.random(),
    name: a.name,
    description: a.description,
    image: a.image,
    categoryId,
  }));

  try {
  localStorage.setItem(
    "art_forms",
    JSON.stringify([...storedForms, ...newForms])
  );
} catch (err) {
  console.error(err);
  toast.error("Storage limit exceeded. Please delete some old data.");
  return;
}

  toast.success("Saved successfully");
  navigate("/categories");
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
        If you create a new category, description and image will be required.
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
                    src={categoryImage}
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
            className="bg-black text-white px-3 py-1 rounded text-sm">
            + Assign another art type
          </button>
        </div>

        {artTypes.map((art) => (
          <div key={art.id} className="border rounded-lg p-4 space-y-3">
            {artTypes.length > 1 && (
              <div className="flex justify-end">
                <button
                  onClick={() => removeArtType(art.id)}
                  className="text-red-600 text-sm">
                  Remove
                </button>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">Art Type Name</label>
              <input
                value={art.name}
                onChange={(e) => updateArtType(art.id, "name", e.target.value)}
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
                  updateArtType(art.id, "description", e.target.value)
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
                    onChange={(e) => handleArtImage(art.id, e)}
                    className="hidden"
                  />
                </label>

                {art.image && (
                  <div className="relative w-24 h-24">
                    <img
                      src={art.image}
                      className="w-full h-full object-cover rounded border"
                    />
                    <button
                      onClick={() => updateArtType(art.id, "image", "")}
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
          className="px-5 py-2 border rounded-lg">
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
