// /src/features/events/CreateEvent.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import '/src/styles/main.scss';

const CreateEvent = () => {
  const navigate = useNavigate();
  const token =
    useSelector((state) => state.user.token) ||
    JSON.parse(localStorage.getItem('user') || '{}')?.token;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    places: '',
    price: '',
    alt: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Simple validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.event_date ||
      !formData.places ||
      !formData.price
    ) {
      setMessage('Please fill in all required fields.');
      return;
    }
    if (!selectedFile) {
      setMessage('Please select an event image.');
      return;
    }

    try {
      // 1) Upload image
      const imgData = new FormData();
      imgData.append('image', selectedFile);

      const uploadRes = await api.post('/events/upload', imgData, {
        headers: { Authorization: `Bearer ${token}` }, // interceptor also adds this, but explicit is fine
      });

      const pictureFilename = uploadRes?.data?.filename;
      if (!pictureFilename) {
        throw new Error('Upload did not return a filename.');
      }

      // 2) Create event (JSON body)
      const res = await api.post(
        '/events',
        {
          ...formData,
          price: Number(formData.price),
          places: Number(formData.places),
          picture: pictureFilename,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Backend returns { eventId }, not result.insertId
      const newId =
        res?.data?.eventId ??
        res?.data?.result?.insertId ??
        res?.data?.result?.id ??
        null;

      setMessage('Event created successfully!');

      if (newId) {
        navigate(`/events/${newId}`);
      } else {
        // Fallback: go back to admin list if no id returned
        navigate('/admin/events');
      }
    } catch (err) {
      console.error('Event creation failed:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Failed to create event.');
    }
  };

  return (
    <div className="create-event">
      <h1>Create Event</h1>

      {message && <p className="event-message">{message}</p>}

      <form onSubmit={handleSubmit} className="event-form">
        <label>Title*</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} />

        <label>Description*</label>
        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>

        <label>Event Date*</label>
        <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} />

        <label>Available Places*</label>
        <input type="number" name="places" value={formData.places} onChange={handleChange} />

        <label>Price (€)*</label>
        <input type="number" name="price" value={formData.price} onChange={handleChange} />

        <label>Image Alt Text</label>
        <input type="text" name="alt" value={formData.alt} onChange={handleChange} />

        <label>Event Image*</label>
        <input type="file" onChange={handleFileChange} accept="image/*" />

        <button type="submit" className="button button--primary">Create Event</button>
      </form>
    </div>
  );
};

export default CreateEvent;
