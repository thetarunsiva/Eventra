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
            if (!dateA) return 1; // A has no date → push A to end
            if (!dateB) return -1; // B has no date → push B to end
            return new Date(dateA) - new Date(dateB);
      });

      const sortedPendingEvents = [...pendingEvents].sort((a, b) => {
            const dateA = a.registrationDeadline || a.eventDate || null;
            const dateB = b.registrationDeadline || b.eventDate || null;
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1; // A has no date → push A to end
            if (!dateB) return -1; // B has no date → push B to end
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
            <div>
                  <h1>Dashboard Page</h1>
                  <button onClick={handleLogout}> Logout </button>
                  <hr />
                  <h2>
                        Showing {filteredEvents.length} of {events.length} Approved Events
                  </h2>
                  <input 
                        type="text"
                        placeholder="Search by title, club, tags, description or location.."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <h2> Calendar view </h2>
                  <div style={{ height: "600px", marginBottom: "40px" }}>
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
                  <hr />
                  {filteredEvents.map((event) => {
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
                                    {
                                          event.registrationLink && (
                                                <a 
                                                      href={event.registrationLink}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      onClick={(e) => e.stopPropagation()} 
                                                >
                                                      Register here
                                                </a>
                                          )
                                    }
                                    <hr />
                              </div>
                        );
                  })}
                  <hr />
                  <h2>
                        Pending Events: {pendingEvents.length}
                  </h2>
                  {sortedPendingEvents.map((event) => {
                        return (
                              <div key={event._id} onClick={() => setSelectedEvent(event)} style={{cursor: "pointer"}}>
                                    <h2>{event.title}</h2>
                                    <div style={{ border: "1px solid orange", padding: "8px 12px", borderRadius: "6px", marginBottom: "12px" }}>
                                          <h4 style={{ margin: 0 }}>⚠️ This event is <strong>PENDING Approval</strong> and may be subject to changes</h4>
                                    </div>
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
                                    {
                                          event.registrationLink && (
                                                <a 
                                                      href={event.registrationLink}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      onClick={(e) => e.stopPropagation()}
                                                >
                                                      <button>
                                                            Register here
                                                      </button>
                                                </a>
                                          )
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
                                                {selectedEvent.status === "Pending" && (
                                                      <div style={{ border: "1px solid orange", padding: "8px 12px", borderRadius: "6px", marginBottom: "12px" }}>
                                                            <h4 style={{ margin: 0 }}>⚠️ This event is <strong>PENDING Approval</strong> and may be subject to changes</h4>
                                                      </div>
                                                )}
                                                <h3>AI Summary</h3>
                                                <p>
                                                      {cleanDescription(selectedEvent.description)}
                                                </p>
                                                <h3>Original Email</h3>
                                                <pre>
                                                      {cleanDescription(selectedEvent.fullEmailBody)}
                                                </pre>
                                                <hr />
                                          </div>
                                    </div>
                              </div>
                        )
                  }
            </div>
      );
};

export default Dashboard;