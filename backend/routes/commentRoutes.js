const express = require('express');
const router = express.Router();

// Middleware for authenticated users (with token)
const withAuth = require('../middleware/withAuth');

// Middleware that restricts access to admin users only
const withAuthAdmin = require('../middleware/withAuthAdmin');

module.exports = (parentRouter, db) => {
  // Load the CommentModel with the database connection injected
  const CommentModel = require('../models/CommentModel')(db);

  // Load the controller with the model dependency injected
  const commentController = require('../controllers/commentController')(CommentModel);

  // --- ADMIN ROUTES ---

  /**
   * GET /comments
   * - Admin-only: Fetch all comments across the system.
   * - Useful for moderation or analytics.
   */
  router.get('/comments', withAuthAdmin, commentController.getAllComments);

  // --- PUBLIC ROUTES ---

  /**
   * GET /comments/product/:productId
   * - Public route: Fetch all comments for a specific product.
   */
  router.get('/comments/product/:productId', commentController.getByProduct);

  /**
   * GET /comments/event/:eventId
   * - Public route: Fetch all comments for a specific event.
   */
  router.get('/comments/event/:eventId', commentController.getByEvent);

  // --- AUTHENTICATED USER ROUTES ---

  /**
   * POST /comments/event/:eventId
   * - Authenticated users can post a comment under a specific event.
   */
  router.post('/comments/event/:eventId', withAuth, commentController.addComment);

  /**
   * PUT /comments/:id
   * - Authenticated users can update one of their own comments.
   */
  router.put('/comments/:id', withAuth, commentController.updateComment);

  /**
   * DELETE /comments/:id
   * - Authenticated users can delete one of their own comments.
   */
  router.delete('/comments/:id', withAuth, commentController.deleteComment);

  // Attach this sub-router to the main application router
  parentRouter.use('/', router);
};
