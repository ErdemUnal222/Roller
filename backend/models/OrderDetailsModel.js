// OrderDetailsModel manages the link between orders and their individual product items
class OrderDetailsModel {
  constructor(db) {
    this.db = db; // Store the MySQL connection instance for reuse
  }

  /**
   * Add product items to a given order.
   * Each item in the `items` array represents a product that the user bought:
   * - productId: which product was ordered
   * - quantity: how many units
   * - price: price per unit at the time of order
   */
  async addOrderDetails(orderId, items) {
    try {
      // Prepare a list of database INSERT queries, one for each product in the order
      const promises = items.map(item => {
        return this.db.query(
          `INSERT INTO order_details (orders_id, products_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.price]
        );
      });

      // Execute all INSERT queries in parallel
      await Promise.all(promises);

      // Return a success response
      return { status: 201, message: "Order details saved" };
    } catch (err) {
      // Log the error for debugging purposes
      console.error("Error in addOrderDetails:", err);

      // Return a structured error response
      return { code: 500, message: "Failed to save order details" };
    }
  }

  /**
   * Retrieve all product items linked to a specific order ID.
   * This method joins the order_details table with the products table,
   * so the frontend can display things like product name and image.
   */
  async getOrderDetailsByOrderId(orderId) {
    try {
      const [result] = await this.db.query(
        `SELECT 
           od.*,              -- All fields from order_details (quantity, price, etc.)
           p.title,           -- Product title from the products table
           p.picture          -- Product image path
         FROM order_details od
         JOIN products p ON od.products_id = p.id
         WHERE od.orders_id = ?`,
        [orderId]
      );

      // Return the joined result to the controller
      return result;
    } catch (err) {
      // Log and return error if query fails
      console.error("Error in getOrderDetailsByOrderId:", err);
      return { code: 500, message: "Failed to fetch order details" };
    }
  }
}

// Export the model using dependency injection (so we can reuse the DB instance)
module.exports = (db) => new OrderDetailsModel(db);
