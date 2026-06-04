import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {
      const navigate = useNavigate();
      const [events, setEvents] = useState([]);
      const [selectedEvent, setSelectedEvent] = useState(null);
      useEffect(() => {
            const fetchPendingEvents = async () => {
                  try {
                        const token = localStorage.getItem("token");
                        const response = await axios.get("http://localhost:5000/api/events/pending",
                              {
                                    headers: {
                                          Authorization: `Bearer ${token}`,
                                    },
                              }
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
                  await axios.patch(`http://localhost:5000/api/events/${eventId}/approve`, {}, {
                        headers: {
                              Authorization: `Bearer ${token}`,
                        }
                  });
                  setEvents(events.filter(event => event._id !== eventId));
                  alert("Event approved successfully!");

            }
            catch (error) {
                  console.error("Error approving event:", error);
            }
      }

      const removeEvent = async (eventId) => {
            const confirmed = window.confirm("Are you sure you want to reject this event? This action cannot be undone!");
            if (!confirmed) return;
            try {
                  const token = localStorage.getItem("token");
                  await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
                        headers: {
                              Authorization: `Bearer ${token}`,
                        }
                  });
                  setEvents(events.filter(prevEvents => prevEvents._id !== eventId));
                  alert("Event removed successfully!");

            }
            catch (error) {
                  console.error("Error removing event:", error);
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
            const dateA = a.registrationDeadline || a.eventDate || null;
            const dateB = b.registrationDeadline || b.eventDate || null;
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1; // A has no date → push A to end
            if (!dateB) return -1; // B has no date → push B to end
            return new Date(dateA) - new Date(dateB);
      });

      return (
            <div>
                  <h1>Admin Dashboard Page</h1>
                  <button onClick={handleLogout}> Logout </button>
                  <h2>
                        Pending Events: {events.length}
                  </h2>
                  <hr />
                  {sortedEvents.map((event) => {
                        return (
                              <div key={event._id} onClick={() => setSelectedEvent(event)} style={{cursor: "pointer"}}>
                                    <h2>{event.title}</h2>
                                    <p>
                                          <strong>Date: </strong>
                                          {formatDate(event.eventDate)}
                                    </p>
                                    <p>
                                          <strong>Time: </strong>
                                          {displayValue(event.eventTime)}
                                    </p>
                                    <p>
                                          <strong>Location: </strong>
                                          {displayValue(event.location)}
                                    </p>
                                    <p>
                                          <strong>Club: </strong>
                                          {displayValue(event.club)}
                                    </p>
                                    <p>
                                          <strong>Registration Deadline: </strong>
                                          {formatDate(event.registrationDeadline)}
                                    </p>
                                    <div>
                                          <strong>Tags:</strong>{" "}
                                          {event.tags?.join(" | ") || "N/A"}
                                    </div>
                                    <p>
                                          {cleanDescription(event.description).slice(0, 360)}
                                          ...
                                    </p>
                                    <p>
                                          <strong>Registration Link: </strong>
                                          { event.registrationLink ? (
                                                <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                                                      {event.registrationLink}
                                                </a>
                                          ) : "N/A" }
                                    </p>
                                    <button onClick={(e) => { e.stopPropagation(); approveEvent(event._id) }}> Approve </button>
                                    <button onClick={(e) => { e.stopPropagation(); removeEvent(event._id) }}> Reject </button>
                                    <hr />
                              </div>
                        );
                  })}
                  {
                        selectedEvent && (
                              <div 
                                    onClick={() => setSelectedEvent(null)}
                                    style={{
                                          position: "fixed",
                                          top: 0,
                                          left: 0,
                                          width: "100%",
                                          height: "100%",
                                          backgroundColor: "rgba(0,0,0,0.5)",
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          zIndex: 9999,
                                    }}
                              >
                                    <div 
                                          onClick={(e) => e.stopPropagation()}
                                          style={{
                                                backgroundColor: "white",
                                                paddingBottom: "20px",
                                                width: "80%",
                                                maxWidth: "1000px",
                                                maxHeight: "90vh",
                                                overflowY: "auto",
                                                borderRadius: "10px",
                                          }}
                                    >
                                          <div 
                                                style={{
                                                      display: "flex",
                                                      justifyContent: "space-between",
                                                      alignItems: "center",
                                                      position: "sticky",
                                                      top: 0,
                                                      backgroundColor: "white",
                                                      padding: "5px 20px",
                                                      borderBottom: "1px solid #ddd",
                                                }}
                                          >
                                                <h2>{selectedEvent.title}</h2>
                                                <button onClick={() => setSelectedEvent(null)}>
                                                      X
                                                </button>
                                          </div>
                                          <div style={{ padding: "20px" }}>
                                                <h3>AI Summary</h3>
                                                <p>
                                                      {cleanDescription(selectedEvent.description)}
                                                </p>
                                                <h3>Original Email</h3>
                                                <pre>
                                                      {cleanDescription(selectedEvent.fullEmailBody)}
                                                </pre>
                                                <button onClick={() => { approveEvent(selectedEvent._id); setSelectedEvent(null); }}>
                                                      Approve
                                                </button>
                                                <button onClick={() => { removeEvent(selectedEvent._id); setSelectedEvent(null); }}>
                                                      Reject
                                                </button>
                                                <hr />
                                          </div>
                                    </div>
                              </div>
                        )
                  }
            </div>
      );
};

export default AdminDashboard;