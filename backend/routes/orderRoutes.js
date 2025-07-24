const express = require('express');
const router = express.Router();
const withAuth = require('../middleware/withAuth'); // Middleware to ensure user is authenticated
const withAuthAdmin = require('../middleware/withAuthAdmin');
const productModelFactory = require('../models/ProductModel');  // <-- import this

// Import the model and controller factory functions
const orderControllerFactory = require('../controllers/orderController');
const orderModelFactory = require('../models/OrderModel');
const orderDetailsModelFactory = require('../models/OrderDetailsModel');

/**
 * Function that sets up order-related routes.
 * @param {Router} parentRouter - The main router to mount order routes on.
 * @param {Object} db - The database connection instance.
 */
module.exports = (parentRouter, db) => {
  // Instantiate models with the database connection
  const orderModel = orderModelFactory(db);
  const orderDetailsModel = orderDetailsModelFactory(db);
  const productModel = productModelFactory(db);  // <-- create this instance
  // Instantiate the controller with the model instances
  const orderController = orderControllerFactory(orderModel, orderDetailsModel, productModel);
  // ----------- Standard Order Routes -----------
// Admin: list all orders
  parentRouter.get('/admin/orders', withAuthAdmin, orderController.getAllOrders);
  // GET /orders
  // Retrieve all orders placed by the currently logged-in user
  router.get('/orders', withAuth, orderController.getAllOrders);

  // GET /orders/:id
  // Retrieve details for a specific order by order ID
  router.get('/orders/:id', withAuth, orderController.getOneOrder);

  // POST /orders
  // Manually create a new order (without initiating payment process)
  router.post('/orders', withAuth, orderController.saveOrder);

  // DELETE /orders/:id
  // Delete a specific order by its ID
  router.delete('/orders/:id', withAuth, withAuthAdmin, orderController.deleteOrder);

  // ----------- Stripe Payment Workflow Routes -----------

  // POST /orders/checkout
  // Create an order and initiate a Stripe Checkout session
  router.post('/orders/checkout', withAuth, orderController.createOrderAndCheckout);

  // POST /orders/payment
  // Confirm payment status after Stripe payment (alternative to webhooks)
  router.post('/orders/payment', withAuth, orderController.payment);
  router.put('/orders/:id/status', withAuth, withAuthAdmin, orderController.updateOrderStatus);

  // Mount the order routes under the parent router
  parentRouter.use('/', router);
};
