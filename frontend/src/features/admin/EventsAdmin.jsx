// /src/pages/admin/EventsAdmin.jsx

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import '../../styles/main.scss';

/**
 * Admin interface to manage events (view, delete, edit, and create).
 * Only accessible to admin users.
 */
function EventsAdmin() {
  // Local state to hold the list of events
  const [events, setEvents] = useState([]);

  // State to manage loading status
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /**
   * useEffect hook runs once when the component mounts.
   * It fetches the list of all events from the backend.
   */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');

        // Ensure that data is an array before storing in state
        setEvents(Array.isArray(res.data.result) ? res.data.result : []);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        // Whether success or error, stop the loading spinner
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  /**
   * Handles deletion of an event by ID.
   * Shows a confirmation prompt to avoid accidental deletions.
   * Updates the local state after deletion to reflect changes.
   */
  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this event?');
    if (!confirm) return;

    try {
      await api.delete(`/events/${id}`);

      // Remove the deleted event from the state
      setEvents(events.filter((event) => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="admin-events-container">
      {/* Title of the admin section */}
      <h2 className="admin-title">Manage Events</h2>

      {/* Button to navigate to the event creation form */}
      <div className="admin-toolbar">
        <Link to="/events/create" className="btn-primary">
          Add New Event
        </Link>
      </div>

      {/* Display loading text while data is being fetched */}
      {loading ? (
        <div className="admin-loading">Loading events...</div>
      ) : (
        <ul className="admin-list">
          {/* Loop through and display each event */}
          {events.map((event) => (
            <li key={event.id} className="admin-item">
              <div>
                <p className="admin-item-title">{event.title}</p>
                <p className="admin-item-date">{event.date}</p>
              </div>

              {/* Admin controls for each event */}
              <div className="admin-actions">
                <Link to={`/events/edit/${event.id}`} className="btn-link">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EventsAdmin;
