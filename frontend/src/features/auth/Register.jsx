// /src/pages/Register.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import "/src/styles/main.scss";

/**
 * Register Component
 * Allows a user to create a new account by filling out a form.
 * Submits data to the backend API, handles errors, and redirects on success.
 */
function Register() {
  const navigate = useNavigate(); // Hook used to redirect the user after successful registration

  // State for each input field in the form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [address, setAddress]     = useState('');
  const [zip, setZip]             = useState('');
  const [city, setCity]           = useState('');

  // State to handle error message and loading state
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  /**
   * Form submission handler
   * Sends a POST request to the backend to create a new user account.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();       // Prevent form from refreshing the page
    setError('');
    setLoading(true);

    try {
      // Send user registration data to the backend API
      const response = await api.post('/register', {
        firstName,
        lastName,
        email,
        password,
        address,
        zip,
        city,
      });

if (import.meta.env.DEV) {
        console.log('Registration success:', response.data);
      }
      // Redirect the user to the login page
      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err);

      // Error handling based on error type
      if (err.response) {
        // Backend returned an error message
        setError(err.response.data?.msg || 'Registration failed.');
      } else if (err.request) {
        // No response from backend
        setError('No response from server.');
      } else {
        // Something else went wrong
        setError('Unexpected error occurred.');
      }
    } finally {
      setLoading(false); // Remove loading state whether success or error
    }
  };

  return (
    <main className="register-page" role="main" aria-labelledby="register-title">
      <form
        onSubmit={handleSubmit}
        className="register-form"
        aria-describedby="register-instructions"
      >
        <h1 id="register-title" className="form-title">Register</h1>

        {/* Input for First Name */}
        <label htmlFor="firstName" className="sr-only">First Name</label>
        <input
          id="firstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          className="form-input"
          required
        />

        {/* Input for Last Name */}
        <label htmlFor="lastName" className="sr-only">Last Name</label>
        <input
          id="lastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          className="form-input"
          required
        />

        {/* Input for Email */}
        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="form-input"
          required
        />

        {/* Input for Password */}
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="form-input"
          required
        />

        {/* Input for Address */}
        <label htmlFor="address" className="sr-only">Address</label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="form-input"
          required
        />

        {/* Input for Zip Code */}
        <label htmlFor="zip" className="sr-only">Zip Code</label>
        <input
          id="zip"
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Zip Code"
          className="form-input"
          required
        />

        {/* Input for City */}
        <label htmlFor="city" className="sr-only">City</label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="form-input"
          required
        />

        {/* Display error message if exists */}
        {error && (
          <p className="form-error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        {/* Submit button with loading indicator */}
        <button
          type="submit"
          className="form-button form-button-green"
          disabled={loading}
          aria-disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </main>
  );
}

export default Register;
