import React, { useState, ChangeEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import toast from "react-hot-toast";

export type Artist = {
    id:number;
  name: string;
  artForm: string;
  city: string;
  state: string;
  country: string;
  imageName?: string;
};

function AddArtists() {
  const navigate = useNavigate();
  const location = useLocation();
    const editArtist = location.state as Artist | null;

  const [existingImage, setExistingImage] = useState<string | undefined>();


  const [name, setName] = useState("");
  const [artForm, setArtForm] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image must be less than 2MB");
      setImageFile(null);
      e.target.value = "";
    } else {
      setImageError("");
      setImageFile(file);
    }
  };

  const handleSubmit = () => {
  const stored: Artist[] = JSON.parse(localStorage.getItem("artists") || "[]");

  if (editArtist) {
    //  UPDATE EXISTING
    if (!name || !artForm || !city || !stateName || !country || !imageFile) {
        toast.error("All Fields are required");
        return;
    }
    const updated = stored.map(a =>
      a.id === editArtist.id
        ? {
            ...a,
            name,
            artForm,
            city,
            state: stateName,
            country,
            imageName: imageFile ? imageFile.name : editArtist.imageName
          }
        : a
    );

    localStorage.setItem("artists", JSON.stringify(updated));
    toast.success("Updated successfully")
  } else {
    //  ADD NEW
    if (!name || !artForm || !city || !stateName || !country || !imageFile) {
        toast.error("All Fields are required");
        return;
    }
    const newArtist: Artist = {
      id: Date.now(),
      name,
      artForm,
      city,
      state: stateName,
      country,
      imageName: imageFile?.name
    };

    localStorage.setItem("artists", JSON.stringify([...stored, newArtist]));
  }
  toast.success("Artist added successfully")
  navigate("/artists");
};


  useEffect(() => {
    if (editArtist) {
      setName(editArtist.name || "");
      setArtForm(editArtist.artForm || "");
      setCity(editArtist.city || "");
      setStateName(editArtist.state || "");
      setCountry(editArtist.country || "");
      setExistingImage(editArtist.imageName);
    }
  }, [editArtist]);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h2 className="text-xl font-semibold mb-6">Add Artist</h2>

      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-medium">Artist Description</h3>
        <hr className="my-3" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium">Artist Name</label>
            <input value={name} required onChange={e => setName(e.target.value)} className="input mt-1" placeholder="Enter artist name" />
          </div>

          <div>
            <label className="text-sm font-medium">Art Form</label>
            <input value={artForm} required onChange={e => setArtForm(e.target.value)} className="input mt-1" placeholder="Eg: Bharatanatyam" />
          </div>

          <div>
            <label className="text-sm font-medium">City</label>
            <input value={city} required onChange={e => setCity(e.target.value)} className="input mt-1" placeholder="Enter artist city" />
          </div>

          <div>
            <label className="text-sm font-medium">State</label>
            <input value={stateName} required onChange={e => setStateName(e.target.value)} className="input mt-1" placeholder="Enter artist state" />
          </div>

          <div>
            <label className="text-sm font-medium">Country</label>
            <input value={country} required onChange={e => setCountry(e.target.value)} className="input mt-1" placeholder="Enter artist country" />
          </div>

        </div>
      </div>

      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-medium">Artist Image</h3>
        <hr className="my-3" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

          <label className="px-4 py-2 border rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 w-fit">
            Choose Image
            <input type="file" accept="image/*" required onChange={handleImageChange} className="hidden" />
          </label>

          {imageFile && (
            <p className="text-sm text-gray-700">
              Selected: <span className="font-medium">{imageFile.name}</span>
            </p>
          )}
        </div>

        {imageError && <p className="text-red-500 text-sm mt-2">{imageError}</p>}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSubmit} className="px-5 py-2 bg-blue-600 text-white rounded-lg">
          Add Artist
        </button>
      </div>

    </div>
  );
}

export default AddArtists;
