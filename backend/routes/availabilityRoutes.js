const express = require('express');
const router = express.Router();

const withAuth = require('../middleware/withAuth');
const withAuthAdmin = require('../middleware/withAuthAdmin');

module.exports = (parentRouter, db) => {
  // DI: model + controller
  const AvailabilityModel = require('../models/AvailabilityModel')(db);
  const availabilityController = require('../controllers/availabilityController')(AvailabilityModel);

  // -------- Param validation (fail fast) --------
  router.param('id', (req, res, next, val) => {
    const n = Number(val);
    if (!Number.isInteger(n) || n <= 0) {
      return res.status(400).json({ status: 400, message: 'Invalid availability id.' });
    }
    req.params.id = n;
    next();
  });

  router.param('userId', (req, res, next, val) => {
    const n = Number(val);
    if (!Number.isInteger(n) || n <= 0) {
      return res.status(400).json({ status: 400, message: 'Invalid user id.' });
    }
    req.params.userId = n;
    next();
  });

  // -----------------------------
  // Admin routes (must be authed + admin)
  // -----------------------------
  router.get('/availabilities', withAuth, withAuthAdmin, availabilityController.getAllAvailabilities);
  router.get('/availabilities/user/:userId', withAuth, withAuthAdmin, availabilityController.getAvailabilitiesByUser);

  // -----------------------------------
  // Authenticated user routes
  // -----------------------------------
  router.get('/availabilities/me', withAuth, availabilityController.getMyAvailabilities);
  router.post('/availabilities', withAuth, availabilityController.createAvailability);
  router.put('/availabilities/:id', withAuth, availabilityController.updateAvailability);
  router.delete('/availabilities/:id', withAuth, availabilityController.deleteAvailability);

  // -----------------------------------
  // Legacy aliases (singular) — optional, avoids 404 from old clients
  // -----------------------------------
  router.get('/availability/me', withAuth, availabilityController.getMyAvailabilities);
  router.post('/availability', withAuth, availabilityController.createAvailability);
  router.put('/availability/:id', withAuth, availabilityController.updateAvailability);
  router.delete('/availability/:id', withAuth, availabilityController.deleteAvailability);

  parentRouter.use('/', router);
};
