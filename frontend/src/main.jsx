// /src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import { Provider } from 'react-redux';
import store from './redux/store';

import api from './api/axios';
import { setAuth, logout, touchActivity } from './redux/userSlice';

// Global styles
import '/src/styles/main.scss';

/* ---------------- Auth Hydration + Expiry Helpers ---------------- */

function safeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
}

// Decode JWT exp without adding a dependency (best effort)
function getExpFromToken(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const data = JSON.parse(decodeURIComponent(escape(json)));
    if (data && typeof data.exp === 'number') return data.exp * 1000; // ms
  } catch { /* ignore */ }
  return null;
}

function hydrateAuth() {
  const storedUser = safeParse(localStorage.getItem('user')); // { ...user, token }
  const token = localStorage.getItem('token') || storedUser?.token || null;

  // Prefer explicit stored expiry if present
  let expiresAt = null;
  const storedExp = localStorage.getItem('tokenExp');
  if (storedExp && !Number.isNaN(Number(storedExp))) {
    expiresAt = Number(storedExp);
  } else if (token) {
    // Fallback: decode exp from JWT
    expiresAt = getExpFromToken(token);
    if (expiresAt) localStorage.setItem('tokenExp', String(expiresAt));
  }

  // If expired, clear immediately
  if (token && expiresAt && Date.now() >= expiresAt) {
    store.dispatch(logout());
    return;
  }

  if (token && storedUser) {
    // Stored user in your app contains all user fields (id, role, etc.)
    const { token: _omit, ...user } = storedUser;
    store.dispatch(setAuth({ token, user, expiresAt }));
  }
}

/* ---------------- Inactivity Auto-Logout ---------------- */

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  store.dispatch(touchActivity());
  inactivityTimer = setTimeout(() => {
    store.dispatch(logout());
    // Optional: toast/alert — comment out if you don’t want a blocking alert
    // alert('You have been logged out due to inactivity.');
  }, INACTIVITY_LIMIT);
}

function setupInactivityTracking() {
  const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
  events.forEach((ev) => window.addEventListener(ev, resetInactivityTimer, { passive: true }));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) resetInactivityTimer();
  });
  resetInactivityTimer();
}

/* ---------------- Periodic Expiry Check ---------------- */

function setupExpiryHeartbeat() {
  // Check every minute whether token expired after hydration
  setInterval(() => {
    const tokenExp = Number(localStorage.getItem('tokenExp') || 0);
    const token = localStorage.getItem('token');
    if (token && tokenExp && Date.now() >= tokenExp) {
      store.dispatch(logout());
    }
  }, 60 * 1000);
}

/* ---------------- Axios 401 Auto-Logout ---------------- */

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Token invalid/expired → force logout
      store.dispatch(logout());
    }
    return Promise.reject(err);
  }
);

/* ---------------- Bootstrap ---------------- */

hydrateAuth();
setupInactivityTracking();
setupExpiryHeartbeat();

/* ---------------- Mount App ---------------- */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
