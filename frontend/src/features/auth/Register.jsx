import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import "/src/styles/main.scss";

function Register() {
  const navigate = useNavigate();

  // State for each input field
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [address, setAddress]     = useState('');
  const [zip, setZip]             = useState('');
  const [city, setCity]           = useState('');
  const [phone, setPhone]         = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  // role is fixed as 'user' (prevent admin creation from public form)
  const role = 'user';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/register', {
        firstName,
        lastName,
        email,
        password,
        address,
        zip,
        city,
        phone,
        role
      });

      if (import.meta.env.DEV) {
        console.log('Registration success:', response.data);
      }

      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err);

      if (err.response) {
        setError(err.response.data?.message || err.response.data?.msg || 'Registration failed.');
      } else if (err.request) {
        setError('No response from server.');
      } else {
        setError('Unexpected error occurred.');
      }
    } finally {
      setLoading(false);
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

        <label htmlFor="phone" className="sr-only">Phone</label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className="form-input"
          required
        />

        {error && (
          <p className="form-error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="button button--primary"
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
