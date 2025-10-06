// backend/controllers/messageController.js

// Controller factory: injects the MessageModel (DI)
module.exports = (MessageModel) => {
  // ---------- helpers ----------
  const toInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const badReq = (res, message = 'Bad request') =>
    res.status(400).json({ status: 400, message });

  // ---------- ADMIN ----------
  // GET /messages  (admin) — list all messages
  const getAllMessages = async (req, res, next) => {
    try {
      const messages = await MessageModel.getAllMessages();
      const result = Array.isArray(messages) ? messages : messages ? [messages] : [];
      res.status(200).json({ status: 200, result });
    } catch (err) {
      console.error('❌ getAllMessages error:', err);
      next(err);
    }
  };

  // GET /admin/messages/:userId1/:userId2 (admin) — full conversation
  const adminGetConversation = async (req, res, next) => {
    try {
      const id1 = toInt(req.params.userId1);
      const id2 = toInt(req.params.userId2);
      if (isNaN(id1) || isNaN(id2)) return badReq(res, 'Both user IDs must be valid integers.');

      const conv = await MessageModel.adminGetConversation(id1, id2);
      const result = Array.isArray(conv) ? conv : conv ? [conv] : [];
      res.status(200).json({ status: 200, result });
    } catch (err) {
      console.error('❌ adminGetConversation error:', err);
      next(err);
    }
  };

  // PATCH /admin/message/:id (admin) — edit one message content
  const adminUpdateMessage = async (req, res, next) => {
    try {
      const id = toInt(req.params.id);
      let { content } = req.body || {};
      if (isNaN(id)) return badReq(res, 'Message id must be a valid integer.');
      if (typeof content !== 'string' || !content.trim()) {
        return badReq(res, 'New content is required.');
      }
      content = content.trim();
      if (content.length > 2000) {
        return badReq(res, 'Content too long (max 2000 chars).');
      }

      const result = await MessageModel.adminUpdateMessage(id, content);
      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ status: 404, message: 'Message not found or unchanged.' });
      }
      res.status(200).json({ status: 200, message: 'Message updated.' });
    } catch (err) {
      console.error('❌ adminUpdateMessage error:', err);
      next(err);
    }
  };

  // DELETE /admin/conversation/:userId1/:userId2 (admin) — delete both directions
  const adminDeleteConversation = async (req, res, next) => {
    try {
      const id1 = toInt(req.params.userId1);
      const id2 = toInt(req.params.userId2);
      if (isNaN(id1) || isNaN(id2)) return badReq(res, 'Both user IDs must be valid integers.');

      const result = await MessageModel.adminDeleteConversation(id1, id2);
      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ status: 404, message: 'No messages found for this conversation.' });
      }
      res.status(200).json({ status: 200, message: 'Conversation deleted.', affected: result.affectedRows });
    } catch (err) {
      console.error('❌ adminDeleteConversation error:', err);
      next(err);
    }
  };

  // DELETE /admin/message/:id (admin) — delete single message
  const deleteMessage = async (req, res, next) => {
    try {
      const id = toInt(req.params.id);
      if (isNaN(id)) return badReq(res, 'Message id must be a valid integer.');

      const result = await MessageModel.deleteOneMessage(id);
      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ status: 404, message: 'Message not found or already deleted.' });
      }
      res.status(200).json({ status: 200, msg: 'Message deleted successfully.' });
    } catch (err) {
      console.error('❌ deleteMessage error:', err);
      next(err);
    }
  };

  // ---------- USER ----------
  // POST /messages — send message (auth)
  const sendMessage = async (req, res, next) => {
    try {
      const senderId = toInt(req.user.id);
      const receiverId = toInt(req.body?.receiverId);
      let { content } = req.body || {};

      if (!senderId || isNaN(receiverId)) {
        return badReq(res, 'Receiver ID is required and must be an integer.');
      }
      if (senderId === receiverId) {
        return badReq(res, 'You cannot send a message to yourself.');
      }
      if (typeof content !== 'string' || !content.trim()) {
        return badReq(res, 'Content is required.');
      }
      content = content.trim();
      if (content.length > 2000) {
        return badReq(res, 'Content too long (max 2000 chars).');
      }

      const message = await MessageModel.saveOneMessage(senderId, receiverId, content);
      if (message?.code) {
        return res.status(message.code || 500).json({ status: message.code || 500, message: message.message });
      }

      res.status(201).json({ status: 201, result: message });
    } catch (err) {
      console.error('❌ sendMessage error:', err);
      next(err);
    }
  };

  // GET /messages/:userId1/:userId2 — conversation for these two users (auth)
  const getMessagesBetweenUsers = async (req, res, next) => {
    try {
      const currentUserId = toInt(req.user.id);
      const id1 = toInt(req.params.userId1);
      const id2 = toInt(req.params.userId2);

      if (isNaN(id1) || isNaN(id2)) {
        return badReq(res, 'Both user IDs must be valid integers.');
      }

      // Access control: must be part of the conversation unless admin
      if (currentUserId !== id1 && currentUserId !== id2 && req.user.role !== 'admin') {
        return res.status(403).json({ status: 403, message: 'Forbidden: you are not part of this conversation.' });
      }

      const messages = await MessageModel.getMessagesBetweenUsers(id1, id2);
      const result = Array.isArray(messages) ? messages : messages ? [messages] : [];
      res.status(200).json({ status: 200, result });
    } catch (err) {
      console.error('❌ getMessagesBetweenUsers error:', err);
      next(err);
    }
  };

  // GET /messages/inbox — recent threads for current user (auth)
  const getUserInbox = async (req, res, next) => {
    try {
      const userId = toInt(req.user.id);
      const results = await MessageModel.getInboxForUser(userId);
      res.status(200).json({ status: 200, result: Array.isArray(results) ? results : [] });
    } catch (err) {
      console.error('❌ getUserInbox error:', err);
      next(err);
    }
  };

  // PATCH /messages/:messageId/read — mark a single message as read (auth)
  const markMessageAsRead = async (req, res, next) => {
    try {
      const messageId = toInt(req.params.messageId);
      if (isNaN(messageId)) return badReq(res, 'Invalid message ID.');

      const result = await MessageModel.markAsRead(messageId);
      if (result?.code) {
        return res.status(result.code || 500).json({ status: result.code || 500, message: result.message });
      }
      res.status(200).json({ status: 200, msg: 'Message marked as read.' });
    } catch (err) {
      console.error('❌ markMessageAsRead error:', err);
      next(err);
    }
  };

  // POST /messages/mark-read — mark an entire thread as read (auth)
  const markMessagesAsRead = async (req, res, next) => {
    try {
      const userId = toInt(req.body?.userId);
      const otherUserId = toInt(req.body?.otherUserId);
      if (isNaN(userId) || isNaN(otherUserId)) {
        return badReq(res, 'Both userId and otherUserId are required and must be integers.');
      }

      // Optional: enforce that the caller is one of the two users, unless admin
      if (req.user.role !== 'admin' && req.user.id !== userId && req.user.id !== otherUserId) {
        return res.status(403).json({ status: 403, message: 'Forbidden: you are not part of this conversation.' });
      }

      const result = await MessageModel.markConversationAsRead(userId, otherUserId);
      if (result?.code) {
        return res.status(result.code || 500).json({ status: result.code || 500, message: result.message });
      }

      res.status(200).json({ status: 200, message: 'Messages marked as read.' });
    } catch (err) {
      console.error('❌ markMessagesAsRead error:', err);
      next(err);
    }
  };

  // ---------- exports ----------
  return {
    // admin
    getAllMessages,
    adminGetConversation,
    adminUpdateMessage,
    adminDeleteConversation,
    deleteMessage,
    // user
    sendMessage,
    getMessagesBetweenUsers,
    getUserInbox,
    markMessageAsRead,
    markMessagesAsRead,
  };
};
