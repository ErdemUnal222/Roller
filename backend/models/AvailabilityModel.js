// backend/models/AvailabilityModel.js

class AvailabilityModel {
  constructor(db) {
    this.db = db; // MySQL connection/pool (promise-mysql / mysql2)
  }

  // ---- Core helpers (preferred API) ----------------------------------------

  /**
   * Create a new availability.
   * Returns a normalized object: { id, user_id, start_date, end_date, comment }
   */
  async create({ userId, startDate, endDate, comment = '' }) {
    try {
      const sql = `
        INSERT INTO availability (user_id, start_date, end_date, comment)
        VALUES (?, ?, ?, ?)
      `;
      const result = await this.db.query(sql, [userId, startDate, endDate, comment]);
      const insertId = result?.insertId ?? result?.[0]?.insertId; // support mysql2/promise
      return {
        id: insertId,
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        comment: comment || ''
      };
    } catch (err) {
      console.error("Error adding availability:", err);
      throw err;
    }
  }

  /**
   * Update a slot. If guardUserId is provided, enforces ownership.
   * Returns the raw result (check .affectedRows).
   */
  async update({ id, startDate, endDate, comment = '', guardUserId = null }) {
    try {
      const params = [startDate, endDate, comment, id];
      let where = `WHERE id = ?`;
      if (guardUserId != null) {
        where += ` AND user_id = ?`;
        params.push(guardUserId);
      }
      const sql = `
        UPDATE availability
        SET start_date = ?, end_date = ?, comment = ?
        ${where}
        LIMIT 1
      `;
      const result = await this.db.query(sql, params);
      return result;
    } catch (err) {
      console.error("Error updating availability:", err);
      throw err;
    }
  }

  /**
   * Delete a slot. If guardUserId is provided, enforces ownership.
   * Returns the raw result (check .affectedRows).
   */
  async remove({ id, guardUserId = null }) {
    try {
      const params = [id];
      let where = `WHERE id = ?`;
      if (guardUserId != null) {
        where += ` AND user_id = ?`;
        params.push(guardUserId);
      }
      const sql = `
        DELETE FROM availability
        ${where}
        LIMIT 1
      `;
      const result = await this.db.query(sql, params);
      return result;
    } catch (err) {
      console.error("Error deleting availability:", err);
      throw err;
    }
  }

  // ---- Queries --------------------------------------------------------------

  async getAllAvailabilities() {
    try {
      const sql = `SELECT * FROM availability ORDER BY start_date ASC, end_date ASC`;
      const rows = await this.db.query(sql);
      return rows;
    } catch (err) {
      console.error("Error getting availabilities:", err);
      throw err;
    }
  }

  async getAvailabilitiesByUser(userId) {
    try {
      const sql = `
        SELECT * FROM availability
        WHERE user_id = ?
        ORDER BY start_date ASC, end_date ASC
      `;
      const rows = await this.db.query(sql, [userId]);
      return rows;
    } catch (err) {
      console.error("Error getting user availabilities:", err);
      throw err;
    }
  }

  async getOneById(id) {
    try {
      const sql = `SELECT * FROM availability WHERE id = ? LIMIT 1`;
      const rows = await this.db.query(sql, [id]);
      // support mysql2 (returns [rows]) vs promise-mysql (returns rows)
      const list = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
      return Array.isArray(list) ? list[0] : list;
    } catch (err) {
      console.error("Error getting availability by id:", err);
      throw err;
    }
  }

  // ---- Legacy wrappers (keep existing controller calls working) -------------

  // Old: addAvailability(userId, startDate, endDate, comment)
  async addAvailability(userId, startDate, endDate, comment = '') {
    return this.create({ userId, startDate, endDate, comment });
  }

  // Old: updateAvailability(id, userId, startDate, endDate, comment)
  async updateAvailability(id, userId, startDate, endDate, comment = '') {
    return this.update({ id, startDate, endDate, comment, guardUserId: userId });
  }

  // Old: deleteAvailability(id, userId)
  async deleteAvailability(id, userId) {
    return this.remove({ id, guardUserId: userId });
  }

  // Old: deleteByIdForUser(userId, id)
  async deleteByIdForUser(userId, id) {
    return this.remove({ id, guardUserId: userId });
  }

  // Old: deleteByIdAnyUser(id) — admin path
  async deleteByIdAnyUser(id) {
    return this.remove({ id, guardUserId: null });
  }
}

module.exports = (db) => new AvailabilityModel(db);
