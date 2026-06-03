import { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
      const [events, setEvents] = useState([]);
      const [selectedEvent, setSelectedEvent] = useState(null);
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

      return (
            <div>
                  <h1>Dashboard Page</h1>
                  <h2>
                        Approved Events: {events.length}
                  </h2>
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
                                          {cleanDescription(event.description)}
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