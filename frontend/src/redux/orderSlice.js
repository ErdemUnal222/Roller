import { createSlice } from '@reduxjs/toolkit';

// Initial state for the order slice
// This slice only tracks the most recent order placed by the user
const initialState = {
  latestOrder: null, // Will hold an object with order details, or null if no order is active
};

const orderSlice = createSlice({
  name: 'order',       // Name used in Redux DevTools and state structure
  initialState,        // The default state when the app starts
  reducers: {
    /**
     * Save the most recent order in the Redux store.
     * This is typically called after the user successfully places an order.
     * 
     * @param {Object} state - The current Redux state for this slice
     * @param {Object} action - The dispatched action containing the order data
     * Example payload: { id: 123, items: [...], total: 45.00 }
     */
    placeOrder: (state, action) => {
      state.latestOrder = action.payload;
    },

    /**
     * Clear the stored order from the state.
     * This might happen after:
     * - the user has finished viewing their confirmation
     * - the user logs out
     * - the cart is reset
     * 
     * @param {Object} state - The current Redux state
     */
    clearOrder: (state) => {
      state.latestOrder = null;
    },
  },
});

// Export the actions so they can be dispatched in components
export const { placeOrder, clearOrder } = orderSlice.actions;

// Export the reducer so it can be combined in the Redux store
export default orderSlice.reducer;
