import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
      const navigate = useNavigate();
      const [events, setEvents] = useState([]);
      const [selectedEvent, setSelectedEvent] = useState(null);
      const [isDemoAdmin, setIsDemoAdmin] = useState(null);

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
                        setIsDemoAdmin(userDeets.data.user.email === "demoadmin@eventra.com");
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

      const sortedEvents = [...events].sort((a, b) => {
            const dateA = a.sampleEvent.registrationDeadline || a.sampleEvent.eventDate || null;
            const dateB = b.sampleEvent.registrationDeadline || b.sampleEvent.eventDate || null;
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return new Date(dateA) - new Date(dateB);
      });

      return (
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
                  {/* Navbar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: "1px solid #eadfd8", marginBottom: "28px" }}>
                        <div>
                              <span
                                    style={{
                                          fontSize: "28px",
                                          fontWeight: "700",
                                          letterSpacing: "-0.5px"
                                    }}
                              >
                                    Eventra
                              </span>
                              <span
                                    style={{
                                          fontSize: "12px",
                                          color: "#92400e",
                                          background: "#fef3c7",
                                          padding: "4px 10px",
                                          borderRadius: "999px",
                                          marginLeft: "10px",
                                          fontWeight: "600"
                                    }}
                              >
                                    Admin
                              </span>
                        </div>
                        <button onClick={handleLogout} style={{ padding: "10px 18px", border: "1px solid #eadfd8", borderRadius: "12px", cursor: "pointer", background: "#fffdfc", color: "#2D1B12", fontWeight: "500" }}>
                              Logout
                        </button>
                  </div>

                  {/* Pending count */}
                  <h3 style={{ marginBottom: "16px" }}>
                        Pending Events: {events.reduce((sum, group) => sum + group.count, 0)}
                  </h3>

                  {/* Event cards */}
                  {sortedEvents.map((group) => {
                        return (
                              <div key={JSON.stringify(group.sampleEvent)} onClick={() => setSelectedEvent(group.sampleEvent)}
                              style={{
                                    background: "#fffdfc",
                                    border: "1px solid #eadfd8",
                                    borderRadius: "16px",
                                    padding: "24px",
                                    minHeight: "240px",
                                    marginBottom: "20px",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
                              }}>
                                    <h3 style={{ margin: "0 0 12px 0", fontSize: "22px", fontWeight: "700"}}>{group.sampleEvent.title}</h3>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6" }}>
                                          <strong>Date: </strong>
                                          {formatDate(group.sampleEvent.eventDate)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6" }}>
                                          <strong>Time: </strong>
                                          {displayValue(group.sampleEvent.eventTime)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6" }}>
                                          <strong>Location: </strong>
                                          {displayValue(group.sampleEvent.location)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6" }}>
                                          <strong>Club: </strong>
                                          {displayValue(group.sampleEvent.club)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6" }}>
                                          <strong>Extractions: </strong>
                                          {group.count} User(s)
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6" }}>
                                          <strong>Extracted from: </strong>
                                          {group.users.map(user => user.email).join(", ")}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6" }}>
                                          <strong>Registration Deadline: </strong>
                                          {formatDate(group.sampleEvent.registrationDeadline)}
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6" }}>
                                          <strong>Tags:</strong>{" "}
                                          {group.sampleEvent.tags?.join(" | ") || "N/A"}
                                    </p>
                                    <p style={{ margin: "8px 0", color: "#444" }}>
                                          {cleanDescription(group.sampleEvent.description).slice(0, 360)}
                                          ...
                                    </p>
                                    <p style={{ margin: "6px 0", fontSize: "15px", lineHeight: "1.6" }}>
                                          <strong>Registration Link: </strong>
                                          {group.sampleEvent.registrationLink ? (
                                                <a
                                                      href={group.sampleEvent.registrationLink}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      onClick={(e) => e.stopPropagation()}
                                                      style={{ color: "#2563eb" }}
                                                >
                                                      {group.sampleEvent.registrationLink}
                                                </a>
                                          ) : "N/A"}
                                    </p>
                                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }} onClick={(e) => e.stopPropagation()}>
                                          <button onClick={() => approveAll(group.eventIds)} style={{ padding: "8px 16px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                                                Approve All {group.count}
                                          </button>
                                          {!isDemoAdmin &&
                                                <button onClick={() => removeAll(group.eventIds)} style={{ padding: "8px 16px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
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
                                    style={{ backgroundColor: "#fffdfc", paddingBottom: "20px", width: "80%", maxWidth: "1000px", maxHeight: "90vh", overflowY: "auto", borderRadius: "20px" }}
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
                                          <h3>AI Summary</h3>
                                          <p>{cleanDescription(selectedEvent.description)}</p>
                                          <h3 style={{ marginTop: "16px" }}>Original Email</h3>
                                          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "13px", color: "#444" }}>
                                                {cleanDescription(selectedEvent.fullEmailBody)}
                                          </pre>
                                          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                                                <button onClick={() => { approveEvent(selectedEvent._id); setSelectedEvent(null); }} style={{ padding: "8px 16px", backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                                                      Approve
                                                </button>
                                                {!isDemoAdmin &&
                                                      <button onClick={() => { removeEvent(selectedEvent._id); setSelectedEvent(null); }} style={{ padding: "8px 16px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
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