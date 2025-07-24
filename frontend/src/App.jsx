// /src/App.jsx

// Import global styles
import './styles/main.scss';

// Import necessary hooks and tools
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from './redux/userSlice';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Route guards
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// Public pages and views
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
  const [authReady, setAuthReady] = useState(false); // Prevent rendering routes until auth is initialized

  useEffect(() => {
    // Check localStorage for previously stored user (for persistent login)
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.id) {
          // Update Redux store with saved session data
          dispatch(setToken(parsed.token));
          dispatch(setUser(parsed));
        }
      } catch (err) {
        console.warn("Failed to parse stored user:", err);
      }
    }
    setAuthReady(true);
  }, [dispatch]);

  // Wait until auth check is completed before rendering
  if (!authReady) return <div className="p-4 text-center">Checking session...</div>;

  return (
    <Router>
      <div className="app-layout">
        {/* Top navigation bar */}
        <Navbar />

        {/* Main content container */}
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/shop" element={<Shop />} />             {/* Public shop */}
            <Route path="/shop/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected Routes (logged-in users) */}
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

            {/* Admin-only Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/users" element={<UsersAdmin />} />
              <Route path="/admin/events" element={<EventsAdmin />} />
              <Route path="/admin/messages" element={<DeleteMessage />} />
              <Route path="/admin/products" element={<Products />} />              {/* Admin product list */}
              <Route path="/admin/products/add" element={<AddProduct />} />
              <Route path="/admin/products/edit/:id" element={<EditProduct />} />
              <Route path="/admin/events/create" element={<CreateEvent />} />     {/* Admin event create */}
            </Route>
          </Routes>
        </main>

        {/* Bottom footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
