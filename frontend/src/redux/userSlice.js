// /src/redux/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

/**
 * State shape:
 * - token: JWT string
 * - user:  user object
 * - expiresAt: number (ms since epoch) or null
 * - lastActiveAt: number (ms since epoch) - optional, for inactivity timer
 */
const initialState = {
  token: null,
  user: null,
  expiresAt: null,
  lastActiveAt: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * setAuth
     * One-shot setter for token, user and expiry (ms epoch).
     * Example:
     *   dispatch(setAuth({ token, user, expiresAt }))
     */
    setAuth: (state, action) => {
      const { token, user, expiresAt } = action.payload || {};
      state.token = token ?? null;
      state.user = user ?? null;
      state.expiresAt = typeof expiresAt === 'number' ? expiresAt : null;

      // Persist to localStorage for session restore
      if (user && token) {
        const toStore = { ...user, token };
        localStorage.setItem('user', JSON.stringify(toStore));
        localStorage.setItem('token', token);
      }
      if (state.expiresAt) {
        localStorage.setItem('tokenExp', String(state.expiresAt));
      }
    },

    /**
     * setToken
     * (Back-compat) Set token only. Prefer setAuth when possible.
     */
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
        // keep "user" object as-is in localStorage if present
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            localStorage.setItem('user', JSON.stringify({ ...parsed, token: action.payload }));
          } catch {/* ignore */}
        }
      } else {
        localStorage.removeItem('token');
      }
    },

    /**
     * setUser
     * (Back-compat) Set user only. Prefer setAuth when possible.
     */
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        const token = state.token || JSON.parse(localStorage.getItem('user') || '{}')?.token || null;
        localStorage.setItem('user', JSON.stringify({ ...(action.payload || {}), token }));
      } else {
        localStorage.removeItem('user');
      }
    },

    /**
     * setExpiry
     * Set the token expiry as a ms epoch number.
     */
    setExpiry: (state, action) => {
      const val = action.payload;
      state.expiresAt = typeof val === 'number' ? val : null;
      if (state.expiresAt) {
        localStorage.setItem('tokenExp', String(state.expiresAt));
      } else {
        localStorage.removeItem('tokenExp');
      }
    },

    /**
     * touchActivity
     * Update last activity timestamp (for inactivity timer).
     */
    touchActivity: (state) => {
      state.lastActiveAt = Date.now();
    },

    /**
     * logout
     * Clears user state and localStorage.
     */
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.expiresAt = null;
      state.lastActiveAt = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExp');
    },
  },
});

export const {
  setAuth,
  setToken,
  setUser,
  setExpiry,
  touchActivity,
  logout,
} = userSlice.actions;

/**
 * Selector: returns true if token is present AND NOT expired.
 */
export const selectIsAuthenticated = (state) => {
  const { token, expiresAt } = state.user || {};
  if (!token) return false;
  if (!expiresAt) return true; // if no expiry stored, treat as valid (back-compat)
  return Date.now() < expiresAt;
};

/**
 * Selector: returns true if token is expired (or missing exp and invalid).
 */
export const selectIsExpired = (state) => {
  const { token, expiresAt } = state.user || {};
  if (!token) return true;
  if (!expiresAt) return false; // no exp stored => cannot assert expired
  return Date.now() >= expiresAt;
};

export default userSlice.reducer;
