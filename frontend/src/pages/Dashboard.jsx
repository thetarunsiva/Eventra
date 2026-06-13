import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";

const localizer = dateFnsLocalizer({
      format,
      parse,
      startOfWeek,
      getDay,
      locales: {},
});

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

      const sortedEvents = [...events].sort((a, b) => {
            const dateA = a.registrationDeadline || a.eventDate || null;
            const dateB = b.registrationDeadline || b.eventDate || null;
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return new Date(dateA) - new Date(dateB);
      });

      const sortedPendingEvents = [...pendingEvents].sort((a, b) => {
            const dateA = a.registrationDeadline || a.eventDate || null;
            const dateB = b.registrationDeadline || b.eventDate || null;
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return new Date(dateA) - new Date(dateB);
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
            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
                  {/* Navbar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e5e5e5", marginBottom: "24px" }}>
                        <h2 style={{ margin: 0 }}>Eventra</h2>
                        <button onClick={handleLogout} style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer", background: "white" }}>
                              Logout
                        </button>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                        <div style={{ border: "1px solid #e5e5e5", borderRadius: "8px", padding: "16px 24px", flex: 1, textAlign: "center" }}>
                              <h2 style={{ margin: 0, fontSize: "2rem" }}>{events.length}</h2>
                              <p style={{ margin: 0, color: "#666" }}>Approved</p>
                        </div>
                        <div style={{ border: "1px solid #e5e5e5", borderRadius: "8px", padding: "16px 24px", flex: 1, textAlign: "center" }}>
                              <h2 style={{ margin: 0, fontSize: "2rem" }}>{pendingEvents.length}</h2>
                              <p style={{ margin: 0, color: "#666" }}>Pending</p>
                        </div>
                        <div style={{ border: "1px solid #e5e5e5", borderRadius: "8px", padding: "16px 24px", flex: 1, textAlign: "center" }}>
                              <h2 style={{ margin: 0, fontSize: "2rem" }}>{events.length + pendingEvents.length}</h2>
                              <p style={{ margin: 0, color: "#666" }}>Total</p>
                        </div>
                  </div>

                  {/* Search */}
                  <input
                        type="text"
                        placeholder="Search by title, club, tags, description or location.."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "14px", marginBottom: "24px", boxSizing: "border-box" }}
                  />

                  {/* Calendar */}
                  <h3 style={{ marginBottom: "12px" }}> Calendar view </h3>
                  <div style={{ height: "500px", marginBottom: "40px" }}>
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
                  <h3 style={{ marginBottom: "16px" }}>
                        Showing {filteredEvents.length} of {events.length} Approved Events
                  </h3>
                  {filteredEvents.map((event) => {
                        return (
                              <div key={event._id} onClick={() => setSelectedEvent(event)} style={{ border: "1px solid #e5e5e5", borderRadius: "8px", padding: "16px 20px", marginBottom: "16px", cursor: "pointer" }}>
                                    <h3 style={{ margin: "0 0 8px 0" }}>{event.title}</h3>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Date: </strong>
                                          {formatDate(event.eventDate)}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Time: </strong>
                                          {displayValue(event.eventTime)}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Location: </strong>
                                          {displayValue(event.location)}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Club: </strong>
                                          {displayValue(event.club)}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Registration Deadline: </strong>
                                          {formatDate(event.registrationDeadline)}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Tags:</strong>{" "}
                                          {event.tags?.join(" | ") || "N/A"}
                                    </p>
                                    <p style={{ margin: "8px 0", color: "#444" }}>
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
                                                <button style={{ padding: "8px 16px", border: "none", borderRadius: "6px", backgroundColor: "#2563eb", color: "white", fontSize: "14px", cursor: "pointer" }}>
                                                      Register here
                                                </button>
                                          </a>
                                    )}
                              </div>
                        );
                  })}

                  {/* Pending Events */}
                  <h3 style={{ marginTop: "32px", marginBottom: "16px" }}>
                        Pending Events: {pendingEvents.length}
                  </h3>
                  {sortedPendingEvents.map((event) => {
                        return (
                              <div key={event._id} onClick={() => setSelectedEvent(event)} style={{ border: "1px solid #f59e0b", borderRadius: "8px", padding: "16px 20px", marginBottom: "16px", cursor: "pointer" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                          <h3 style={{ margin: 0 }}>{event.title}</h3>
                                          <span style={{ backgroundColor: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "999px", fontSize: "12px" }}>Pending</span>
                                    </div>
                                    <div style={{ border: "1px solid orange", padding: "8px 12px", borderRadius: "6px", marginBottom: "12px" }}>
                                          <h4 style={{ margin: 0 }}>⚠️ This event is <strong>PENDING Approval</strong> and may be subject to changes</h4>
                                    </div>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Date: </strong>
                                          {formatDate(event.eventDate)}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Time: </strong>
                                          {displayValue(event.eventTime)}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Location: </strong>
                                          {displayValue(event.location)}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Club: </strong>
                                          {displayValue(event.club)}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Registration Deadline: </strong>
                                          {formatDate(event.registrationDeadline)}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                          <strong>Tags:</strong>{" "}
                                          {event.tags?.join(" | ") || "N/A"}
                                    </p>
                                    <p style={{ margin: "8px 0", color: "#444" }}>
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
                                                <button style={{ padding: "8px 16px", border: "none", borderRadius: "6px", backgroundColor: "#f59e0b", color: "white", fontSize: "14px", cursor: "pointer" }}>
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
                                    style={{ backgroundColor: "white", paddingBottom: "20px", width: "80%", maxWidth: "1000px", maxHeight: "90vh", overflowY: "auto", borderRadius: "10px" }}
                              >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: "white", padding: "12px 20px", borderBottom: "1px solid #ddd" }}>
                                          <h3 style={{ margin: 0 }}>{selectedEvent.title}</h3>
                                          <button
                                                onClick={() => setSelectedEvent(null)}
                                                style={{ border: "1px solid #e5e5e5", backgroundColor: "white", borderRadius: "6px", width: "32px", height: "32px", cursor: "pointer", fontWeight: "600" }}
                                          >
                                                X
                                          </button>
                                    </div>
                                    <div style={{ padding: "20px" }}>
                                          {selectedEvent.status === "Pending" && (
                                                <div style={{ border: "1px solid orange", padding: "8px 12px", borderRadius: "6px", marginBottom: "12px" }}>
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