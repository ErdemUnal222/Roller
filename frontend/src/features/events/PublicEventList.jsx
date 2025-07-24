// Import React hooks and other necessary modules
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getAllEvents } from '../../api/eventService'; // API function to fetch events
import '/src/styles/main.scss'; // Global styles

/**
 * PublicEventList Component
 * This component is responsible for displaying a public list of all upcoming events.
 * It is accessible to any user, even without being logged in.
 */
function PublicEventList() {
  // Local state to store fetched events
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');     // To handle fetch errors
  const [loading, setLoading] = useState(true); // Show loading message until events are fetched

  // Optional: Get user role from Redux if you want to show different info for different roles
  const role = useSelector((state) => state.user.user?.role);
  /**
   * Fetch the list of events when the component is first rendered.
   */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Call API to get all events
        const data = await getAllEvents();

        // Ensure we always get an array (in case backend returns a single object)
        const normalized = Array.isArray(data) ? data : [data];

        // Save events to state
        setEvents(normalized);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events.');
      } finally {
        setLoading(false); // Stop loading spinner regardless of success or failure
      }
    };

    fetchEvents();
  }, []); // Empty dependency array means this effect runs once on component mount

  return (
    <main className="public-events-page">
      <h1 className="public-events-title">Upcoming Events</h1>

      {/* Show loading message while fetching data */}
      {loading && <p className="loading-msg">Loading events...</p>}

      {/* Show error message if an error occurred */}
      {error && <p className="public-events-error">{error}</p>}

      <section className="public-event-list">
        {/* Check if events exist and display them */}
        {Array.isArray(events) && events.length > 0 ? (
          events.map((event) => (
            <article key={event.id} className="public-event-card">
              {/* Event title */}
              <h2 className="event-name">{event.title}</h2>

              {/* Display formatted event date */}
              <time className="event-date">
                {new Date(event.event_date).toLocaleDateString()}
              </time>

              {/* Show a preview of the event description (first 150 characters) */}
              <p className="event-description">
                {event.description?.slice(0, 150)}...
              </p>

              {/* Link to detailed event view */}
              <Link
                to={`/events/${event.id}`}
                className="event-link"
                aria-label={`View details about ${event.title}`}
              >
                View Details →
              </Link>
            </article>
          ))
        ) : (
          // If no events and not loading or error, show fallback message
          !loading && !error && (
            <p className="event-empty">No events available at this time.</p>
          )
        )}
      </section>
    </main>
  );
}

export default PublicEventList;
