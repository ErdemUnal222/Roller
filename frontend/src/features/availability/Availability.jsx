// /src/features/availability/Availability.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  getMyAvailabilities,
  createAvailability,
  deleteAvailability,
} from '../../api/availabilityService';
import '/src/styles/main.scss';

function toInputLocal(dt = new Date(), withMinutes = true) {
  const d = new Date(dt);
  d.setSeconds(0, 0);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, withMinutes ? 16 : 10);
}
function hasOverlap(startA, endA, slots) {
  const a1 = new Date(startA).getTime();
  const a2 = new Date(endA).getTime();
  if (!(a1 && a2)) return false;
  return slots.some(({ start_date, end_date }) => {
    const b1 = new Date(start_date).getTime();
    const b2 = new Date(end_date).getTime();
    return a1 < b2 && a2 > b1; // proper interval overlap
  });
}
function groupByDay(slots) {
  return slots.reduce((acc, s) => {
    const key = new Date(s.start_date).toLocaleDateString();
    (acc[key] ||= []).push(s);
    return acc;
  }, {});
}

export default function Availability() {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState({ type: '', msg: '' });
  const [filter, setFilter] = useState('upcoming'); // upcoming | past | all
  const [busyId, setBusyId] = useState(null);

  const [newSlot, setNewSlot] = useState({
    start_date: '',
    end_date: '',
    comment: '',
  });

  // preload fields with sensible defaults (now and +1 hour)
  useEffect(() => {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    setNewSlot({
      start_date: toInputLocal(now),
      end_date: toInputLocal(inOneHour),
      comment: '',
    });
  }, []);

  // Load *my* availabilities on mount
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getMyAvailabilities();
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.result) ? data.result : []);
        arr.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        if (!cancel) setAvailabilities(arr);
      } catch (error) {
        console.error('Error loading availabilities', error);
        if (!cancel) setFlash({ type: 'error', msg: 'Failed to load availability.' });
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const resetFlash = () => setFlash({ type: '', msg: '' });

  // Derived lists
  const nowTs = Date.now();
  const filtered = useMemo(() => {
    if (filter === 'all') return availabilities;
    if (filter === 'past') return availabilities.filter(s => new Date(s.end_date).getTime() < nowTs);
    return availabilities.filter(s => new Date(s.end_date).getTime() >= nowTs);
  }, [availabilities, filter, nowTs]);

  const grouped = useMemo(() => {
    const copy = [...filtered].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    return groupByDay(copy);
  }, [filtered]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetFlash();

    const { start_date, end_date } = newSlot;
    if (!start_date || !end_date) {
      return setFlash({ type: 'error', msg: 'Please provide both start and end date/time.' });
    }
    const s = new Date(start_date).getTime();
    const t = new Date(end_date).getTime();
    if (Number.isNaN(s) || Number.isNaN(t)) {
      return setFlash({ type: 'error', msg: 'Invalid date/time format.' });
    }
    if (s >= t) {
      return setFlash({ type: 'error', msg: 'Start must be before end.' });
    }
    // min duration 30 minutes
    if (t - s < 30 * 60 * 1000) {
      return setFlash({ type: 'error', msg: 'Slot must be at least 30 minutes.' });
    }
    if (hasOverlap(start_date, end_date, availabilities)) {
      return setFlash({ type: 'error', msg: 'This slot overlaps an existing availability.' });
    }

    try {
      const created = await createAvailability(newSlot);
      const createdRow = created?.id
        ? created
        : {
            id: created?.insertId || Math.random().toString(36).slice(2),
            start_date,
            end_date,
            comment: newSlot.comment || '',
          };

      setAvailabilities(prev =>
        [...prev, createdRow].sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      );

      setNewSlot({
        start_date: toInputLocal(new Date(end_date)), // convenience: next slot starts after last end
        end_date: toInputLocal(new Date(new Date(end_date).getTime() + 60 * 60 * 1000)),
        comment: '',
      });

      setFlash({ type: 'success', msg: 'Availability added.' });
    } catch (err) {
      console.error('Error creating availability:', err);
      setFlash({ type: 'error', msg: err?.response?.data?.message || err?.message || 'Failed to create availability.' });
    }
  };

  const handleDelete = async (id) => {
    resetFlash();
    const ok = window.confirm('Delete this availability? This cannot be undone.');
    if (!ok) return;

    const prev = availabilities;
    setBusyId(id);
    setAvailabilities((p) => p.filter((s) => s.id !== id));

    try {
      await deleteAvailability(id);
      setFlash({ type: 'success', msg: 'Availability deleted.' });
    } catch (err) {
      console.error('Error deleting availability:', err);
      setFlash({ type: 'error', msg: err?.response?.data?.message || err?.message || 'Could not delete availability.' });
      setAvailabilities(prev); // revert on failure
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="availability-page container" role="main" aria-labelledby="availability-title">
      <header className="availability-header">
        <h2 id="availability-title" className="availability-title">My Availability</h2>

        {/* Filter pills */}
        <div className="availability-tabs" role="tablist" aria-label="Filter availabilities">
          {['upcoming', 'past', 'all'].map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key ? 'true' : 'false'}
              className={`pill ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        {flash.msg && (
          <p
            className={`availability-banner ${flash.type === 'error' ? 'error' : 'success'}`}
            aria-live="polite"
            role="status"
          >
            {flash.msg}
          </p>
        )}
      </header>

      {/* Form */}
      <form className="availability-form admin-form__card" onSubmit={handleSubmit} onChange={resetFlash} noValidate>
        <div className="admin-form__grid">
          <div className="form-field">
            <label htmlFor="start_date">Start</label>
            <input
              id="start_date"
              type="datetime-local"
              value={newSlot.start_date}
              min={toInputLocal(new Date())}
              onChange={(e) => setNewSlot({ ...newSlot, start_date: e.target.value, end_date: Math.max(new Date(e.target.value).getTime(), new Date(newSlot.end_date || e.target.value).getTime()) && newSlot.end_date ? newSlot.end_date : e.target.value })}
              required
              className="availability-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="end_date">End</label>
            <input
              id="end_date"
              type="datetime-local"
              value={newSlot.end_date}
              min={newSlot.start_date || toInputLocal(new Date())}
              onChange={(e) => setNewSlot({ ...newSlot, end_date: e.target.value })}
              required
              className="availability-input"
            />
          </div>

          <div className="form-field form-field--full">
            <label htmlFor="comment">Comment (optional)</label>
            <input
              id="comment"
              type="text"
              value={newSlot.comment}
              onChange={(e) => setNewSlot({ ...newSlot, comment: e.target.value })}
              className="availability-input"
              placeholder="e.g., mornings only"
              maxLength={140}
            />
          </div>
        </div>

        <div className="admin-form__actions">
          <button type="submit" className="button button--primary">Add Availability</button>
        </div>
      </form>

      {/* List */}
      <div className="availability-list-wrap">
        {loading ? (
          <ul className="availability-list skeleton">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="availability-card">
                <div className="sk-line w-60"></div>
                <div className="sk-line w-40"></div>
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <div className="availability-empty">
            <p>No availabilities found for this filter.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([day, items]) => (
            <div key={day} className="availability-day">
              <h3 className="availability-day-title">{day}</h3>
              <ul className="availability-list">
                {items.map((slot) => (
                  <li key={slot.id} className="availability-card">
                    <div className="availability-info">
                      <div className="times">
                        <strong>{new Date(slot.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                        <span> – {new Date(slot.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {slot.comment && <div className="availability-comment">“{slot.comment}”</div>}
                    </div>
                    <div className="availability-actions">
                      <button
                        type="button"
                        className="button button--danger"
                        onClick={() => handleDelete(slot.id)}
                        disabled={busyId === slot.id}
                      >
                        {busyId === slot.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
