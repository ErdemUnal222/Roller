// models/OrderModel.js
class OrderModel {
  constructor(db) {
    this.db = db; // promise-mysql pool/connection
  }

  // CREATE
  async saveOneOrder(userId, totalAmount, totalProducts) {
    try {
      const result = await this.db.query(
        `INSERT INTO orders (users_id, total, total_products, status, created_at)
         VALUES (?, ?, ?, 'Processing', NOW())`,
        [userId, totalAmount, totalProducts]
      );
      // result is OkPacket { insertId, affectedRows, ... }
      return result;
    } catch (err) {
      console.error("Error in saveOneOrder:", err);
      return { code: 500, message: "Error saving order" };
    }
  }

  // UPDATE
  async updateStatus(orderId, status) {
    try {
      const result = await this.db.query(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, orderId]
      );
      // result is OkPacket
      return result;
    } catch (err) {
      console.error("Error in updateStatus:", err);
      return { code: 500, message: "Error updating order status" };
    }
  }

  // READ (admin)
  async getAllOrders() {
    try {
      const [rows] = await this.db.query(
        `SELECT 
  users.firstName, 
  users.lastName,
  orders.id,
  orders.total,
  orders.status
FROM orders
JOIN users ON orders.users_id = users.id
ORDER BY orders.created_at DESC`
      );
      // rows is an array of rows
      return rows;
    } catch (err) {
      console.error("Error in getAllOrders:", err);
      return { code: 500, message: "Error retrieving orders" };
    }
  }

  // READ (by user)
  async getOrdersByUserId(userId) {
    try {
      const [rows] = await this.db.query(
        `SELECT * FROM orders WHERE users_id = ? ORDER BY created_at DESC`,
        [userId]
      );
      return rows;
    } catch (err) {
      console.error("Error in getOrdersByUserId:", err);
      return { code: 500, message: "Error retrieving user orders" };
    }
  }

  // READ (one)
  async getOneOrder(orderId) {
    try {
      const [rows] = await this.db.query(
        `SELECT * FROM orders WHERE id = ?`,
        [orderId]
      );
      return rows;
    } catch (err) {
      console.error("Error in getOneOrder:", err);
      return { code: 500, message: "Error retrieving order" };
    }
  }

  // DELETE
  async deleteOneOrder(orderId) {
    try {
      const result = await this.db.query(
        `DELETE FROM orders WHERE id = ?`,
        [orderId]
      );
      return result; // OkPacket
    } catch (err) {
      console.error("Error in deleteOneOrder:", err);
      return { code: 500, message: "Error deleting order" };
    }
  }
}

module.exports = (db) => new OrderModel(db);
