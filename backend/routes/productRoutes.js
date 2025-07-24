const express = require('express');
const router = express.Router();

// Middleware to restrict access
const withAuth = require('../middleware/withAuth');         // Requires user to be logged in
const withAuthAdmin = require('../middleware/withAuthAdmin'); // Requires user to be an admin

// Load model and controller factories
const productModelFactory = require('../models/ProductModel');
const productControllerFactory = require('../controllers/productController');

/**
 * This file defines all routes related to products — both public and admin-only.
 * Routes are grouped into two sections: storefront (public) and dashboard (admin).
 */
module.exports = (parentRouter, db) => {
  // Inject the database connection into the product model and controller
  const productModel = productModelFactory(db);
  const productController = productControllerFactory(productModel);

  // ------------------------
  // Public-facing routes (shop)
  // ------------------------

  // List all products (used by public shop page)
  router.get('/shop', productController.getAllProducts);

  // View a specific product by ID
  router.get('/shop/:id', productController.getOneProduct);

  // ------------------------
  // Admin-only routes (dashboard management)
  // ------------------------

  // List all products in admin panel
  router.get('/products', withAuth, withAuthAdmin, productController.getAllProducts);

  // View a product's details (for editing in admin panel)
  router.get('/products/:id', withAuth, withAuthAdmin, productController.getOneProduct);

  // Add a new product to the database
  router.post('/products/add',  withAuthAdmin, productController.saveProduct);

  // Update an existing product's data
  router.put('/products/edit/:id', withAuthAdmin, productController.updateProduct);

  // Delete a product by its ID
  router.delete('/products/:id', withAuthAdmin, productController.deleteProduct);

  // Attach this router to the parent router
  parentRouter.use('/', router);
};
