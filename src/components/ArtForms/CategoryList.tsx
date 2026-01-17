/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MoreVertical } from "lucide-react";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import {
  deleteCategoryApi,
  getAllCategoriesApi,
  deleteArtTypeApi,
} from "../../api/artCategoryApi";
import toast from "react-hot-toast";
import { HOST_URL } from "../../api/api";

type ArtType = {
  _id?: string;
  name: string;
  description: string;
  image: string;
};

type Category = {
  _id: string;
  name: string;
  description: string;
  image: string;
  artTypes: ArtType[];
};

type ViewArt = ArtType & { category: Category };

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewArt, setViewArt] = useState<ViewArt | null>(null);

  const [sortKey, setSortKey] = useState<"name" | "count" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filterOpen, setFilterOpen] = useState(false);
  const [tempCategory, setTempCategory] = useState("");
  const [appliedCategory, setAppliedCategory] = useState("");

  const navigate = useNavigate();

  /* ---------- LOAD ---------- */
  async function load() {
    const res = await getAllCategoriesApi();
    const formatted = res.data.data.map((a: any) => ({
            ...a,
            image: `${HOST_URL + a.image}`,
          }))
    setCategories(formatted);
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------- OUTSIDE CLICK FILTER ---------- */
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".filter-box") && !target.closest(".filter-btn")) {
        setFilterOpen(false);
      }
    }

    if (filterOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  /* ---------- OUTSIDE CLICK MENU ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".cat-menu")) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clearFilters = () => {
    setAppliedCategory("");
    setTempCategory("");
    setFilterOpen(false);
  };

  /* ---------- FILTER + SORT ---------- */
  const filteredCategories = categories
    .filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = appliedCategory
        ? cat.name === appliedCategory
        : true;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;

      let valA: any;
      let valB: any;

      if (sortKey === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      if (sortKey === "count") {
        valA = a.artTypes.length;
        valB = b.artTypes.length;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  async function handleDelete(id: string) {
    try {
      await deleteCategoryApi(id);
      toast.success("Category deleted");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  }

  async function handleDeleteType() {
    try {
      await deleteArtTypeApi(viewArt!.category._id, viewArt!._id as string);
      toast.success("Art type deleted");
      setViewArt(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

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

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full sm:w-72 focus:ring-2 focus:ring-[#83261D] outline-none"
          />

          {appliedCategory && (
            <div className="flex gap-2 bg-[#F8E7DC] text-[#83261D] px-3 py-1.5 rounded-full text-sm border border-red-200">
              <span>Category: {appliedCategory}</span>

              <button
                onClick={() => {
                  setAppliedCategory("");
                  setTempCategory("");
                }}
                className="font-bold hover:text-black">
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-[#83261D] border border-red-200 rounded-lg hover:bg-[#F8E7DC] whitespace-nowrap">
            Clear Filter
          </button>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 border px-4 py-2 rounded-xl w-fit filter-btn">
            <PiSlidersHorizontalBold />
            Filter
          </button>

          {filterOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white border rounded-xl shadow-xl p-4 z-30 filter-box">
              <p className="text-sm font-semibold mb-2">Filter by Category</p>

              <select
                value={tempCategory}
                onChange={(e) => setTempCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4">
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 border rounded-lg text-sm">
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setAppliedCategory(tempCategory);
                    setFilterOpen(false);
                  }}
                  className="px-3 py-1.5 bg-[#83261D] text-white rounded-lg text-sm">
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="my-3" />

      {/* TABLE */}
      <table className="w-full text-sm border border-[#F1EEE7]">
        <thead className="bg-white">
          <tr>
            <th className="p-3 text-left">Image</th>

            <th
              className="p-3 text-left cursor-pointer select-none"
              onClick={() => {
                setSortKey("name");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}>
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

            <th
              className="p-3 text-left cursor-pointer select-none"
              onClick={() => {
                setSortKey("count");
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}>
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
            return (
              <tr key={cat._id} className="border-t align-top">
                <td className="p-3">
                  <img
                    src={import.meta.env.VITE_API_BASE_URL + cat.image}
                    className="w-12 h-12 rounded object-cover border"
                  />
                </td>

                <td className="p-3 font-medium">{cat.name}</td>
                <td className="p-3 text-gray-600">{cat.description}</td>

                <td className="p-3 text-gray-700">
                  {cat.artTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {cat.artTypes.map((a) => (
                        <span
                          key={a._id}
                          onClick={() => setViewArt({ ...a, category: cat })}
                          className="px-2 py-1 bg-gray-100 rounded text-xs cursor-pointer hover:bg-gray-200">
                          {a.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No art types</span>
                  )}
                </td>

                <td className="p-3 text-right relative cat-menu">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === cat._id ? null : cat._id)
                    }>
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === cat._id && (
                    <div className="absolute right-3 top-9 w-28 bg-white border rounded-lg shadow z-20">
                      <button
                        onClick={() =>
                          navigate("/categories/add", { state: cat })
                        }
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                        Update
                      </button>

                      <button
                        onClick={() => handleDelete(cat._id)}
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

      {viewArt && (
        <div className="fixed inset-0 soft-blur flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden relative shadow-[0_30px_70px_rgba(0,0,0,0.5)] border border-white/20 animate-in zoom-in-95 duration-300">
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

            <div className="relative h-80 w-full overflow-hidden bg-gray-100">
              <img
                src={import.meta.env.VITE_API_BASE_URL + viewArt.image}
                alt={viewArt.name}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
              />
            </div>

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
            <div className="flex justify-end gap-3 m-4">
              <button
                onClick={() =>
                  navigate("/categories/add", {
                    state: { mode: "editArtType", data: viewArt },
                  })
                }
                className="px-4 py-2 bg-[#83261D] text-white rounded-lg">
                Update
              </button>
              <button
                onClick={() => handleDeleteType()}
                className="px-4 py-2 border rounded-lg text-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
