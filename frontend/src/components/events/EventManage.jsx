import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft, Calendar, MapPin, Link2 } from "lucide-react";
import { toast } from "sonner";

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

export default function EventManage() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const successMessage = location.state?.toastSuccess;
    if (!successMessage) return;
    toast.success(successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/events/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("FETCH EVENTS ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        <div className="bg-white rounded-2xl border border-slate-400/70 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                My Events
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and edit events created by your organization.
              </p>
            </div>
            <Button
              onClick={() => navigate("/events/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Event
            </Button>
          </div>

          {loading && <p className="text-gray-500">Loading events...</p>}

          {!loading && events.length === 0 && (
            <p className="text-gray-500">No events created yet.</p>
          )}

          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="border border-slate-400/70 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/events/manage/${event.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {event.event_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {event.organizer_type}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatEventDate(event.start_date)}
                      </span>
                      {event.event_type === "in_person" && (
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location || "Location not set"}
                        </span>
                      )}
                      {event.event_type === "online" && (
                        <span className="flex items-center gap-2">
                          <Link2 className="w-4 h-4" />
                          {event.event_link || "Link not set"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
