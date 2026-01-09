/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { Artist } from "./AddArtists";
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import { PiSlidersHorizontalBold } from "react-icons/pi";

type SortKey = "name" | "artForm" | "city" | "state" | "country";

function ArtistsList() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

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

  const navigate = useNavigate();

  /* ---------- LOAD ---------- */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("artists") || "[]");
    setArtists(data);
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
      if (a[key] < b[key]) return newOrder === "asc" ? -1 : 1;
      if (a[key] > b[key]) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    setArtists(sorted);
  };

  /* ---------- DELETE ---------- */
  const handleDelete = (id: number) => {
    const updated = artists.filter((a) => a.id !== id);
    setArtists(updated);
    localStorage.setItem("artists", JSON.stringify(updated));
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Artists List</h2>
        <button
          onClick={() => navigate("/artists/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg">
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
              className="w-full border rounded-xl pl-4 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Applied filter chips */}
          {cityFilter && (
            <span className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs whitespace-nowrap">
              City: {cityFilter}
              <button
                onClick={() => removeSingleFilter("city")}
                className="font-bold">
                ×
              </button>
            </span>
          )}

          {stateFilter && (
            <span className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs whitespace-nowrap">
              State: {stateFilter}
              <button
                onClick={() => removeSingleFilter("state")}
                className="font-bold">
                ×
              </button>
            </span>
          )}

          {artFormFilter && (
            <span className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs whitespace-nowraps">
              Art: {artFormFilter}
              <button
                onClick={() => removeSingleFilter("artForm")}
                className="font-bold">
                ×
              </button>
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {/* Clear filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 whitespace-nowrap">
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

            <div className="flex justify-between items-center gap-2 mt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilter(false)}
                  className="px-4 py-2 text-sm border rounded-lg">
                  Cancel
                </button>

                <button
                  onClick={applyFilters}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <table className="w-full text-sm border text-gray-500">
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
              <td colSpan={6} className="p-4 text-center text-gray-500">
                No artists added
              </td>
            </tr>
          )}

          {filteredArtists.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-3 text-gray-800">
                <div className="flex items-center gap-3">
                  {a.imageUrl ? (
                    <img
                      src={a.imageUrl}
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
                  onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)}>
                  <MoreVertical size={18} />
                </button>

                {openMenu === a.id && (
                  <div className="absolute right-4 top-10 w-28 bg-white border rounded-lg shadow z-20">
                    <button
                      onClick={() => navigate("/artists/add", { state: a })}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                      Update
                    </button>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100">
                      Delete
                    </button>
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
