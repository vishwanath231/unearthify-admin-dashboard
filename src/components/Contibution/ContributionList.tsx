/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { PiSlidersHorizontalBold } from "react-icons/pi";

export type Contribution = {
  id: number;
  name: string;
  mobile: string;
  type: string;
  description: string;
};

type SortKey = "name" | "mobile" | "type";

export default function ContributionList() {
  const navigate = useNavigate();

  const [data, setData] = useState<Contribution[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [typeFilter, setTypeFilter] = useState("");

  const [tempType, setTempType] = useState("");
  const [page, setPage] = useState(1);
  const [viewContribution, setViewContribution] = useState<Contribution | null>(null);

  const ITEMS_PER_PAGE = 10;

  /* ---------- LOAD ---------- */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("contributions") || "[]");
    setData(stored);
  }, []);

  /* ---------- OUTSIDE CLICK (menu) ---------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".contribution-menu")) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------- OUTSIDE CLICK (filter) ---------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".filter-box") && !target.closest(".filter-btn")) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ---------- SORT ---------- */

  const sortData = (key: SortKey) => {
    const newOrder = sortKey === key && order === "asc" ? "desc" : "asc";
    setSortKey(key);
    setOrder(newOrder);

    const sorted = [...data].sort((a: any, b: any) => {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return newOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return newOrder === "asc"
        ? String(aVal).localeCompare(String(bVal), undefined, {
            sensitivity: "base",
          })
        : String(bVal).localeCompare(String(aVal), undefined, {
            sensitivity: "base",
          });
    });

    setData(sorted);
  };

  /* ---------- DELETE ---------- */
  const handleDelete = (id: number) => {
    const updated = data.filter((d) => d.id !== id);
    setData(updated);
    localStorage.setItem("contributions", JSON.stringify(updated));
  };

  /* ---------- ICON ---------- */
  const SortIcon = ({ col }: { col: SortKey }) => (
    <div className="flex flex-col leading-none">
      <TiArrowSortedUp
        size={14}
        className={
          sortKey === col && order === "asc" ? "text-black" : "text-gray-300"
        }
      />
      <TiArrowSortedDown
        size={14}
        className={
          sortKey === col && order === "desc" ? "text-black" : "text-gray-300"
        }
      />
    </div>
  );

  const headers: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "mobile", label: "Mobile" },
    { key: "type", label: "Contribution Type" },
  ];

  /* ---------- FILTERED DATA ---------- */
  const filteredData = data.filter((d) => {
  const value = search.toLowerCase();

  const matchesSearch =
    d.name.toLowerCase().includes(value) ||
    d.mobile.includes(search);

  const matchesType = typeFilter
    ? d.type.toLowerCase().includes(typeFilter.toLowerCase())
    : true;

  return matchesSearch && matchesType;
});


   /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filteredData.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  /* ---------- APPLY FILTER ---------- */
  const applyFilters = () => {
    setTypeFilter(tempType);
    setShowFilter(false);
    setTempType("");
  };

  const clearFilters = () => {
    setTypeFilter("");
    setTempType("");
    setShowFilter(false);
  };

  const removeTypeFilter = () => setTypeFilter("");

  return (
    <div className="p-6 bg-white rounded-xl shadow">

      {/* Header */}
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => navigate("/contribution/add")}
          className="bg-[#83261D] text-white px-4 py-2 rounded-lg">
          + Add Contribution
        </button>
      </div>

      <hr className="my-3" />

      {/* Search & filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

        <div className="flex flex-wrap items-center gap-2 w-full">

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            className="w-full md:w-72 border rounded-xl pl-4 pr-3 py-2 focus:ring-2 focus:ring-[#83261D] outline-none"
          />

          {typeFilter && (
            <span className="flex items-center gap-2 bg-blue-50 text-[#83261D] px-3 py-1 rounded-full text-xs">
              Type: {typeFilter}
              <button onClick={removeTypeFilter} className="font-bold">×</button>
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 whitespace-nowrap">
            Clear Filters
          </button>

          <button
            onClick={() => setShowFilter((p) => !p)}
            className="flex items-center gap-2 border px-4 py-2 rounded-xl filter-btn">
            <PiSlidersHorizontalBold /> Filter
          </button>
        </div>
      </div>

      <hr className="my-3" />

      {/* Filter box */}
      <div className="relative">
        {showFilter && (
          <div className="absolute right-0 mt-2 w-full sm:w-96 bg-white border rounded-xl shadow-lg p-4 z-30 filter-box">

            <h4 className="font-medium mb-3">Filter Contributions</h4>

            <div>
              <label className="text-xs text-gray-600">Contribution Type</label>
              <select
                value={tempType}
                onChange={(e) => setTempType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select type</option>
                <option>Artist Information</option>
                <option>Art Form Details</option>
                <option>Cultural Events</option>
                <option>Others</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowFilter(false)}
                className="px-4 py-2 text-sm border rounded-lg">
                Cancel
              </button>

              <button
                onClick={applyFilters}
                className="px-4 py-2 text-sm bg-[#83261D] text-white rounded-lg">
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <table className="w-full text-sm border text-gray-500">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h.key}
                onClick={() => sortData(h.key)}
                className="p-3 cursor-pointer text-left">
                <div className="flex items-center gap-2">
                  {h.label} <SortIcon col={h.key} />
                </div>
              </th>
            ))}
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredData.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No contributions found
              </td>
            </tr>
          )}

          {paginated.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-3 font-medium text-gray-800">{c.name}</td>
              <td className="p-3">{c.mobile}</td>
              <td className="p-3">{c.type}</td>

              <td className="p-3 text-right relative contribution-menu">
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === c.id ? null : c.id)
                  }>
                  <MoreVertical size={18} />
                </button>

                {openMenu === c.id && (
  <div className="absolute right-4 top-10 w-32 bg-white border rounded-lg shadow z-20">

    <button
      onClick={() => {
        setViewContribution(c);
        setOpenMenu(null);
      }}
      className="block w-full px-4 py-2 text-left hover:bg-gray-100">
      View
    </button>

    <button
      onClick={() => navigate("/contribution/add", { state: c })}
      className="block w-full px-4 py-2 text-left hover:bg-gray-100">
      Update
    </button>

    <button
      onClick={() => handleDelete(c.id)}
      className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100">
      Delete
    </button>
  </div>
)}

{viewContribution && (
  <div className="fixed inset-0 soft-blur flex items-center justify-center z-50 px-4">
    
    <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100">

      <button
        onClick={() => setViewContribution(null)}
        className="absolute top-5 right-5 z-20 text-gray-400 hover:text-gray-900 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative bg-[#83261D] pt-12 pb-16 px-8 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm mb-4">
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {viewContribution.name}
          </h2>
          <span className="mt-1 text-white/70 text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
            {viewContribution.type}
          </span>
        </div>
      </div>

      <div className="px-8 pb-8 -mt-8 relative z-10">
        <div className="bg-white rounded-[24px] shadow-xl border border-gray-50 p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact No.</p>
              <p className="text-gray-900 font-semibold flex items-center gap-2">
                <span className="text-[#83261D]">📞</span> {viewContribution.mobile}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
              <p className="text-emerald-600 font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Verified
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message/Notes</p>
            <div className="bg-gray-50/80 p-4 rounded-xl">
              <p className="text-gray-600 text-[14px] leading-relaxed italic">
                "{viewContribution.description || "No specific notes provided for this contribution."}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40">
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-black text-white" : ""
              }`}>
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
