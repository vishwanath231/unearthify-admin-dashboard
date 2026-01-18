/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getAllEventsApi, deleteEventApi } from "../../api/eventApi";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { MoreVertical } from "lucide-react";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";

type Event = {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  categories: string;
  image: string;
};

// const STORAGE_KEY = "events";

type SortKey = "title" | "date" | "location" | "categories";

export default function EventList() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [eventCategories, setEventCategories] = useState<string[]>([]);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [dateFilter, setDateFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const [tempDate, setTempDate] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [viewEvent, setViewEvent] = useState<Event | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tempCategory, setTempCategory] = useState("");

  
  /* ---------- LOAD ---------- */
 
const loadEvents = async () => {
  try {
    const res = await getAllEventsApi();
 
    const formatted = res.data.data.map((e: any) => ({
      ...e,
      image: import.meta.env.VITE_API_BASE_URL + e.image
    }));
 
    setEvents(formatted);
  } catch {
    toast.error("Failed to load events");
  }
};
const loadEventCategories = async () => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/categories`
    );
    const data = await res.json();

    const names = data.data.map((c: any) => c.name);
    setEventCategories(names);
  } catch (err) {
    console.error("Failed to load categories", err);
  }
};

 
useEffect(() => {
  loadEvents();
  loadEventCategories();
}, []);

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
const handleDelete = async (id: string) => {
  try {
    await deleteEventApi(id);
    toast.success("Event Deleted");
    loadEvents();
  } catch {
    toast.error("Delete failed");
  }
};
 
  /* ---------- FILTER + SEARCH ---------- */
  const filtered = events.filter((e) => {
  const v = search.toLowerCase();

  const matchesSearch =
    e.title.toLowerCase().includes(v) ||
    e.description.toLowerCase().includes(v) ||
    e.location.toLowerCase().includes(v) ||
    e.date.toLowerCase().includes(v);

  // const matchesDate = dateFilter ? e.date === dateFilter : true;
    const matchesDate = dateFilter
    ? new Date(e.date).toISOString().slice(0, 10) === dateFilter
    : true;


  const matchesLocation = locationFilter
    ? e.location.toLowerCase().includes(locationFilter.toLowerCase())
    : true;

  const matchesCategory = categoryFilter
  ? e.categories?.trim().toLowerCase() === categoryFilter.trim().toLowerCase()
  : true;


  return matchesSearch && matchesDate && matchesLocation && matchesCategory;
});

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
  // Formating the date
//   const formatDate = (dateStr: string) => {
//   if (!dateStr) return "";
//   return new Date(dateStr).toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
// };
  const formatDate = (dateStr: string) => {
  if (!dateStr) return "";

  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};


  const headers: { key: SortKey; label: string }[] = [
    { key: "categories", label: "Category" },
    { key: "title", label: "Event" },
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
            <span className="bg-[#F8E7DC] text-[#83261D] px-3 py-1 rounded-full text-xs flex items-center gap-1">
              Date: {dateFilter}
              <button onClick={() => setDateFilter("")}>×</button>
            </span>
          )}

          {locationFilter && (
            <span className="bg-[#F8E7DC] text-[#83261D] px-3 py-1 rounded-full text-xs flex items-center gap-1">
              Location: {locationFilter}
              <button onClick={() => setLocationFilter("")}>×</button>
            </span>
          )}

          {categoryFilter && (
            <span className="bg-[#F8E7DC] text-[#83261D] px-3 py-1 rounded-full text-xs flex items-center gap-1">
              Category: {categoryFilter}
              <button onClick={() => setCategoryFilter("")}>×</button>
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

                    {eventCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
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
            

            {filtered.map((ev) => (
              <tr key={ev._id} className="border-t">
                <td className="p-3">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                </td>

                <td className="p-3 font-medium text-[#83261D]">
                  {ev.categories}
                </td>

                <td className="p-3">
                  <p className="font-medium">{ev.title}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[240px]">
                    {ev.description}
                  </p>
                </td>

                <td className="p-3">{formatDate(ev.date)}</td>

                <td className="p-3">{ev.location}</td>

                <td className="p-3 text-right relative event-menu">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === ev._id ? null : ev._id)
                    }>
                    <MoreVertical size={18} />
                  </button>

                  {openMenu === ev._id && (
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
                        onClick={() => handleDelete(ev._id)}
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
                          {viewEvent.image ? (
                            <>
                              <img
                                src={viewEvent.image}
                                alt={viewEvent.title}
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
                            {viewEvent.categories}
                          </div>
                          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            {viewEvent.title}
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

            
          </tbody>
        </table>
      </div>


    </div>
  );
}
