// /src/pages/admin/DeleteMessage.jsx

import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import '../../styles/main.scss';

function DeleteMessage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const role = useSelector((s) => s.user.user?.role?.toLowerCase() || '');

  // ------- Data fetch -------
  const refreshMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/messages'); // admin-only endpoint
      const result = Array.isArray(res.data?.result)
        ? res.data.result
        : res.data?.result
        ? [res.data.result]
        : [];
      setMessages(
        result.slice().sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))
      );
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMessages();
  }, []);

  // ------- Helpers -------
  const groupByConversation = useMemo(() => {
    // Group by sorted user ID pair to avoid A→B vs B→A duplication
    const map = new Map();
    for (const msg of messages) {
      const a = Number(msg.sender_id);
      const b = Number(msg.receiver_id);
      const [u1, u2] = a < b ? [a, b] : [b, a];
      const key = `${u1}|${u2}`;

      // Derive stable display names matching ID order
      const name1 =
        u1 === msg.sender_id ? msg.sender_username : msg.receiver_username;
      const name2 =
        u2 === msg.receiver_id ? msg.receiver_username : msg.sender_username;

      if (!map.has(key)) {
        map.set(key, {
          key,
          u1,
          u2,
          label: `${name1 || '[Unknown]'} ↔ ${name2 || '[Unknown]'}`,
          msgs: [],
        });
      }
      map.get(key).msgs.push(msg);
    }
    // sort inside each conversation (oldest first for reading)
    for (const v of map.values()) {
      v.msgs.sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
    }
    return Array.from(map.values());
  }, [messages]);

  const filteredGroups = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return groupByConversation;
    return groupByConversation.filter((g) => g.label.toLowerCase().includes(q));
  }, [groupByConversation, searchTerm]);

  // ------- Admin actions -------
  const handleDeleteSingle = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/admin/message/${id}`);
      // Optimistic removal
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete message.');
    }
  };

  const handleDeleteConversation = async (u1, u2, label) => {
    if (!window.confirm(`Delete ALL messages in conversation:\n${label}?`)) return;
    try {
      // Preferred: server handles full conv delete
      await api.delete(`/admin/conversation/${u1}/${u2}`);
      // Refresh full list
      await refreshMessages();
    } catch (err) {
      console.warn('Bulk delete endpoint failed, falling back to per-message.', err);
      // Fallback: delete each message in that conv
      const ids = groupByConversation.find((g) => g.u1 === u1 && g.u2 === u2)?.msgs.map(m => m.id) || [];
      try {
        await Promise.all(ids.map((id) => api.delete(`/admin/message/${id}`)));
        await refreshMessages();
      } catch (e2) {
        console.error('Fallback bulk delete error:', e2);
        alert('Some messages may not have been deleted.');
      }
    }
  };

  const startEditing = (msg) => {
    setEditingId(msg.id);
    setEditingContent(msg.content || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const saveEdit = async (id) => {
    const content = editingContent.trim();
    if (!content) {
      alert('Content cannot be empty.');
      return;
    }
    try {
      await api.patch(`/admin/message/${id}`, { content });
      // Update in place
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content } : m))
      );
      cancelEditing();
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update message.');
    }
  };

  // Optional: refresh only one conversation (uses admin GET conv endpoint)
  const refreshConversation = async (u1, u2) => {
    try {
      const res = await api.get(`/admin/messages/${u1}/${u2}`);
      const conv = Array.isArray(res.data?.result) ? res.data.result : [];
      // Replace only that conversation in state
      setMessages((prev) => {
        const removed = prev.filter((m) => {
          const a = Number(m.sender_id);
          const b = Number(m.receiver_id);
          const [x, y] = a < b ? [a, b] : [b, a];
          return !(x === u1 && y === u2);
        });
        return [
          ...removed,
          ...conv.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at)),
        ];
      });
    } catch (err) {
      console.error('Refresh conversation failed:', err);
    }
  };

  if (loading) return <div className="admin-loading">Loading messages...</div>;

  return (
    <div className="admin-messages-container">
      <h2 className="admin-title">🛠️ Admin: View & Manage Conversations</h2>

      <input
        type="text"
        placeholder="Search users or conversations..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredGroups.length === 0 && (
        <p className="muted">No conversations found.</p>
      )}

      {filteredGroups.map(({ key, u1, u2, label, msgs }) => (
        <div key={key} className="admin-message-group">
          <h3 className="group-title">Conversation: {label}</h3>

          <div className="group-actions">
            <button
              className="btn"
              onClick={() => refreshConversation(u1, u2)}
              title="Reload this conversation only"
            >
              Refresh Conversation
            </button>

            <button
              className="btn-export"
              onClick={() => {
                const text = msgs
                  .map(
                    (m) =>
                      `[${new Date(m.sent_at).toLocaleString()}] ${m.sender_username} ➝ ${m.receiver_username}: ${m.content}`
                  )
                  .join('\n');
                const blob = new Blob([text], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `chat_${label.replace(/ ↔ /g, '_')}.txt`;
                link.click();
              }}
            >
              Export Chat
            </button>

            <button
              className="btn-delete-convo"
              onClick={() => handleDeleteConversation(u1, u2, label)}
            >
              Delete Conversation
            </button>
          </div>

          <ul className="admin-list">
            {msgs.map((msg) => (
              <li key={msg.id} className="admin-item">
                <div className="message-info">
                  <p><strong>From:</strong> {msg.sender_username}</p>
                  <p><strong>To:</strong> {msg.receiver_username}</p>

                  {editingId === msg.id ? (
                    <div className="edit-inline">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows={3}
                      />
                      <div className="edit-actions">
                        <button className="btn" onClick={() => saveEdit(msg.id)}>
                          Save
                        </button>
                        <button className="btn" onClick={cancelEditing}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p><strong>Message:</strong> {msg.content}</p>
                  )}

                  <p>
                    <small>{new Date(msg.sent_at).toLocaleString()}</small>
                  </p>
                </div>

                {role === 'admin' && (
                  <div className="row-actions">
                    {editingId === msg.id ? null : (
                      <button
                        className="btn"
                        onClick={() => startEditing(msg)}
                        aria-label={`Edit message ${msg.id}`}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSingle(msg.id)}
                      className="btn-delete"
                      aria-label={`Delete message ${msg.id}`}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default DeleteMessage;
