// /src/pages/admin/DeleteMessage.jsx

// Importing React hooks and Redux state
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// Custom Axios instance for API requests
import api from '../../api/axios';

// Global stylesheet
import '../../styles/main.scss';

/**
 * Admin Component to view, group, search, delete and export conversations.
 * Only accessible by users with the 'admin' role.
 */
function DeleteMessage() {
  // Local state to hold messages
  const [messages, setMessages] = useState([]);

  // State to control loading spinner
  const [loading, setLoading] = useState(true);

  // Search term entered by admin to filter conversations
  const [searchTerm, setSearchTerm] = useState('');

  // Get current user's role from Redux store
  const role = useSelector((state) => state.user.user?.role?.toLowerCase() || '');

  /**
   * Reusable function to fetch all messages from the backend.
   * Admin endpoint returns an array or a single object depending on result.
   */
  const refreshMessages = async () => {
    try {
      const res = await api.get('/messages');
      const result = Array.isArray(res.data.result)
        ? res.data.result
        : res.data.result
        ? [res.data.result]
        : [];

      // Sort messages by newest first
      setMessages(
        result
          .slice()
          .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at))
      );
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages on initial render
  useEffect(() => {
    refreshMessages();
  }, []);

  /**
   * Handle deletion of a single message by ID
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await api.delete(`/admin/message/${id}`);
      await refreshMessages(); // Refresh after deleting
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete message.');
    }
  };

  // Show loading text while fetching data
  if (loading) return <div className="admin-loading">Loading messages...</div>;

  /**
   * Group all messages by conversation (sender ↔ receiver).
   * This helps display them in grouped UI blocks.
   */
  const grouped = messages.reduce((acc, msg) => {
    const sender = msg.sender_username || '[Unknown Sender]';
    const receiver = msg.receiver_username || '[Unknown Receiver]';

    // Always use alphabetical order to group both directions (A ↔ B = B ↔ A)
    const key = [sender, receiver].sort().join(' ↔ ');

    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  return (
    <div className="admin-messages-container">
      <h2 className="admin-title">🛠️ Admin: View & Manage Conversations</h2>

      {/* Search input to filter conversations by name */}
      <input
        type="text"
        placeholder="Search users or conversations..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Iterate over each grouped conversation */}
      {Object.entries(grouped)
        .filter(([pair]) =>
          pair.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(([pair, msgs]) => (
          <div key={pair} className="admin-message-group">
            <h3 className="group-title">Conversation: {pair}</h3>

            <div className="group-actions">
              {/* Delete all messages in a conversation */}
              <button
                className="btn-delete-convo"
                onClick={async () => {
                  if (window.confirm(`Delete all messages in: ${pair}?`)) {
                    const idsToDelete = msgs.map((m) => m.id);
                    try {
                      await Promise.all(
                        idsToDelete.map((id) =>
                          api.delete(`/admin/message/${id}`)
                        )
                      );
                      await refreshMessages(); // Refresh after bulk delete
                    } catch (err) {
                      console.error('Bulk delete error:', err);
                      alert('Some messages may not have been deleted.');
                    }
                  }
                }}
              >
                 Delete Conversation
              </button>

              {/* Export all messages in plain text format */}
              <button
                className="btn-export"
                onClick={() => {
                  const text = msgs
                    .map(
                      (m) =>
                        `[${new Date(m.sent_at).toLocaleString()}] ${m.sender_username} ➝ ${m.receiver_username}: ${m.content}`
                    )
                    .join('\n');

                  // Create and download the text file
                  const blob = new Blob([text], { type: 'text/plain' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = `chat_${pair.replace(/ ↔ /g, '_')}.txt`;
                  link.click();
                }}
              >
                Export Chat
              </button>
            </div>

            {/* List of individual messages in the conversation */}
            <ul className="admin-list">
              {msgs
                .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at))
                .map((msg) => (
                  <li key={msg.id} className="admin-item">
                    <div className="message-info">
                      <p><strong>From:</strong> {msg.sender_username}</p>
                      <p><strong>To:</strong> {msg.receiver_username}</p>
                      <p><strong>Message:</strong> {msg.content}</p>
                      <p>
                        <small>{new Date(msg.sent_at).toLocaleString()}</small>
                      </p>
                    </div>

                    {/* Admin-only delete button for each message */}
                    {role === 'admin' && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="btn-delete"
                        aria-label={`Delete message ${msg.id}`}
                      >
                        Delete
                      </button>
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
