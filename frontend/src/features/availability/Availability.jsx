// /src/pages/Availability.jsx

import { useEffect, useState } from 'react';
import {
  getAllAvailabilities,
  createAvailability,
} from '../../api/availabilityService';
import '/src/styles/main.scss'; // Import global styles

/**
 * Availability Component
 * 
 * This component allows logged-in users to view and add availability periods.
 */
function Availability() {
  // State to store the list of availability entries
  const [availabilities, setAvailabilities] = useState([]);

  // State to store the form inputs for a new availability entry
  const [newSlot, setNewSlot] = useState({
    start_date: '',
    end_date: '',
    comment: '',
  });

  // Load all existing availabilities when the component is first displayed
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllAvailabilities(); // Fetch availability list from the backend
        setAvailabilities(Array.isArray(data) ? data : []); // Store in local state
        } catch (error) {
        console.error('Error loading availabilities', error);
      }
    }

    fetchData(); // Run once on component mount
  }, []);

  /**
   * Submit handler for the availability form.
   * Sends the new availability data to the backend and updates the UI.
   */
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const created = await createAvailability(newSlot);

    // Check if the response structure matches the backend: { result: { id, start_date, end_date, ... } }
     if (!created || !created.id) {
      throw new Error('Invalid response from server');
    }

    // Add the new availability to the list
    setAvailabilities([...availabilities, created]);
    // Reset form fields
    setNewSlot({ start_date: '', end_date: '', comment: '' });
  } catch (err) {
    console.error('Error creating availability:', err);
  }
};


  return (
    <div className="availability-page" role="main" aria-labelledby="availability-title">
      <h2 id="availability-title" className="availability-title">My Availability</h2>

      {/* Form to add a new availability period */}
      <form onSubmit={handleSubmit} className="availability-form">
        <label>
          Start Date:
          <input
            type="datetime-local"
            value={newSlot.start_date}
            onChange={(e) =>
              setNewSlot({ ...newSlot, start_date: e.target.value })
            }
            required
            className="availability-input"
          />
        </label>

        <label>
          End Date:
          <input
            type="datetime-local"
            value={newSlot.end_date}
            onChange={(e) =>
              setNewSlot({ ...newSlot, end_date: e.target.value })
            }
            required
            className="availability-input"
          />
        </label>

        <label>
          Comment (optional):
          <input
            type="text"
            value={newSlot.comment}
            onChange={(e) =>
              setNewSlot({ ...newSlot, comment: e.target.value })
            }
            className="availability-input"
          />
        </label>

        <button type="submit" className="availability-button">
          Add Availability
        </button>
      </form>

      {/* Display the list of existing availabilities */}
      <ul className="availability-list">
        {availabilities.map((slot, index) => {
          // Skip any invalid or incomplete entries
          if (!slot || !slot.start_date || !slot.end_date) return null;

          return (
            <li key={slot.id || index} className="availability-item">
              From {new Date(slot.start_date).toLocaleString()} to{' '}
              {new Date(slot.end_date).toLocaleString()}
              {slot.comment && ` — Note: ${slot.comment}`}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Availability;
