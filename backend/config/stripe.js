// Load environment variables from the .env file into process.env
require("dotenv").config();

// Import the Stripe library
const Stripe = require("stripe");

// Initialize the Stripe client using the secret key from the environment variables
const stripe = Stripe(process.env.STRIPE_SECRET);

// Check if the Stripe secret key is provided; throw an error if it's missing
if (!process.env.STRIPE_SECRET) {
  throw new Error("STRIPE_SECRET is not defined in .env");
}

// Export the configured Stripe instance so it can be used in other parts of the app
module.exports = stripe;
