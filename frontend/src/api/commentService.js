// /src/api/comments.js
// This file defines all the API functions related to comments for events and products.
// It uses a custom Axios instance configured in /src/api/axios.js.

import API from './axios'; // Import the pre-configured Axios instance

// -----------------------------------------------------------
// 1. GET ALL COMMENTS (ADMIN ONLY)
// -----------------------------------------------------------

/**
 * Fetch all comments from the backend.
 * This route is usually reserved for admin users who want to moderate content.
 */
export const getAllComments = async () => {
  try {
    const res = await API.get('/comments'); // GET request to /comments endpoint
    return res.data;
  } catch (err) {
    // If there's an error, throw a meaningful message
    throw err.message || "Failed to fetch comments.";
  }
};

// -----------------------------------------------------------
// 2. GET COMMENTS BY EVENT
// -----------------------------------------------------------

/**
 * Retrieve all comments associated with a specific event.
 * This is useful for displaying user feedback on event detail pages.
 */
export const getCommentsByEvent = async (eventId) => {
  try {
    const res = await API.get(`/comments/event/${eventId}`);
    return res.data;
  } catch (err) {
    throw err.message || "Failed to fetch event comments.";
  }
};

// -----------------------------------------------------------
// 3. GET COMMENTS BY PRODUCT
// -----------------------------------------------------------

/**
 * Retrieve all comments associated with a specific product.
 * Typically used on product detail pages for reviews or feedback.
 */
export const getCommentsByProduct = async (productId) => {
  try {
    const res = await API.get(`/comments/product/${productId}`);
    return res.data;
  } catch (err) {
    throw err.message || "Failed to fetch product comments.";
  }
};

// -----------------------------------------------------------
// 4. CREATE A COMMENT ON AN EVENT
// -----------------------------------------------------------

/**
 * Submit a new comment for a specific event.
 * The comment must contain text and the user must be authenticated.
 */
export const createComment = async (eventId, content) => {
  try {
    // POST the comment text to the backend
    const res = await API.post(`/comments/event/${eventId}`, { text: content });
    return res.data;
  } catch (err) {
    throw err.message || "Failed to create comment.";
  }
};

// -----------------------------------------------------------
// 5. UPDATE AN EXISTING COMMENT
// -----------------------------------------------------------

/**
 * Update the content of an existing comment.
 * Users can only update their own comments (authorization is checked by backend).
 */
export const updateComment = async (id, commentData) => {
  try {
    const res = await API.put(`/comments/${id}`, commentData);
    return res.data;
  } catch (err) {
    throw err.message || "Failed to update comment.";
  }
};

// -----------------------------------------------------------
// 6. DELETE A COMMENT
// -----------------------------------------------------------

/**
 * Delete a comment by its ID.
 * Only the author of the comment or an admin can delete it.
 */
export const deleteComment = async (id) => {
  try {
    const res = await API.delete(`/comments/${id}`);
    return res.data;
  } catch (err) {
    throw err.message || "Failed to delete comment.";
  }
};
