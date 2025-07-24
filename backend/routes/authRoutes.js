const express = require('express');
const router = express.Router(); // Create a new Express router instance

// Import the controller and model factory functions
const userControllerFactory = require('../controllers/userController');
const userModelFactory = require('../models/UserModel');

/**
 * Register authentication-related routes with dependency injection.
 * 

 */
module.exports = (parentRouter, db) => {
  // Create an instance of the user model using the provided DB connection
  const userModel = userModelFactory(db);

  // Create an instance of the controller using the model instance
  const userController = userControllerFactory(userModel);

  /**
   * POST /auth/login
   * - This public route handles user login attempts.
   * - The controller verifies credentials and returns a JWT token if valid.
   */
  router.post('/auth/login', userController.connectUser);

  // Mount the routes defined above under the main router
  parentRouter.use('/', router);
};
