// Export a controller factory function that takes the MessageModel as input
module.exports = (MessageModel) => {

  // Fetches all messages in the system (used by admin or for debugging)
  const getAllMessages = async (req, res, next) => {
    try {
      const messages = await MessageModel.getAllMessages();

      // Ensure the result is always an array
      const result = Array.isArray(messages) ? messages : [messages];

      res.status(200).json({ status: 200, result });
    } catch (err) {
      console.error("❌ Error in getAllMessages:", err);
      next(err);
    }
  };

  // Sends a new message from the logged-in user to another user
  const sendMessage = async (req, res, next) => {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user.id;

      // Check that required fields are provided
      if (!receiverId || !content) {
        return next({ status: 400, message: "Receiver ID and content are required!" });
      }

      const message = await MessageModel.saveOneMessage(senderId, receiverId, content);

      if (message.code) {
        return next({ status: message.code, message: message.message });
      }

      res.status(201).json({ result: message });
    } catch (err) {
      next(err);
    }
  };

  // Retrieves all messages exchanged between two specific users
const getMessagesBetweenUsers = async (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log("🛡 Controller: getMessagesBetweenUsers called");
  }
  try {
    const { userId1, userId2 } = req.params;

    // Ensure everything is a number before comparison
    const currentUserId = Number(req.user.id);
    const id1 = Number(userId1);
    const id2 = Number(userId2);

if (process.env.NODE_ENV !== 'production') {
   console.log("🔐 Checking conversation access rights…");
   console.log("→ currentUserId:", currentUserId);
   console.log("→ id1:", id1, "| id2:", id2);
   console.log("→ role:", req.user.role);
 }

// ✅ Security check
if (currentUserId !== id1 && currentUserId !== id2 && req.user.role !== 'admin') {
 if (process.env.NODE_ENV !== 'production') {
    console.warn("🚫 BLOCKED: user is not part of the conversation and not admin.");
  }  return res.status(403).json({ message: "Forbidden: you are not part of this conversation." });
} else {
 if (process.env.NODE_ENV !== 'production') {
    console.log("✅ ACCESS GRANTED");
  }}


    // Validate inputs
    if (isNaN(id1) || isNaN(id2)) {
      return res.status(400).json({ message: "Both user IDs must be valid integers." });
    }

    // 🔐 Secure access: only allow if current user is one of the two or is an admin
    if (currentUserId !== id1 && currentUserId !== id2 && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: you are not part of this conversation." });
    }

    const messages = await MessageModel.getMessagesBetweenUsers(id1, id2);
    const result = Array.isArray(messages) ? messages : messages ? [messages] : [];

    res.status(200).json({ status: 200, result });
  } catch (err) {
    next(err);
  }
};




  // Marks a single message as read using its message ID
  const markMessageAsRead = async (req, res, next) => {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        return next({ status: 400, message: "Message ID is required." });
      }

const numericId = Number(messageId);
      if (isNaN(numericId)) {
        return next({ status: 400, message: "Invalid message ID." });
      }

      const result = await MessageModel.markAsRead(numericId);
      if (result.code) {
        return next({ status: result.code, message: result.message });
      }

      res.status(200).json({ status: 200, msg: "Message marked as read." });
    } catch (err) {
      next(err);
    }
  };

  // Retrieves the current user's inbox (list of conversations or recent contacts)
  const getUserInbox = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const results = await MessageModel.getInboxForUser(userId);

      res.status(200).json({ status: 200, result: results });
    } catch (err) {
      next(err);
    }
  };

  // Marks all messages in a conversation between two users as read
  const markMessagesAsRead = async (req, res, next) => {
    try {
      const { userId, otherUserId } = req.body;

      // Both user IDs are required for conversation tracking
      if (!userId || !otherUserId) {
        return next({ status: 400, message: "Both userId and otherUserId are required." });
      }

      const result = await MessageModel.markConversationAsRead(userId, otherUserId);

      if (result.code) {
        return next({ status: result.code, message: result.message });
      }

      res.status(200).json({ status: 200, message: "Messages marked as read." });
    } catch (err) {
      next(err);
    }
  };

  // Deletes a message by its ID
  const deleteMessage = async (req, res, next) => {
    try {
      const messageId = req.params.id;

      if (!messageId) {
        return next({ status: 400, message: "Message ID is required." });
      }

      const result = await MessageModel.deleteOneMessage(messageId);

      if (result.affectedRows === 0) {
        return next({ status: 404, message: "Message not found or already deleted." });
      }

      res.status(200).json({ status: 200, msg: "Message deleted successfully." });
    } catch (err) {
      next(err);
    }
  };

  // Expose all controller methods for use in routes
  return {
    sendMessage,
    getMessagesBetweenUsers,
    markMessageAsRead,
    getUserInbox,
    deleteMessage,
    markMessagesAsRead,
    getAllMessages
  };
};
