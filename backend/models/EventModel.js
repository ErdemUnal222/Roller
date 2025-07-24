// EventModel handles all database interactions for event-related data
class EventModel {
  constructor(db) {
    this.db = db; // Store the MySQL connection so we can use it in all methods
  }

  // READ: Retrieve all events from the database (e.g. for public display or admin panel)
  async getAllEvents() {
    const rows = await this.db.query("SELECT * FROM events");
if (process.env.NODE_ENV !== 'production') {
      console.log("All events from DB:", rows); // Optional debug log for dev testing
    }    return rows; // Return all events as an array
  }

  // READ: Retrieve a specific event by its ID
  async getOneEvent(id) {
    try {
      const rows = await this.db.query("SELECT * FROM events WHERE id = ?", [id]);
      return rows[0]; // Return the first result (or undefined if not found)
    } catch (err) {
      throw err; // Let the controller deal with any error
    }
  }

  // CREATE: Insert a new event in the database
  async saveOneEvent(eventData) {
    try {
      const result = await this.db.query(
        `INSERT INTO events (title, description, event_date, places, picture, alt, price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          eventData.title,
          eventData.description,
          eventData.event_date,
          eventData.places,
          eventData.picture || null, // Optional field: file upload
          eventData.alt || null,     // Optional field: alt text for image
          eventData.price
        ]
      );
      return result; // Return insertId or result info
    } catch (err) {
      throw err;
    }
  }

  // UPDATE: Update an event's details based on its ID
  async updateEvent(id, eventData) {
    try {
      const result = await this.db.query(
        `UPDATE events 
         SET title = ?, description = ?, event_date = ?, places = ?, picture = ?, alt = ?, price = ?
         WHERE id = ?`,
        [
          eventData.title,
          eventData.description,
          eventData.event_date,
          eventData.places,
          eventData.picture || null,
          eventData.alt || null,
          eventData.price,
          id
        ]
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  // DELETE: Permanently remove an event from the database
  async deleteOneEvent(id) {
    try {
      const result = await this.db.query("DELETE FROM events WHERE id = ?", [id]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // RELATION: Register a user to an event (many-to-many via users_events table)
  async registerUserToEvent(userId, eventId) {
    try {
      const result = await this.db.query(
        "INSERT INTO users_events (user_id, event_id) VALUES (?, ?)",
        [userId, eventId]
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  // RELATION: Check if a user is already registered for an event
  async checkUserRegistration(userId, eventId) {
    try {
      const rows = await this.db.query(
        "SELECT 1 FROM users_events WHERE user_id = ? AND event_id = ? LIMIT 1",
        [userId, eventId]
      );
      return rows.length > 0; // true if user is already registered
    } catch (err) {
      throw err;
    }
  }

  // RELATION: Unregister a user from an event
  async unregisterUserFromEvent(userId, eventId) {
    try {
      const result = await this.db.query(
        "DELETE FROM users_events WHERE user_id = ? AND event_id = ?",
        [userId, eventId]
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
}

// Export a factory function that injects the DB connection into the model
module.exports = (db) => new EventModel(db);
