import React, { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router";
import { Artist } from "./AddArtists";

type SortKey = "name" | "artForm" | "city" | "state" | "country";

function ArtistsList() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const menuRef = useRef<HTMLTableCellElement | null>(null);
  const navigate = useNavigate();

  /* ---------- LOAD ---------- */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("artists") || "[]");
    setArtists(data);
  }, []);

  /* ---------- OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
    const updated = artists.filter(a => a.id !== id);
    setArtists(updated);
    localStorage.setItem("artists", JSON.stringify(updated));
  };

  /* ---------- ICON ---------- */
  const SortIcon = ({ col }: { col: SortKey }) => (
    <div className="flex flex-col leading-none">
      <ChevronUp size={14} className={sortKey === col && order === "asc" ? "text-black" : "text-gray-300"} />
      <ChevronDown size={14} className={sortKey === col && order === "desc" ? "text-black" : "text-gray-300"} />
    </div>
  );

  const headers: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "artForm", label: "Art Form" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" }
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Artists List</h2>
        <button
          onClick={() => navigate("/artists/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Artist
        </button>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            {headers.map(h => (
              <th
                key={h.key}
                onClick={() => sortData(h.key)}
                className="p-3 cursor-pointer text-left"
              >
                <div className="flex items-center gap-1">
                  {h.label}
                  <SortIcon col={h.key} />
                </div>
              </th>
            ))}
            <th className="p-3 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {artists.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">
                No artists added
              </td>
            </tr>
          )}

          {artists.map(a => (
            <tr key={a.id} className="border-t">
              <td className="p-3 font-medium">{a.name}</td>
              <td className="p-3">{a.artForm}</td>
              <td className="p-3">{a.city}</td>
              <td className="p-3">{a.state}</td>
              <td className="p-3">{a.country}</td>

              <td ref={menuRef} className="p-3 text-right relative">
                <button onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)}>
                  <MoreVertical size={18} />
                </button>

                {openMenu === a.id && (
                  <div className="absolute right-4 top-10 w-28 bg-white border rounded-lg shadow z-20">
                    <button
                      onClick={() => navigate("/artists/add", { state: a })}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                    >
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
