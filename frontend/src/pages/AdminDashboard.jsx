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
                              {
                                    headers: {
                                          Authorization: `Bearer ${token}`,
                                    },
                              }
                        );
                        const userDeets = await axios.get(
                              `${import.meta.env.VITE_API_URL}/auth/me`,
                              { headers: { Authorization: `Bearer ${token}`}}
                        )
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
                        headers: {
                              Authorization: `Bearer ${token}`,
                        }
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
                  // Removing approved events from Pending list..
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
                        headers: {
                              Authorization: `Bearer ${token}`,
                        }
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
                              headers: {
                                    Authorization: `Bearer ${token}`,
                              }
                        },
                  );
                  setEvents(
                        prev => prev.filter(group => !group.eventIds.some(id => eventIds.includes(String(id))))
                  );
                  alert("All events removed successfully!");
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
            const dateA = a.sampleEvent.registrationDeadline || a.sampleEvent.eventDate || null;
            const dateB = b.sampleEvent.registrationDeadline || b.sampleEvent.eventDate || null;
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
                        Pending Events: {events.reduce((sum, group) => sum + group.count, 0)}
                  </h2>
                  <hr />
                  {sortedEvents.map((group) => {
                        return (
                              <div key={JSON.stringify(group.sampleEvent)} onClick={() => setSelectedEvent(group.sampleEvent)} style={{cursor: "pointer"}}>
                                    <h2>{group.sampleEvent.title}</h2>
                                    <p>
                                          <strong>Date: </strong>
                                          {formatDate(group.sampleEvent.eventDate)}
                                    </p>
                                    <p>
                                          <strong>Time: </strong>
                                          {displayValue(group.sampleEvent.eventTime)}
                                    </p>
                                    <p>
                                          <strong>Location: </strong>
                                          {displayValue(group.sampleEvent.location)}
                                    </p>
                                    <p>
                                          <strong>Club: </strong>
                                          {displayValue(group.sampleEvent.club)}
                                    </p>
                                    <p>
                                          <strong>Extractions: </strong>
                                          {group.count} User(s)
                                    </p>
                                    <p>
                                          <strong>Extracted from: </strong>
                                          {group.users.map(user => user.email).join(", ")}
                                    </p>
                                    <p>
                                          <strong>Registration Deadline: </strong>
                                          {formatDate(group.sampleEvent.registrationDeadline)}
                                    </p>
                                    <div>
                                          <strong>Tags:</strong>{" "}
                                          {group.sampleEvent.tags?.join(" | ") || "N/A"}
                                    </div>
                                    <p>
                                          {cleanDescription(group.sampleEvent.description).slice(0, 360)}
                                          ...
                                    </p>
                                    <p>
                                          <strong>Registration Link: </strong>
                                          { group.sampleEvent.registrationLink ? (
                                                <a 
                                                      href={group.sampleEvent.registrationLink} 
                                                      target="_blank" 
                                                      rel="noopener noreferrer"
                                                      onClick={(e) => e.stopPropagation()}
                                                >
                                                      {group.sampleEvent.registrationLink}
                                                </a>
                                          ) : "N/A" }
                                    </p>
                                    <button onClick={(e) => { e.stopPropagation(); approveAll(group.eventIds) }}> Approve All {group.count} </button>
                                    { !isDemoAdmin && 
                                          <button onClick={(e) => { e.stopPropagation(); removeAll(group.eventIds) }}> Reject All </button>
                                    }
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
                                                { !isDemoAdmin && 
                                                      <button onClick={() => { removeEvent(selectedEvent._id); setSelectedEvent(null); }}>
                                                            Reject
                                                      </button>
                                                }
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