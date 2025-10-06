// /src/pages/admin/Dashboard.jsx

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import "/src/styles/main.scss";
import API from "../../api/axios";

/**
 * Admin Dashboard
 * - User management table (edit/delete)
 * - Message moderation snapshot (stats + recent conversations + link)
 */
function Dashboard() {
  // Guard
  const user = useSelector((state) => state.user.user);
  if (!user || user.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Messages state (for moderation snapshot)
  const [msgs, setMsgs] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);

  // ---------------- Fetch Users ----------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/users");
        setUsers(Array.isArray(data?.result) ? data.result : []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // ---------------- Fetch Messages (admin) ----------------
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await API.get("/messages"); // admin-only endpoint
        const result = Array.isArray(res.data?.result)
          ? res.data.result
          : res.data?.result
          ? [res.data.result]
          : [];
        setMsgs(result);
      } catch (err) {
        console.error("Error fetching admin messages:", err);
      } finally {
        setLoadingMsgs(false);
      }
    };
    fetchMessages();
  }, []);

  // ---------------- Users: edit flow ----------------
  const handleEdit = (u) => {
    setEditingUserId(u.id);
    setEditFormData({ ...u });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/admin/user/${editingUserId}`, editFormData);
      const updatedUser =
        data?.newUser || data?.result?.user || data?.result || { id: editingUserId, ...editFormData };

      setUsers((prev) => prev.map((u) => (u.id === editingUserId ? updatedUser : u)));
      setEditingUserId(null);
      setEditFormData({});
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;
    try {
      await API.delete(`/admin/user/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  // ---------------- Message Moderation: derived data ----------------
  const moderation = useMemo(() => {
    // unique conversation key: sorted user id pair "min|max"
    const convMap = new Map();
    let messagesToday = 0;

    const todayStr = new Date().toDateString();

    for (const m of msgs) {
      const a = Number(m.sender_id);
      const b = Number(m.receiver_id);
      const [u1, u2] = a < b ? [a, b] : [b, a];
      const key = `${u1}|${u2}`;

      // count "today"
      const d = new Date(m.sent_at);
      if (d.toDateString() === todayStr) messagesToday += 1;

      if (!convMap.has(key)) convMap.set(key, []);
      convMap.get(key).push(m);
    }

    // latest 5 conversations by newest message time
    const convList = Array.from(convMap.entries()).map(([key, list]) => {
      const sorted = list.slice().sort((x, y) => new Date(y.sent_at) - new Date(x.sent_at));
      const last = sorted[0];

      // build a readable label (User A ↔ User B) from the last message we saw
      // (safe enough for preview)
      const [u1, u2] = key.split("|");
      // Try to use usernames from last message
      const label = `${last?.sender_username || `#${u1}`} ↔ ${last?.receiver_username || `#${u2}`}`;

      return {
        key,
        u1: Number(u1),
        u2: Number(u2),
        label,
        latestAt: last ? new Date(last.sent_at) : new Date(0),
        messages: sorted,
      };
    });

    convList.sort((a, b) => b.latestAt - a.latestAt);

    return {
      totalMessages: msgs.length,
      totalConversations: convMap.size,
      messagesToday,
      recentConversations: convList.slice(0, 5),
    };
  }, [msgs]);

  return (
    <section className="dashboard-container" role="main" aria-labelledby="dashboard-title">
      <header className="dashboard-header">
        <h1 id="dashboard-title" className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-welcome">Welcome, Admin</p>
      </header>

      {/* ===== Quick Stats Row (Messages) ===== */}
      <section className="dashboard-cards" aria-label="System stats">
        <div className="card">
          <p className="card-kpi">{loadingMsgs ? "…" : moderation.totalMessages}</p>
          <p className="card-label">Total Messages</p>
        </div>
        <div className="card">
          <p className="card-kpi">{loadingMsgs ? "…" : moderation.totalConversations}</p>
          <p className="card-label">Conversations</p>
        </div>
        <div className="card">
          <p className="card-kpi">{loadingMsgs ? "…" : moderation.messagesToday}</p>
          <p className="card-label">Messages Today</p>
        </div>
        <div className="card card-link">
          <Link to="/admin/messages" className="button button--primary" style={{ width: '100%' }}>
            Manage Conversations
          </Link>
          <small className="muted">View, edit, delete & export chats</small>
        </div>
      </section>

      {/* ===== Recent Conversations Preview ===== */}
      <section className="dashboard-panel" aria-labelledby="recent-conversations-heading">
        <div className="panel-header">
          <h2 id="recent-conversations-heading" className="panel-title">Recent Conversations</h2>
          <Link to="/admin/messages" className="button button--ghost">Open Messages</Link>
        </div>

        {loadingMsgs ? (
          <p className="loading-msg">Loading conversations…</p>
        ) : moderation.recentConversations.length === 0 ? (
          <p className="muted">No conversations yet.</p>
        ) : (
          <ul className="conv-list">
            {moderation.recentConversations.map((c) => (
              <li key={c.key} className="conv-item">
                <div className="conv-meta">
                  <div className="conv-label">{c.label}</div>
                  <div className="conv-time">
                    {c.latestAt.toLocaleString()}
                  </div>
                </div>
                <div className="conv-last">
                  <strong>Last:</strong>{" "}
                  <span className="ellipsis">
                    {c.messages[0]?.content || "(no content)"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ===== User Management Table ===== */}
      <section className="dashboard-table" aria-labelledby="users-table-heading">
        <h2 id="users-table-heading" className="table-heading">User List</h2>

        {loadingUsers ? (
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
                    <button onClick={() => handleEdit(u)} className="button button--ghost">Edit</button>
                    <button onClick={() => handleDelete(u.id)} className="button button--danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ===== Edit Form ===== */}
      {editingUserId && (
        <section className="edit-form">
          <h3>Edit User</h3>
          <form onSubmit={handleEditSubmit}>
            <input
              name="firstName"
              value={editFormData.firstName || ""}
              onChange={handleEditChange}
              placeholder="First Name"
              required
            />
            <input
              name="lastName"
              value={editFormData.lastName || ""}
              onChange={handleEditChange}
              placeholder="Last Name"
              required
            />
            <input
              name="email"
              value={editFormData.email || ""}
              onChange={handleEditChange}
              placeholder="Email"
              required
            />
            <input
              name="city"
              value={editFormData.city || ""}
              onChange={handleEditChange}
              placeholder="City"
            />
            <input
              name="role"
              value={editFormData.role || ""}
              onChange={handleEditChange}
              placeholder="Role"
            />
            <button type="submit" className="button button--primary">Save</button>
            <button type="button" className="button button--ghost" onClick={() => setEditingUserId(null)}>Cancel</button>
          </form>
        </section>
      )}
    </section>
  );
}

export default Dashboard;
