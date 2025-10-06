// Login.jsx

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../redux/userSlice';
import api from '../../api/axios';
import '/src/styles/main.scss';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  // Decode JWT `exp` → ms epoch (fallback to +1h if missing)
  const getExpiryMs = (token) => {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      const payload = JSON.parse(decodeURIComponent(escape(json)));
      if (payload?.exp) return payload.exp * 1000;
    } catch (_) {}
    return Date.now() + 60 * 60 * 1000; // fallback: 1h
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // NOTE: keep this path consistent with your backend; if your API is /auth/login use that
      const res = await api.post('/login', { email, password });
      const { token, user } = res.data;

      if (!token || !user) throw new Error('Login response missing token or user.');

      const expiresAt = getExpiryMs(token);

      // Persist to localStorage for hydration
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExp', String(expiresAt));
      localStorage.setItem('user', JSON.stringify({ ...user, token }));

      // Update Redux in one shot
      dispatch(setAuth({ token, user, expiresAt }));

      // Redirect
      const redirectTo = from || (user.role === 'admin' ? '/dashboard' : '/profile');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.formattedMessage || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" role="main" aria-labelledby="login-title">
      <form onSubmit={handleSubmit} className="login-form" role="form" aria-describedby="login-instructions">
        <h1 id="login-title" className="login-title">Login</h1>
        <p id="login-instructions" className="login-instructions">
          Please enter your email and password to access your account.
        </p>

        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {error && <p className="form-error" role="alert" aria-live="assertive">{error}</p>}

        <button
          type="submit"
          className="form-button form-button-green"
          disabled={loading}
          aria-disabled={loading}
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </main>
  );
}

export default Login;
