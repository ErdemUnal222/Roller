// /src/api/events.js
// This module defines all functions for communicating with the backend API
// regarding events. It covers full CRUD operations: create, read, update, delete.

import API from './axios'; // Import the configured Axios instance with token support

// -----------------------------------------------------------
// 1. GET ALL EVENTS
// -----------------------------------------------------------

/**
 * Fetch the list of all events from the backend.
 * This can be used to show events on the homepage or admin dashboard.
 * 
 */
export const getAllEvents = async () => {
  try {
    // Send a GET request to /events endpoint
    const response = await API.get('/events');
    return Array.isArray(response.data.result)
      ? response.data.result
      : []; // Ensure an array is returned
  } catch (err) {
    console.error('getAllEvents error:', err);
    throw (
      err.response?.data?.message || "Failed to fetch events."
    );
  }
};

// -----------------------------------------------------------
// 2. GET ONE EVENT BY ID
// -----------------------------------------------------------

/**
 * Fetch detailed information about a single event.
 * This is used when viewing the full details of an event (e.g., on an event page).
 * 
 */
export const getEventById = async (id) => {
  try {
    const response = await API.get(`/events/${id}`);
    return response.data.result;
  } catch (err) {
    console.error('getEventById error:', err);
    throw (
      err.response?.data?.message || "Failed to fetch event."
    );
  }
};

// -----------------------------------------------------------
// 3. CREATE A NEW EVENT
// -----------------------------------------------------------

/**
 * Submit a new event to the backend.
 * This is typically done by an admin through the dashboard interface.
 * 
 */
export const createEvent = async (eventData) => {
  try {
    const response = await API.post('/events', eventData); // POST request to backend
    return response.data;
  } catch (err) {
    console.error('createEvent error:', err);
    throw (
      err.response?.data?.message || "Failed to create event."
    );
  }
};

// -----------------------------------------------------------
// 4. UPDATE AN EXISTING EVENT
// -----------------------------------------------------------

/**
 * Update an existing event’s data.
 * This is used when an admin wants to edit an event already created.
 * 
 */
export const updateEvent = async (id, eventData) => {
  try {
    const response = await API.put(`/events/${id}`, eventData);
    return response.data;
  } catch (err) {
    console.error('updateEvent error:', err);
    throw (
      err.response?.data?.message || "Failed to update event."
    );
  }
};

// -----------------------------------------------------------
// 5. DELETE AN EVENT
// -----------------------------------------------------------

/**
 * Permanently delete an event from the backend.
 * Only authorized users (usually admins) can perform this action.
 * 
 */
export const deleteEvent = async (id) => {
  try {
    const response = await API.delete(`/events/${id}`);
    return response.data;
  } catch (err) {
    console.error('deleteEvent error:', err);
    throw (
      err.response?.data?.message || "Failed to delete event."
    );
  }
};
