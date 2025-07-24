const express = require('express');
const router = express.Router();

const withAuth = require('../middleware/withAuth');
const withAuthAdmin = require('../middleware/withAuthAdmin');

const messageControllerFactory = require('../controllers/messageController');
const messageModelFactory = require('../models/MessageModel');

/**
 * All messaging routes (admin and user)
 */
module.exports = (parentRouter, db) => {
  const messageModel = messageModelFactory(db);
  const messageController = messageControllerFactory(messageModel);

  // -------------------- ADMIN ROUTES --------------------
  parentRouter.get('/messages', withAuthAdmin, messageController.getAllMessages); // admin: list all messages
  parentRouter.delete('/admin/message/:id', withAuthAdmin, messageController.deleteMessage); // admin: delete one

  // -------------------- USER ROUTES --------------------
  const userRouter = express.Router();

  // Inbox = list last message per conversation
  userRouter.get('/inbox', withAuth, messageController.getUserInbox);
  // Full chat between two users
  userRouter.get('/:userId1/:userId2', withAuth, messageController.getMessagesBetweenUsers);

  // Mark a single message or an entire thread as read
  userRouter.post('/mark-read', withAuth, messageController.markMessagesAsRead);
  userRouter.patch('/:messageId/read', withAuth, messageController.markMessageAsRead);

  // Send a new message
  userRouter.post('/', withAuth, messageController.sendMessage);

  // Mount under /messages (no double prefixing)
  parentRouter.use('/messages', userRouter);
};
