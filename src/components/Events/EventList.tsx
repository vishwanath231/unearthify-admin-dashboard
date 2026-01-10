import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Event } from "./AddEvent";
import { PiSlidersHorizontalBold } from "react-icons/pi";

const STORAGE_KEY = "events";
const EDIT_KEY = "event_editing";

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  const [tempDate, setTempDate] = useState("");
  const [tempLocation, setTempLocation] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const navigate = useNavigate();

  function load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setEvents(JSON.parse(data));
    else setEvents([]);
  }

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener("events-updated", refresh);
    return () => window.removeEventListener("events-updated", refresh);
  }, []);

  // close filter on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("#event-filter-box")) {
        setIsFilterOpen(false);
      }
    }

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  function handleDelete(id: string) {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success("Event deleted");
  }

  function handleEdit(event: Event) {
    localStorage.setItem(EDIT_KEY, JSON.stringify(event));
    navigate("/events/add");
  }

  // ---------- FILTER + SEARCH ----------
  const filtered = events.filter((e) => {
    const v = search.toLowerCase();

    const matchesSearch =
      e.name.toLowerCase().includes(v) ||
      e.description.toLowerCase().includes(v) ||
      e.location.toLowerCase().includes(v) ||
      e.date.toLowerCase().includes(v);

    const matchesDate = filterDate ? e.date === filterDate : true;

    const matchesLocation = filterLocation
      ? e.location.toLowerCase().includes(filterLocation.toLowerCase())
      : true;

    return matchesSearch && matchesDate && matchesLocation;
  });

  // ---------- PAGINATION ----------
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, filterDate, filterLocation]);

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Events List</h2>
        <button
          onClick={() => navigate("/events/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Add Event
        </button>
      </div>

      <hr className="my-3" />

      {/* SEARCH + FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        {/* LEFT SIDE — SEARCH */}
        <div className="w-full md:w-72">
          <input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl pl-4 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* applied filters */}
          <div className="flex flex-wrap gap-2 mt-2">
            {filterDate && (
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                Date: {filterDate}
                <button onClick={() => setFilterDate("")}>✕</button>
              </span>
            )}

            {filterLocation && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                Location: {filterLocation}
                <button onClick={() => setFilterLocation("")}>✕</button>
              </span>
            )}
          </div>
        </div>

        {/* RIGHT SIDE — FILTER CONTROLS */}
        <div
          className="relative flex items-center gap-3 justify-end"
          id="event-filter-box">
          <button
            onClick={() => {
              setFilterDate("");
              setFilterLocation("");
              setTempDate("");
              setTempLocation("");
            }}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 whitespace-nowrap">
            Clear Filters
          </button>

          <button
            onClick={() => {
              setTempDate(filterDate);
              setTempLocation(filterLocation);
              setIsFilterOpen(!isFilterOpen);
            }}
            className="flex items-center gap-2 border px-4 py-2 rounded-xl">
            <PiSlidersHorizontalBold /> Filter
          </button>

          {/* FILTER DROPDOWN */}
          {isFilterOpen && (
            <div className="absolute right-0 top-12 bg-white border shadow-lg rounded-lg p-4 w-64 z-50 space-y-3">
              <div>
                <label className="text-xs font-medium">Filter by date</label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="border p-2 rounded w-full text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium">
                  Filter by location
                </label>
                <input
                  placeholder="Eg: Kerala"
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  className="border p-2 rounded w-full text-sm mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="px-3 py-1 text-sm border rounded">
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setFilterDate(tempDate);
                    setFilterLocation(tempLocation);
                    setIsFilterOpen(false);
                  }}
                  className="px-3 py-1 text-sm bg-black text-white rounded">
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="my-3" />

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Event</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((ev) => (
              <tr key={ev.id} className="border-t">
                <td className="p-3">
                  <img
                    src={ev.image}
                    className="w-12 h-12 rounded object-cover"
                  />
                </td>
                <td className="p-3">
                  <p className="font-medium">{ev.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[240px]">
                    {ev.description}
                  </p>
                </td>
                <td className="p-3">{ev.date}</td>
                <td className="p-3">{ev.location}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(ev)}
                      className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs">
                      Delete
                    </button>
                  </div>
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
