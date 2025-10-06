// config/stripe.js
require('dotenv').config();
const Stripe = require('stripe');

// Never load this in the browser bundle
if (typeof window !== 'undefined') {
  throw new Error('Do not import the Stripe secret on the client.');
}

// Accept both env names; use your *secret* (sk_...) key
const secret =
  process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_SECRET;

if (!secret) {
  throw new Error('Stripe secret is not set (STRIPE_SECRET_KEY or STRIPE_SECRET).');
}

if (/^pk_/.test(secret)) {
  throw new Error('Publishable key detected. Use your secret key (starts with sk_...) on the server.');
}

// Optional (recommended): pin API version + add timeout
const stripe = new Stripe(secret, {
  apiVersion: process.env.STRIPE_API_VERSION || '2023-10-16',
  timeout: 20000, // 20s
});

module.exports = stripe;
