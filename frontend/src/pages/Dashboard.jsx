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
      locales: {}
});

function Dashboard() {
      const navigate = useNavigate();
      const [events, setEvents] = useState([]);
      const [selectedEvent, setSelectedEvent] = useState(null);
      const [searchTerm, setSearchTerm] = useState("");
      const [selectedDate, setSelectedDate] = useState(null);
      useEffect(() => {
            const fetchApprovedEvents = async () => {
                  try {
                        const token = localStorage.getItem("token");
                        const response = await axios.get("http://localhost:5000/api/events/approved",
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
            if (!a.eventDate) return 1;
            if (!b.eventDate) return -1;
            return new Date(a.eventDate) - new Date(b.eventDate);
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
                              startAccessor="start"
                              endAccessor="end"
                              views={["month", "week"]}
                              selectable
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
                              <div>
                                    <h2>{selectedEvent.title}</h2>
                                    <h3>AI Summary</h3>
                                    <p>
                                          {cleanDescription(selectedEvent.description)}
                                    </p>
                                    <h3>Original Email</h3>
                                    <pre>
                                          {cleanDescription(selectedEvent.fullEmailBody)}
                                    </pre>
                                    <button onClick={() => setSelectedEvent(null)}>
                                          Close
                                    </button>
                                    <hr />
                              </div>
                        )
                  }
            </div>
      );
};

export default Dashboard;