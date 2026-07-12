import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ClosedEventOverlay from "../components/ClosedEventOverlay";

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

function AdminDashboard() {
      const navigate = useNavigate();
      const [events, setEvents] = useState([]);
      const [selectedEvent, setSelectedEvent] = useState(null);

      useEffect(() => {
            const fetchPendingEvents = async () => {
                  try {
                        const token = localStorage.getItem("token");
                        const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/pending/grouped`,
                              { headers: { Authorization: `Bearer ${token}` } }
                        );
                        const userDeets = await axios.get(
                              `${import.meta.env.VITE_API_URL}/auth/me`,
                              { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setEvents(response.data);
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

      const approveEvent = async (eventId) => {
            try {
                  const token = localStorage.getItem("token");
                  await axios.patch(`${import.meta.env.VITE_API_URL}/events/${eventId}/approve`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                  });
                  setEvents(
                        prev =>
                              prev.map(group => ({
                                    ...group,
                                    eventIds: group.eventIds.filter(id => String(id) !== String(eventId)),
                                    count: group.eventIds.filter(id => String(id) !== String(eventId)).length,
                              }))
                              .filter(group => group.count > 0)
                  );
                  alert("Event approved successfully!");
            }
            catch (error) {
                  console.error("Error approving event:", error);
            }
      }

      const approveAll = async (eventIds) => {
            try {
                  const token = localStorage.getItem("token");
                  await axios.patch(
                        `${import.meta.env.VITE_API_URL}/events/approve-many`,
                        { eventIds },
                        { headers: { Authorization: `Bearer ${token}` } },
                  );
                  setEvents(prev =>
                        prev.filter(group =>
                              !group.eventIds.some(id => eventIds.includes(String(id)))
                        )
                  );
                  alert("All events in this group approved successfully!");
            }
            catch (error) {
                  console.error("Error approving all events in group:", error);
            }
      }

      const removeEvent = async (eventId) => {
            const confirmed = window.confirm("Are you sure you want to reject this event? This action cannot be undone!");
            if (!confirmed) return;
            try {
                  const token = localStorage.getItem("token");
                  await axios.delete(`${import.meta.env.VITE_API_URL}/events/${eventId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                  });
                  setEvents(
                        prev =>
                              prev.map(group => ({
                                    ...group,
                                    eventIds: group.eventIds.filter(id => String(id) !== String(eventId)),
                                    count: group.eventIds.filter(id => String(id) !== String(eventId)).length,
                              }))
                              .filter(group => group.count > 0)
                  );
                  alert("Event removed successfully!");
            }
            catch (error) {
                  console.error("Error removing event:", error);
            }
      }

      const removeAll = async (eventIds) => {
            const confirmed = window.confirm("Are you sure you want to reject all copies of this event? This action cannot be undone!");
            if (!confirmed) return;
            try {
                  const token = localStorage.getItem("token");
                  await axios.delete(
                        `${import.meta.env.VITE_API_URL}/events/delete-many`,
                        {
                              data: { eventIds },
                              headers: { Authorization: `Bearer ${token}` }
                        },
                  );
                  setEvents(
                        prev => prev.filter(group => !group.eventIds.some(id => eventIds.includes(String(id))))
                  );
                  alert("All events removed successfully!");
            }
            catch (error) {
                  console.error("Error removing events:", error.response?.data || error.message);
                  alert("Failed to remove events: " + (error.response?.data?.message || error.message));
            }
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
            const dateA = a.sampleEvent.registrationDeadline || a.sampleEvent.eventDate || null;
            const dateB = b.sampleEvent.registrationDeadline || b.sampleEvent.eventDate || null;
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return new Date(dateA) - new Date(dateB);
      });

      return (
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 40px", background: "linear-gradient(180deg, #fff8f4 0%, #fffdfc 28%, #fffaf7 100%)", minHeight: "100vh" }}>
                  {/* Navbar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: `1px solid ${uiPalette.border}`, marginBottom: "28px" }}>
                        <div>
                              <span
                                    style={{
                                          fontSize: "28px",
                                          fontWeight: "700",
                                          letterSpacing: "-0.5px",
                                          color: uiPalette.text
                                    }}
                              >
                                    Eventra
                              </span>
                              <span
                                    style={{
                                          fontSize: "12px",
                                          color: uiPalette.text,
                                          background: uiPalette.accentSoft,
                                          padding: "4px 10px",
                                          borderRadius: "999px",
                                          marginLeft: "10px",
                                          fontWeight: "600"
                                    }}
                              >
                                    Admin
                              </span>
                        </div>
                        <button onClick={handleLogout} style={{ padding: "10px 18px", border: `1px solid ${uiPalette.border}`, borderRadius: "12px", cursor: "pointer", background: uiPalette.surface, color: uiPalette.text, fontWeight: "600", boxShadow: "0 4px 12px rgba(45, 27, 18, 0.06)" }}>
                              Logout
                        </button>
                  </div>

                  {/* Pending count */}
                  <h3 style={{ marginBottom: "16px", color: uiPalette.text }}>
                        Pending Events: {events.reduce((sum, group) => sum + group.count, 0)}
                  </h3>

                  {/* Event cards */}
                  {sortedEvents.map((group) => {
                        const isPastEvent = isClosedEvent(group.sampleEvent.eventDate);
                        return (
                              <div key={JSON.stringify(group.sampleEvent)} onClick={() => setSelectedEvent(group.sampleEvent)}
                              style={{
                                    position: "relative",
                                    overflow: "hidden",
                                    background: isPastEvent ? uiPalette.closedBg : uiPalette.surface,
                                    color: isPastEvent ? "#52525b" : uiPalette.text,
                                    border: isPastEvent ? `1px solid ${uiPalette.closedBorder}` : `1px solid ${uiPalette.border}`,
                                    borderRadius: "16px",
                                    padding: "24px",
                                    minHeight: "240px",
                                    marginBottom: "20px",
                                    cursor: "pointer",
                                    boxShadow: isPastEvent ? "0 2px 8px rgba(0,0,0,0.03)" : "0 10px 24px rgba(45, 27, 18, 0.06)",
                                    filter: isPastEvent ? "grayscale(100%)" : "none",
                                    opacity: isPastEvent ? 0.78 : 1
                              }}>
                                    {isPastEvent && <ClosedEventOverlay />}
                                    <h3 style={{ margin: "0 0 12px 0", fontSize: "22px", fontWeight: "700", color: isPastEvent ? "#3f3f46" : uiPalette.text}}>{group.sampleEvent.title}</h3>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Date: </strong>
                                          {formatDate(group.sampleEvent.eventDate)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Time: </strong>
                                          {displayValue(group.sampleEvent.eventTime)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Location: </strong>
                                          {displayValue(group.sampleEvent.location)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Club: </strong>
                                          {displayValue(group.sampleEvent.club)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Extractions: </strong>
                                          {group.count} User(s)
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Extracted from: </strong>
                                          {group.users.map(user => user.email).join(", ")}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Registration Deadline: </strong>
                                          {formatDate(group.sampleEvent.registrationDeadline)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Tags:</strong>{" "}
                                          {group.sampleEvent.tags?.join(" | ") || "N/A"}
                                    </p>
                                    <p style={{ margin: "8px 0", color: isPastEvent ? "#52525b" : uiPalette.muted, fontStyle: "italic" }}>
                                          {cleanDescription(group.sampleEvent.description).slice(0, 360)}
                                          ...
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6", color: isPastEvent ? "#52525b" : uiPalette.softText }}>
                                          <strong>Registration Link: </strong>
                                          {group.sampleEvent.registrationLink ? (
                                                <a
                                                      href={group.sampleEvent.registrationLink}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      onClick={(e) => e.stopPropagation()}
                                                      style={{ color: "#7c2d12" }}
                                                >
                                                      {group.sampleEvent.registrationLink}
                                                </a>
                                          ) : "N/A"}
                                    </p>
                                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }} onClick={(e) => e.stopPropagation()}>
                                          <button onClick={() => approveAll(group.eventIds)} style={{ padding: "8px 16px", backgroundColor: "#166534", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 6px 16px rgba(22, 101, 52, 0.16)" }}>
                                                Approve All {group.count}
                                          </button>
                                          {
                                                <button onClick={() => removeAll(group.eventIds)} style={{ padding: "8px 16px", backgroundColor: "#991b1b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 6px 16px rgba(153, 27, 27, 0.16)" }}>
                                                      Reject All
                                                </button>
                                          }
                                    </div>
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
                                          <h3>AI Summary</h3>
                                          <p>{cleanDescription(selectedEvent.description)}</p>
                                          <h3 style={{ marginTop: "16px" }}>Original Email</h3>
                                          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "13px", color: uiPalette.muted }}>
                                                {cleanDescription(selectedEvent.fullEmailBody)}
                                          </pre>
                                          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                                                <button onClick={() => { approveEvent(selectedEvent._id); setSelectedEvent(null); }} style={{ padding: "8px 16px", backgroundColor: "#166534", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 6px 16px rgba(22, 101, 52, 0.16)" }}>
                                                      Approve
                                                </button>
                                                {
                                                      <button onClick={() => { removeEvent(selectedEvent._id); setSelectedEvent(null); }} style={{ padding: "8px 16px", backgroundColor: "#991b1b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 6px 16px rgba(153, 27, 27, 0.16)" }}>
                                                            Reject
                                                      </button>
                                                }
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
};

export default AdminDashboard;