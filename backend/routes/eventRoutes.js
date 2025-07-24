const express = require('express');
const router = express.Router();

// Middleware to protect routes that require a logged-in user
const withAuth = require('../middleware/withAuth');

// Import controller and model factories
const eventControllerFactory = require('../controllers/eventController');
const EventModelFactory = require('../models/EventModel');
const withAuthAdmin = require('../middleware/withAuthAdmin');
/**
 * This module defines all API routes related to events.
 * It injects the database instance into the model and controller.
 */
module.exports = (parentRouter, db) => {
  // Instantiate model and controller with DB dependency injection
  const eventModel = EventModelFactory(db);
  const eventController = eventControllerFactory(eventModel);

  // ---------------- USER ROUTES ----------------

  /**
   * GET /events/:id/is-registered
   * - Protected route: Checks if the authenticated user is already registered to a specific event.
   */
  router.get('/events/:id/is-registered', withAuth, eventController.checkIfRegistered);

  /**
   * POST /events/:id/register
   * - Protected route: Allows a user to register for an event.
   */
  router.post('/events/:id/register', withAuth, eventController.registerForEvent);

  /**
   * DELETE /events/:id/unregister
   * - Protected route: Allows a user to cancel their registration for an event.
   */
  router.delete('/events/:id/unregister', withAuth, eventController.unregisterFromEvent);

  // ---------------- PUBLIC ROUTES ----------------

  /**
   * GET /events
   * - Public route: Retrieves a list of all events in the system.
   */
  router.get('/events', eventController.getAllEvents);

  /**
   * GET /events/:id
   * - Public route: Retrieves detailed information for a specific event by its ID.
   */
  router.get('/events/:id', eventController.getOneEvent);

  // ---------------- ADMIN / ORGANIZER ROUTES ----------------

  /**
   * POST /events
   * - Protected route: Creates a new event.
   * - Typically used by admin or event organizer.
   */
  router.post('/events', withAuth, eventController.saveEvent);

  /**
   * POST /events/upload
   * - Uploads an image for an event.
   * - No middleware applied here; could be secured if necessary.
   */
  router.post('/events/upload', withAuthAdmin, eventController.savePicture);

  /**
   * PUT /events/:id
   * - Protected route: Updates an existing event.
   * - Can modify event title, date, description, etc.
   */
  router.put('/events/:id', withAuth, eventController.updateEvent);

  /**
   * DELETE /events/:id
   * - Protected route: Deletes an event by its ID.
   * - Only authorized users should be able to perform this action.
   */
  router.delete('/events/:id', withAuth, eventController.deleteEvent);

  // Register this sub-router into the main application router
  parentRouter.use('/', router);
};
