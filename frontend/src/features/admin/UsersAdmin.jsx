// /src/pages/admin/UsersAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import api from "../../api/axios";

function UsersAdmin() {
  // Auth state
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const isAdmin = (user?.role || "").toLowerCase() === "admin";

  // Data state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null); // row-level busy
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", city: "", role: "user" });

  const readyToFetch = useMemo(() => isAdmin && (token || localStorage.getItem("user") || localStorage.getItem("session")), [isAdmin, token]);

  // Load users once auth is ready
  useEffect(() => {
    let cancel = false;
    const loadUsers = async () => {
      if (!readyToFetch) return;
      try {
        setLoading(true);
        setError("");
        // Admin list endpoint; adjust if your backend differs
        const { data } = await api.get("/admin/users");
        const list = Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : []);
        if (!cancel) setUsers(list);
      } catch (err) {
        if (!cancel) setError(err?.response?.data?.message || "Failed to load users.");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    loadUsers();
    return () => { cancel = true; };
  }, [readyToFetch]);

  if (!user || !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  const beginEdit = (u) => {
    setEditingId(u.id);
    setEditForm({
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email || "",
      city: u.city || "",
      role: (u.role || "user"),
    });
    setSuccess("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ firstName: "", lastName: "", email: "", city: "", role: "user" });
  };

  const saveEdit = async (id) => {
    try {
      setBusyId(id);
      setError("");
      setSuccess("");
      // Minimal payload; add fields if your backend supports them
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        city: editForm.city.trim(),
        role: editForm.role,
      };
      const { data } = await api.put(`/admin/users/${id}`, payload);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...payload } : u)));
      setSuccess(data?.message || "User updated.");
      cancelEdit();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user.");
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      setBusyId(id);
      setError("");
      setSuccess("");
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccess("User deleted.");
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-users">
      <h2 className="admin-title">Manage Users</h2>

      {error && <div className="form-error" style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="form-success" style={{ marginBottom: 12 }}>{success}</div>}

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ minWidth: 160 }}>Name</th>
              <th style={{ minWidth: 220 }}>Email</th>
              <th>City</th>
              <th style={{ minWidth: 120 }}>Role</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isEditing = editingId === u.id;
              return (
                <tr key={u.id}>
                  <td>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          value={editForm.firstName}
                          onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                          placeholder="First name"
                        />
                        <input
                          value={editForm.lastName}
                          onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                          placeholder="Last name"
                        />
                      </div>
                    ) : (
                      <>
                        {u.firstName} {u.lastName}
                      </>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="Email"
                        type="email"
                      />
                    ) : (
                      u.email
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.city}
                        onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                        placeholder="City"
                      />
                    ) : (
                      u.city
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      u.role
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button
                          className="button button--primary"
                          onClick={() => saveEdit(u.id)}
                          disabled={busyId === u.id}
                        >
                          Save
                        </button>
                        <button className="button button--ghost" onClick={cancelEdit} disabled={busyId === u.id} style={{ marginLeft: 8 }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="button button--ghost"
                          onClick={() => beginEdit(u)}
                          disabled={busyId === u.id}
                        >
                          Edit
                        </button>
                        <button
                          className="button button--danger"
                          onClick={() => removeUser(u.id)}
                          disabled={busyId === u.id}
                          style={{ marginLeft: 8 }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UsersAdmin;
