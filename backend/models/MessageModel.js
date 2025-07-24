// Define the MessageModel class to handle all messaging-related operations
class MessageModel {
  constructor(db) {
    this.db = db; // Store the MySQL connection instance so we can reuse it across methods
  }

  // READ: Fetch all messages in the system (used for admin view or moderation)
  async getAllMessages() {
    try {
      const [rows] = await this.db.query(
        `SELECT 
           m.id,
           m.sender_id,
           CONCAT(sender.firstname, ' ', sender.lastname) AS sender_username,
           m.receiver_id,
           CONCAT(receiver.firstname, ' ', receiver.lastname) AS receiver_username,
           m.content,
           m.sent_at,
           m.seen
         FROM messages m
         LEFT JOIN users sender ON sender.id = m.sender_id
         LEFT JOIN users receiver ON receiver.id = m.receiver_id
         ORDER BY m.sent_at DESC`
      );
      // Make sure we always return an array, even if empty
      return Array.isArray(rows) ? rows : rows ? [rows] : [];
    } catch (err) {
      console.error("Error in getAllMessages:", err);
      return [];
    }
  }

  // DELETE: Remove a specific message by ID (admin or user who sent it)
  async deleteOneMessage(id) {
    try {
      const [result] = await this.db.query(
        'DELETE FROM messages WHERE id = ?',
        [id]
      );
      return result;
    } catch (err) {
      console.error("Error in deleteOneMessage:", err);
      return { code: 500, message: 'Error deleting message' };
    }
  }

  // READ: Fetch full conversation between two users (chronologically sorted)
  async getMessagesBetweenUsers(user1Id, user2Id) {
    try {
      const result = await this.db.query(
        `SELECT 
           m.id,
           m.sender_id,
           CONCAT(sender.firstname, ' ', sender.lastname) AS sender_username,
           m.receiver_id,
           CONCAT(receiver.firstname, ' ', receiver.lastname) AS receiver_username,
           m.content,
           m.sent_at,
           m.seen
         FROM messages m
         JOIN users sender ON m.sender_id = sender.id
         JOIN users receiver ON m.receiver_id = receiver.id
         WHERE (m.sender_id = ? AND m.receiver_id = ?)
            OR (m.sender_id = ? AND m.receiver_id = ?)
         ORDER BY m.sent_at ASC`,
        [user1Id, user2Id, user2Id, user1Id]
      );
      const rows = Array.isArray(result[0]) ? result[0] : result;
      return rows;
    } catch (err) {
      console.error("Error in getMessagesBetweenUsers:", err);
      return { code: 500, message: 'Error retrieving conversation' };
    }
  }

  // CREATE: Save a message from sender to receiver
  async saveOneMessage(senderId, receiverId, content) {
    try {
      const result = await this.db.query(
        'INSERT INTO messages (sender_id, receiver_id, content, sent_at, seen) VALUES (?, ?, ?, NOW(), 0)',
        [senderId, receiverId, content]
      );

      // Fallback in case of MySQL driver variations
      const insertId = result?.[0]?.insertId || result.insertId;

      // Return a complete message object (can be used directly in frontend)
      return {
        id: insertId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        sent_at: new Date().toISOString(),
        seen: 0
      };
    } catch (err) {
      console.error("Error in saveOneMessage:", err);
      return { code: 500, message: 'Error saving message' };
    }
  }

  // UPDATE: Mark all messages as "seen" from another user in a given conversation
  async markConversationAsRead(userId, otherUserId) {
    try {
      const result = await this.db.query(
        `UPDATE messages
         SET seen = 1
         WHERE receiver_id = ? AND sender_id = ?`,
        [userId, otherUserId]
      );
      return Array.isArray(result) ? result[0] : result;
    } catch (err) {
      console.error("Error in markConversationAsRead:", err);
      return { code: 500, message: 'Error marking conversation as read' };
    }
  }
   async markAsRead(messageId) {
    try {
      const result = await this.db.query(
        `UPDATE messages SET seen = 1 WHERE id = ?`,
        [messageId]
      );
      return Array.isArray(result) ? result[0] : result;
    } catch (err) {
      console.error("Error in markAsRead:", err);
      return { code: 500, message: 'Error marking message as read' };
    }
  }

  // READ: Get the inbox view (one most recent message per user pair)
  async getInboxForUser(userId) {
    try {
      const [rawRows] = await this.db.query(
        `SELECT 
           m.id,
           m.sender_id,
           m.receiver_id,
           m.content,
           m.sent_at,
           m.seen,
           sender.firstname AS sender_firstname,
           sender.lastname AS sender_lastname,
           receiver.firstname AS receiver_firstname,
           receiver.lastname AS receiver_lastname
         FROM messages m
         JOIN (
           SELECT 
             LEAST(sender_id, receiver_id) AS user1,
             GREATEST(sender_id, receiver_id) AS user2,
             MAX(sent_at) AS latest_time
           FROM messages
           WHERE sender_id = ? OR receiver_id = ?
           GROUP BY user1, user2
         ) latest
           ON LEAST(m.sender_id, m.receiver_id) = latest.user1
          AND GREATEST(m.sender_id, m.receiver_id) = latest.user2
          AND m.sent_at = latest.latest_time
         LEFT JOIN users sender ON sender.id = m.sender_id
         LEFT JOIN users receiver ON receiver.id = m.receiver_id
         ORDER BY m.sent_at DESC`,
        [userId, userId]
      );

      const rows = Array.isArray(rawRows) ? rawRows : [];

      // Format output to match frontend expectations
      return rows
        .filter(msg => msg && msg.id)
        .map((msg) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          sender_username: `${msg.sender_firstname ?? '[Unknown]'} ${msg.sender_lastname ?? ''}`.trim(),
          receiver_username: `${msg.receiver_firstname ?? '[Unknown]'} ${msg.receiver_lastname ?? ''}`.trim(),
          content: msg.content,
          sent_at: msg.sent_at,
          seen: msg.seen,
        }));
    } catch (err) {
      console.error("Error in getInboxForUser:", err);
      return { code: 500, message: 'Error retrieving inbox' };
    }
  }
}

// Export a factory that injects the database instance into the model
module.exports = (db) => new MessageModel(db);
