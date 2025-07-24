const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET); // Initialize Stripe with secret key

module.exports = (OrderModel) => {

  // HANDLE Stripe webhook for completed payment
  const handleStripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature']; // Stripe sends a unique signature with every webhook

    let event;

    try {
      // Stripe requires verifying the event's authenticity using the raw request body and the signature
      event = stripe.webhooks.constructEvent(
        req.rawBody, // Raw body must be provided by middleware (important for verification)
        sig,
        process.env.STRIPE_WEBHOOK_SECRET // Secret set in Stripe dashboard
      );
    } catch (err) {
      // If verification fails, the webhook is invalid (could be tampered)
      return next({ status: 400, message: `Webhook Error: ${err.message}` });
    }

    // When payment is successfully completed, Stripe emits this event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // We saved our internal order ID in Stripe metadata during checkout
      const orderId = session.metadata && session.metadata.orderId;

      if (orderId) {
        try {
          // Update the order status in our own database
          await OrderModel.updateStatus(orderId, 'paid');
        } catch (err) {
          // If DB update fails, we still acknowledge Stripe to avoid retries
          return next({ status: 500, message: `Failed to update order #${orderId} status` });
        }
      }
    }

    // Respond 200 OK no matter what — required by Stripe to stop resending the event
    res.status(200).json({ received: true });
  };

  // Export the webhook handler so it can be used in routes
  return {
    handleStripeWebhook
  };
};
