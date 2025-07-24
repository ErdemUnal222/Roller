// This file serves as the central entry point to register all route modules.
// It exports a function that receives the main Express router and the database connection instance.

module.exports = (router, db) => {
  // Load and register all route modules with the provided router and db

  require('./authRoutes')(router, db);            // Handles login and authentication
  require('./productRoutes')(router, db);         // Handles product catalog CRUD
  require('./availabilityRoutes')(router, db);    // Handles player availabilities
  require('./commentRoutes')(router, db); // Handles event and product comments
  require('./eventRoutes')(router, db);           // Manages all event-related routes
  require('./messageRoutes')(router, db);         // Manages user-to-user messaging
  require('./orderRoutes')(router, db);           // Handles shopping and order history
  require('./statsRoutes')(router, db);           // Provides overview stats for the admin dashboard
  require('./userRoutes')(router, db);            // User profile management and admin listing
  require('./webhookRoutes')(router, db);         // Stripe payment webhook integration
};
