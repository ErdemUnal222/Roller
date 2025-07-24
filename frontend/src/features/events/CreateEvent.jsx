// /src/features/events/CreateEvent.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

/**
 * CreateEvent Component
 * Admin-only form to create a new event including image upload via multipart/form-data.
 */
function CreateEvent() {
  // State to manage form inputs
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    price: '',
    places: '',
    image: null,
  });

  const navigate = useNavigate(); // Hook to programmatically navigate after form submission
  const [message, setMessage] = useState(''); // State to show success or error message

  /**
   * handleChange
   * Updates form state when user types or selects a file
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // If input type is file, store the uploaded file
    if (type === 'file') {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      // Otherwise update normal input fields
      setForm({ ...form, [name]: value });
    }
  };

  /**
   * handleSubmit
   * Sends form data (including the image) to the backend using FormData.
   * On success, it redirects the user to the admin events list.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      // Append each key-value pair to the FormData object
      for (const key in form) {
        formData.append(key, form[key]);
      }

      // Send POST request to create the event
      const uploadRes = await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Event created successfully!');
      navigate('/admin/events'); // Redirect to admin event management page
    } catch (err) {
      console.error(' Failed to create event:', err);
      setMessage('Failed to create event.');
    }
  };

  return (
    <div className="event-create-form" role="main" aria-labelledby="create-event-title">
      <h2 id="create-event-title">Create New Event</h2>
      {message && <p className="event-message">{message}</p>}

      {/* Form to create a new event */}
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          onChange={handleChange}
          value={form.title}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          value={form.description}
          required
        />
        <input
          name="event_date"
          type="date"
          onChange={handleChange}
          value={form.event_date}
          required
        />
        <input
          name="price"
          type="number"
          placeholder="Price (€)"
          onChange={handleChange}
          value={form.price}
          required
        />
        <input
          name="places"
          type="number"
          placeholder="Available places"
          onChange={handleChange}
          value={form.places}
          required
        />
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
}

export default CreateEvent;
