import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function PublicEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/events/public/${eventId}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.event) {
          setEvent(data.event);
        } else {
          setEvent(null);
        }
      } catch (_) {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date not set";
    const d = new Date(dateValue);
    return Number.isNaN(d.getTime()) ? String(dateValue) : d.toLocaleDateString();
  };

  const handleApply = async () => {
    if (!eventId || applying) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to apply for this event.");
      navigate("/login");
      return;
    }

    try {
      setApplying(true);
      const res = await fetch(`${API_URL}/events/${eventId}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data.message || "Applied for this event successfully.");
      } else {
        toast.error(data.message || "Failed to apply for this event.");
      }
    } catch (_) {
      toast.error("Server error. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {loading && (
          <div className="rounded-2xl border border-slate-300 bg-white p-6 text-sm text-slate-600">
            Loading event...
          </div>
        )}

        {!loading && !event && (
          <div className="rounded-2xl border border-slate-300 bg-white p-6 text-sm text-slate-600">
            Event not found.
          </div>
        )}

        {!loading && event && (
          <div className="overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm">
            <div className="relative h-64 w-full overflow-hidden bg-slate-100">
              {event.event_media_url ? (
                <img
                  src={event.event_media_url}
                  alt={`${event.event_name || "Event"} banner`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200" />
              )}
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-800">
                {event.event_type === "online" ? "Online" : "In person"}
              </div>
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-bold text-slate-900">{event.event_name}</h1>
              <p className="mt-2 text-sm text-slate-600">Created by: {event.organizer_name || "Organizer"}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-700">
                <div className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.start_date)}
                </div>
                <div className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {event.start_time || "Time not set"}
                </div>
                <div className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event.event_type === "online" ? "Online" : event.location || "Location not set"}
                </div>
              </div>

              <p className="mt-5 whitespace-pre-wrap break-words text-sm text-slate-800">
                {event.description || "No description provided."}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-slate-600">{event.applications_count || 0} applied</p>
                <Button
                  type="button"
                  className="h-10 bg-[#111827] px-5 text-sm text-white hover:bg-[#0b1220]"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? "Applying..." : "Apply"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
