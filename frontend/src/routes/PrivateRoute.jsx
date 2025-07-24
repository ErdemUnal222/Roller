// /src/routes/PrivateRoute.jsx

import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * PrivateRoute component
 * Used to protect routes that require user authentication.
 * 
 * It checks whether a token exists in the Redux store.
 * If not authenticated, it redirects the user to the login page
 * and remembers the original destination using location state.
 * If authenticated, it renders the nested route (Outlet).
 */
function PrivateRoute() {
  const token = useSelector((state) => state.user.token); // Check for authentication token
  const location = useLocation(); // Store the current location

  // If no token is found, redirect to login and store current path
  if (!token) {
    console.warn('Access denied: no token found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, allow access to the protected route
  return <Outlet />;
}

export default PrivateRoute;
