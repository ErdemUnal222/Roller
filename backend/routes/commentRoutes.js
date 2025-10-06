const express = require('express');
const router = express.Router();

const withAuth = require('../middleware/withAuth');
const withAuthAdmin = require('../middleware/withAuthAdmin');

module.exports = (parentRouter, db) => {
  const CommentModel = require('../models/CommentModel')(db);
  const commentController = require('../controllers/commentController')(CommentModel);

  // ---- Param validation (fail fast on bad ids) ----
  router.param('id', (req, res, next, val) => {
    const n = Number(val);
    if (!Number.isInteger(n) || n <= 0) {
      return res.status(400).json({ status: 400, message: 'Invalid comment id.' });
    }
    req.params.id = n;
    next();
  });

  router.param('eventId', (req, res, next, val) => {
    const n = Number(val);
    if (!Number.isInteger(n) || n <= 0) {
      return res.status(400).json({ status: 400, message: 'Invalid event id.' });
    }
    req.params.eventId = n;
    next();
  });

  router.param('productId', (req, res, next, val) => {
    const n = Number(val);
    if (!Number.isInteger(n) || n <= 0) {
      return res.status(400).json({ status: 400, message: 'Invalid product id.' });
    }
    req.params.productId = n;
    next();
  });

  // ---- ADMIN ROUTES ----
  // GET /comments — list all (moderation)
  // Use both withAuth and withAuthAdmin for maximum safety
  router.get('/comments', withAuth, withAuthAdmin, commentController.getAllComments);

  // ---- PUBLIC ROUTES ----
  router.get('/comments/product/:productId', commentController.getByProduct);
  router.get('/comments/event/:eventId', commentController.getByEvent);

  // ---- AUTHENTICATED USER ROUTES ----
  router.post('/comments/event/:eventId', withAuth, commentController.addComment);
  router.put('/comments/:id', withAuth, commentController.updateComment);
  router.delete('/comments/:id', withAuth, commentController.deleteComment);

  parentRouter.use('/', router);
};
