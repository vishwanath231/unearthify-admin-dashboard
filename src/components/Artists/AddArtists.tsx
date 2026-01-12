import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import toast from "react-hot-toast";

export type Artist = {
  id: number;
  name: string;
  artForm: string;
  city: string;
  state: string;
  country: string;
  bio: string;
  imageName?: string;
  imageUrl?: string;
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
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image must be less than 2MB");
      setImageFile(null);
      setPreviewUrl(null);
      e.target.value = "";
    } else {
      setImageError("");
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSubmit = async () => {
    if (!name || !artForm || !city || !stateName || !country || !bio) {
      toast.error("All fields are required");
      return;
    }

    const stored: Artist[] = JSON.parse(
      localStorage.getItem("artists") || "[]"
    );

    let imageUrl = editArtist?.imageUrl;

    if (imageFile) {
      imageUrl = await fileToBase64(imageFile);
    }

    if (editArtist) {
      const updated = stored.map((a) =>
        a.id === editArtist.id
          ? {
              ...a,
              name,
              artForm,
              city,
              state: stateName,
              country,
              bio,
              imageName: imageFile ? imageFile.name : editArtist.imageName,
              imageUrl,
            }
          : a
      );

      localStorage.setItem("artists", JSON.stringify(updated));
      toast.success("Artist updated");
    } else {
      if (!imageFile) {
        toast.error("Image is required");
        return;
      }

      const newArtist: Artist = {
        id: Date.now(),
        name,
        artForm,
        city,
        state: stateName,
        country,
        bio,
        imageName: imageFile.name,
        imageUrl,
      };

      localStorage.setItem("artists", JSON.stringify([...stored, newArtist]));
      toast.success("Artist added");
    }

    navigate("/artists");
  };

  useEffect(() => {
    if (editArtist) {
      setName(editArtist.name || "");
      setArtForm(editArtist.artForm || "");
      setCity(editArtist.city || "");
      setStateName(editArtist.state || "");
      setCountry(editArtist.country || "");
      setBio(editArtist.bio || "");
      setExistingImage(editArtist.imageName);
    }
  }, [editArtist]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="relative bg-white p-4 rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {editArtist ? "Update Contribution" : ""}
        </h2>
      </div>

      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-medium">Artist Description</h3>
        <hr className="my-3" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Artist Name</label>
            <input
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="input mt-1"
              placeholder="Enter artist name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Art Form</label>
            <input
              value={artForm}
              required
              onChange={(e) => setArtForm(e.target.value)}
              className="input mt-1"
              placeholder="Eg: Bharatanatyam"
            />
          </div>

          <div>
            <label className="text-sm font-medium">City</label>
            <input
              value={city}
              required
              onChange={(e) => setCity(e.target.value)}
              className="input mt-1"
              placeholder="Enter artist city"
            />
          </div>

          <div>
            <label className="text-sm font-medium">State</label>
            <input
              value={stateName}
              required
              onChange={(e) => setStateName(e.target.value)}
              className="input mt-1"
              placeholder="Enter artist state"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Country</label>
            <input
              value={country}
              required
              onChange={(e) => setCountry(e.target.value)}
              className="input mt-1"
              placeholder="Enter artist country"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input mt-1 h-28"
            placeholder="Write artist bio..."
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-medium">Artist Image</h3>
        <hr className="my-3" />

        <div className="flex items-center gap-4 flex-wrap">
          {/* Button */}
          <label className="px-4 py-2 border rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 w-fit">
            {previewUrl || existingImage ? "Change Image" : "Choose Image"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Preview */}
          {previewUrl && (
            <div className="relative w-24 h-24">
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-full object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                ×
              </button>
            </div>
          )}

          {/* Existing image name (if no preview) */}
          {!previewUrl && existingImage && (
            <p className="text-sm text-gray-700">
              Current image:{" "}
              <span className="font-medium">{existingImage}</span>
            </p>
          )}
        </div>

        {imageError && (
          <p className="text-red-500 text-sm mt-2">{imageError}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate("/artists")}
          className="px-5 py-2 bg-[#83261D] text-white rounded-lg">
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="px-5 py-2 bg-[#83261D] text-white rounded-lg">
          {editArtist ? "Update Artist" : "Add Artist"}
        </button>
      </div>
    </div>
  );
}

export default AddArtists;
