// /src/features/events/EventCard.jsx
import { Link } from 'react-router-dom';

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

function buildImageSrc(file) {
  if (!file) return null;
  if (/^https?:\/\//i.test(file)) return file;
  const path = file.startsWith('uploads/') ? file : `uploads/events/${file}`;
  const prefix = BASE_URL ? `${BASE_URL}/` : '/';
  return `${prefix}${path}`.replace(/([^:]\/)\/+/g, '$1');
}

/**
 * EventCard
 * Props:
 *  - event: { id, title, event_date|date, location, description, picture, alt }
 *  - to (optional): route for the CTA (defaults to /events/:id)
 *  - ctaLabel (optional): text for the button (defaults to "View details")
 *  - showDescription (optional): toggle description (default true)
 */
export default function EventCard({
  event,
  to,
  ctaLabel = 'View details',
  showDescription = true,
}) {
  const dateRaw = event?.event_date ?? event?.date;
  const dateText = formatDate(dateRaw);
  const imgSrc = buildImageSrc(event?.picture);
  const linkTo = to || `/events/${event?.id}`;

  return (
    <article className="public-event-card" tabIndex={0}>
      {/* Media */}
      <div className="media">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={event?.alt || event?.title || 'Event image'}
            className="event-image"
            onError={(e) => {
              // fallback from /uploads/events/* to /uploads/*
              const f = event?.picture;
              if (f && !/\/uploads\//.test(e.currentTarget.src)) {
                const altSrc = `${BASE_URL ? `${BASE_URL}/` : '/'}uploads/${f}`.replace(/([^:]\/)\/+/g, '$1');
                e.currentTarget.src = altSrc;
              } else {
                e.currentTarget.style.visibility = 'hidden';
              }
            }}
          />
        ) : (
          <div className="img-fallback" aria-hidden="true" />
        )}
      </div>

      {/* Info */}
      <div className="info">
        <h2 className="event-name" title={event?.title}>{event?.title}</h2>
        <time className="event-date">{dateText}</time>
        {event?.location && <div className="event-location">{event.location}</div>}
        {showDescription && (
          <p className="event-description">
            {event?.description ? `${event.description.slice(0, 150)}…` : 'No description provided.'}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="actions">
        <Link to={linkTo} className="button button--primary" aria-label={`View details about ${event?.title}`}>
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}

/* Optional: lightweight skeleton for loading states */
export function EventCardSkeleton() {
  return (
    <article className="public-event-card skeleton" aria-hidden="true">
      <div className="media"></div>
      <div className="info">
        <div className="line w-60"></div>
        <div className="line w-40"></div>
        <div className="line w-90"></div>
      </div>
      <div className="actions">
        <span className="btn"></span>
      </div>
    </article>
  );
}
