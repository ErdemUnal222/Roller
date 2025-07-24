// Import necessary dependencies and components
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/axios'; // Axios instance with predefined settings
import Comments from '../comments/Comments'; // Comment section component
import "/src/styles/main.scss"; // Global SCSS styles

/**
 * EventDetails Component
 * This component displays a detailed view of a single event.
 * It allows users to register/unregister for the event.
 * Admins can also upload or update the event image.
 */
const EventDetails = () => {
  // Extract event ID from the URL
  const { id } = useParams();

  // Component state
  const [event, setEvent] = useState(null); // Holds the event data
  const [message, setMessage] = useState(''); // Feedback message
  const [selectedFile, setSelectedFile] = useState(null); // File selected for upload
  const [isRegistered, setIsRegistered] = useState(false); // Registration status

  // Get user role from Redux store
  const role = useSelector((state) => state.user.user?.role);
  const isAdmin = role?.toLowerCase() === 'admin';

  /**
   * Checks if the current user is registered for the event.
   */
  const checkRegistration = async () => {
    try {
      const res = await api.get(`/events/${id}/is-registered`);
      setIsRegistered(res.data.registered);
    } catch (err) {
      console.error('Registration check failed:', err);
      setIsRegistered(false); // default to false if error occurs
    }
  };

  /**
   * Fetch event details from API using event ID.
   */
  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.result);
    } catch (err) {
      console.error('Error fetching event:', err);
    }
  };

  // On component mount or when event ID changes, fetch data
  useEffect(() => {
    fetchEvent();
    checkRegistration();
  }, [id]);

  /**
   * Handles event registration.
   */
  const handleRegister = async () => {
    try {
      await api.post(`/events/${id}/register`);
      await checkRegistration();
      setMessage('Successfully registered for the event.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed.');
    }
  };

  /**
   * Handles event unregistration.
   */
  const handleUnregister = async () => {
    try {
      await api.delete(`/events/${id}/unregister`);
      await checkRegistration();
      setMessage('You have been unregistered from the event.');
    } catch (err) {
      setMessage('Could not unregister from the event.');
    }
  };

  /**
   * Handles file input change for uploading a new image.
   */
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  /**
   * Handles uploading and assigning an image to the event.
   * Admin-only functionality.
   */
  const handleUploadPicture = async () => {
    if (!selectedFile) return;

if (!isAdmin) {
  setMessage('Only admins can upload event pictures.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Upload image to server
      const uploadRes = await api.post('/events/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update event with new image reference
      await api.put(`/events/${id}`, {
        ...event,
        picture: uploadRes.data.filename,
      });

      // Refresh event details to reflect change
      const updated = await api.get(`/events/${id}`);
      setEvent(updated.data.result);
      setSelectedFile(null);
      setMessage('Picture updated successfully.');
    } catch (err) {
      console.error('Upload failed:', err);
      setMessage('Failed to upload or update picture.');
    }
  };

  // Show loading state if event has not loaded yet
  if (!event) return <div className="event-loading">Loading event...</div>;

  return (
    <div className="event-details">
      <h1 className="event-title">{event.title}</h1>

      {/* Event image, if available */}
      {event.picture && (
        <img
          src={`http://ihsanerdemunal.ide.3wa.io:9500/uploads/${event.picture}`}
          alt={event.alt || event.title}
          className="event-image"
        />
      )}

      {/* Event information */}
      <p className="event-description">{event.description}</p>
      <p className="event-meta">Date: {new Date(event.event_date).toLocaleDateString()}</p>
      <p className="event-meta">Available Places: {event.places}</p>
      <p className="event-meta">Price: €{event.price}</p>

      {/* Admin-only section for uploading a new event image */}
      {isAdmin && (
      <div className="event-upload">
          <label htmlFor="event-image-upload">Upload or Change Event Image</label>
          <input
            id="event-image-upload"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />
          <button onClick={handleUploadPicture}>Upload Image</button>
        </div>
      )}

      {/* Registration/unregistration button */}
      {isRegistered ? (
        <button className="event-button unregister" onClick={handleUnregister}>
          Unregister
        </button>
      ) : (
        <button className="event-button register" onClick={handleRegister}>
          Register
        </button>
      )}

      {/* Display status or error messages */}
      {message && <p className="event-message">{message}</p>}

      {/* Comments section for the event */}
      <Comments eventId={id} />
    </div>
  );
};

export default EventDetails;
