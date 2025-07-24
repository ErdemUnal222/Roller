// Define a model class to manage all availability-related database interactions
class AvailabilityModel {
  constructor(db) {
    // Store the database connection instance for use in all methods
    this.db = db;
  }

  // Add a new availability entry linked to a specific user
  async addAvailability(userId, startDate, endDate, comment = '') {
    try {
      // Insert a new row into the 'availability' table
      const result = await this.db.query(
        'INSERT INTO availability (user_id, start_date, end_date, comment) VALUES (?, ?, ?, ?)',
        [userId, startDate, endDate, comment]
      );
      return result;
    } catch (err) {
      // Log error for debugging and return a custom error object
      console.error("Error adding availability:", err);
      return { code: 500, message: 'Error adding availability' };
    }
  }

  // Update an existing availability entry — only allowed if the user owns it
  async updateAvailability(id, userId, startDate, endDate, comment = '') {
    try {
      // Use both the availability ID and user ID to prevent unauthorized edits
      const result = await this.db.query(
        'UPDATE availability SET start_date = ?, end_date = ?, comment = ? WHERE id = ? AND user_id = ?',
        [startDate, endDate, comment, id, userId]
      );
      return result;
    } catch (err) {
      console.error("Error updating availability:", err);
      return { code: 500, message: 'Error updating availability' };
    }
  }

  // Delete an availability entry, with user ownership check
  async deleteAvailability(id, userId) {
    try {
      // Only the user who created the availability can delete it
      const result = await this.db.query(
        'DELETE FROM availability WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return result;
    } catch (err) {
      console.error("Error deleting availability:", err);
      return { code: 500, message: 'Error deleting availability' };
    }
  }

  // Retrieve all availabilities from the table — useful for admins
  async getAllAvailabilities() {
    try {
      const result = await this.db.query('SELECT * FROM availability');
      return result;
    } catch (err) {
      console.error("Error getting availabilities:", err);
      return { code: 500, message: 'Error getting availabilities' };
    }
  }

  // Fetch all availabilities submitted by a specific user
  async getAvailabilitiesByUser(userId) {
    try {
      const result = await this.db.query(
        'SELECT * FROM availability WHERE user_id = ?',
        [userId]
      );
      return result;
    } catch (err) {
      console.error("Error getting user availabilities:", err);
      return { code: 500, message: 'Error getting user availabilities' };
    }
  }
}

// Export a factory function that returns a new instance of the model
module.exports = (db) => new AvailabilityModel(db);
