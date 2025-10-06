// Import React hooks and other necessary modules
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getAllEvents } from '../../api/eventService';
import '/src/styles/main.scss';

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || '';

function formatDate(v) {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return 'TBA';
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

/**
 * PublicEventList — polished, shop-style grid of events
 */
export default function PublicEventList() {
  const role = useSelector((state) => state.user.user?.role);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // nice skeleton count
  const placeholders = useMemo(() => Array.from({ length: 8 }), []);

  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        setLoading(true);
        setError('');

        const data = await getAllEvents();
        // normalize a variety of backend shapes
        const list =
          Array.isArray(data?.result) ? data.result :
          Array.isArray(data?.events) ? data.events :
          Array.isArray(data) ? data : [];

        if (!cancel) setEvents(list);
      } catch (err) {
        console.error('Error fetching events:', err);
        if (!cancel) setError('Failed to load events.');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => { cancel = true; };
  }, []);

  return (
    <main className="public-events-page">
      <h1 className="public-events-title">Upcoming Events</h1>

      {error && (
        <div className="events-banner error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <section className="public-event-list" aria-live="polite" aria-busy="true">
          {placeholders.map((_, i) => (
            <article key={`ph-${i}`} className="public-event-card skeleton">
              <div className="media"></div>
              <div className="line w-60"></div>
              <div className="line w-40"></div>
              <div className="line w-90"></div>
              <div className="actions">
                <span className="btn shimmer"></span>
              </div>
            </article>
          ))}
        </section>
      ) : events.length === 0 ? (
        <div className="events-empty">
          <p>No events available at this time.</p>
          <Link to="/" className="button button--ghost">Back to home</Link>
        </div>
      ) : (
        <section className="public-event-list">
          {events.map((ev) => {
            const imgSrc = ev.picture
              ? (BASE_URL ? `${BASE_URL}/uploads/events/${ev.picture}` : `/uploads/events/${ev.picture}`)
              : null;

            return (
              <article key={ev.id} className="public-event-card" tabIndex={0}>
                <div className="media">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={ev.alt || ev.title || 'Event image'}
                      className="event-image"
                      onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                    />
                  ) : (
                    <div className="img-fallback" aria-hidden="true" />
                  )}

                  {/* optional small tag if you want to flag role-based controls later */}
                  {role === 'admin' && <span className="badge">Admin</span>}
                </div>

                <div className="info">
                  <h2 className="event-name" title={ev.title}>{ev.title}</h2>
                  <time className="event-date">{formatDate(ev.event_date)}</time>
                  <p className="event-description">
                    {ev.description ? `${ev.description.slice(0, 150)}…` : 'No description provided.'}
                  </p>
                </div>

                <div className="actions">
                  <Link
                    to={`/events/${ev.id}`}
                    className="button button--primary"
                    aria-label={`View details about ${ev.title}`}
                  >
                    View details
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
