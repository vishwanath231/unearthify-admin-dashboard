/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { PiSlidersHorizontalBold } from "react-icons/pi";
import { getAllArtistsApi, deleteArtistApi } from "../../api/artistApi";
import toast from "react-hot-toast";
import { HOST_URL } from "../../api/api";

type Artist = {
  _id: string;
  name: string;
  artForm: string;
  city: string;
  state: string;
  country: string;
  bio: string;
  image: string;
  collection: string[];
  isFeatured: boolean;
  status: string;
};

type SortKey = "name" | "artForm" | "city" | "state" | "country";

function ArtistsList() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [artFormFilter, setArtFormFilter] = useState("");

  const [tempCity, setTempCity] = useState("");
  const [tempState, setTempState] = useState("");
  const [tempArtForm, setTempArtForm] = useState("");
  const [viewArtist, setViewArtist] = useState<Artist | null>(null);

  const navigate = useNavigate();

  const loadArtists = async () => {
    try {
      const res = await getAllArtistsApi();

      const formatted = res.data.data.map((a: any) => ({
        ...a,
        image: `${HOST_URL + a.image}`,
      }));

      setArtists(formatted);
    } catch {
      toast.error("Failed to load artists");
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  /* ---------- OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // if click is NOT inside any action menu or 3-dot button
      if (!target.closest(".artist-menu")) {
        setOpenMenu(null);
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

    const sorted = [...artists].sort((a: any, b: any) => {
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

    setArtists(sorted);
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Unauthorized");

      await deleteArtistApi(id, token);
      toast.success("Artist deleted");
      loadArtists();
    } catch {
      toast.error("Delete failed");
    }
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
    { key: "artForm", label: "Art Form" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
  ];

  const filteredArtists = artists.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) &&
      a.city.toLowerCase().includes(cityFilter.toLowerCase()) &&
      a.state.toLowerCase().includes(stateFilter.toLowerCase()) &&
      a.artForm.toLowerCase().includes(artFormFilter.toLowerCase())
  );

  const applyFilters = () => {
    setCityFilter(tempCity);
    setStateFilter(tempState);
    setArtFormFilter(tempArtForm);
    setShowFilter(false);

    setTempCity("");
    setTempState("");
    setTempArtForm("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".filter-box") && !target.closest(".filter-btn")) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearFilters = () => {
    // clear applied filters
    setCityFilter("");
    setStateFilter("");
    setArtFormFilter("");

    // clear temp inputs
    setTempCity("");
    setTempState("");
    setTempArtForm("");

    setShowFilter(false);
  };

  const removeSingleFilter = (type: "city" | "state" | "artForm") => {
    if (type === "city") setCityFilter("");
    if (type === "state") setStateFilter("");
    if (type === "artForm") setArtFormFilter("");
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => navigate("/artists/add")}
          className="bg-[#83261D] text-white px-4 py-2 rounded-lg">
          + Add Artist
        </button>
      </div>
      <hr className="my-3" />

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        {/* Search */}
        <div className="flex flex-wrap items-center gap-2 w-full">
          {/* Search input */}
          <div className="relative w-full md:w-72">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search artist..."
              className="w-full border rounded-xl pl-4 pr-3 py-2 focus:ring-2 focus:ring-[#83261D] outline-none"
            />
          </div>

          {/* Applied filter chips */}
          {cityFilter && (
            <span className="flex items-center gap-2 bg-blue-50 text-[#83261D] px-3 py-1 rounded-full text-xs whitespace-nowrap">
              City: {cityFilter}
              <button
                onClick={() => removeSingleFilter("city")}
                className="font-bold">
                ×
              </button>
            </span>
          )}

          {stateFilter && (
            <span className="flex items-center gap-2 bg-blue-50 text-[#83261D] px-3 py-1 rounded-full text-xs whitespace-nowrap">
              State: {stateFilter}
              <button
                onClick={() => removeSingleFilter("state")}
                className="font-bold">
                ×
              </button>
            </span>
          )}

          {artFormFilter && (
            <span className="flex items-center gap-2 bg-blue-50 text-[#83261D] px-3 py-1 rounded-full text-xs whitespace-nowraps">
              Art: {artFormFilter}
              <button
                onClick={() => removeSingleFilter("artForm")}
                className="font-bold">
                ×
              </button>
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {/* Clear filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-[#83261D] border border-red-200 rounded-lg hover:bg-[#F8E7DC] whitespace-nowrap">
            Clear Filters
          </button>

          {/* Filter button */}
          <button
            onClick={() => setShowFilter((prev) => !prev)}
            className="flex items-center gap-2 border px-4 py-2 rounded-xl w-fit filter-btn">
            <PiSlidersHorizontalBold /> Filter
          </button>
        </div>
      </div>

      <hr className="my-3" />

      <div className="relative">
        {showFilter && (
          <div className="absolute right-0 mt-2 w-full sm:w-96 bg-white border rounded-xl shadow-lg p-4 z-30 filter-box">
            <h4 className="font-medium mb-3">Filter Artists</h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">City</label>
                <input
                  value={tempCity}
                  onChange={(e) => setTempCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">State</label>
                <input
                  value={tempState}
                  onChange={(e) => setTempState(e.target.value)}
                  placeholder="Enter state"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Art Form</label>
                <input
                  value={tempArtForm}
                  onChange={(e) => setTempArtForm(e.target.value)}
                  placeholder="Enter art form"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 mt-4">
              <div className="flex gap-2">
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
          </div>
        )}
      </div>

      <table className="w-full text-sm border border-[#F1EEE7]">
        <thead className="bg-white">
          <tr>
            {headers.map((h) => (
              <th
                key={h.key}
                onClick={() => sortData(h.key)}
                className="p-3 cursor-pointer text-left">
                <div className="flex items-center gap-2 leading-none">
                  {h.label}
                  <SortIcon col={h.key} />
                </div>
              </th>
            ))}
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredArtists.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-600">
                No artists added
              </td>
            </tr>
          )}

          {filteredArtists.map((a) => (
            <tr key={a._id} className="border-t">
              <td className="p-3 text-gray-800">
                <div className="flex items-center gap-3">
                  {a.image ? (
                    <img
                      src={a.image}
                      alt={a.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      N/A
                    </div>
                  )}

                  <span className="font-medium">{a.name}</span>
                </div>
              </td>
              <td className="p-3">{a.artForm}</td>
              <td className="p-3">{a.city}</td>
              <td className="p-3">{a.state}</td>
              <td className="p-3">{a.country}</td>

              <td className="p-3 text-right relative artist-menu">
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === a._id ? null : a._id)
                  }>
                  <MoreVertical size={18} />
                </button>

                {openMenu === a._id && (
                  <div className="absolute right-4 top-10 w-32 bg-white border rounded-lg shadow z-20">
                    <button
                      onClick={() => {
                        setViewArtist(a);
                        setOpenMenu(null);
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                      View
                    </button>

                    <button
                      onClick={() => navigate("/artists/add", { state: a })}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                      Update
                    </button>

                    <button
                      onClick={() => handleDelete(a._id)}
                      className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100">
                      Delete
                    </button>
                  </div>
                )}

                {viewArtist && (
                  <div className="fixed inset-0 soft-blur flex items-center justify-center z-50 px-4">
                    <div className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden relative shadow-2xl">
                      <button
                        onClick={() => setViewArtist(null)}
                        className="absolute top-4 right-4 z-20 bg-black backdrop-blur-md text-white rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-lg">
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

                      <div className="relative w-full h-72">
                        {viewArtist.image ? (
                          <>
                            <img
                              src={viewArtist.image}
                              alt={viewArtist.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <span>No Image Available</span>
                          </div>
                        )}
                      </div>

                      <div className="px-8 pb-8 -mt-12 relative z-10">
                        <div className="inline-flex items-center bg-[#83261D] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-md mb-3 shadow-md">
                          <span className="mr-1.5">🎨</span>{" "}
                          {viewArtist.artForm || "Artist"}
                        </div>

                        <div className="mb-6">
                          <h2 className="text-4xl font-black text-gray-900 leading-none">
                            {viewArtist.name}
                          </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <p className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1 text-[#83261D]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              Location
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200">
                                {viewArtist.city}, {viewArtist.state}
                              </span>
                              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200">
                                {viewArtist.country}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1 text-[#83261D]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              About the Artist
                            </p>
                            <p className="text-gray-600 text-sm leading-relaxed italic bg-gray-50 p-4 rounded-2xl">
                              "
                              {viewArtist.bio ||
                                "This artist hasn't shared their story yet."}
                              "
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
  );
}

export default ArtistsList;
