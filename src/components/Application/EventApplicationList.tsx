/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import toast from "react-hot-toast";
import {
  getEventApplicationApi,
  deletEventApplicationApi,
} from "../../api/eventApplicationApi";

export type EventApplication = {
  _id: string;
  eventName: string;
  categoryName: string;
  name: string;
  phoneNumber: string;
  age: number;
  location: string;
  gender: string;
  address: string;
};

type SortKey = "name" | "phoneNumber" | "eventName" | "location";

export default function EventApplicationList() {
  const [data, setData] = useState<EventApplication[]>([]);
  const [viewApplication, setViewApplication] =
    useState<EventApplication | null>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [genderFilter, setGenderFilter] = useState("");
  const [tempGender, setTempGender] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadApplications();
  }, []);

  /* ---------- OUTSIDE CLICK HANDLER ---------- */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpenMenu(null);
      }

      if (filterRef.current && !filterRef.current.contains(target)) {
        setShowFilter(false);
      }

      if (modalRef.current && !modalRef.current.contains(target)) {
        setViewApplication(null);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await getEventApplicationApi();
      setData(res.data.data);
    } catch {
      toast.error("Failed to load event applications");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- SORT ---------- */
  const sortData = (key: SortKey) => {
    const newOrder = sortKey === key && order === "asc" ? "desc" : "asc";
    setSortKey(key);
    setOrder(newOrder);

    const sorted = [...data].sort(
      (a: EventApplication, b: EventApplication) => {
        const aVal = a[key];
        const bVal = b[key];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return newOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        return newOrder === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      },
    );

    setData(sorted);
  };

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

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deletEventApplicationApi(id);
      setData((prev) => prev.filter((item) => item._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const headers: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "phoneNumber", label: "Phone" },
    { key: "eventName", label: "Event" },
    { key: "location", label: "Location" },
  ];

  /* ---------- FILTER ---------- */
  const filteredData = data.filter((d) => {
    const value = search.toLowerCase();

    const matchesSearch =
      d.name.toLowerCase().includes(value) ||
      d.phoneNumber.includes(search) ||
      d.eventName.toLowerCase().includes(value) ||
      d.location.toLowerCase().includes(value);

    const matchesGender = genderFilter
      ? d.gender.toLowerCase() === genderFilter.toLowerCase()
      : true;

    return matchesSearch && matchesGender;
  });

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filteredData.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, genderFilter]);

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        {/* SEARCH + ACTIVE FILTER TAG */}
        <div className="flex flex-wrap items-center gap-2 w-full">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, event..."
            className="w-full md:w-72 border rounded-xl pl-4 pr-3 py-2 focus:ring-2 focus:ring-[#83261D] outline-none"
          />

          {genderFilter && (
            <span className="flex items-center gap-2 bg-[#F8E7DC] text-[#83261D] px-3 py-1 rounded-full text-xs">
              Gender: {genderFilter}
              <button onClick={() => setGenderFilter("")} className="font-bold">
                ×
              </button>
            </span>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setGenderFilter("");
              setTempGender("");
            }}
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

      {/* FILTER BOX */}
      <div className="relative">
        {showFilter && (
          <div
            ref={filterRef}
            className="absolute right-0 mt-2 w-full sm:w-96 bg-white border rounded-xl shadow-lg p-4 z-30 filter-box">
            <h4 className="font-medium mb-3">Filter Event Applications</h4>

            <div>
              <label className="text-xs text-gray-600">Gender</label>
              <select
                value={tempGender}
                onChange={(e) => setTempGender(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowFilter(false)}
                className="px-4 py-2 text-sm border rounded-lg">
                Cancel
              </button>

              <button
                onClick={() => {
                  setGenderFilter(tempGender);
                  setShowFilter(false);
                }}
                className="px-4 py-2 text-sm bg-[#83261D] text-white rounded-lg">
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <p className="text-center py-6 text-gray-500 font-medium">
          Loading Event Applications...
        </p>
      )}

      {!loading && (
        <table className="w-full text-sm border text-gray-500">
          <thead>
            <tr>
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => sortData(h.key)}
                  className="p-3 cursor-pointer text-left">
                  <div className="flex items-center gap-2">
                    {h.label}
                    <SortIcon col={h.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No Applications found
                </td>
              </tr>
            )}

            {paginated.map((a) => (
              <tr key={a._id} className="border-t">
                <td className="p-3 font-medium text-gray-800">{a.name}</td>
                <td className="p-3">{a.phoneNumber}</td>
                <td className="p-3">{a.eventName}</td>
                <td className="p-3">{a.location}</td>

                <td className="p-3 text-right relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === a._id ? null : a._id)
                    }>
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === a._id && (
                    <div
                      className="absolute right-4 top-10 w-32 bg-white border rounded-lg shadow z-20"
                      ref={menuRef}>
                      <button
                        onClick={() => {
                          setViewApplication(a);
                          setOpenMenu(null);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                        View
                      </button>

                      <button
                        onClick={() => handleDelete(a._id)}
                        disabled={deletingId === a._id}
                        className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 disabled:opacity-50">
                        {deletingId === a._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
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
        </div>
      )}

      {/* View Modal */}
      {viewApplication && (
        <div className="fixed inset-0 soft-blur flex items-center justify-center z-50 px-4">
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
            ref={modalRef}>
            {/* Header Section */}
            <div className="bg-[#83261D] p-6 text-white relative">
              <button
                onClick={() => setViewApplication(null)}
                className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-2xl">
                ×
              </button>
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold leading-tight">
                  {viewApplication.name}
                </h2>
                {/* Event Name Label */}
                <div className="flex flex-col">
                  <span className="text-[15px] text-white/60 font-bold ml-1 mb-0.5">
                    Event
                  </span>
                  <span className="px-2 py-1 rounded-lg text-sm font-medium">
                    {viewApplication.eventName}
                  </span>
                </div>

                {/* Category Label */}
                <div className="flex flex-col">
                  <span className="text-[15px] text-white/60 font-bold ml-1 mb-0.5">
                    Category
                  </span>
                  <span className="inline-flex w-fit px-3 py-1 bg-white/10 rounded-lg text-sm font-medium border border-white/5">
                    {viewApplication.categoryName}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              {/* Quick Attributes Row */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-center flex-1 border-r border-gray-200">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    Age
                  </p>
                  <p className="text-gray-800 font-bold">
                    {viewApplication.age}
                  </p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    Gender
                  </p>
                  <p className="text-gray-800 font-bold">
                    {viewApplication.gender}
                  </p>
                </div>
              </div>

              {/* Contact & Location Details */}
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#83261D] shrink-0 border border-red-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">
                      Phone Number
                    </p>
                    <p className="text-gray-700 font-medium">
                      {viewApplication.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#83261D] shrink-0 border border-red-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">
                      City / Location
                    </p>
                    <p className="text-gray-700 font-medium">
                      {viewApplication.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#83261D] shrink-0 border border-red-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">
                      Detailed Address
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {viewApplication.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
