// /src/api/orderService.js
// Handles all API requests related to order management

import API from './axios';

/**
 * Get a list of all orders (requires authentication).
 */
export const getAllOrders = async () => {
  try {
    const res = await API.get('/orders');
    return res.data;
  } catch (err) {
    throw err.formattedMessage || "Failed to fetch orders.";
  }
};

/**
 * Fetch the details of a specific order by ID.
 */
export const getOrderById = async (id) => {
  try {
    const res = await API.get(`/orders/${id}`);
    return res.data;
  } catch (err) {
    throw err.formattedMessage || "Failed to fetch order.";
  }
};

/**
 * Create a new order (requires authentication).
 */
export const createOrder = async (orderData) => {
  try {
    const res = await API.post('/orders', orderData);
    return res.data;
  } catch (err) {
    throw err.formattedMessage || "Failed to create order.";
  }
};

/**
 * Submit payment information after order creation.
 */
export const createPayment = async (paymentData) => {
  try {
    const res = await API.post('/orders/payment', paymentData);
    return res.data;
  } catch (err) {
    throw err.formattedMessage || "Failed to create payment.";
  }
};
