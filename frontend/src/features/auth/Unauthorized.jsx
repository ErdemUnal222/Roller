// /src/pages/Unauthorized.jsx

// Import global styles
import "/src/styles/main.scss";

/**
 * Unauthorized Page Component
 * 
 * This component is displayed when a user tries to access a page they are not authorized to view.
 * For example, it can be used when a non-admin user attempts to access an admin-only route.
 * 
 * The page shows a 403 error message, which is the standard HTTP status code for "Forbidden".
 */
function Unauthorized() {
  return (
    // Role and aria-live are used for accessibility: screen readers will announce this as an alert
    <div className="unauthorized-page" role="alert" aria-live="assertive">
      <h1 className="unauthorized-title">403 - Unauthorized</h1>
      
      <p className="unauthorized-text">
        You do not have permission to access this page.
      </p>
    </div>
  );
}

export default Unauthorized;
