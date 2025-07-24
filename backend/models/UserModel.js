class UserModel {
  constructor(db) {
    this.db = db;
  }

  async saveOneUser(userData) {
    try {
      const result = await this.db.query(
        `INSERT INTO users (
            firstName, lastName, email, password, created_at,
            address, zip, city, phone, role
        ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
        [
          userData.firstName,
          userData.lastName,
          userData.email,
          userData.password,
          userData.address,
          userData.zip,
          userData.city,
          userData.phone,
          userData.role || 'user' // fallback if undefined
        ]
      );

      return {
        id: result.insertId,
        status: 201,
        message: 'User saved successfully'
      };
    } catch (err) {
      console.error("saveOneUser error:", err);
      return { code: 500, message: 'Error saving user' };
    }
  }

  async getUserByEmail(email) {
    try {
      const result = await this.db.query(
        `SELECT id, email, password, role, firstName, lastName, address, complement, zip, city, picture
         FROM users WHERE email = ?`,
        [email]
      );
      return result;
    } catch (err) {
      console.error("getUserByEmail error:", err);
      return { code: 500, message: 'Error retrieving user by email' };
    }
  }

  async getOneUser(id) {
    try {
      const result = await this.db.query(
        `SELECT id, firstName, lastName, email, address, zip, city, phone, role, picture 
         FROM users WHERE id = ?`,
        [id]
      );
      return result;
    } catch (err) {
      console.error("getOneUser error:", err);
      return { code: 500, message: 'Error retrieving user by ID' };
    }
  }

  async updateUser(data, userId) {
    try {
      if (!data || typeof data !== 'object') {
        return { code: 400, message: "Invalid update data" };
      }

      const allowedFields = [
        'firstName', 'lastName', 'email', 'address',
        'zip', 'city', 'phone', 'picture'
      ];

      const fields = [];
      const values = [];

      for (const key of allowedFields) {
        if (data[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      }

      if (fields.length === 0) {
        return { code: 400, message: "No valid fields to update" };
      }

      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      values.push(userId);

      const result = await this.db.query(sql, values);
      return result;
    } catch (err) {
      console.error("updateUser error:", err);
      return { code: 500, message: 'Error updating user' };
    }
  }

  async updateConnexion(id) {
    try {
      const result = await this.db.query(
        "UPDATE users SET last_connection = NOW() WHERE id = ?", [id]
      );
      return result;
    } catch (err) {
      console.error("updateConnexion error:", err);
      return { code: 500, message: 'Error updating last connection timestamp' };
    }
  }

  async deleteOneUser(id) {
    try {
      const [result] = await this.db.query("DELETE FROM users WHERE id = ?", [id]);
      return result;
    } catch (err) {
      console.error("deleteOneUser SQL error:", err);
      return { code: 500, message: err.message };
    }
  }

  async softDeleteUser(id) {
    try {
      const [result] = await this.db.query(
        "UPDATE users SET isDeleted = 1 WHERE id = ?",
        [id]
      );
      return result;
    } catch (err) {
      console.error("softDeleteUser error:", err);
      return { code: 500, message: err.message };
    }
  }

  async getAllOtherUsers(currentUserId) {
    try {
      const result = await this.db.query(
        'SELECT id, firstName, lastName FROM users WHERE id != ? AND isDeleted = 0',
        [currentUserId]
      );
      return result;
    } catch (err) {
      console.error("getAllOtherUsers error:", err);
      return { code: 500, message: err.message };
    }
  }

  async getAllUsers() {
    try {
      const result = await this.db.query(
        `SELECT id, firstName, lastName, email, address, zip, city, phone, role 
         FROM users WHERE isDeleted = 0`
      );
      return result;
    } catch (err) {
      console.error("getAllUsers error:", err);
      return { code: 500, message: 'Error retrieving all users' };
    }
  }
}

module.exports = (db) => new UserModel(db);
