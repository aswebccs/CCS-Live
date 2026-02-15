import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft, Calendar, MapPin, Search, Clock, Link2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentApplyEvent() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [datePostedFilter, setDatePostedFilter] = useState("all");
  const [applyingId, setApplyingId] = useState(null);
  const [appliedEventIds, setAppliedEventIds] = useState([]);
  const [feedMode, setFeedMode] = useState("all");
  const [page, setPage] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const query = new URLSearchParams();
        if (eventTypeFilter !== "all") query.set("event_type", eventTypeFilter);
        if (datePostedFilter !== "all") query.set("date_posted", datePostedFilter);

        const qs = query.toString();
        const feedUrl = `${API_URL}/events/feed${qs ? `?${qs}` : ""}`;
        const res = await fetch(feedUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          const nextEvents = Array.isArray(data.events) ? data.events : [];
          setEvents(nextEvents);
          setAppliedEventIds(
            nextEvents
              .filter((event) => event.is_applied)
              .map((event) => String(event.id))
          );
        } else {
          setEvents([]);
          setAppliedEventIds([]);
        }
      } catch (err) {
        setEvents([]);
        setAppliedEventIds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [eventTypeFilter, datePostedFilter]);

  const handleApply = async (eventId) => {
    if (!eventId || applyingId) return;
    const normalizedEventId = String(eventId);
    setApplyingId(normalizedEventId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/events/${eventId}/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data.message || "You have applied for this event.");
        setAppliedEventIds((prev) => (
          prev.includes(normalizedEventId) ? prev : [...prev, normalizedEventId]
        ));
      } else {
        toast.error(data.message || "Failed to apply for this event.");
      }
    } catch (err) {
      toast.error("Server error. Please try again.");
    } finally {
      setApplyingId(null);
    }
  };

  const filteredEvents = useMemo(() => {
    const baseEvents = feedMode === "applied"
      ? events.filter((event) => (
        event.is_applied || appliedEventIds.includes(String(event.id))
      ))
      : events;
    const term = search.trim().toLowerCase();
    if (!term) return baseEvents;

    return baseEvents.filter((event) => {
      const speakersText = Array.isArray(event.speakers)
        ? event.speakers.join(" ")
        : "";
      return (
        (event.event_name || "").toLowerCase().includes(term) ||
        (event.organizer_name || "").toLowerCase().includes(term) ||
        (event.organizer_type || "").toLowerCase().includes(term) ||
        (event.description || "").toLowerCase().includes(term) ||
        speakersText.toLowerCase().includes(term)
      );
    });
  }, [events, search, feedMode, appliedEventIds]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const pageSize = 4;
  const totalPages = Math.max(1, filteredEvents.length - pageSize + 1);
  const safePage = Math.min(page, totalPages - 1);
  const hasMultiplePages = totalPages > 1;

  useEffect(() => {
    if (loading || isCarouselPaused || !hasMultiplePages) return;

    const intervalId = window.setInterval(() => {
      setPage((prev) => ((prev + 1) % totalPages));
    }, 1800);

    return () => window.clearInterval(intervalId);
  }, [loading, isCarouselPaused, hasMultiplePages, totalPages]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date not set";
    const d = new Date(dateValue);
    return Number.isNaN(d.getTime())
      ? String(dateValue)
      : d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Source+Sans+3:wght@400;500;600&display=swap");

        :root {
          --panel: #ffffff;
          --ink: #0f172a;
          --muted: #5b6575;
          --border: rgba(15, 23, 42, 0.24);
          --soft: #f4f5f7;
          --accent: #111827;
        }
        .events-hero {
          background: #ffffff;
        }
        .event-card {
          background: var(--panel);
          border: 1px solid var(--border);
          box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .event-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
        }
        .card-body {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .poster {
          aspect-ratio: 4 / 5;
          background: #f2f3f7;
        }
        .poster::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.0) 0%, rgba(15, 23, 42, 0.22) 100%);
        }
        .tag {
          background: var(--soft);
          border: 1px solid var(--border);
        }
        .font-display {
          font-family: "Merriweather", Georgia, serif;
        }
        .font-body {
          font-family: "Source Sans 3", system-ui, sans-serif;
        }
        .fade-up {
          animation: fadeUp 450ms ease both;
        }
        .nav-icon {
          height: 40px;
          width: 40px;
          border-radius: 999px;
          background: #ffffff;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
          color: #475569;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #64748b;
        }
        .nav-icon:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .carousel-viewport {
          overflow: hidden;
        }
        .carousel-track {
          --carousel-gap: 24px;
          --carousel-card-width: calc((100% - (var(--carousel-gap) * 3)) / 4.15);
          display: flex;
          gap: var(--carousel-gap);
          transition: transform 500ms ease;
          will-change: transform;
        }
        .carousel-item {
          flex: 0 0 var(--carousel-card-width);
          min-width: 0;
        }
        @media (max-width: 1279px) {
          .carousel-track {
            --carousel-card-width: calc((100% - var(--carousel-gap)) / 2.05);
          }
        }
        @media (max-width: 639px) {
          .carousel-track {
            --carousel-card-width: 100%;
          }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="events-hero px-4 py-8">
        <div className="max-w-6xl mx-auto font-body">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8">
              <p className="uppercase tracking-[0.2em] text-xs font-bold text-slate-500 mb-2">
                Student Events
              </p>
              <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight text-purple-700">
                Discover events that build your edge.
              </h1>
              <div className="mt-5 relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by event name, organizer, location, or speakers"
                  className="w-full border border-slate-500 rounded-2xl pl-12 pr-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setEventTypeFilter((prev) => (prev === "online" ? "all" : "online"))}
                  className={`rounded-full border px-4 py-2 ${eventTypeFilter === "online" ? "border-slate-800 text-slate-900 bg-slate-50" : "border-slate-500 text-slate-700 bg-white"}`}
                >
                  Event type: Online
                </button>
                <button
                  type="button"
                  onClick={() => setEventTypeFilter((prev) => (prev === "in_person" ? "all" : "in_person"))}
                  className={`rounded-full border px-4 py-2 ${eventTypeFilter === "in_person" ? "border-slate-800 text-slate-900 bg-slate-50" : "border-slate-500 text-slate-700 bg-white"}`}
                >
                  Event type: In person
                </button>
                <div className="relative">
                  <select
                    className="appearance-none rounded-full border border-slate-500 pl-4 pr-10 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 min-w-[140px]"
                    value={datePostedFilter}
                    onChange={(e) => setDatePostedFilter(e.target.value)}
                  >
                    <option value="all">Any date</option>
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="rounded-3xl border border-slate-400 bg-gradient-to-b from-white to-slate-50 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Your feed</h2>
                  <span className="text-xs text-slate-500">
                    {feedMode === "applied" ? "Applied only" : "All events"}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Track your applied events here.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedMode((prev) => (prev === "applied" ? "all" : "applied"))}
                    className={`rounded-xl border px-3 py-2 text-left transition-colors ${feedMode === "applied" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-500 bg-white text-slate-700 hover:bg-slate-100"}`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.12em]">Applied</p>
                    <p className="text-lg font-semibold">{appliedEventIds.length}</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-12">
        <div className="max-w-6xl mx-auto font-body">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Events</h2>
            <div className="text-sm text-slate-500">
              {filteredEvents.length} events
            </div>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            {filteredEvents.length > pageSize && (
              <>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="nav-icon hidden xl:inline-flex absolute -left-14 top-1/2 -translate-y-1/2 z-10"
                  aria-label="Previous events"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="nav-icon hidden xl:inline-flex absolute -right-14 top-1/2 -translate-y-1/2 z-10"
                  aria-label="Next events"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            {loading && (
              <div className="border border-slate-400 rounded-2xl p-6 bg-white text-sm text-slate-600">
                Loading events...
              </div>
            )}

            {!loading && filteredEvents.length === 0 && (
              <div className="border border-slate-400 rounded-2xl p-6 bg-white text-sm text-slate-600">
                No events found.
              </div>
            )}

            {!loading && filteredEvents.length > 0 && (
              <div className="carousel-viewport">
                <div
                  className="carousel-track"
                  style={{
                    transform: `translateX(calc(-${safePage} * (var(--carousel-card-width) + var(--carousel-gap))))`,
                  }}
                >
            {filteredEvents.map((event) => (
              <div key={event.id} className="carousel-item">
                <div className="event-card rounded-3xl overflow-hidden transition-all duration-300 fade-up">
                  <div className="relative poster w-full overflow-hidden">
                  {event.event_media_url ? (
                    <img
                      src={event.event_media_url}
                      alt={`${event.event_name || "Event"} banner`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
                  )}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-700">
                      {event.event_type === "online" ? "Online" : "In person"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/80">
                      {event.organizer_type || "Organization"}
                    </p>
                    <p className="text-sm font-semibold truncate">
                      {event.organizer_name || "Organizer"}
                    </p>
                  </div>
                  </div>

                  <div className="p-4 card-body min-h-[210px]">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(event.start_date)}
                    <span className="mx-1">•</span>
                    <Clock className="w-4 h-4" />
                    {event.start_time || "Time not set"}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mt-2 line-clamp-2 min-h-[44px]">
                    {event.event_name}
                  </h3>
                  {!!event.description && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 min-h-[32px]">
                      {event.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-4 h-4" />
                    {event.event_type === "online"
                      ? "Online"
                      : event.location || "Location not set"}
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {event.applications_count ?? (Array.isArray(event.speakers) ? event.speakers.length : 0)} applied
                    </div>
                    <Button
                      className="bg-[#111827] text-white hover:bg-[#0b1220] h-9 px-4 text-sm"
                      type="button"
                      onClick={() => handleApply(event.id)}
                      disabled={applyingId === String(event.id) || appliedEventIds.includes(String(event.id))}
                    >
                      {appliedEventIds.includes(String(event.id)) ? "Applied" : applyingId === String(event.id) ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                    <div className="h-6 mt-3">
                      {event.event_type === "online" && event.event_link && (
                        <a
                          href={event.event_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 break-all"
                        >
                          <Link2 className="w-4 h-4" />
                          Join link
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
                </div>
              </div>
            )}
          </div>

          {filteredEvents.length > pageSize && (
            <div className="mt-4 text-center text-sm text-slate-500">
              Page {safePage + 1} of {totalPages}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
