// src/api/productService.js
// This module handles all API interactions related to product management.

import API from './axios';

/**
 * Fetch the complete list of products (admin view).
 */
export const getAllProducts = async () => {
  try {
    const res = await API.get('/products'); // Admin-only route
    return res.data;
  } catch (err) {
    throw err.formattedMessage || "Failed to fetch products.";
  }
};

/**
 * Fetch the product catalog for the public shop.
 */
export const getShopProducts = async () => {
  try {
    const response = await API.get('/shop');
    return response.data;
  } catch (err) {
    throw err.formattedMessage || "Failed to fetch shop products.";
  }
};

/**
 * Fetch a single product by its ID.
 * - If isAdmin is true, fetch from /products/:id
 * - Otherwise, fetch from /shop/:id
 */
export const getProductById = async (id, isAdmin = false) => {
  try {
    const path = isAdmin ? `/products/${id}` : `/shop/${id}`;
    const res = await API.get(path);
    return res.data;
  } catch (err) {
    throw err.formattedMessage || "Failed to fetch product.";
  }
};

/**
 * Create a new product (admin-only).
 */
export const createProduct = async (data) => {
  try {
    const res = await API.post('/products', data); // Fixed path
    return res.data;
  } catch (err) {
    throw err.formattedMessage || "Failed to create product.";
  }
};

/**
 * Update an existing product by ID (admin-only).
 */
export const updateProduct = async (id, data) => {
  try {
    const res = await API.put(`/products/${id}`, data); // Fixed path
    return res.data;
  } catch (err) {
    throw err.formattedMessage || "Failed to update product.";
  }
};

/**
 * Delete a product by ID (admin-only).
 */
export const deleteProduct = async (id) => {
  try {
    const res = await API.delete(`/products/${id}`);
    return res.data;
  } catch (err) {
    throw err.formattedMessage || "Failed to delete product.";
  }
};

/**
 * Fetch a single public product (for shop detail page).
 */
export const getOneProduct = async (id) => {
  try {
    const res = await API.get(`/shop/${id}`);
    return res.data;
  } catch (err) {
    throw err.formattedMessage || "Failed to fetch shop product.";
  }
};
