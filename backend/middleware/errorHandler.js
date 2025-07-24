// Global error-handling middleware for Express
function errorHandler(err, req, res, next) {
  // This middleware catches any error that occurs in your app and wasn't already handled

  // Print the full error stack to the terminal (useful for debugging)
  console.error(err.stack);

  // Extract a status code from the error if it exists, otherwise default to 500 (internal server error)
  const status = err.status || 500;

  // Extract a readable error message, or fallback to a generic one
  const message = err.message || "Internal Server Error";

  // Respond to the client with a consistent error object
  res.status(status).json({
    success: false, // Always false since this is an error
    message         // Send back the specific message (e.g. "User not found", "Validation error", etc.)
  });
}

// Export the middleware so it can be used in app.js or server.js
module.exports = errorHandler;
