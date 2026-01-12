import { useEffect, useState } from "react";
import { Category } from "./AddCategory";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const STORAGE_KEY = "art_categories";
const EDIT_KEY = "art_category_editing";

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  function load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setCategories(JSON.parse(data));
    else setCategories([]);
  }

  useEffect(() => {
    load();

    const refresh = () => load();
    window.addEventListener("categories-updated", refresh);

    return () => {
      window.removeEventListener("categories-updated", refresh);
    };
  }, []);

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: string) {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function handleEdit(cat: Category) {
    localStorage.setItem(EDIT_KEY, JSON.stringify(cat));
    navigate("/categories/add");
    window.dispatchEvent(new Event("category-edit"));
    toast.success("Category loaded in form");
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Categories List</h2>
        <button
          onClick={() => navigate("/categories/add")}
          className="bg-[#83261D] text-white px-4 py-2 rounded-lg">
          + Add Categories
        </button>
      </div>
      <hr className="my-3" />

      <div className="mb-4 flex justify-around">
        <input
          type="text"
          placeholder="Search by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full sm:w-72 focus:ring-2 focus:ring-[#83261D] outline-none"
        />
      </div>

      <hr className="my-3" />

      <table className="w-full text-sm border border-[#F1EEE7]">
        <thead className="bg-white">
          <tr>
            <th className="p-3 text-left">Image</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredCategories.map((cat) => (
            <tr key={cat.id} className="border-t">
              <td className="p-3">
                <img
                  src={cat.image}
                  className="w-12 h-12 rounded object-cover"
                />
              </td>
              <td className="p-3">{cat.name}</td>
              <td className="p-3">{cat.description}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {filteredCategories.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-400">
                No categories added
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
