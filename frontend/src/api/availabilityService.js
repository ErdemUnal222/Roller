// /src/api/availabilityService.js
// Frontend API functions for availability features (single, de-duplicated module)

import api from './axios';

// Toggle this if your backend uses plural routes.
// If your backend is '/availabilities/...' set BASE = '/availabilities'
const BASE = '/availability';

/** Admin: fetch all availabilities (requires admin on backend). */
export const getAllAvailabilities = async () => {
  const { data } = await api.get(`${BASE}`);
  return Array.isArray(data?.result) ? data.result : (data?.result || data || []);
};

/** Fetch availabilities for a specific user (public/admin use). */
export const getAvailabilityByUser = async (userId) => {
  const { data } = await api.get(`${BASE}/user/${userId}`);
  return Array.isArray(data?.result) ? data.result : (data?.result || data || []);
};

/** Fetch the logged-in user's own availabilities. */
export const getMyAvailabilities = async () => {
  const { data } = await api.get(`${BASE}/me`);
  return Array.isArray(data?.result) ? data.result : (data?.result || data || []);
};

/** Create a new availability entry. Returns created row/object from backend. */
export const createAvailability = async (payload) => {
  const { data } = await api.post(`${BASE}`, payload);
  return data?.result || data;
};

/** Update an existing availability entry. */
export const updateAvailability = async (id, updates) => {
  const { data } = await api.put(`${BASE}/${id}`, updates);
  return data?.result || data;
};

/** Delete an availability entry. */
export const deleteAvailability = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return data?.result || data;
};
