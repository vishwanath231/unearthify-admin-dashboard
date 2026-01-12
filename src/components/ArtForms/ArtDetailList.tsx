import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArtDetail } from "./AddArtDetail";
import { useNavigate } from "react-router";

const STORAGE_KEY = "art_details";
const EDIT_KEY = "art_detail_editing";

export default function ArtDetailList() {
  const [details, setDetails] = useState<ArtDetail[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setDetails(JSON.parse(data));
    else setDetails([]);
  }

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener("artdetails-updated", refresh);
    return () => window.removeEventListener("artdetails-updated", refresh);
  }, []);

  const filteredDetails = details.filter((d) => {
    const value = search.toLowerCase();

    return (
      d.origin.toLowerCase().includes(value) ||
      d.materials.toLowerCase().includes(value) ||
      d.famousArtist.toLowerCase().includes(value) ||
      d.region.toLowerCase().includes(value) ||
      d.website.toLowerCase().includes(value)
    );
  });

  function handleDelete(id: string) {
    const updated = details.filter((d) => d.id !== id);
    setDetails(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function handleEdit(item: ArtDetail) {
    localStorage.setItem(EDIT_KEY, JSON.stringify(item));
    navigate("/art-details/add");
    window.dispatchEvent(new Event("artdetail-edit"));
    toast.success("Details loaded in form");
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Art Details List</h2>
        <button
          onClick={() => navigate("/art-details/add")}
          className="bg-[#83261D] text-white px-4 py-2 rounded-lg">
          + Add Art Details
        </button>
      </div>
      <hr className="my-3" />

      <div className="mb-4 flex justify-around">
        <input
          type="text"
          placeholder="Search art details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full sm:w-80 focus:ring-2 focus:ring-[#83261D] outline-none"
        />
      </div>

      <hr className="my-3" />

      <table className="w-full text-sm border border-[#F1EEE7]">
        <thead className="bg-white">
          <tr>
            <th className="p-3 text-left">Origin</th>
            <th className="p-3 text-left">Materials</th>
            <th className="p-3 text-left">Famous Artist</th>
            <th className="p-3 text-left">Region</th>
            <th className="p-3 text-left">Website</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredDetails.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="p-3 truncate max-w-[220px]">{d.origin}</td>
              <td className="p-3">{d.materials}</td>
              <td className="p-3">{d.famousArtist}</td>
              <td className="p-3">{d.region}</td>
              <td className="p-3">{d.website}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(d)}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {filteredDetails.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-400">
                No art details added
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
