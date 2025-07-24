// /src/components/RequireAdmin.jsx

import { Navigate, useLocation } from "react-router-dom";

/**
 * RequireAdmin Component
 * This component is used to protect routes that should only be accessible by admin users.
 * 
 * - If the user is not logged in: redirect to the login page.
 * - If the user is logged in but not an admin: redirect to the unauthorized page.
 * - If the user is an admin: allow access to the protected content (children).
 */
function RequireAdmin({ children }) {
  const location = useLocation(); // Get current location to redirect back after login if needed

  /**
   * Retrieve the user object from localStorage and parse it.
   * Use a try/catch block to safely handle any invalid JSON data.
   * If the data is missing or invalid, user will be null.
   */
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  // Check if the user has the "admin" role
  const isAdmin = user?.role === "admin";

  // Case 1: User is not logged in
  if (!user) {
    // Redirect to login page and remember the current location (to return after login)
    return (
      <Navigate
        to="/login"
        state={{ from: location }} // Save current path to redirect later
        replace
      />
    );
  }

  // Case 2: User is logged in but does not have admin privileges
  if (!isAdmin) {
    // Redirect to a generic unauthorized access page
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  // Case 3: User is an authenticated admin — allow access to the protected route
  return children;
}

export default RequireAdmin;
