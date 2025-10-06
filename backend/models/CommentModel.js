// Define the CommentModel class to handle all comment-related database operations
class CommentModel {
  constructor(db) {
    this.db = db; // Store the DB connection for use in all methods
  }

  // CREATE: Add a new comment linked to a specific user and event
  async addComment({ text, event_id, user_id }) {
    try {
      const result = await this.db.query(
        `INSERT INTO comments (content, event_id, user_id, created_at) VALUES (?, ?, ?, NOW())`,
        [text, event_id, user_id]
      );

      return {
        id: result.insertId,
        content: text,
        event_id,
        user_id,
        created_at: new Date()
      };
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  // UPDATE (OWNER): Allow users to edit their own comment by checking ownership
  async updateComment(commentId, userId, text) {
    try {
      const result = await this.db.query(
        `UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ? AND user_id = ?`,
        [text, commentId, userId]
      );
      return result; // expect result.affectedRows from your db wrapper
    } catch (err) {
      console.error("Error updating comment:", err);
      throw err;
    }
  }

  // UPDATE (ADMIN): Edit any comment (no user_id guard)
  async updateCommentAdmin(commentId, text) {
    try {
      const result = await this.db.query(
        `UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?`,
        [text, commentId]
      );
      return result;
    } catch (err) {
      console.error("Error admin-updating comment:", err);
      throw err;
    }
  }

  // DELETE (OWNER): Allow users to delete only their own comments
  async deleteComment(commentId, userId) {
    try {
      const result = await this.db.query(
        `DELETE FROM comments WHERE id = ? AND user_id = ?`,
        [commentId, userId]
      );
      return result;
    } catch (err) {
      console.error("Error deleting comment:", err);
      throw err;
    }
  }

  // DELETE (ADMIN): Delete any comment (no user_id guard)
  async forceDeleteComment(commentId) {
    try {
      const result = await this.db.query(
        `DELETE FROM comments WHERE id = ?`,
        [commentId]
      );
      return result;
    } catch (err) {
      console.error("Error force deleting comment:", err);
      throw err;
    }
  }

  // READ: Fetch all comments for a specific event, including author's full name
  async getByEvent(eventId) {
    try {
      const result = await this.db.query(
        `SELECT comments.*, CONCAT(users.firstName, ' ', users.lastName) AS name
         FROM comments
         JOIN users ON comments.user_id = users.id
         WHERE comments.event_id = ?
         ORDER BY comments.created_at DESC`,
        [eventId]
      );
      return result;
    } catch (err) {
      console.error("Error getting comments by event:", err);
      throw err;
    }
  }

  // READ: Fetch all comments related to a specific product
  async getCommentsByProduct(productId) {
    try {
      const result = await this.db.query(
        `SELECT comments.*, CONCAT(users.firstName, ' ', users.lastName) AS name
         FROM comments
         JOIN users ON comments.user_id = users.id
         WHERE comments.product_id = ?
         ORDER BY comments.created_at DESC`,
        [productId]
      );
      return result;
    } catch (err) {
      console.error("Error getting product comments:", err);
      throw err;
    }
  }

  // READ: Admin-level method to list all comments across the platform
  async getAllComments() {
    try {
      const result = await this.db.query(
        `SELECT comments.*, CONCAT(users.firstName, ' ', users.lastName) AS name
         FROM comments
         JOIN users ON comments.user_id = users.id
         ORDER BY comments.created_at DESC`
      );
      return result;
    } catch (err) {
      console.error("Error getting all comments:", err);
      throw err;
    }
  }
}

// Export the model instance, injected with the DB connection
module.exports = (db) => new CommentModel(db);
