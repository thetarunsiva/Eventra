import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";

import ClosedEventOverlay from "../components/ClosedEventOverlay";

const localizer = dateFnsLocalizer({
      format,
      parse,
      startOfWeek,
      getDay,
      locales: {},
});

const uiPalette = {
      page: "#fff8f4",
      surface: "#fffdfc",
      surfaceAlt: "#fff7f0",
      border: "#eadfd8",
      text: "#2D1B12",
      muted: "#5C4A40",
      softText: "#6b5a50",
      accent: "#2D1B12",
      accentSoft: "#f3e6db",
      closedBg: "#f4f4f5",
      closedBorder: "#d4d4d8",
};

function Dashboard() {
      const navigate = useNavigate();
      const [events, setEvents] = useState([]);
      const [pendingEvents, setPendingEvents] = useState([]);
      const [selectedEvent, setSelectedEvent] = useState(null);
      const [searchTerm, setSearchTerm] = useState("");
      const [currentDate, setCurrentDate] = useState(new Date());

      useEffect(() => {
            const fetchApprovedEvents = async () => {
                  try {
                        const token = localStorage.getItem("token");
                        const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/approved`,
                              {
                                    headers: {
                                          Authorization: `Bearer ${token}`,
                                    },
                              }
                        );
                        setEvents(response.data);
                  }
                  catch (error) {
                        console.error("Error fetching approved events:", error);
                  }
            }
            fetchApprovedEvents();
      }, []);

      useEffect(() => {
            const fetchPendingEvents = async () => {
                  try {
                        const token = localStorage.getItem("token");
                        const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/pending`,
                              {
                                    headers: {
                                          Authorization: `Bearer ${token}`,
                                    },
                              }
                        );
                        setPendingEvents(response.data);
                  }
                  catch (error) {
                        console.error("Error fetching pending events:", error);
                  }
            }
            fetchPendingEvents();
      }, []);

      useEffect(() => {
            if (selectedEvent) {
                  document.body.style.overflow = "hidden";
            }
            else {
                  document.body.style.overflow = "auto";
            }
            return () => {
                  document.body.style.overflow = "auto";
            };
      }, [selectedEvent]);

      const handleLogout = () => {
            localStorage.removeItem("token");
            navigate("/");
      }

      const formatDate = (date) => {
            if (!date) return "N/A";
            return new Date(date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
            });
      };

      const displayValue = (value) => {
            if (!value || value.trim() === "") return "N/A";
            return value;
      }

      const cleanDescription = (text) => {
            if (!text) return "N/A";
            return text
                  .replace(/\\r\\n/g, "\n")
                  .replace(/\r\n/g, "\n")
                  .replace(/\\n/g, "\n")
                  .trim();
      }

      const isClosedEvent = (date) => {
            if (!date) return false;
            return new Date(date) < new Date();
      };

      const sortedEvents = [...events].sort((a, b) => {
            const dateA = a.registrationDeadline || a.eventDate || null;
            const dateB = b.registrationDeadline || b.eventDate || null;
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return new Date(dateB) - new Date(dateA);
      });

      const sortedPendingEvents = [...pendingEvents].sort((a, b) => {
            const dateA = a.registrationDeadline || a.eventDate || null;
            const dateB = b.registrationDeadline || b.eventDate || null;
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return new Date(dateB) - new Date(dateA);
      });

      const filteredEvents = sortedEvents.filter((event) => {
            const query = searchTerm.toLowerCase();
            return (
                  event.title?.toLowerCase().includes(query) ||
                  event.club?.toLowerCase().includes(query) ||
                  event.tags?.join(" ").toLowerCase().includes(query) ||
                  event.description?.toLowerCase().includes(query) ||
                  event.location?.toLowerCase().includes(query)
            );
      });

      const calendarEvents = sortedEvents
            .filter(event => event.eventDate)
            .map(event => ({
                  title: event.title,
                  start: new Date(event.eventDate),
                  end: new Date(event.eventDate),
                  resource: event,
            }));

      return (
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 40px", background: "linear-gradient(180deg, #fff8f4 0%, #fffdfc 28%, #fffaf7 100%)", minHeight: "100vh" }}>
                  <style>{`
                        .eventra-calendar .rbc-toolbar {
                              margin-bottom: 10px;
                              color: ${uiPalette.text};
                        }

                        .eventra-calendar .rbc-toolbar button {
                              color: ${uiPalette.text};
                              background: ${uiPalette.surface};
                              border: 1px solid ${uiPalette.border};
                              border-radius: 10px;
                              box-shadow: 0 6px 14px rgba(45, 27, 18, 0.08);
                        }

                        .eventra-calendar .rbc-toolbar button.rbc-active,
                        .eventra-calendar .rbc-toolbar button:active,
                        .eventra-calendar .rbc-toolbar button:hover {
                              background: ${uiPalette.accentSoft};
                              color: ${uiPalette.text};
                        }

                        .eventra-calendar .rbc-month-view,
                        .eventra-calendar .rbc-time-view,
                        .eventra-calendar .rbc-agenda-view {
                              background: ${uiPalette.surface};
                              border: 1px solid ${uiPalette.border};
                              border-radius: 14px;
                              overflow: hidden;
                        }

                        .eventra-calendar .rbc-header {
                              background: ${uiPalette.accentSoft};
                              color: ${uiPalette.text};
                              border-bottom: 1px solid ${uiPalette.border};
                              padding: 8px 4px;
                              font-weight: 700;
                        }

                        .eventra-calendar .rbc-day-bg + .rbc-day-bg,
                        .eventra-calendar .rbc-month-row + .rbc-month-row,
                        .eventra-calendar .rbc-header + .rbc-header {
                              border-left: 1px solid ${uiPalette.border};
                        }

                        .eventra-calendar .rbc-off-range-bg {
                              background: #f7efea;
                        }

                        .eventra-calendar .rbc-today {
                              background: rgba(180, 83, 9, 0.08);
                        }

                        .eventra-calendar .rbc-date-cell {
                              color: ${uiPalette.softText};
                              padding: 4px 8px 0 0;
                              font-weight: 600;
                        }

                        .eventra-calendar .rbc-off-range .rbc-date-cell {
                              color: #a08f86;
                        }

                        .eventra-calendar .rbc-event {
                              background: linear-gradient(135deg, #2D1B12 0%, #5C4A40 100%);
                              color: #fffdfc;
                              border: none;
                              border-radius: 10px;
                              box-shadow: 0 8px 16px rgba(45, 27, 18, 0.18);
                              padding: 2px 6px;
                        }

                        .eventra-calendar .rbc-event-label,
                        .eventra-calendar .rbc-event-content {
                              color: #fffdfc;
                        }

                        .eventra-calendar .rbc-show-more {
                              color: ${uiPalette.text};
                              font-weight: 700;
                        }
                  `}</style>
                  {/* Navbar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: `1px solid ${uiPalette.border}`, marginBottom: "28px" }}>
                        <h2
                              style={{
                                    margin: 0,
                                    fontSize: "28px",
                                    fontWeight: "700",
                                    letterSpacing: "-0.5px",
                                    color: uiPalette.text
                              }}
                        >
                              Eventra
                        </h2>
                        <button onClick={handleLogout} style={{ padding: "10px 18px", border: `1px solid ${uiPalette.border}`, borderRadius: "12px", cursor: "pointer", background: uiPalette.surface, color: uiPalette.text, fontWeight: "600", boxShadow: "0 4px 12px rgba(45, 27, 18, 0.06)" }}>
                              Logout
                        </button>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                        <div style={{ background: uiPalette.surface, border: `1px solid ${uiPalette.border}`, borderRadius: "16px", padding: "24px", minHeight: "120px", flex: 1, textAlign: "center", boxShadow: "0 10px 24px rgba(45, 27, 18, 0.06)" }}>
                              <h2 style={{ margin: 0, fontSize: "2rem", color: uiPalette.text }}>{events.length}</h2>
                              <p style={{ margin: 0, color: uiPalette.muted, fontWeight: 500 }}>Approved</p>
                        </div>
                        <div style={{ background: uiPalette.surface, border: `1px solid ${uiPalette.border}`, borderRadius: "16px", padding: "24px", minHeight: "120px", flex: 1, textAlign: "center", boxShadow: "0 10px 24px rgba(45, 27, 18, 0.06)" }}>
                              <h2 style={{ margin: 0, fontSize: "2rem", color: uiPalette.text }}>{pendingEvents.length}</h2>
                              <p style={{ margin: 0, color: uiPalette.muted, fontWeight: 500 }}>Pending</p>
                        </div>
                        <div style={{ background: uiPalette.surface, border: `1px solid ${uiPalette.border}`, borderRadius: "16px", padding: "24px", minHeight: "120px", flex: 1, textAlign: "center", boxShadow: "0 10px 24px rgba(45, 27, 18, 0.06)" }}>
                              <h2 style={{ margin: 0, fontSize: "2rem", color: uiPalette.text }}>{events.length + pendingEvents.length}</h2>
                              <p style={{ margin: 0, color: uiPalette.muted, fontWeight: 500 }}>Total</p>
                        </div>
                  </div>

                  {/* Search */}
                  <input
                        type="text"
                        placeholder="Search by title, club, tags, description or location.."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%", padding: "14px 18px", borderRadius: "12px", border: `2px solid ${uiPalette.border}`, background: uiPalette.surface, color: uiPalette.text, fontSize: "15px", marginBottom: "28px", boxSizing: "border-box", boxShadow: "0 14px 30px rgba(45, 27, 18, 0.12)" }}
                  />

                  {/* Calendar */}
                  <h3 style={{ marginBottom: "12px", color: uiPalette.text }}>Calendar view</h3>
                  <div className="eventra-calendar" style={{ height: "500px", marginBottom: "40px", background: uiPalette.surface, border: `1px solid ${uiPalette.border}`, borderRadius: "16px", padding: "10px", boxShadow: "0 16px 36px rgba(45, 27, 18, 0.16)" }}>
                        <Calendar
                              localizer={localizer}
                              events={calendarEvents}
                              date={currentDate}
                              startAccessor="start"
                              endAccessor="end"
                              views={["month"]}
                              selectable
                              onNavigate={(date) => setCurrentDate(date)}
                              onSelectEvent={(calendarEvent) =>
                                    setSelectedEvent(calendarEvent.resource)
                              }
                        />
                  </div>

                  {/* Approved Events */}
                  <h3 style={{ marginBottom: "16px", color: uiPalette.text }}>
                        Showing {filteredEvents.length} of {events.length} Approved Events
                  </h3>
                  {filteredEvents.map((event) => {
                        const isPastEvent = isClosedEvent(event.eventDate);
                        return (
                              <div key={event._id} onClick={() => setSelectedEvent(event)} 
                              style={{
                                    position: "relative",
                                    overflow: "hidden",
                                    background: isPastEvent ? uiPalette.closedBg : uiPalette.surface,
                                    color: isPastEvent ? "#52525b" : uiPalette.text,
                                    border: isPastEvent
                                          ? `1px solid ${uiPalette.closedBorder}`
                                          : `1px solid ${uiPalette.border}`,
                                    filter: isPastEvent ? "grayscale(100%)" : "none",
                                    opacity: isPastEvent ? 0.78 : 1,
                                    borderRadius: "16px",
                                    padding: "24px",
                                    minHeight: "240px",
                                    marginBottom: "20px",
                                    cursor: "pointer",
                                    boxShadow: isPastEvent
                                          ? "0 2px 8px rgba(0,0,0,0.03)"
                                          : "0 10px 24px rgba(45, 27, 18, 0.06)",
                                    transition: "all 0.2s ease"
                              }}>
                                    {isPastEvent && <ClosedEventOverlay />}
                                    <h3 style={{ margin: "0 0 12px 0", fontSize: "22px", fontWeight: "700", color: isPastEvent ? "#3f3f46" : uiPalette.text }}>
                                                {event.title}
                                    </h3>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Date: </strong>
                                          {formatDate(event.eventDate)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Time: </strong>
                                          {displayValue(event.eventTime)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Location: </strong>
                                          {displayValue(event.location)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Club: </strong>
                                          {displayValue(event.club)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Registration Deadline: </strong>
                                          {formatDate(event.registrationDeadline)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Tags:</strong>{" "}
                                          {event.tags?.join(" | ") || "N/A"}
                                    </p>
                                    <p style={{ margin: "8px 0", color: isPastEvent ? "#52525b" : uiPalette.muted, fontStyle: "italic" }}>
                                          {cleanDescription(event.description).slice(0, 360)}
                                          ...
                                    </p>
                                    {event.registrationLink && (
                                          <a
                                                href={event.registrationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ textDecoration: "none", display: "inline-block", marginTop: "12px" }}
                                          >
                                                <button style={{ padding: "8px 16px", border: "none", borderRadius: "8px", backgroundColor: uiPalette.accent, color: "white", fontSize: "14px", cursor: "pointer", boxShadow: "0 6px 16px rgba(45, 27, 18, 0.16)" }}>
                                                      Register here
                                                </button>
                                          </a>
                                    )}
                              </div>
                        );
                  })}

                  {/* Pending Events */}
                  <h3 style={{ marginTop: "32px", marginBottom: "16px", color: uiPalette.text }}> 
                        Pending Events: {pendingEvents.length}
                  </h3>
                  {sortedPendingEvents.map((event) => {
                        const isPastEvent = isClosedEvent(event.eventDate);
                        return (
                              <div key={event._id} onClick={() => setSelectedEvent(event)} style={{ position: "relative", overflow: "hidden", background: isPastEvent ? uiPalette.closedBg : uiPalette.surfaceAlt, color: isPastEvent ? "#52525b" : uiPalette.text, border: isPastEvent ? `1px solid ${uiPalette.closedBorder}` : `1px solid ${uiPalette.border}`, borderRadius: "16px", padding: "24px", marginBottom: "20px", cursor: "pointer", boxShadow: isPastEvent ? "0 2px 8px rgba(0,0,0,0.03)" : "0 10px 24px rgba(45, 27, 18, 0.06)", filter: isPastEvent ? "grayscale(100%)" : "none", opacity: isPastEvent ? 0.78 : 1 }}>
                                    {isPastEvent && <ClosedEventOverlay />}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                          <h3 style={{ margin: 0 }}>{event.title}</h3>
                                          <span style={{ backgroundColor: "#f3e6db", color: uiPalette.text, padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>Pending</span>
                                    </div>
                                    <div style={{ border: "1px solid #d6b08f", background: "rgba(255,255,255,0.55)", padding: "8px 12px", borderRadius: "10px", marginBottom: "12px" }}>
                                          <h4 style={{ margin: 0 }}>⚠️ This event is <strong>PENDING Approval</strong> and may be subject to changes</h4>
                                    </div>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Date: </strong>
                                          {formatDate(event.eventDate)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Time: </strong>
                                          {displayValue(event.eventTime)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Location: </strong>
                                          {displayValue(event.location)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Club: </strong>
                                          {displayValue(event.club)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Registration Deadline: </strong>
                                          {formatDate(event.registrationDeadline)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Tags:</strong>{" "}
                                          {event.tags?.join(" | ") || "N/A"}
                                    </p>
                                    <p style={{ margin: "8px 0", color: isPastEvent ? "#52525b" : uiPalette.muted, fontStyle: "italic" }}>
                                          {cleanDescription(event.description).slice(0, 360)}
                                          ...
                                    </p>
                                    {event.registrationLink && (
                                          <a
                                                href={event.registrationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ textDecoration: "none", display: "inline-block", marginTop: "12px" }}
                                          >
                                                <button style={{ padding: "8px 16px", border: "none", borderRadius: "8px", backgroundColor: "#b45309", color: "white", fontSize: "14px", cursor: "pointer", boxShadow: "0 6px 16px rgba(180, 83, 9, 0.16)" }}>
                                                      Register here
                                                </button>
                                          </a>
                                    )}
                              </div>
                        );
                  })}

                  {/* Modal */}
                  {selectedEvent && (
                        <div
                              onClick={() => setSelectedEvent(null)}
                              style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}
                        >
                              <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ backgroundColor: uiPalette.surface, paddingBottom: "20px", width: "80%", maxWidth: "1000px", maxHeight: "90vh", overflowY: "auto", borderRadius: "20px", boxShadow: "0 24px 60px rgba(45, 27, 18, 0.18)", border: `1px solid ${uiPalette.border}` }}
                              >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: uiPalette.surface, padding: "12px 20px", borderBottom: `1px solid ${uiPalette.border}` }}>
                                          <h3 style={{ margin: 0 }}>{selectedEvent.title}</h3>
                                          <button
                                                onClick={() => setSelectedEvent(null)}
                                                style={{ border: `1px solid ${uiPalette.border}`, backgroundColor: uiPalette.surface, borderRadius: "6px", width: "32px", height: "32px", cursor: "pointer", fontWeight: "600" }}
                                          >
                                                X
                                          </button>
                                    </div>
                                    <div style={{ padding: "20px" }}>
                                          {selectedEvent.status === "Pending" && (
                                                <div style={{ border: "1px solid #d6b08f", background: "rgba(255,255,255,0.65)", padding: "8px 12px", borderRadius: "10px", marginBottom: "12px" }}>
                                                      <h4 style={{ margin: 0 }}>⚠️ This event is <strong>PENDING Approval</strong> and may be subject to changes</h4>
                                                </div>
                                          )}
                                          <h3>AI Summary</h3>
                                          <p>{cleanDescription(selectedEvent.description)}</p>
                                          <h3>Original Email</h3>
                                          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "13px", color: "#444" }}>
                                                {cleanDescription(selectedEvent.fullEmailBody)}
                                          </pre>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
};

export default Dashboard;