// /src/App.jsx
import './styles/main.scss';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from './redux/userSlice';
import api from './api/axios';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

import Home from './features/home/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Unauthorized from './features/auth/Unauthorized';

import PublicEventList from './features/events/PublicEventList';
import EventDetails from './features/events/EventDetails';
import CreateEvent from './features/events/CreateEvent';

import ProductList from './features/products/ProductList';
import ProductDetail from './features/products/ProductDetail';
import Products from './features/products/Products';
import AddProduct from './features/products/AddProduct';
import EditProduct from './features/products/EditProduct';

import Dashboard from './features/auth/Dashboard';
import UsersAdmin from './features/admin/UsersAdmin';
import EventsAdmin from './features/admin/EventsAdmin';
import DeleteMessage from './features/admin/DeleteMessage';
import EditEvent from './features/events/EditEvent';

import Profile from './features/profile/Profile';
import Availability from './features/availability/Availability';
import Comments from './features/comments/Comments';
import Orders from './features/orders/Orders';
import Cart from './features/cart/Cart';
import Checkout from './features/cart/Checkout';
import Success from './features/cart/Success';
import MessageInbox from './features/messages/MessageInbox';
import MessagesPage from './features/messages/MessagesPage';

import About from './features/pages/About';
import Privacy from './features/pages/Privacy';
import Terms from './features/pages/Terms';
import Contact from './features/pages/Contact';
import Shop from './features/products/Shop';

function App() {
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      const raw = localStorage.getItem('user') || localStorage.getItem('session');
      let token = null;

      if (raw) {
        try {
          const saved = JSON.parse(raw);
          token = saved?.token || saved?.user?.token || null;
        } catch {
          // ignore bad JSON
        }
      }

      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // FIX: call the correct endpoint that your backend actually exposes
          const { data } = await api.get('/me');
          if (!cancelled && data?.user) {
            dispatch(setToken(token));
            dispatch(setUser({ ...data.user }));
          }
        } catch {
          delete api.defaults.headers.common['Authorization'];
          localStorage.removeItem('user');
          localStorage.removeItem('session');
        }
      }

      if (!cancelled) setAuthReady(true);
    };

    bootstrapAuth();

    const onStorage = (e) => {
      if (e.key === 'user' || e.key === 'session') {
        window.location.reload();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
    };
  }, [dispatch]);

  if (!authReady) return <div className="p-4 text-center">Checking session...</div>;

  return (
    <Router>
      <div className="app-layout">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />

            {/* Authenticated */}
            <Route element={<PrivateRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<Success />} />
              <Route path="/events" element={<PublicEventList />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/availability" element={<Availability />} />
              <Route path="/comments" element={<Comments />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/messages" element={<MessageInbox />} />
              <Route path="/messages/:userId1/:userId2" element={<MessagesPage />} />
            </Route>

            {/* Admin */}
            <Route element={<AdminRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/users" element={<UsersAdmin />} />
              <Route path="/admin/events" element={<EventsAdmin />} />
              <Route path="/admin/messages" element={<DeleteMessage />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/admin/products/add" element={<AddProduct />} />
              <Route path="/admin/products/edit/:id" element={<EditProduct />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/admin/events/create" element={<CreateEvent />} />
              <Route path="/events/edit/:id" element={<EditEvent />} />
            </Route>
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
