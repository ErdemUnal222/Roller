import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import '/src/styles/main.scss';

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || '';

// ---- helpers ----
function toDateInputValue(v) {
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; // already yyyy-mm-dd
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  // normalize to local date (avoid TZ shift)
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}
function buildEventImgSrc(file) {
  if (!file) return null;
  if (/^https?:\/\//i.test(file)) return file;
  const path = file.startsWith('uploads/') ? file : `uploads/events/${file}`;
  const prefix = BASE_URL ? `${BASE_URL}/` : '/';
  return `${prefix}${path}`.replace(/([^:]\/)\/+/g, '$1');
}

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    price: '',
    places: '',
    image: null,   // File
    picture: '',   // current filename (string)
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState({ type: '', msg: '' });

  // preview URL for selected file (revoke on change/unmount)
  const [previewUrl, setPreviewUrl] = useState(null);
  const prevUrlRef = useRef(null);

  const existingImgSrc = useMemo(() => buildEventImgSrc(form.picture), [form.picture]);
  const heroSrc = previewUrl || existingImgSrc;

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/events/${id}`);
        const ev = data?.result || data?.event || data;
        if (!ev) throw new Error('Event not found');
        if (cancel) return;
        setForm((f) => ({
          ...f,
          title: ev.title || '',
          description: ev.description || '',
          event_date: toDateInputValue(ev.event_date),
          price: ev.price ?? '',
          places: ev.places ?? '',
          image: null,
          picture: ev.picture || '',
        }));
      } catch (err) {
        if (!cancel) setFlash({ type: 'error', msg: err?.response?.data?.message || 'Error loading event.' });
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  // file change → generate preview and store file
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files?.[0] || null;
      setForm((f) => ({ ...f, image: file }));
      // preview object URL
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      const url = file ? URL.createObjectURL(file) : null;
      prevUrlRef.current = url;
      setPreviewUrl(url);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFlash({ type: '', msg: '' });

    // basic client validation
    if (!form.title.trim()) return setFlash({ type: 'error', msg: 'Title is required.' });
    if (!form.event_date)   return setFlash({ type: 'error', msg: 'Date is required.' });
    if (Number(form.price) < 0)  return setFlash({ type: 'error', msg: 'Price cannot be negative.' });
    if (Number(form.places) < 0) return setFlash({ type: 'error', msg: 'Places cannot be negative.' });

    try {
      setBusy(true);

      let pictureFilename = null;
      if (form.image) {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(form.image.type)) {
          throw new Error('Invalid image type. Use JPG, PNG, or WEBP.');
        }
        if (form.image.size > 2 * 1024 * 1024) {
          throw new Error('Image too large (max 2MB).');
        }

        const fd = new FormData();
        fd.append('image', form.image);
        const uploadRes = await api.post('/events/upload', fd); // content-type set automatically
        pictureFilename = uploadRes.data?.filename || uploadRes.data?.result?.filename;
        if (!pictureFilename) throw new Error('Upload did not return a filename.');
      }

      await api.put(`/events/${id}`, {
        title: form.title.trim(),
        description: form.description,
        event_date: form.event_date,            // yyyy-mm-dd
        price: Number(form.price),
        places: Number(form.places),
        ...(pictureFilename && { picture: pictureFilename }),
      });

      setFlash({ type: 'success', msg: 'Event updated successfully!' });
      // slight pause so the user sees the success, then go back
      setTimeout(() => navigate('/admin/events'), 700);
    } catch (err) {
      console.error('Update failed:', err);
      setFlash({ type: 'error', msg: err?.response?.data?.message || err?.message || 'Failed to update event.' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <section className="admin-form">
        <header className="admin-form__header">
          <h1 className="admin-form__title">Edit Event</h1>
        </header>
        <div className="admin-form__card skeleton">
          <div className="sk-hero"></div>
          <div className="sk-line w-80"></div>
          <div className="sk-line w-60"></div>
          <div className="sk-line w-95"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-form">
      <header className="admin-form__header">
        <h1 className="admin-form__title">Edit Event</h1>
        {flash.msg && (
          <p
            className={`admin-form__message ${flash.type}`}
            role="status"
            aria-live="polite"
          >
            {flash.msg}
          </p>
        )}
      </header>

      <form className="admin-form__card" onSubmit={handleSubmit} noValidate>
        {/* Hero / preview */}
        <div className="admin-form__hero">
          {heroSrc ? (
            <img
              className="event-image-preview"
              src={heroSrc}
              alt={form.title || 'Event image'}
              onError={(e) => {
                // fallback from /uploads/events/* to /uploads/*
                const f = form.picture;
                if (f && !/\/uploads\//.test(e.currentTarget.src)) {
                  const altSrc = `${BASE_URL ? `${BASE_URL}/` : '/'}uploads/${f}`.replace(/([^:]\/)\/+/g, '$1');
                  e.currentTarget.src = altSrc;
                } else {
                  e.currentTarget.style.visibility = 'hidden';
                }
              }}
            />
          ) : (
            <div className="event-image-fallback" aria-hidden="true" />
          )}
        </div>

        {/* Fields */}
        <div className="admin-form__grid">
          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={160}
            />
          </div>

          <div className="form-field">
            <label htmlFor="event_date">Date</label>
            <input
              id="event_date"
              type="date"
              name="event_date"
              value={form.event_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="price">Price (€)</label>
            <input
              id="price"
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="places">Available places</label>
            <input
              id="places"
              type="number"
              name="places"
              min="0"
              value={form.places}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field form-field--full">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field form-field--full">
            <label htmlFor="image">Event image (optional)</label>
            <input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              disabled={busy}
            />
            <p className="hint">JPG/PNG/WEBP up to 2MB.</p>
          </div>
        </div>

        <div className="admin-form__actions">
          <button
            type="button"
            className="button"
            onClick={() => navigate(-1)}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button button--primary"
            disabled={busy}
            data-loading={busy ? 'true' : 'false'}
          >
            {busy ? 'Saving…' : 'Update Event'}
          </button>
        </div>
      </form>
    </section>
  );
}
