import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export type Event = {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  image: string;
};

const STORAGE_KEY = "events";
const EDIT_KEY = "event_editing";

export default function AddEvent() {
  const empty: Event = {
    id: "",
    name: "",
    description: "",
    date: "",
    location: "",
    image: "",
  };

  const [form, setForm] = useState<Event>(empty);
  const [preview, setPreview] = useState<string>("");
  const [editing, setEditing] = useState<Event | null>(null);
  const navigate = useNavigate();

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const editData = localStorage.getItem(EDIT_KEY);
    if (editData) {
      const parsed = JSON.parse(editData);
      setEditing(parsed);
      setForm(parsed);
      setPreview(parsed.image);
    }
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (
      !form.name ||
      !form.description ||
      !form.date ||
      !form.location ||
      !form.image
    ) {
      toast.error("All fields are required");
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const events: Event[] = stored ? JSON.parse(stored) : [];

    let updated: Event[];

    if (editing) {
      updated = events.map((e) =>
        e.id === editing.id ? { ...form, id: editing.id } : e
      );
      localStorage.removeItem(EDIT_KEY);
      setEditing(null);
      toast.success("Event updated");
    } else {
      updated = [...events, { ...form, id: Date.now().toString() }];
      toast.success("Event added");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("events-updated"));
    navigate("/events");

    setForm(empty);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-8">
      <h2 className="text-lg font-semibold">
        {editing ? "Update Event" : "Add Event"}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Event Name</label>
            <input
              name="name"
              className="border p-2 rounded"
              placeholder="Eg: Classical Dance Festival"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Event Date</label>
            <input
              type="date"
              name="date"
              className="border p-2 rounded"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium">Event Description</label>
            <textarea
              name="description"
              className="border p-2 rounded min-h-[110px]"
              placeholder="Write event details..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium">Event Location</label>
            <input
              name="location"
              className="border p-2 rounded"
              placeholder="Eg: Kerala Kalamandalam, Thrissur"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="md:col-span-2 bg-black text-white py-2 rounded hover:opacity-90">
            {editing ? "Update Event" : "Add Event"}
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-center justify-center border rounded bg-gray-50 min-h-[220px] gap-3">
          {preview ? (
            <img
              src={preview}
              className="max-h-[200px] object-contain rounded"
            />
          ) : (
            <p className="text-gray-400 text-sm">Event image preview</p>
          )}

          <label className="cursor-pointer text-sm bg-white border px-3 py-1 rounded">
            Upload Image
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
