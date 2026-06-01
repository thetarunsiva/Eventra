import { useState, useEffect } from "react";
import axios from "axios";

function AdminDashboard() {
      const [events, setEvents] = useState([]);
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

      return (
            <div>
                  <h1>Admin Dashboard Page</h1>
                  <h2>
                        Pending Events: {events.length}
                  </h2>
                  { events.map((event) => (
                        <div key={event._id}>
                              <p><strong>Title: </strong>{event.title}</p>
                              <p><strong>Club: </strong>{event.club}</p>
                              <p><strong>Description: </strong>{event.description?.slice(0, 500)}</p>
                              
                              <button onClick={() => approveEvent(event._id)}> Approve </button>
                              <button onClick={() => removeEvent(event._id)}> Reject </button>
                              <hr />
                        </div>
                  )) }
            </div>
      );
};

export default AdminDashboard;