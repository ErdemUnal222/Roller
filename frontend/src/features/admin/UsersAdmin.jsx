// /src/pages/admin/UsersAdmin.jsx

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchAllUsers } from "../../api/admin";
import { Navigate } from "react-router-dom";

/**
 * Admin panel component for managing all registered users.
 * Fetches user data from the backend and displays it in a table.
 * Only accessible to admin users.
 */
function UsersAdmin() {
  // Get the current logged-in user's token and data from the Redux store
  const token = useSelector((state) => state.user.token); // unused but kept for potential future use
  const user = useSelector((state) => state.user.user);

  // Local state to hold the list of users and loading indicator
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch all users from the backend when the component mounts.
   * Uses the admin API with token-based authentication.
   */
  useEffect(() => {
    const loadUsers = async () => {
      try {
const data = await fetchAllUsers();
        setUsers(Array.isArray(data) ? data : []);      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    loadUsers();
  }, [token]);

  /**
   * Protect the route: if the user is not logged in or not an admin,
   * redirect them to the unauthorized access page.
   */
  if (!user || user.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="admin-users">
      <h2 className="admin-title">Manage Users</h2>

      {/* Loading indicator while user data is being fetched */}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>City</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.city}</td>
                <td>{u.role}</td>
                <td>
                  {/* Buttons for future Edit/Delete functionality */}
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UsersAdmin;
