import { configureStore } from '@reduxjs/toolkit';

// Import individual slice reducers
import userReducer from './userSlice';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';

/**
 * Redux Store Configuration
 *
 * This file sets up the central Redux store, which combines
 * all feature-specific slices into a single global state tree.
 */
const store = configureStore({
  reducer: {
    /**
     * The 'user' slice:
     * Manages authentication status, profile info, role (admin/user), etc.
     * Example state: { user: { id, firstName, isAdmin, token, ... } }
     */
    user: userReducer,

    /**
     * The 'cart' slice:
     * Tracks products added to the shopping cart, including quantities and stock constraints.
     * Example state: { items: [ { id, title, price, quantity, stock }, ... ] }
     */
    cart: cartReducer,

    /**
     * The 'order' slice:
     * Stores the most recently placed order, used for displaying confirmations.
     * Example state: { latestOrder: { id, items, total, createdAt, ... } }
     */
    order: orderReducer,
  },
});

/**
 * Export the configured store to be provided to the entire React app.
 * Typically used in <Provider store={store}> at the top level (e.g., App.jsx).
 */
export default store;
