import { createSlice } from '@reduxjs/toolkit';

// Initial state of the user slice
const initialState = {
  token: null, // Stores the JWT or session token (used for authenticated requests)
  user: null,  // Stores the logged-in user’s data (id, email, role, etc.)
};

// Create the user slice
const userSlice = createSlice({
  name: 'user',        // Slice name (used internally in Redux DevTools)
  initialState,        // Initial state declared above
  reducers: {
    /**
     * setToken
     * Stores the authentication token after login
     * Example: dispatch(setToken('abc123'));
     */
    setToken: (state, action) => {
      state.token = action.payload;
    },

    /**
     * setUser
     * Stores the user object after login or profile fetch
     * Example user object: { id, email, firstName, role, ... }
     */
    setUser: (state, action) => {
      state.user = action.payload;
    },

    /**
     * logout
     * Clears all user-related state on logout
     * Used to reset authentication and remove sensitive data
     */
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

// Export the actions to be used throughout the app
export const { setToken, setUser, logout } = userSlice.actions;

// Export the reducer function to be included in the store
export default userSlice.reducer;
