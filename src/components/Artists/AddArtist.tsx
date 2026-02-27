/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import toast from "react-hot-toast";
import { createArtistApi, updateArtistApi } from "../../api/artistApi";
import { State, City } from "country-state-city";
import Select from "react-select";

type Artist = {
  _id: string;
  name: string;
  artForm: string;
  city: string;
  state: string;
  country: string;
  bio: string;
  image: string;
};

function AddArtist() {
  const navigate = useNavigate();
  const location = useLocation();
  const editArtist = location.state as Artist | null;

  const [existingImage, setExistingImage] = useState<string | undefined>();

  const [name, setName] = useState("");
  const [artForm, setArtForm] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("India");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const cityOptions = cities.map((c) => ({
    label: c.name,
    value: c.name,
  }));
  const stateOptions = states.map((s) => ({
    label: s.name,
    value: s.name,
    isoCode: s.isoCode,
  }));

  //Loading the states in India
  useEffect(() => {
    const indianStates = State.getStatesOfCountry("IN");
    setStates(indianStates);
  }, []);

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
    if (isSubmitting) return;
    if (!name || !artForm || !city || !stateName || !country || !bio) {
      toast.error("All fields are required");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("artForm", artForm);
      formData.append("city", city);
      formData.append("state", stateName);
      formData.append("country", country);
      formData.append("bio", bio);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editArtist) {
        await updateArtistApi(editArtist._id, formData);
        toast.success("Artist updated");
      } else {
        await createArtistApi(formData);
        toast.success("Artist created successfully");
      }

      navigate("/artists");
    } catch (err: any) {
      console.error("UPDATE ERROR ", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Create failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (editArtist) {
      setName(editArtist.name || "");
      setArtForm(editArtist.artForm || "");
      setStateName(editArtist.state || "");
      setCity(editArtist.city || "");
      setCountry("India");
      setBio(editArtist.bio || "");
      setExistingImage(editArtist.image);

      // preload cities for edit
      const stateObj = State.getStatesOfCountry("IN").find(
        (s) => s.name === editArtist.state,
      );
      if (stateObj) {
        setCities(City.getCitiesOfState("IN", stateObj.isoCode));
      }
    }
  }, [editArtist]);

  const selectStyles = {
    menu: (base: any) => ({
      ...base,
      maxHeight: 200,
      borderRadius: "8px",
      overflowY: "auto",
      zIndex: 50,
    }),
    control: (base: any) => ({
      ...base,
      minHeight: "40px",
      borderRadius: "8px",
      fontSize: "14px",
    }),
    option: (base: any) => ({
      ...base,
      fontSize: "14px",
    }),
    placeholder: (base: any) => ({
      ...base,
      fontSize: "14px",
    }),
  };

  return (
    <div className="relative bg-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold">
          {editArtist ? "Update Artist" : "Add New Artist"}
        </h2>
      </div>

      {/* Artist Description Section */}
      <div className="bg-white rounded-lg sm:rounded-xl border p-3 sm:p-4 md:p-5 mb-4 sm:mb-5 md:mb-6">
        <h3 className="text-sm sm:text-base font-medium">Artist Description</h3>
        <hr className="my-2 sm:my-3" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Artist Name */}
          <div>
            <label className="text-xs sm:text-sm font-medium">Artist Name <span className="text-red-500">*</span></label>
            <input
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              placeholder="Enter artist name"
            />
          </div>

          {/* Art Form */}
          <div>
            <label className="text-xs sm:text-sm font-medium">Art Form <span className="text-red-500">*</span></label>
            <input
              value={artForm}
              required
              onChange={(e) => setArtForm(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none"
              placeholder="Eg: Bharatanatyam"
            />
          </div>

          {/* Country (Read Only) */}
          <div>
            <label className="text-xs sm:text-sm font-medium">Country</label>
            <input
              value={country}
              readOnly
              className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* State Select */}
          <div>
            <label className="text-xs sm:text-sm font-medium">State <span className="text-red-500">*</span></label>
            <div className="mt-1">
              <Select
                options={stateOptions}
                value={
                  stateName
                    ? stateOptions.find((s) => s.value === stateName)
                    : null
                }
                placeholder="Select State"
                onChange={(option) => {
                  if (!option) return;
                  setStateName(option.value);
                  setCity("");
                  const cityList = City.getCitiesOfState("IN", option.isoCode);
                  setCities(cityList);
                }}
                styles={selectStyles}
              />
            </div>
          </div>

          {/* City Select */}
          <div className="sm:col-span-1">
            <label className="text-xs sm:text-sm font-medium">City <span className="text-red-500">*</span></label>
            <div className="mt-1">
              <Select
                options={cityOptions}
                value={city ? { label: city, value: city } : null}
                onChange={(option) => setCity(option?.value || "")}
                placeholder="Select City"
                isDisabled={!stateName}
                styles={selectStyles}
              />
            </div>
          </div>

          {/* Bio - Full Width */}
          <div className="sm:col-span-2">
            <label className="text-xs sm:text-sm font-medium">Bio <span className="text-red-500">*</span></label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none h-24 sm:h-28 resize-none"
              placeholder="Write artist bio..."
            />
          </div>
        </div>
      </div>

      {/* Artist Image Section */}
      <div className="bg-white rounded-lg sm:rounded-xl border p-3 sm:p-4 md:p-5 mb-4 sm:mb-5 md:mb-6">
        <h3 className="text-sm sm:text-base font-medium">Artist Image</h3>
        <hr className="my-2 sm:my-3" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Button */}
          <label className="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 w-fit text-xs sm:text-sm">
            {previewUrl || existingImage ? "Change Image" : "Choose Image"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Preview / Existing Image */}
          {(previewUrl || existingImage) && (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
              <img
                src={previewUrl || existingImage || ""}
                alt="preview"
                className="w-full h-full object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm hover:bg-red-600 transition-colors">
                ×
              </button>
            </div>
          )}

          {/* Image Hint */}
          <p className="text-[10px] sm:text-xs text-gray-400">
            Max file size: 2MB
          </p>
        </div>

        {imageError && (
          <p className="text-red-500 text-xs sm:text-sm mt-2">{imageError}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <button
          onClick={() => navigate("/artists")}
          className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gray-500 text-white rounded-lg text-xs sm:text-sm hover:bg-gray-600 transition-colors order-2 sm:order-1">
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg text-white text-xs sm:text-sm transition-colors order-1 sm:order-2 ${
            isSubmitting 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-[#83261D] hover:bg-[#6a1e17]"
          }`}>
          {isSubmitting
            ? editArtist
              ? "Updating..."
              : "Adding..."
            : editArtist
              ? "Update Artist"
              : "Add Artist"}
        </button>
      </div>
    </div>
  );
}

export default AddArtist;