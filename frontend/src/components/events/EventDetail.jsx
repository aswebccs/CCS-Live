import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft, Calendar, Clock, MapPin, Link2, Users } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const formatEventDate = (value) => {
  if (!value) return "Date not set";
  const raw = String(value);

  // Keep date-only values untouched to avoid timezone drift.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeTimeInput = (value) => {
  if (!value) return "";
  return String(value).slice(0, 5);
};

const buildFormFromEvent = (event) => ({
  event_type: event?.event_type || "online",
  event_name: event?.event_name || "",
  event_link: event?.event_link || "",
  location: event?.location || "",
  start_date: formatEventDate(event?.start_date),
  start_time: normalizeTimeInput(event?.start_time),
  end_date: event?.end_date ? formatEventDate(event.end_date) : "",
  end_time: event?.end_time ? normalizeTimeInput(event.end_time) : "",
  description: event?.description || "",
  speakers: Array.isArray(event?.speakers) ? event.speakers : [],
});

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(false);
  const [speakerInput, setSpeakerInput] = useState("");
  const [editForm, setEditForm] = useState(buildFormFromEvent(null));
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_URL}/events/my/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setEvent(data.event);
          setEditForm(buildFormFromEvent(data.event));
        }
      } catch (err) {
        console.error("FETCH EVENT ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, token]);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await fetch(`${API_URL}/events/my/${eventId}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setApplicants(Array.isArray(data.applicants) ? data.applicants : []);
        } else {
          setApplicants([]);
        }
      } catch (err) {
        setApplicants([]);
      } finally {
        setApplicantsLoading(false);
      }
    };

    fetchApplicants();
  }, [eventId, token]);

  const getInitials = (name) => {
    if (!name) return "S";
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return `${first}${last}`.toUpperCase() || "S";
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const updateStatus = async (nextStatus) => {
    try {
      const res = await fetch(`${API_URL}/events/my/${eventId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ type: "error", text: data.message || "Failed to update status." });
        return;
      }
      setEvent((prev) => ({ ...prev, status: nextStatus }));
      setToast({
        type: "success",
        text:
          nextStatus === "inactive"
            ? "The event is now inactive."
            : "The event is now active.",
      });
    } catch (err) {
      setToast({ type: "error", text: "Server error. Please try again." });
    }
  };

  const startEditing = () => {
    if (!event) return;
    setEditForm(buildFormFromEvent(event));
    setSpeakerInput("");
    setIsEditing(true);
    setStatusOpen(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSpeakerInput("");
    setEditForm(buildFormFromEvent(event));
  };

  const addSpeaker = (name) => {
    const cleaned = name.trim();
    if (!cleaned) return;
    if (editForm.speakers.includes(cleaned)) return;
    setEditForm((prev) => ({ ...prev, speakers: [...prev.speakers, cleaned] }));
  };

  const removeSpeaker = (name) => {
    setEditForm((prev) => ({
      ...prev,
      speakers: prev.speakers.filter((s) => s !== name),
    }));
  };

  const saveEdit = async () => {
    if (!editForm.event_name || !editForm.start_date || !editForm.start_time) {
      setToast({ type: "error", text: "Please fill required fields." });
      return;
    }
    if (editForm.event_type === "online" && !editForm.event_link) {
      setToast({ type: "error", text: "Event link is required for online events." });
      return;
    }
    if (editForm.event_type === "in_person" && !editForm.location) {
      setToast({ type: "error", text: "Location is required for in-person events." });
      return;
    }

    try {
      setSavingEdit(true);
      const res = await fetch(`${API_URL}/events/my/${eventId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: editForm.event_type,
          event_name: editForm.event_name,
          event_link: editForm.event_type === "online" ? editForm.event_link : null,
          location: editForm.event_type === "in_person" ? editForm.location : null,
          start_date: editForm.start_date,
          start_time: editForm.start_time,
          end_date: editForm.end_date || null,
          end_time: editForm.end_time || null,
          description: editForm.description,
          speakers: editForm.speakers,
          status: event?.status || "active",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ type: "error", text: data.message || "Failed to update event." });
        return;
      }

      setEvent(data.event);
      setEditForm(buildFormFromEvent(data.event));
      setIsEditing(false);
      setSpeakerInput("");
      setToast({ type: "success", text: "Event updated successfully." });
    } catch (err) {
      setToast({ type: "error", text: "Server error. Please try again." });
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteEvent = async () => {
    const ok = window.confirm("Delete this event permanently? This cannot be undone.");
    if (!ok) return;

    try {
      setDeletingEvent(true);
      const res = await fetch(`${API_URL}/events/my/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ type: "error", text: data.message || "Failed to delete event." });
        return;
      }

      navigate("/events/manage", {
        replace: true,
        state: { toastSuccess: "Event deleted successfully." },
      });
    } catch (err) {
      setToast({ type: "error", text: "Server error. Please try again." });
    } finally {
      setDeletingEvent(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {toast && (
          <Toast
            message={toast.text}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <button
          onClick={() => navigate("/events/manage")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to events
        </button>

        <div className="bg-white rounded-2xl border border-slate-400/70 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {event.event_name}
              </h1>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {event.organizer_type}: {event.organizer_name || "Unknown"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Event Status
              </label>
              <div className="relative" ref={statusRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditing) setStatusOpen((prev) => !prev);
                  }}
                  disabled={isEditing}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${event.status === "inactive"
                        ? "bg-red-500"
                        : "bg-emerald-500"
                        }`}
                    />
                    <span className="text-gray-900">
                      {event.status === "inactive" ? "Inactive" : "Active"}
                    </span>
                  </span>
                  <span className="text-gray-500" />
                </button>

                {statusOpen && (
                  <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setStatusOpen(false);
                          updateStatus("active");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusOpen(false);
                          updateStatus("inactive");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Inactive</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border border-slate-400/70 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Event details
                </h2>
                {!isEditing ? (
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Start: {formatEventDate(event.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Time: {event.start_time}</span>
                  </div>
                  {event.end_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>End: {formatEventDate(event.end_date)}</span>
                    </div>
                  )}
                  {event.end_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>End time: {event.end_time}</span>
                    </div>
                  )}
                  {event.event_type === "in_person" && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{event.location || "Location not set"}</span>
                    </div>
                  )}
                  {event.event_type === "online" && (
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-gray-500" />
                      <span>{event.event_link || "Link not set"}</span>
                    </div>
                  )}
                </div>
                ) : (
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Event type</label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="eventType"
                          value="online"
                          checked={editForm.event_type === "online"}
                          onChange={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              event_type: "online",
                              location: "",
                            }))
                          }
                        />
                        Online
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="eventType"
                          value="in_person"
                          checked={editForm.event_type === "in_person"}
                          onChange={() =>
                            setEditForm((prev) => ({
                              ...prev,
                              event_type: "in_person",
                              event_link: "",
                            }))
                          }
                        />
                        In person
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Event name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                      value={editForm.event_name}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, event_name: e.target.value }))
                      }
                    />
                  </div>

                  {editForm.event_type === "online" ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Event link</label>
                      <input
                        type="url"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        value={editForm.event_link}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, event_link: e.target.value }))
                        }
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, location: e.target.value }))
                        }
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Start date</label>
                      <input
                        type="date"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        value={editForm.start_date}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, start_date: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Start time</label>
                      <input
                        type="time"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        value={editForm.start_time}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, start_time: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">End date</label>
                      <input
                        type="date"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        value={editForm.end_date}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, end_date: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">End time</label>
                      <input
                        type="time"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        value={editForm.end_time}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, end_time: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
                )}
              </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-slate-400/70 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Speakers
                  </h2>
                  {!isEditing && event.speakers?.length ? (
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      {event.speakers.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : !isEditing ? (
                    <p className="text-gray-500 text-sm">No speakers added.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <Users className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Type speaker name and press Enter"
                          className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2"
                          value={speakerInput}
                          onChange={(e) => setSpeakerInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              addSpeaker(speakerInput);
                              setSpeakerInput("");
                            }
                          }}
                          onBlur={() => {
                            if (speakerInput.trim()) {
                              addSpeaker(speakerInput);
                              setSpeakerInput("");
                            }
                          }}
                        />
                      </div>
                      {editForm.speakers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editForm.speakers.map((speaker) => (
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
                      ) : (
                        <p className="text-gray-500 text-sm">No speakers added.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg border border-slate-400/70 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Applied Students
                    </h2>
                    <span className="text-sm text-gray-500">
                      {applicants.length} total
                    </span>
                  </div>

                  {applicantsLoading && (
                    <p className="text-sm text-gray-500">Loading applicants...</p>
                  )}

                  {!applicantsLoading && applicants.length === 0 && (
                    <p className="text-sm text-gray-500">No applications yet.</p>
                  )}

                  {!applicantsLoading && applicants.length > 0 && (
                    <div className="space-y-3">
                      {applicants.map((applicant) => (
                        <div
                          key={applicant.id}
                          className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
                        >
                          {applicant.profile_image_url ? (
                            <img
                              src={applicant.profile_image_url}
                              alt={applicant.student_name || "Student"}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold">
                              {getInitials(applicant.student_name)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {applicant.student_name || "Student"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-400/70 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Description
              </h2>
              {!isEditing ? (
                <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                  {event.description || "No description provided."}
                </p>
              ) : (
                <textarea
                  rows={5}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              {!isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={deleteEvent}
                    disabled={deletingEvent}
                  >
                    {deletingEvent ? "Deleting..." : "Delete Event"}
                  </Button>
                  <Button
                    type="button"
                    className="border border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-200"
                    onClick={startEditing}
                  >
                    Edit Event
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={savingEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={saveEdit}
                    disabled={savingEdit}
                  >
                    {savingEdit ? "Updating..." : "Update Event"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
