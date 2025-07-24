// The OrderModel class handles all database logic related to orders
class OrderModel {
  constructor(db) {
    this.db = db; // Save the MySQL connection so we can reuse it in each method
  }

  /**
   * CREATE: Save a new order in the `orders` table.
   * This method takes:
   * - userId: the user placing the order
   * - totalAmount: the total price of all products in the order
   * - totalProducts: how many products were purchased
   * It automatically sets the status to "Processing" and the timestamp to the current time.
   */
  async saveOneOrder(userId, totalAmount, totalProducts) {
    try {
      const result = await this.db.query(
        `INSERT INTO orders (users_id, total, total_products, status, created_at) 
         VALUES (?, ?, ?, 'Processing', NOW())`,
        [userId, totalAmount, totalProducts]
      );
      return result; // Return the result object, including the new order ID
    } catch (err) {
      console.error("Error in saveOneOrder:", err);
      return { code: 500, message: 'Error saving order' };
    }
  }

  /**
   * UPDATE: Change the status of an existing order.
   * For example, from "Processing" to "Paid", "Shipped", or "Cancelled".
   * This is used during order tracking or after a successful payment.
   */
  async updateStatus(orderId, status) {
    try {
      const [result] = await this.db.query(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, orderId]
      );
      return result;
    } catch (err) {
      console.error("Error in updateStatus:", err);
      return { code: 500, message: 'Error updating order status' };
    }
  }

  /**
   * READ: Get a full list of all orders from the database.
   * This is mostly used by admins in the back office to monitor activity.
   * Orders are sorted by creation date (most recent first).
   */
  async getAllOrders() {
    try {
      const [result] = await this.db.query(
        `SELECT * FROM orders ORDER BY created_at DESC`
      );
      return result;
    } catch (err) {
      console.error("Error in getAllOrders:", err);
      return { code: 500, message: 'Error retrieving orders' };
    }
  }
 // Retrieve all orders belonging to a specific user
  async getOrdersByUserId(userId) {
    try {
      const [result] = await this.db.query(
        `SELECT * FROM orders WHERE users_id = ? ORDER BY created_at DESC`,
        [userId]
      );
      return result;
    } catch (err) {
      console.error("Error in getOrdersByUserId:", err);
      return { code: 500, message: 'Error retrieving user orders' };
    }
  }

  /**
   * READ: Fetch the details of a specific order using its ID.
   * This is used, for example, to display a detailed view of the order.
   */
  async getOneOrder(orderId) {
    try {
      const [result] = await this.db.query(
        `SELECT * FROM orders WHERE id = ?`,
        [orderId]
      );
      return result;
    } catch (err) {
      console.error("Error in getOneOrder:", err);
      return { code: 500, message: 'Error retrieving order' };
    }
  }

  /**
   * DELETE: Permanently remove an order from the database using its ID.
   * This could be used to clean up test data or cancel faulty orders.
   */
  async deleteOneOrder(orderId) {
    try {
      const [result] = await this.db.query(
        `DELETE FROM orders WHERE id = ?`,
        [orderId]
      );
      return result;
    } catch (err) {
      console.error("Error in deleteOneOrder:", err);
      return { code: 500, message: 'Error deleting order' };
    }
  }
}

// Export an instance of the OrderModel with the injected DB connection
module.exports = (db) => new OrderModel(db);
