const Stripe = require('stripe');

const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET; // support both names
if (!stripeSecret) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}
const stripe = Stripe(stripeSecret);

module.exports = (OrderModel) => {
  // POST /api/v1/webhook/stripe
  const handleStripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) return res.status(400).send('Missing Stripe-Signature');

    let event;
    try {
      // IMPORTANT: req.body is a Buffer (because of bodyParser.raw in server.js)
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      // Bad signature -> reject
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // prefer metadata.orderId; fallback to client_reference_id if you used it
        const orderId = session?.metadata?.orderId || session?.client_reference_id;
        if (orderId) {
          try {
            await OrderModel.updateStatus(orderId, 'paid');
          } catch (dbErr) {
            // Log but ACK to avoid Stripe retries; reconcile later
            console.error(`Failed to update order #${orderId}:`, dbErr?.message || dbErr);
          }
        }
      }
      // handle other event types if needed...
    } catch (err) {
      // Any unexpected handler error: log but still ACK
      console.error('Webhook handler error:', err?.message || err);
    }

    // Always ACK 200 so Stripe doesn’t retry endlessly
    return res.status(200).json({ received: true });
  };

  return { handleStripeWebhook };
};
