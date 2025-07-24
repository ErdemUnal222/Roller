// Export a function that receives a database connection instance
module.exports = (db) => {

  // Retrieves dashboard overview statistics (counts and revenue)
  const getOverviewStats = async (req, res, next) => {
    try {
      // Run SQL queries to gather summary data
      const [[users]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
      const [[events]] = await db.query('SELECT COUNT(*) AS totalEvents FROM events');
      const [[products]] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');
      const [[orders]] = await db.query('SELECT COUNT(*) AS totalOrders, SUM(total) AS totalRevenue FROM orders');

      // Return all statistics as a structured response object
      res.status(200).json({
        status: 200,
        stats: {
          totalUsers: users.totalUsers,
          totalEvents: events.totalEvents,
          totalProducts: products.totalProducts,
          totalOrders: orders.totalOrders,
          totalRevenue: orders.totalRevenue || 0 // Use 0 if no revenue found
        }
      });
    } catch (err) {
      // Handle database or server errors
      next({ status: 500, message: "Error fetching statistics" });
    }
  };

  // Expose the controller method
  return { getOverviewStats };
};
