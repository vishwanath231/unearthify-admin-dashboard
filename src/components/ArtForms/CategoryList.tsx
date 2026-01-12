/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MoreVertical } from "lucide-react";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";

const STORAGE_KEY = "art_categories";
const ART_FORM_KEY = "art_forms";

type ArtForm = {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
};
type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [artForms, setArtForms] = useState<ArtForm[]>([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewArt, setViewArt] = useState<ArtForm | null>(null);

  // 🔥 SORT STATE
  const [sortKey, setSortKey] = useState<"name" | "count" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const navigate = useNavigate();

  function load() {
    const catData = localStorage.getItem(STORAGE_KEY);
    const artData = localStorage.getItem(ART_FORM_KEY);

    setCategories(catData ? JSON.parse(catData) : []);
    setArtForms(artData ? JSON.parse(artData) : []);
  }

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener("categories-updated", refresh);
    window.addEventListener("artforms-updated", refresh);

    return () => {
      window.removeEventListener("categories-updated", refresh);
      window.removeEventListener("artforms-updated", refresh);
    };
  }, []);

  /* ---------- OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".cat-menu")) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- HELPERS ---------- */
  function getArtTypes(categoryId: string) {
    return artForms.filter((a) => a.categoryId === categoryId);
  }

  /* ---------- FILTER + SORT ---------- */
  const filteredCategories = categories
    .filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortKey) return 0;

      let valA: any;
      let valB: any;

      if (sortKey === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      if (sortKey === "count") {
        valA = getArtTypes(a.id).length;
        valB = getArtTypes(b.id).length;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  function handleDelete(id: string) {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      {/* HEADER */}
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => navigate("/categories/add")}
          className="bg-[#83261D] text-white px-4 py-2 rounded-lg">
          + Add Categories
        </button>
      </div>

      <hr className="my-3" />

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded-lg w-full sm:w-72 focus:ring-2 focus:ring-[#83261D] outline-none mb-4"
      />

      <hr className="my-3" />

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[#F1EEE7]">
          <thead className="bg-white">
            <tr>
              <th className="p-3 text-left">Image</th>

              {/* 🔤 NAME SORT */}
              <th
                className="p-3 text-left cursor-pointer select-none"
                onClick={() => {
                  setSortKey("name");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-1">
                  <span>Name</span>
                  <div className="flex flex-col leading-none">
                    <TiArrowSortedUp
                      size={14}
                      className={
                        sortKey === "name" && sortOrder === "asc"
                          ? "text-black"
                          : "text-gray-300"
                      }
                    />
                    <TiArrowSortedDown
                      size={14}
                      className={
                        sortKey === "name" && sortOrder === "desc"
                          ? "text-black"
                          : "text-gray-300"
                      }
                    />
                  </div>
                </div>
              </th>

              <th className="p-3 text-left">Description</th>

              {/* 🔢 NUMBER SORT */}
              <th
                className="p-3 text-left cursor-pointer select-none"
                onClick={() => {
                  setSortKey("count");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center gap-1">
                  <span>Art Types</span>
                  <div className="flex flex-col leading-none">
                    <TiArrowSortedUp
                      size={14}
                      className={
                        sortKey === "count" && sortOrder === "asc"
                          ? "text-black"
                          : "text-gray-300"
                      }
                    />
                    <TiArrowSortedDown
                      size={14}
                      className={
                        sortKey === "count" && sortOrder === "desc"
                          ? "text-black"
                          : "text-gray-300"
                      }
                    />
                  </div>
                </div>
              </th>

              <th className="p-3 text-right"></th>
            </tr>
          </thead>

          <tbody>
            {filteredCategories.map((cat) => {
              const arts = getArtTypes(cat.id);

              return (
                <tr key={cat.id} className="border-t align-top">
                  <td className="p-3">
                    <img
                      src={cat.image}
                      className="w-12 h-12 rounded object-cover border"
                    />
                  </td>

                  <td className="p-3 font-medium">{cat.name}</td>
                  <td className="p-3 text-gray-600">{cat.description}</td>

                  <td className="p-3 text-gray-700">
                    {arts.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {arts.map((a) => (
                          <span
                            key={a.id}
                            onClick={() => setViewArt(a)}
                            className="px-2 py-1 bg-gray-100 rounded text-xs cursor-pointer hover:bg-gray-200">
                            {a.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">
                        No art types
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right relative cat-menu">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === cat.id ? null : cat.id)
                      }>
                      <MoreVertical size={18} />
                    </button>

                    {openMenu === cat.id && (
                      <div className="absolute right-3 top-9 w-28 bg-white border rounded-lg shadow z-20">
                        <button
                          onClick={() =>
                            navigate("/categories/add", { state: cat })
                          }
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100">
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {filteredCategories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL (unchanged) */}
      {viewArt && (
        <div className="fixed inset-0 soft-blur flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden relative shadow-[0_30px_70px_rgba(0,0,0,0.5)] border border-white/20 animate-in zoom-in-95 duration-300">
            {/* ❌ ELEGANT CLOSE BUTTON */}
            <button
              onClick={() => setViewArt(null)}
              className="absolute top-5 right-5 z-50 bg-black hover:bg-[#83261D] backdrop-blur-md text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-xl group border border-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:rotate-90 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* 🖼️ HERO BANNER */}
            <div className="relative h-80 w-full overflow-hidden bg-gray-100">
              <img
                src={viewArt.image}
                alt={viewArt.name}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
              />
            </div>

            {/* 📄 CONTENT SECTION */}
            <div className="px-10 pb-10 pt-8 relative">
              {/* Label */}
              <span className="inline-block mb-2 text-xs font-bold tracking-widest text-[#83261D] uppercase">
                Art Type
              </span>

              {/* Title */}
              <h2 className="text-3xl font-black tracking-tighter leading-none mb-6">
                {viewArt.name}
              </h2>

              {/* Description */}
              <span className="inline-block mb-2 text-xs font-bold tracking-widest text-[#83261D] uppercase">
                Type Description
              </span>
              <div className="relative">
                <p className="text-3xl font-black tracking-tighter leading-none mb-6">
                  {viewArt.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
