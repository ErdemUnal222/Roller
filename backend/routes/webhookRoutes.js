const express = require('express');
const router = express.Router();

// Import controller and model factories
const webhookControllerFactory = require('../controllers/webhookController');
const orderModelFactory = require('../models/OrderModel');

/**
 * Register the Stripe webhook route with injected dependencies.
 */
module.exports = (parentRouter, db) => {
  // Create an instance of the order model using the database connection
  const orderModel = orderModelFactory(db);

  // Inject the model into the webhook controller
  const webhookController = webhookControllerFactory(orderModel);

  /**
   * Route: POST /webhook/stripe
   * Description: Handles incoming Stripe webhook events (e.g., payment success).
   * Note: Stripe requires raw request body to verify the signature.
   */
  router.post('/webhook/stripe', webhookController.handleStripeWebhook);

  // Register the webhook route under the main app router
  parentRouter.use('/', router);
};
