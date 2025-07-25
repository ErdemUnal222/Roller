// /src/pages/admin/Dashboard.jsx

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "/src/styles/main.scss";
const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;
/**
 * Admin Dashboard Component
 * This is the main admin interface for managing user accounts.
 * Allows viewing, editing, and deleting users.
 * Only accessible by authenticated admin users.
 */
function Dashboard() {
  // Get current user info and token from Redux store
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);

  // Local component state
  const [users, setUsers] = useState([]);              // List of users to display
  const [loading, setLoading] = useState(true);        // Show loading spinner while fetching
  const [editingUserId, setEditingUserId] = useState(null); // ID of the user being edited
  const [editFormData, setEditFormData] = useState({});     // Editable user form data

  // Fetch all users from the backend when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/users`, {          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Validate that the response is in JSON format
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error("Server did not return JSON. Response was: " + text);
        }

        const data = await res.json();
if (data.result) {
          setUsers(Array.isArray(data.result) ? data.result : []);
        }      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false); // Hide spinner
      }
    };

    fetchUsers();
  }, []);

  // Triggered when clicking "Edit" — loads data into form
  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditFormData({ ...user });
  };

  // Updates form data as user types in input fields
  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Sends updated user info to the server
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/api/v1/users/${editingUserId}`, {        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();

      if (res.ok) {
        // Replace updated user in the state
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUserId ? data.newUser : u))
        );
        // Clear editing mode
        setEditingUserId(null);
        setEditFormData({});
      } else {
        console.error("Failed to update user:", data.message);
      }
    } catch (err) {
      console.error("Edit request failed:", err);
    }
  };

  // Deletes a user after confirmation
  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://ihsanerdemunal.ide.3wa.io:9500/api/v1/admin/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        // Remove the deleted user from the list
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        console.error("Failed to delete user:", data.message);
      }
    } catch (err) {
      console.error("Delete request failed:", err);
    }
  };

  // Redirect non-admin users to unauthorized access page
  if (!user || user.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <section className="dashboard-container" role="main" aria-labelledby="dashboard-title">
      <header className="dashboard-header">
        <h1 id="dashboard-title" className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-welcome">Welcome, Admin</p>
      </header>

      {/* User Management Table */}
      <section className="dashboard-table" aria-labelledby="users-table-heading">
        <h2 id="users-table-heading" className="table-heading">User List</h2>

        {loading ? (
          <p className="loading-msg">Loading users...</p>
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
                    <button onClick={() => handleEdit(u)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(u.id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Edit Form - shown only when editing a user */}
      {editingUserId && (
        <section className="edit-form">
          <h3>Edit User</h3>
          <form onSubmit={handleEditSubmit}>
            <input
              name="firstName"
              value={editFormData.firstName || ''}
              onChange={handleEditChange}
              placeholder="First Name"
              required
            />
            <input
              name="lastName"
              value={editFormData.lastName || ''}
              onChange={handleEditChange}
              placeholder="Last Name"
              required
            />
            <input
              name="email"
              value={editFormData.email || ''}
              onChange={handleEditChange}
              placeholder="Email"
              required
            />
            <input
              name="city"
              value={editFormData.city || ''}
              onChange={handleEditChange}
              placeholder="City"
            />
            <input
              name="role"
              value={editFormData.role || ''}
              onChange={handleEditChange}
              placeholder="Role"
            />
            <button type="submit" className="btn-save">Save</button>
            <button type="button" onClick={() => setEditingUserId(null)}>Cancel</button>
          </form>
        </section>
      )}
    </section>
  );
}

export default Dashboard;
