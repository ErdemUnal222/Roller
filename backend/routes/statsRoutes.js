const express = require('express');
const router = express.Router();

// Middleware to protect routes — only logged-in users can access stats
const withAuth = require('../middleware/withAuth');

// Import the controller factory for stats
const statsControllerFactory = require('../controllers/statsController');

/**
 * Defines all statistics-related routes.
 * This includes high-level platform data like total users, events, revenue, etc.
 *
 */
module.exports = (parentRouter, db) => {
  // Inject the DB connection into the controller
  const statsController = statsControllerFactory(db);

  /**
   * GET /stats/overview
   * Returns platform-wide KPIs: user count, event count, product count, orders, and total revenue.
   * Only accessible by authenticated users (admin or staff).
   */
  router.get('/stats/overview', withAuth, statsController.getOverviewStats);

  // Attach these routes to the main application router
  parentRouter.use('/', router);
};
