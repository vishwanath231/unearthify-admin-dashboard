/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { MoreVertical } from "lucide-react";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { AppEvent } from "./AddEvent";

const STORAGE_KEY = "events";

type SortKey = "name" | "date" | "location" | "category";

export default function EventList() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<AppEvent[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [tempDate, setTempDate] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [viewEvent, setViewEvent] = useState<AppEvent | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tempCategory, setTempCategory] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  /* ---------- LOAD ---------- */
  function loadEvents() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setEvents(data);
  }

  useEffect(() => {
    loadEvents();

    const refresh = () => loadEvents();

    window.addEventListener("events-updated", refresh);

    return () => window.removeEventListener("events-updated", refresh);
  }, []);

  /* ---------- OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!target.closest(".event-menu")) setOpenMenu(null);

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

    const sorted = [...events].sort((a: any, b: any) => {
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

    setEvents(sorted);
  };

  /* ---------- DELETE ---------- */
  const handleDelete = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success("Event deleted");
  };

  /* ---------- FILTER + SEARCH ---------- */
  const filtered = events.filter((e) => {
    const v = search.toLowerCase();

    const matchesSearch =
      e.name.toLowerCase().includes(v) ||
      e.description.toLowerCase().includes(v) ||
      e.location.toLowerCase().includes(v) ||
      e.date.toLowerCase().includes(v) ||
      e.description.toLowerCase().includes(v);

    const matchesDate = dateFilter ? e.date === dateFilter : true;
    const matchesLocation = locationFilter
      ? e.location.toLowerCase().includes(locationFilter.toLowerCase())
      : true;

    const matchesCategory = categoryFilter
      ? e.category === categoryFilter
      : true;

    return matchesSearch && matchesDate && matchesLocation && matchesCategory;
  });

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, dateFilter, locationFilter]);

  /* ---------- FILTER ACTIONS ---------- */
  const applyFilters = () => {
    setDateFilter(tempDate);
    setLocationFilter(tempLocation);
    setCategoryFilter(tempCategory);
    setShowFilter(false);
  };

  const clearFilters = () => {
    setDateFilter("");
    setLocationFilter("");
    setTempDate("");
    setTempLocation("");
    setCategoryFilter("");
    setTempCategory("");
    setShowFilter(false);
  };

  /* ---------- SORT ICON ---------- */
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
    { key: "name", label: "Event" },
    { key: "category", label: "Category" },
    { key: "date", label: "Date" },
    { key: "location", label: "Location" },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      {/* HEADER */}
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => navigate("/events/add")}
          className="bg-[#83261D] text-white px-4 py-2 rounded-lg">
          + Add Event
        </button>
      </div>

      <hr className="my-3" />

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2 w-full">
          <input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 border rounded-xl pl-4 pr-3 py-2 focus:ring-2 focus:ring-[#83261D] outline-none"
          />

          {dateFilter && (
            <span className="bg-blue-100 text-[#83261D] px-3 py-1 rounded-full text-xs flex items-center gap-1">
              Date: {dateFilter}
              <button onClick={() => setDateFilter("")}>×</button>
            </span>
          )}

          {locationFilter && (
            <span className="bg-green-100 text-[#83261D] px-3 py-1 rounded-full text-xs flex items-center gap-1">
              Location: {locationFilter}
              <button onClick={() => setLocationFilter("")}>×</button>
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-[#83261D] border border-red-200 rounded-lg hover:bg-[#F8E7DC] whitespace-nowrap">
            Clear Filters
          </button>

          <button
            onClick={() => {
              setTempDate(dateFilter);
              setTempLocation(locationFilter);
              setShowFilter((p) => !p);
            }}
            className="flex items-center gap-2 border px-4 py-2 rounded-xl filter-btn">
            <PiSlidersHorizontalBold /> Filter
          </button>
        </div>
      </div>

      <hr className="my-3" />

      {/* FILTER BOX */}
      <div className="relative">
        {showFilter && (
          <div className="absolute right-0 mt-2 w-full sm:w-96 bg-white border rounded-xl shadow-lg p-4 z-30 filter-box">
            <h4 className="font-medium mb-3">Filter Events</h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs">Category</label>
                <select
                  value={tempCategory}
                  onChange={(e) => setTempCategory(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">All</option>
                  <option>Artist Information</option>
                  <option>Art Form Details</option>
                  <option>Cultural Events</option>
                  <option>Others</option>
                </select>
              </div>
              <div>
                <label className="text-xs">Date</label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs">Location</label>
                <input
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  placeholder="Eg: Kerala"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
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

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-[#F1EEE7]">
          <thead>
            <tr>
              <th className="p-3 text-left">Image</th>

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

              <th></th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((ev) => (
              <tr key={ev.id} className="border-t">
                <td className="p-3">
                  <img
                    src={ev.imageUrl}
                    alt={ev.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                </td>

                <td className="p-3 font-medium text-[#83261D]">
                  {ev.category}
                </td>

                <td className="p-3">
                  <p className="font-medium">{ev.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[240px]">
                    {ev.description}
                  </p>
                </td>

                <td className="p-3">{ev.date}</td>
                <td className="p-3">{ev.location}</td>

                <td className="p-3 text-right relative event-menu">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === ev.id ? null : ev.id)
                    }>
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === ev.id && (
                    <div className="absolute right-4 top-10 w-32 bg-white border rounded-lg shadow z-20">
                      <button
                        onClick={() => {
                          setViewEvent(ev);
                          setOpenMenu(null);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                        View
                      </button>

                      <button
                        onClick={() => navigate("/events/add", { state: ev })}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                        Update
                      </button>

                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100">
                        Delete
                      </button>
                    </div>
                  )}

                  {viewEvent && (
                    <div className="fixed inset-0 soft-blur flex items-center justify-center z-50 px-4">
                      <div className="bg-white w-full max-w-xl rounded-[24px] overflow-hidden relative shadow-2xl border border-white/20">
                        <button
                          onClick={() => setViewEvent(null)}
                          className="absolute top-4 right-4 z-30 bg-white/90 hover:bg-white text-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>

                        <div className="relative h-64 overflow-hidden">
                          {viewEvent.imageUrl ? (
                            <>
                              <img
                                src={viewEvent.imageUrl}
                                alt={viewEvent.name}
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                              <svg
                                className="w-12 h-12 opacity-20 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-xs font-bold uppercase tracking-widest">
                                Event Preview
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="px-8 pb-10 -mt-10 relative z-10">
                          {/* Category Tag */}
                          <div className="inline-flex items-center gap-2 bg-[#83261D] text-white text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-xl shadow-xl mb-4">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            {viewEvent.category}
                          </div>
                          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            {viewEvent.name}
                          </h2>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 mb-6">
                            <div className="flex items-center text-gray-600">
                              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-[#83261D]"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">
                                  When
                                </p>
                                <p className="text-sm font-semibold">
                                  {viewEvent.date}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-[#83261D]"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">
                                  Where
                                </p>
                                <p className="text-sm font-semibold">
                                  {viewEvent.location}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-[0.1em] text-gray-400">
                              About the event
                            </label>
                            <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
                              <p className="text-gray-600 text-[15px] leading-relaxed">
                                {viewEvent.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  No events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
