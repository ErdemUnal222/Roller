// backend/routes/messageRoutes.js
const express = require('express');

const withAuth = require('../middleware/withAuth');
const withAuthAdmin = require('../middleware/withAuthAdmin');

const messageControllerFactory = require('../controllers/messageController');
const messageModelFactory = require('../models/MessageModel');

/**
 * All messaging routes (admin and user)
 */
module.exports = (parentRouter, db) => {
  // DI: model -> controller
  const messageModel = messageModelFactory(db);
  const messageController = messageControllerFactory(messageModel);

  // -------------------- ADMIN ROUTES (no prefix change to keep frontend working) --------------------
  // List all messages (used by DeleteMessage.jsx via GET /messages)
  parentRouter.get('/messages', withAuthAdmin, messageController.getAllMessages);

  // Get full conversation (both directions) between two users
  parentRouter.get(
    '/admin/messages/:userId1/:userId2',
    withAuthAdmin,
    messageController.adminGetConversation
  );

  // Edit a single message (content)
  parentRouter.patch(
    '/admin/message/:id',
    withAuthAdmin,
    messageController.adminUpdateMessage
  );

  // Delete a single message by id
  parentRouter.delete(
    '/admin/message/:id',
    withAuthAdmin,
    messageController.deleteMessage
  );

  // Delete an entire conversation (both directions)
  parentRouter.delete(
    '/admin/conversation/:userId1/:userId2',
    withAuthAdmin,
    messageController.adminDeleteConversation
  );

  // -------------------- USER ROUTES (mounted under /messages) --------------------
  const userRouter = express.Router();

  // Inbox = list last message per conversation
  userRouter.get('/inbox', withAuth, messageController.getUserInbox);

  // Full chat between two users
  userRouter.get('/:userId1/:userId2', withAuth, messageController.getMessagesBetweenUsers);

  // Mark all messages in a thread as read
  userRouter.post('/mark-read', withAuth, messageController.markMessagesAsRead);

  // Mark a single message as read
  userRouter.patch('/:messageId/read', withAuth, messageController.markMessageAsRead);

  // Send a new message
  userRouter.post('/', withAuth, messageController.sendMessage);

  // Mount under /messages (no double prefixing)
  parentRouter.use('/messages', userRouter);
};
