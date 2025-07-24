// /src/routes/AdminRoute.jsx

import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * AdminRoute component
 * This is a protected route wrapper used to restrict access to admin-only pages.
 * It checks the current user's authentication status and role.
 * 
 * If the user is not logged in, they are redirected to the login page.
 * If the user is logged in but not an admin, they are redirected to the unauthorized page.
 * If the user is an admin, the nested route (Outlet) is rendered.
 */
function AdminRoute() {
  const user = useSelector((state) => state.user.user); // Get current user from Redux state

  // Redirect to login if user is not authenticated
  if (!user) {
    console.warn("No user found — redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Redirect to unauthorized page if user is not an admin
  if (user.role?.toLowerCase() !== 'admin') {
    console.warn("Access denied — user is not an admin:", user.role);
    return <Navigate to="/unauthorized" replace />;
  }

  // If the user is an admin, render the nested routes
  return <Outlet />;
}

export default AdminRoute;
