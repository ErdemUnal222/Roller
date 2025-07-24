const express = require('express');
const router = express.Router();

// Middleware to protect routes
const withAuth = require('../middleware/withAuth');           // Requires user to be logged in
const withAuthAdmin = require('../middleware/withAuthAdmin'); // Requires admin role

// Factory imports: model + controller logic
const userModelFactory = require('../models/UserModel');
const userControllerFactory = require('../controllers/userController');
const messageModelFactory = require('../models/MessageModel');
const messageControllerFactory = require('../controllers/messageController');

module.exports = (parentRouter, db) => {
  // Instantiate model + controller with DB connection
  const userModel = userModelFactory(db);
  const userController = userControllerFactory(userModel);

  const messageModel = messageModelFactory(db);
  const messageController = messageControllerFactory(messageModel);

  /**
   * Public routes
   * These endpoints can be accessed without logging in.
   */
  router.post('/register', userController.saveUser); // Create a new user account
  router.post('/login', userController.connectUser); // Authenticate user and return a token

  /**
   * Authenticated user routes
   * Users must be logged in to access these routes.
   */
  router.get('/me', withAuth, userController.getCurrentUser);             // Get profile of the currently logged-in user
  router.put('/user/:id', withAuth, userController.updateUser);           // Update user profile (if it's your own)
  router.delete('/user/:id', withAuth, userController.deleteUser);        // Delete your own user account
  router.post('/user/:id/upload', withAuth, userController.uploadProfilePicture); // Upload or update profile picture
  router.get('/users/list', withAuth, userController.getOtherUsers);


  /**
   * Shared route — accessible by all logged-in users
   * Useful for features like listing users in a messaging app.
   */
  router.get('/users', withAuthAdmin, userController.getAllUsers); // List of all non-deleted users

  /**
   * Admin-only routes
   * Restricted to users with admin privileges (checked via JWT middleware).
   */
  router.put('/admin/user/:id', withAuthAdmin, userController.updateUser);            // Admin edits any user's data
  router.get('/user/:id', withAuthAdmin, userController.getOneUser);           // Get any user's profile by ID
  router.delete('/admin/user/:id', withAuthAdmin, userController.deleteUser);         // Admin permanently deletes a user
  router.delete('/admin/message/:id', withAuthAdmin, messageController.deleteMessage); // Admin deletes a specific message

  // Attach this route group to the main router (e.g., /api/v1)
  parentRouter.use('/', router);
};
