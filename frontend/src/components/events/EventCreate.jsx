import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft, Calendar, Clock, MapPin, Link2, Users, Upload, Image as ImageIcon, X } from "lucide-react";

export default function EventCreate() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const userType =
    Number(localStorage.getItem("user_type")) ||
    Number(localStorage.getItem("userType"));

  const getPostCreateRedirectRoute = () => {
    if (userType === 1 || userType === 2) return "/admin-dashboard";
    if ([4, 5, 6, 7].includes(userType)) return "/dashboard";
    return "/dashboard";
  };

  const [eventType, setEventType] = useState("online");
  const [eventName, setEventName] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [speakers, setSpeakers] = useState([]);
  const [speakerInput, setSpeakerInput] = useState("");
  const [eventMedia, setEventMedia] = useState(null);
  const [eventMediaPreview, setEventMediaPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const mediaInputRef = useRef(null);

  const Toast = ({ message, type = "success", onClose }) => {
    const bgColor =
      type === "success"
        ? "bg-green-600"
        : type === "error"
          ? "bg-red-600"
          : "bg-blue-600";

    useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <div
        className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in`}
      >
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:bg-white/20 rounded p-1"
        >
          ×
        </button>
      </div>
    );
  };

  const handleCreateEvent = async () => {
    setMessage(null);

    if (![4, 5, 6, 7].includes(userType)) {
      setMessage({ type: "error", text: "Create event is not configured for this profile yet." });
      return;
    }

    if (!eventName || !startDate || !startTime) {
      setMessage({ type: "error", text: "Please fill required fields." });
      return;
    }

    if (eventType === "online" && !eventLink) {
      setMessage({ type: "error", text: "Please add an event link." });
      return;
    }

    if (eventType === "in_person" && !location) {
      setMessage({ type: "error", text: "Please add a location." });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("event_type", eventType);
      formData.append("event_name", eventName);
      formData.append("event_link", eventType === "online" ? eventLink : "");
      formData.append("location", eventType === "in_person" ? location : "");
      formData.append("start_date", startDate);
      formData.append("start_time", startTime);
      formData.append("end_date", endDate || "");
      formData.append("end_time", endTime || "");
      formData.append("description", description || "");
      formData.append("speakers", JSON.stringify(speakers));
      if (eventMedia) {
        formData.append("eventMedia", eventMedia);
      }

      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Failed to create event." });
        return;
      }

      navigate(getPostCreateRedirectRoute(), {
        replace: true,
        state: {
          toastSuccess: "Event created successfully.",
          toastId: `event-created-${Date.now()}`,
        },
      });
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const addSpeaker = (name) => {
    const cleaned = name.trim();
    if (!cleaned) return;
    if (speakers.includes(cleaned)) return;
    setSpeakers((prev) => [...prev, cleaned]);
  };

  const removeSpeaker = (name) => {
    setSpeakers((prev) => prev.filter((s) => s !== name));
  };

  const handleSpeakerKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSpeaker(speakerInput);
      setSpeakerInput("");
    }

    if (e.key === "Backspace" && !speakerInput && speakers.length > 0) {
      setSpeakers((prev) => prev.slice(0, -1));
    }
  };

  const handleSpeakerBlur = () => {
    if (!speakerInput.trim()) return;
    addSpeaker(speakerInput);
    setSpeakerInput("");
  };

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please upload an image file only." });
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size should be 5MB or less." });
      e.target.value = "";
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    if (eventMediaPreview) URL.revokeObjectURL(eventMediaPreview);
    setEventMedia(file);
    setEventMediaPreview(nextPreview);
  };

  const clearMedia = () => {
    if (eventMediaPreview) URL.revokeObjectURL(eventMediaPreview);
    setEventMedia(null);
    setEventMediaPreview("");
    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (eventMediaPreview) URL.revokeObjectURL(eventMediaPreview);
    };
  }, [eventMediaPreview]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {message && (
          <Toast
            message={message.text}
            type={message.type}
            onClose={() => setMessage(null)}
          />
        )}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        <div className="bg-white rounded-2xl border border-slate-400/70 shadow-sm">
          <div className="p-6 md:p-8 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Create Event
                </h1>
                <p className="text-gray-600">
                  Add event details to publish a new event.
                </p>
              </div>

              <div />
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6 lg:col-span-2">
                <div className="bg-white rounded-lg border border-slate-400/70 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Event details
                  </h2>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Event type
                      </label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="radio"
                            name="eventType"
                            value="online"
                            checked={eventType === "online"}
                            onChange={() => setEventType("online")}
                            className="accent-blue-600"
                          />
                          Online
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="radio"
                            name="eventType"
                            value="in_person"
                            checked={eventType === "in_person"}
                            onChange={() => setEventType("in_person")}
                            className="accent-blue-600"
                          />
                          In person
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Event name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter event name"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={75}
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                      />
                    </div>

                    {eventType === "in_person" ? (
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Location
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Add event location"
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Event link
                        </label>
                        <div className="relative">
                          <Link2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            placeholder="https://example.com/event"
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={eventLink}
                            onChange={(e) => setEventLink(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Start date
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Start time
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="time"
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          End date
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          End time
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="time"
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-slate-400/70 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Speakers
                    </h2>
                    <div className="relative space-y-3">
                      <Users className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Type a speaker and press Enter"
                        className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={speakerInput}
                        onChange={(e) => setSpeakerInput(e.target.value)}
                        onKeyDown={handleSpeakerKeyDown}
                        onBlur={handleSpeakerBlur}
                      />
                      {speakers.length > 0 && (
                        <>
                          <p className="text-xs text-gray-600">
                            {speakers.length} {speakers.length === 1 ? "speaker" : "speakers"} added
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {speakers.map((speaker) => (
                              <button
                                key={speaker}
                                type="button"
                                onClick={() => removeSpeaker(speaker)}
                                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
                              >
                                {speaker}
                                <span className="text-blue-500">x</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                  </div>

                </div>
              </div>

              <div>
                <div className="bg-white rounded-lg border border-slate-400/70 p-6 lg:sticky lg:top-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload media
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Add an event banner, poster, or cover image.
                  </p>

                  <div className="space-y-4">
                    {eventMediaPreview ? (
                      <div className="rounded-lg overflow-hidden border border-slate-300">
                        <img
                          src={eventMediaPreview}
                          alt="Event media preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ) : (
                      <label
                        htmlFor="event-media"
                        className="h-48 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-500 cursor-pointer hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-sm font-medium">No media selected</span>
                      </label>
                    )}

                    <input
                      id="event-media"
                      ref={mediaInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMediaChange}
                    />

                    {eventMedia && (
                      <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                        <p className="text-sm font-medium text-blue-900 truncate">
                          {eventMedia.name}
                        </p>
                        <p className="text-xs text-blue-700">
                          {(eventMedia.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="event-media"
                        className="inline-flex items-center gap-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-medium cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        {eventMedia ? "Change image" : "Upload image"}
                      </label>
                      {eventMedia && (
                        <button
                          type="button"
                          onClick={clearMedia}
                          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      JPG, PNG, WEBP. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="bg-white rounded-lg border border-slate-400/70 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <textarea
                  rows={5}
                  placeholder="Ex: topics, schedule, etc."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={5000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleCreateEvent}
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
