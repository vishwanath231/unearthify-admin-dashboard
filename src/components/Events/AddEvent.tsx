/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router";
import api from "../../api/axios";

type AppEvent = {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  categories: string;
  image: string;
};

type Category = {
  _id: string;
  name: string;
};

export default function AddEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const editEvent = location.state as AppEvent | null;

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

 const [form, setForm] = useState({
  title: "",
  description: "",
  date: "",
  location: "",
  categories: "",
  // recurrence: "none", //recurrence added 
});

  const [existingImage, setExistingImage] = useState<string | undefined>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- PREFILL ---------- */
  useEffect(() => {
    if (editEvent) {
      setForm({
      title: editEvent.title,
      description: editEvent.description,
      date: editEvent.date,
      location: editEvent.location,
      categories: editEvent.categories,
      // recurrence: (editEvent as any).recurrence || "none",
    });

      setExistingImage(editEvent.image);
      setPreviewUrl(editEvent.image || null);
    }
  }, [editEvent]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");

        let categoryArray: any[] = [];

        // CASE 1: response is already array
        if (Array.isArray(res.data)) {
          categoryArray = res.data;
        }

        // CASE 2: response.data is array
        else if (Array.isArray(res.data.data)) {
          categoryArray = res.data.data;
        }

        // CASE 3: response.categories is array
        else if (Array.isArray(res.data.categories)) {
          categoryArray = res.data.categories;
        }

        setCategories(categoryArray);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load categories");
        setCategories([]); // SAFETY
      }
    };

    fetchCategories();
  }, []);

  /* ---------- IMAGE ---------- */
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image must be less than 2MB");
      return;
    }

    setImageError("");
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setExistingImage(undefined);
    setImageError("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ---------- INPUT ---------- */
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* ---------- SUBMIT ---------- */

  async function handleSubmit() {
    if (isSubmitting) return;
    const { title, description, date, location, categories } = form;

    if (!title || !description || !date || !location || !categories) {
      toast.error("All fields are required");
      return;
    }

    if (!editEvent && !imageFile) {
      toast.error("Image is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("location", location);
      formData.append("categories", categories);
      // formData.append("recurrence", form.recurrence);


      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editEvent) {
        await api.put(`/events/${editEvent._id}`, formData);
        toast.success("Event updated");
      } else {
        await api.post("/events", formData);
        toast.success("Event created");
      }
      navigate("/events");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {editEvent ? "Update Event" : ""}
        </h2>
      </div>

      {/* DETAILS */}
      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-medium">Event Details</h3>
        <hr className="my-3" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Select Category
            </label>
            <select
              name="categories"
              value={form.categories}
              onChange={handleChange}
              className="input bg-white">
              <option value="">-- Select category --</option>

              {categories.length > 0 &&
                categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Event Name
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input"
              placeholder="Eg: Classical Dance Festival"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Event Date
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="input"
            />
          </div>
          {/* <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Recurring Event
            </label>
            <select
              name="recurrence"
              value={form.recurrence}
              onChange={handleChange}
              className="input bg-white">
              <option value="none">One-time</option>
              <option value="monthly">Every Month</option>
              <option value="yearly">Every Year</option>
            </select>
          </div> */}


          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="input"
              placeholder="Eg: Kerala Kalamandalam, Thrissur"
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input h-28"
              placeholder="Write full event details..."
            />
          </div>
        </div>
      </div>

      {/* IMAGE */}
      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-medium">Event Image</h3>
        <hr className="my-3" />

        <div className="flex items-center gap-4 flex-wrap">
          <label className="px-4 py-2 border rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 w-fit">
            {previewUrl || existingImage ? "Change Image" : "Choose Image"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {previewUrl && (
            <div className="relative w-24 h-24">
              <img
                src={previewUrl}
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

          {!previewUrl && existingImage && (
            <p className="text-sm text-gray-600">
              Current image: <b>{existingImage}</b>
            </p>
          )}
        </div>

        {imageError && (
          <p className="text-red-500 text-sm mt-2">{imageError}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate("/events")}
          className="px-5 py-2 bg-[#83261D] text-white rounded-lg">
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-5 py-2 rounded-lg text-white ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#83261D]"
          }`}>
          {isSubmitting
            ? editEvent
              ? "Updating..."
              : "Adding..."
            : editEvent
              ? "Update Event"
              : "Add Event"}
        </button>
      </div>
    </div>
  );
}
