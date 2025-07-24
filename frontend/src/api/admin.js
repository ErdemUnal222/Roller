import API from './axios';

// ========================== USERS ==========================
// This route is restricted to admin users only.
export const fetchAllUsers = async () => {
  const res = await API.get('/users');
  return res.data.result || [];

};

export const deleteUserById = async (id) => {
  await API.delete(`/users/${id}`);
  return true;

};

// Update user details such as name, email, etc.
// This is useful for admins who want to edit user information.
export const updateUser = async (id, body) => {
  const res = await API.put(`/users/${id}`, body);
  return res.data.newUser;
};

// ========================== PRODUCTS ==========================

// Get all products from the database.
// This requires authentication (admin access).
export const fetchAllProducts = async () => {
  const res = await API.get('/products');
  return Array.isArray(res.data.result) ? res.data.result : [];
  
};

// Delete a product by its ID (admin-only function).
export const deleteProduct = async (id) => {
  await API.delete(`/products/${id}`);
};

// Update a product's details.
// Useful for changing the price, title, stock, or description.
export const updateProduct = async (id, body) => {
  const res = await API.put(`/products/${id}`, body);
  return res.data.updatedProduct;
};

// ========================== EVENTS ==========================

// Get a list of all events.
// This function retrieves events created on the platform.
// Requires authentication.
export const fetchAllEvents = async () => {
  const res = await API.get('/events');
  return res.data.result || [];
};

// Delete an event using its ID (admin-only function).
// Useful for removing outdated or canceled events.
export const deleteEvent = async (id) => {
  await API.delete(`/events/${id}`);
};


// ========================== ORDERS ==========================

// Retrieve all orders made on the platform.
// Only admin users can access this route.
export const fetchAllOrders = async () => {
  const res = await API.get('/orders');
  return res.data.result || [];
};


// Update the status of an order (e.g., "paid", "shipped", "canceled").
// Only admins can perform this action.
export const updateOrderStatus = async (id, status) => {
  const res = await API.put(`/orders/${id}`, { status });
  return res.data.updatedOrder;
};
