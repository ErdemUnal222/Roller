// controllers/orderController.js
const stripe = require("../config/stripe"); // Stripe instance with API key

// Redirect users back to the FRONTEND (React app), not the API server
const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  "http://localhost:3000";

module.exports = (OrderModel, OrderDetailsModel, ProductModel) => {
  // ------------------------
  // Create order WITHOUT Stripe (manual save)
  // ------------------------
  const saveOrder = async (req, res, next) => {
    try {
      const { totalAmount, totalProducts } = req.body;
      const userId = req.user?.id;

      if (
        !userId ||
        !Number.isFinite(Number(totalAmount)) ||
        !Number.isFinite(Number(totalProducts))
      ) {
        return next({ status: 400, message: "Missing required order data" });
      }

      const order = await OrderModel.saveOneOrder(
        userId,
        Number(totalAmount),
        Number(totalProducts)
      );
      if (order?.code) return next({ status: 500, message: "Error saving order" });

      return res.status(201).json({
        status: 201,
        msg: "Order saved successfully",
        orderId: order.insertId || order.id,
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------
  // Delete order by ID
  // ------------------------
  const deleteOrder = async (req, res, next) => {
    try {
      const deletion = await OrderModel.deleteOneOrder(req.params.id);
      if (deletion?.code) return next({ status: 500, message: "Error deleting order" });

      if (!deletion || deletion.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found." });
      }

      return res.status(200).json({ status: 200, msg: "Order deleted successfully" });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------
  // Get all orders (admin sees all; user sees only their orders)
  // ------------------------
  const getAllOrders = async (req, res, next) => {
    try {
      let orders;
      if (req.user?.role === "admin") {
        orders = await OrderModel.getAllOrders();
      } else if (typeof OrderModel.getOrdersByUserId === "function") {
        orders = await OrderModel.getOrdersByUserId(req.user.id);
      } else {
        // Fallback: filter client-side if model lacks user-specific method
        const all = await OrderModel.getAllOrders();
        orders = Array.isArray(all)
          ? all.filter((o) => o.users_id === req.user.id)
          : [];
      }
      return res.status(200).json({ result: orders });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------
  // Get one order with details (owner or admin)
  // ------------------------
  const getOneOrder = async (req, res, next) => {
    try {
      const order = await OrderModel.getOneOrder(req.params.id);
      if (order?.code) return next({ status: order.code, message: order.message });

      if (!Array.isArray(order) || !order[0]) {
        return next({ status: 404, message: "Order not found" });
      }

      // Only owner or admin can view (use correct column: users_id)
      if (order[0].users_id !== req.user.id && req.user.role !== "admin") {
        return next({ status: 403, message: "Unauthorized to access this order" });
      }

      const items = await OrderDetailsModel.getOrderDetailsByOrderId(req.params.id);
      if (items?.code) return next({ status: items.code, message: items.message });

      return res.status(200).json({
        status: 200,
        result: {
          ...order[0],
          items,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------
  // Full checkout: create order, save details, update stock, Stripe Checkout
  // ------------------------
  const createOrderAndCheckout = async (req, res, next) => {
    try {
      const { items } = req.body;
      const userId = req.user?.id;

      if (!userId || !Array.isArray(items) || items.length === 0) {
        return next({ status: 400, message: "Missing order data or items" });
      }

      // Validate & compute totals from client-provided items
      // (For stronger security, fetch prices from DB and ignore client prices.)
      let totalProducts = 0;
      let totalAmount = 0;
const verifiedItems = [];
      for (const it of items) {
       const product = await ProductModel.getOneProduct(it.id);
if (!product) {
  return next({ status: 400, message: "Product not found: " + it.id });
}
        const qty = Number(it.quantity);
        const price = Number(product.price);
        if (
          !Number.isFinite(qty) || qty <= 0 ||
          !Number.isFinite(price) || price <= 0
        ) {
          return next({ status: 400, message: "Invalid item price/quantity" });
        }
        totalProducts += qty;
        totalAmount += price * qty;
        verifiedItems.push({ ...it, price, qty });
      }

      // 1) Create local order (pending)
      const order = await OrderModel.saveOneOrder(userId, totalAmount, totalProducts);
      if (order?.code) return next({ status: 500, message: "Error saving order" });

      const orderId = order.insertId || order.id;
      if (!orderId) return next({ status: 500, message: "Failed to create order" });

      // 2) Save order details
      const detailResult = await OrderDetailsModel.addOrderDetails(orderId,verifiedItems);
      if (detailResult?.code) return next({ status: 500, message: "Error saving order details" });

      // 3) Decrement stock (best-effort; log problems but continue)
      for (const item of items) {
        try {
          await ProductModel.decrementStock(item.productId, item.quantity);
        } catch (stockErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `Stock update failed for product ${item.productId}:`,
              stockErr?.message || stockErr
            );
          }
        }
      }

      // 4) Prepare Stripe line_items (use server-validated values)
      const line_items = verifiedItems.map((item) => ({
  price_data: {
    currency: "eur",
    product_data: { name: item.name || `Item ${item.id}` },
    unit_amount: Math.round(item.price * 100),
  },
  quantity: item.qty,
}));
      // 5) Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items,
        client_reference_id: String(orderId),
        metadata: { orderId: String(orderId), userId: String(userId) },
        success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_URL}/checkout`,
      });

      return res.status(201).json({
        status: 201,
        ok: true,
        msg: "Order created and Stripe session initiated",
        orderId,
        url: session.url,
      });
    } catch (err) {
      console.error("createOrderAndCheckout error:", err?.message || err);
      return res.status(500).json({ ok: false, message: "Failed to create checkout session" });
    }
  };

  // ------------------------
  // Admin: Update order status
  // ------------------------
  const updateOrderStatus = async (req, res, next) => {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status field is required." });
      }

      const updated = await OrderModel.updateStatus(orderId, status);
      if (updated?.code) {
        return next({ status: 500, message: "Error updating order status" });
      }
      if (!updated || updated.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found." });
      }

      return res.status(200).json({ message: "Order status updated successfully." });
    } catch (err) {
      next(err);
    }
  };

  // ------------------------
  // Payment success placeholder (if you’re not using webhooks)
  // ------------------------
  const payment = async (req, res, next) => {
    try {
      return res.status(200).json({ status: 200, msg: "Payment handled successfully!" });
    } catch (err) {
      next(err);
    }
  };

  return {
    createOrderAndCheckout,
    updateOrderStatus,
    getAllOrders,
    getOneOrder,
    payment,
    saveOrder,
    deleteOrder,
  };
};
