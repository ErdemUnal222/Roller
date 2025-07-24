// /src/api/availabilities.js
// This file defines frontend API functions related to availability features.
// These functions use a pre-configured Axios instance to communicate with the backend.

import API from './axios'; // Import the custom Axios instance (handles base URL and headers)

/**
 * Fetch all availabilities from the backend.
 * This route is typically protected and intended for admin users to see all declared availabilities.
 *
 */
export const getAllAvailabilities = async () => {
  try {
    const res = await API.get('/availabilities');
    return Array.isArray(res.data.result) ? res.data.result : []; // ensure array
  } catch (err) {
    throw err.response?.data?.message || "Failed to fetch availabilities.";
  }
};


/**
 * Fetch availability records for a specific user.
 * Useful when displaying the logged-in user's availability calendar or history.
 *
 */
export const getAvailabilityByUser = async (userId) => {
  try {
    const res = await API.get(`/availabilities/user/${userId}`); // Send GET request to /availabilities/user/:userId
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || "Failed to fetch user's availabilities.";
  }
};

/**
 * Create a new availability entry.
 * Called when a user fills out and submits a form to specify when they are available.
 *
 */
export const createAvailability = async (data) => {
  try {
    const res = await API.post('/availabilities', data); // Send POST request to /availabilities
    return res.data.result;
  } catch (err) {
    throw err.response?.data?.message || "Failed to create availability.";
  }
};

/**
 * Update an existing availability entry.
 * Called when a user wants to modify a previously declared availability (e.g., change the time slot).
 *
 */
export const updateAvailability = async (id, data) => {
  try {
    const res = await API.put(`/availabilities/${id}`, data); // Send PUT request to /availabilities/:id
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || "Failed to update availability.";
  }
};

/**
 * Delete an existing availability entry.
 * Called when a user decides to remove their availability (e.g., they are no longer free on that date).
 *
 */
export const deleteAvailability = async (id) => {
  try {
    const res = await API.delete(`/availabilities/${id}`); // Send DELETE request to /availabilities/:id
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || "Failed to delete availability.";
  }
};
