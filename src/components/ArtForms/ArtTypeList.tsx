import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArtForm } from "./AddArtType";
import { useNavigate } from "react-router";

const STORAGE_KEY = "art_forms";
const EDIT_KEY = "art_form_editing";

export default function ArtTypeList() {
  const [forms, setForms] = useState<ArtForm[]>([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  function load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setForms(JSON.parse(data));
    else setForms([]);
  }

  useEffect(() => {
    load();

    const refresh = () => load();
    window.addEventListener("artforms-updated", refresh);

    return () => {
      window.removeEventListener("artforms-updated", refresh);
    };
  }, []);

  const filteredForms = forms.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.categoryId.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: string) {
    const updated = forms.filter((f) => f.id !== id);
    setForms(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function handleEdit(form: ArtForm) {
    localStorage.setItem(EDIT_KEY, JSON.stringify(form));
    navigate("/arttypes/add");
    window.dispatchEvent(new Event("artform-edit"));
    toast.success("Art form loaded in form");
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Art Types List</h2>
        <button
          onClick={() => navigate("/arttypes/add")}
          className="bg-[#83261D] text-white px-4 py-2 rounded-lg">
          + Add ArtType
        </button>
      </div>
      <hr className="my-3" />

      <div className="mb-4 flex justify-around">
        <input
          type="text"
          placeholder="Search by name or category..."
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
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredForms.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-3">
                <img src={a.image} className="w-12 h-12 rounded object-cover" />
              </td>
              <td className="p-3">{a.name}</td>
              <td className="p-3">{a.categoryId}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(a)}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs">
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(a.id)}
                    className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {filteredForms.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-400">
                No art forms added
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
