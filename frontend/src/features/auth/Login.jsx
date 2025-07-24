// /src/pages/Login.jsx

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../../redux/userSlice';
import api from '../../api/axios';
import "/src/styles/main.scss";

/**
 * Login component
 * This page allows a user to log into their account.
 * After a successful login, the user is redirected to their dashboard or profile depending on their role.
 */
function Login() {
  // Navigation and Redux hooks
  const navigate = useNavigate();                // To redirect users after login
  const dispatch = useDispatch();                // To update global state (Redux)
  const location = useLocation();                // To retrieve previous location if redirected

  // Local component state for form inputs and feedback
  const [email, setEmail] = useState('');        // User email input
  const [password, setPassword] = useState('');  // User password input
  const [error, setError] = useState('');        // Error message if login fails
  const [loading, setLoading] = useState(false); // Loading state for UI feedback

  // If the user was redirected to login, go back to that page after successful login
  const from = location.state?.from?.pathname;

  /**
   * Handles the login form submission
   * Sends credentials to backend and stores token/user in Redux and localStorage
   */
  const handleSubmit = async (e) => {
    e.preventDefault();       // Prevent page reload
    setError('');
    setLoading(true);

    try {
      // Send login request to backend
      const response = await api.post('/login', { email, password });
      const { token, user } = response.data;

      // Ensure both token and user are returned
      if (!token || !user) {
        throw new Error("Login response missing token or user.");
      }

      // Store user info with token in localStorage for persistence
      const userDataToStore = { ...user, token };
      localStorage.setItem('user', JSON.stringify(userDataToStore));
      localStorage.setItem('userId', user.id); // Optional separate storage of user ID

if (import.meta.env.DEV) {
        console.log(
          "User logged in, stored in localStorage:",
          userDataToStore
        );
      }
      // Update Redux store with user and token
      dispatch(setToken(token));
      dispatch(setUser(userDataToStore));

      // Redirect to previous page, or based on role
      const redirectTo = from || (user.role === 'admin' ? '/dashboard' : '/profile');
      navigate(redirectTo, { replace: true });

    } catch (err) {
      console.error('Login error:', err);
      // Show custom error message or fallback
      setError(err?.formattedMessage || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false); // Always remove loading state
    }
  };

  return (
    <main className="login-page" role="main" aria-labelledby="login-title">
      <form
        onSubmit={handleSubmit}
        className="login-form"
        role="form"
        aria-describedby="login-instructions"
      >
        <h1 id="login-title" className="login-title">Login</h1>
        <p id="login-instructions" className="login-instructions">
          Please enter your email and password to access your account.
        </p>

        {/* Email Input */}
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            aria-required="true"
            required
          />
        </div>

        {/* Password Input */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            aria-required="true"
            required
          />
        </div>

        {/* Error Message Display */}
        {error && (
          <p className="form-error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        {/* Submit Button with loading indicator */}
        <button
          type="submit"
          className="form-button form-button-green"
          disabled={loading}
          aria-disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  );
}

export default Login;
