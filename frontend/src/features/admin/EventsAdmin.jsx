// /src/features/admin/EventsAdmin.jsx

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import '/src/styles/main.scss';

/**
 * Admin interface to manage events (list, create, edit, delete).
 * Requires AdminRoute in the router.
 */
export default function EventsAdmin() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Load events
  const fetchEvents = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/events'); // public endpoint
      setEvents(Array.isArray(res.data.result) ? res.data.result : []);
    } catch (err) {
      console.error('Failed to load events:', err);
      setMessage(err.formattedMessage || err.response?.data?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Delete an event (admin-protected on backend)
  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm('Delete this event? This cannot be undone.');
    if (!ok) return;

    setDeletingId(id);
    setMessage('');
    try {
      await api.delete(`/events/${id}`); // withAuth on backend; token auto-attached by interceptor
      // Remove locally to avoid full refetch, or refetch for safety:
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setMessage('Event deleted.');
    } catch (err) {
      console.error('Delete failed:', err);
      setMessage(err.formattedMessage || err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeletingId(null);
    }
  };

  // Navigate to create page (admin route)
  const goCreate = () => navigate('/admin/events/create');

  return (
    <div className="admin-events p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Events (Admin)</h1>
        <button className="button button--primary" onClick={goCreate}>
          + Create Event
        </button>
      </div>

      {message && <p className="event-message mb-3">{message}</p>}

      {loading ? (
        <div className="py-8">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="py-8">No events found.</div>
      ) : (
        <ul className="event-list grid gap-4">
          {events.map((ev) => (
            <li key={ev.id} className="event-card p-4 border rounded">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-medium">{ev.title}</h2>
                  <p className="text-sm text-gray-600">
                    {ev.event_date ? new Date(ev.event_date).toLocaleString() : 'No date'}
                  </p>
                  <p className="mt-2">{ev.description}</p>
                  <div className="mt-2 text-sm">
                    <span className="mr-4">Places: {ev.places}</span>
                    <span>Price: €{ev.price}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Link to={`/events/${ev.id}`} className="button">View</Link>
                  <Link to={`/events/edit/${ev.id}`} className="button button--accent">Edit</Link>
                  <button
                    className="button button--danger"
                    onClick={() => handleDelete(ev.id)}
                    disabled={deletingId === ev.id}
                  >
                    {deletingId === ev.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
