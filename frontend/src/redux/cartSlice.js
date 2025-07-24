import { createSlice } from '@reduxjs/toolkit';

/**
 * Initial state for the shopping cart.
 * Each item is expected to have: id, title, price, quantity, and stock.
 */
const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Add a product to the cart.
     * - If the product already exists in the cart and stock allows, increment quantity.
     * - If not, add it to the cart with quantity 1.
     * - Prevent adding if stock is 0 or limit is reached.
     */
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((item) => item.id === product.id);

      if (existing) {
        if (existing.quantity < product.stock) {
          existing.quantity += 1;
        } else {
          console.warn("Cannot add more than available stock");
        }
      } else {
        if (product.stock > 0) {
          state.items.push({ ...product, quantity: 1 });
        } else {
          console.warn("Product out of stock");
        }
      }
    },

    /**
     * Remove an item completely from the cart by product ID.
     */
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    /**
     * Increment the quantity of a product in the cart.
     * - Only increments if below the stock limit.
     */
    incrementItem: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item && item.quantity < action.payload.stock) {
        item.quantity += 1;
      } else {
        console.warn("Cannot exceed stock");
      }
    },

    /**
     * Decrease the quantity of a product in the cart (min 1).
     * - Won’t go below 1 to avoid negative quantities.
     */
    decrementItem: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    /**
     * Remove all items from the cart.
     * Use this after successful checkout to reset the cart.
     */
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeItem,
  incrementItem,
  decrementItem,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
