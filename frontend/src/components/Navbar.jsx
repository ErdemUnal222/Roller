// /src/components/Navbar.jsx
import { useMemo, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ThemeToggle from "./ThemeToggle";
import api from "/src/api/axios";
import { setUser, setToken } from "/src/redux/userSlice";
import { clearCart } from "/src/redux/cartSlice";

function Avatar({ user }) {
  const initials = useMemo(() => {
    if (!user?.firstName && !user?.lastName) return "U";
    const f = (user?.firstName || "").charAt(0).toUpperCase();
    const l = (user?.lastName || "").charAt(0).toUpperCase();
    return `${f}${l}` || "U";
  }, [user]);

  if (user?.avatarUrl) {
    return (
      <img
        className="navbar-avatar"
        src={user.avatarUrl}
        alt={`${user.firstName} ${user.lastName}`}
      />
    );
  }
  return (
    <span className="navbar-avatar-placeholder" aria-hidden="true">
      {initials}
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((s) => s.user.user);
  const cartCount =
    useSelector((s) => s.cart.items)?.reduce((n, i) => n + i.quantity, 0) || 0;

  // Base links visible to everyone
  const baseLinks = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Events" },
    { to: "/shop", label: "Shop" },
  ];

  // If logged in, append Availability
  const navLinks = user
    ? [...baseLinks, { to: "/availability", label: "Availability" }]
    : baseLinks;

  const handleLogout = () => {
    dispatch(clearCart());
    dispatch(setUser(null));
    dispatch(setToken(null));
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("user");
    setOpen(false);
    navigate("/login");
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" aria-label="Go to homepage">
          Roller Derby
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className={`navbar-toggle ${open ? "open" : ""}`}
          aria-label="Toggle navigation"
          aria-controls="navbar-menu"
          aria-expanded={open ? "true" : "false"}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
        </button>

        {/* Menu */}
        <nav
          id="navbar-menu"
          className={`navbar-menu ${open ? "open" : ""}`}
          aria-label="Main"
        >
          {/* Left: primary links */}
          <div className="navbar-section left" onClick={() => setOpen(false)}>
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="navbar-link"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right: actions */}
          <div className="navbar-section right">
            <ThemeToggle />

            {/* Cart */}
            <Link
              to="/cart"
              className="button"
              title="Cart"
              aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              onClick={() => setOpen(false)}
            >
              <span className="cart" style={{ position: "relative" }}>
                🛒
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </span>
            </Link>

            {/* Auth / Profile */}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="button button--ghost"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="button button--primary"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                {/* Messages */}
                <Link
                  to="/messages"
                  className="button button--ghost"
                  onClick={() => setOpen(false)}
                >
                  Messages
                </Link>

                {/* Profile */}
                <Link
                  to="/profile"
                  className="profile-link"
                  onClick={() => setOpen(false)}
                >
                  <Avatar user={user} />
                  <span>{user.firstName}</span>
                </Link>

                {/* Logout */}
                <button
                  type="button"
                  className="button button--danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>

                {/* Admin shortcuts */}
                {user.role === "admin" && (
                  <div className="navbar-admin" aria-label="Admin shortcuts">
                    <span className="admin-label">Admin</span>
                    {/* Replaced Users with Dashboard */}
                    <Link
                      to="/dashboard"
                      className="button button--ghost"
                      onClick={() => setOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/events"
                      className="button button--ghost"
                      onClick={() => setOpen(false)}
                    >
                      Events
                    </Link>
                    <Link
                      to="/admin/products"
                      className="button button--ghost"
                      onClick={() => setOpen(false)}
                    >
                      Products
                    </Link>
                    <Link
                      to="/admin/orders"
                      className="button button--ghost"
                      onClick={() => setOpen(false)}
                    >
                      Orders
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
