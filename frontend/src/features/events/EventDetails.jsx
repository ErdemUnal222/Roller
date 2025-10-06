// /src/features/events/EventDetails.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import Comments from '../comments/Comments';
import '/src/styles/main.scss';

const BASE_URL =
  import.meta.env.VITE_SERVER_BASE_URL ||
  api?.defaults?.baseURL ||
  'http://localhost:5000';

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

function formatPrice(v) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

// Robust normalizer for various image shapes
function buildImageSrc(file) {
  if (!file) return null;
  if (/^https?:\/\//i.test(file)) return file;

  // Normalize: "filename.jpg", "events/filename.jpg", "uploads/events/filename.jpg", "/uploads/..."
  let f = String(file).trim();
  // strip leading slashes
  f = f.replace(/^\/+/, '');

  if (!f.startsWith('uploads/')) {
    // if backend sends "events/filename.jpg" keep it under uploads/events
    f = f.startsWith('events/') ? `uploads/${f}` : `uploads/events/${f}`;
  }

  const prefix = `${String(BASE_URL).replace(/\/+$/, '')}/`;
  return `${prefix}${f}`.replace(/([^:]\/)\/+/g, '$1'); // collapse accidental double slashes
}

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('info'); // 'success' | 'error' | 'info'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const role = useSelector((s) => s.user.user?.role);
  const isAdmin = role?.toLowerCase() === 'admin';
  const token =
    useSelector((s) => s.user.token) ||
    JSON.parse(localStorage.getItem('user') || '{}')?.token ||
    null;

  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined;

  const remaining = useMemo(() => {
    const total = Number(event?.places ?? 0);
    return Number.isNaN(total) ? 0 : total;
  }, [event]);

  const canRegister = !!token && remaining > 0 && !isRegistered && !busy;

  // Fetch registration status
  const checkRegistration = async () => {
    if (!token) { setIsRegistered(false); return; }
    try {
      const res = await api.get(`/events/${id}/is-registered`, { headers: authHeader });
      setIsRegistered(!!res.data?.registered);
    } catch (err) {
      console.warn('Registration check failed:', err?.response?.data?.message || err?.message);
      setIsRegistered(false);
    }
  };

  // Fetch event details
  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/events/${id}`);
      setEvent(res.data?.result || res.data?.event || res.data || null);
    } catch (err) {
      console.error('Error fetching event:', err);
      setEvent(null);
      setError(err?.response?.data?.message || 'Failed to load event.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchEvent();
    if (token) checkRegistration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  // Register
  const handleRegister = async () => {
    if (!token) {
      setMsgType('error');
      setMessage('Please log in to register.');
      return;
    }
    try {
      setBusy(true);
      await api.post(`/events/${id}/register`, null, { headers: authHeader });
      await checkRegistration();
      setMsgType('success');
      setMessage('Successfully registered for the event.');
    } catch (err) {
      console.error('Register error:', err);
      setMsgType('error');
      setMessage(err?.response?.data?.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  // Unregister
  const handleUnregister = async () => {
    if (!token) return;
    try {
      setBusy(true);
      await api.delete(`/events/${id}/unregister`, { headers: authHeader });
      await checkRegistration();
      setMsgType('success');
      setMessage('You have been unregistered from the event.');
    } catch (err) {
      console.error('Unregister error:', err);
      setMsgType('error');
      setMessage(err?.response?.data?.message || 'Could not unregister.');
    } finally {
      setBusy(false);
    }
  };

  // Select image
  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setSelectedFile(f || null);
  };

  // Upload event image (admin only)
  const handleUploadPicture = async () => {
    if (!isAdmin) {
      setMsgType('error');
      setMessage('Only admins can upload event pictures.');
      return;
    }
    if (!selectedFile) {
      setMsgType('error');
      setMessage('Please select an image first.');
      return;
    }

    // Basic validation
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(selectedFile.type)) {
      setMsgType('error');
      setMessage('Invalid file type. Please upload JPG, PNG, or WEBP.');
      return;
    }
    if (selectedFile.size > 2 * 1024 * 1024) {
      setMsgType('error');
      setMessage('File too large (max 2MB).');
      return;
    }

    const formData = new FormData();
    // Keep field name 'image' to match your backend route
    formData.append('image', selectedFile);

    try {
      setBusy(true);
      const uploadRes = await api.post('/events/upload', formData, {
        headers: { ...authHeader, 'Content-Type': 'multipart/form-data' },
      });

      const filename =
        uploadRes.data?.filename ||
        uploadRes.data?.result?.filename ||
        uploadRes.data?.path || // in case backend returns full path
        null;

      if (!filename) throw new Error('Upload did not return a filename.');

      // Update both possible columns to be safe (picture/image)
      await api.put(
        `/events/${id}`,
        { ...event, picture: filename, image: filename },
        { headers: authHeader }
      );

      await fetchEvent();
      setSelectedFile(null);
      setMsgType('success');
      setMessage('Picture updated successfully.');
    } catch (err) {
      console.error('Upload failed:', err);
      setMsgType('error');
      setMessage(err?.response?.data?.message || 'Failed to upload or update picture.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="event-details card skeleton">
        <div className="media"></div>
        <div className="line w-80"></div>
        <div className="line w-50"></div>
        <div className="line w-95"></div>
        <div className="line w-70"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details card">
        <div className="events-banner error" role="alert">
          {error || 'Event not found.'}
        </div>
        <Link to="/events" className="button button--ghost" style={{ marginTop: '.75rem' }}>
          Back to events
        </Link>
      </div>
    );
  }

  // Use any of the common image keys
  const fileKey = event?.picture ?? event?.image ?? event?.imageUrl ?? event?.img ?? null;
  const imgSrc = buildImageSrc(fileKey);
  const dateText = formatDate(event.event_date);
  const priceText = formatPrice(event.price);

  return (
    <div className="event-details card">
      {/* Image */}
      <div className="event-hero">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={event.alt || event.title}
            className="event-hero-img"
            onError={(e) => {
              // Fallback once to "uploads/<basename>" if first attempt fails
              const original = fileKey;
              if (original && !/\/uploads\//.test(e.currentTarget.src)) {
                const base = String(original).split('/').pop();
                const altSrc = buildImageSrc(base);
                if (altSrc && altSrc !== e.currentTarget.src) {
                  e.currentTarget.src = altSrc;
                  return;
                }
              }
              e.currentTarget.style.visibility = 'hidden';
            }}
          />
        ) : (
          <div className="hero-fallback" aria-hidden="true" />
        )}
      </div>

      {/* Info */}
      <div className="event-info">
        <h1 className="event-title">{event.title}</h1>

        <div className="meta">
          <span className="pill">{dateText}</span>
          <span className="pill">{priceText}</span>
          {typeof event.places !== 'undefined' && (
            <span className={`pill ${remaining <= 0 ? 'danger' : ''}`}>
              {remaining > 0 ? `${remaining} places` : 'Full'}
            </span>
          )}
        </div>

        <p className="event-description">{event.description || 'No description provided.'}</p>

        {/* Admin upload */}
        {isAdmin && (
          <div className="event-upload">
            <label htmlFor="event-image-upload">Upload or Change Event Image</label>
            <input
              id="event-image-upload"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              disabled={busy}
            />
            <button
              className="button button--accent"
              onClick={handleUploadPicture}
              disabled={busy || !selectedFile}
            >
              {busy ? 'Uploading…' : 'Upload Image'}
            </button>
          </div>
        )}

        {/* Registration */}
        <div className="event-actions">
          {!token ? (
            <Link to="/login" className="button button--primary">Log in to register</Link>
          ) : isRegistered ? (
            <button className="button button--danger" onClick={handleUnregister} disabled={busy}>
              {busy ? 'Processing…' : 'Unregister'}
            </button>
          ) : (
            <button
              className="button button--primary"
              onClick={handleRegister}
              disabled={!canRegister}
              aria-disabled={!canRegister}
              title={!canRegister && !token ? 'Login required' : undefined}
            >
              {busy ? 'Processing…' : 'Register'}
            </button>
          )}
        </div>

        {/* Flash message */}
        {message && (
          <div className={`events-banner inline ${msgType === 'error' ? 'error' : msgType === 'success' ? 'success' : ''}`}>
            {message}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="event-comments">
        <Comments eventId={id} />
      </div>
    </div>
  );
};

export default EventDetails;
