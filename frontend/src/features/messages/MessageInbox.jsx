import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import "/src/styles/main.scss";

// ✅ NEW: Import service-based functions
import { getInbox } from '/src/api/messagesService';
import API from '/src/api/axios'; // still needed for user list

const MessageInbox = forwardRef((props, ref) => {
  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = currentUser?.id;

  const [inbox, setInbox] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // ✅ Use service to fetch inbox
  const refreshInbox = async () => {
    if (!currentUserId) return;
    try {
      const res = await getInbox();
      setInbox(res.result || []);
    } catch (err) {
      console.error('❌ Inbox fetch failed:', err)
      setError('Failed to load your messages.');
    }
  };

  useImperativeHandle(ref, () => ({
    refreshInbox
  }));

  useEffect(() => {
    refreshInbox();
  }, [currentUserId]);

  // 🔄 Keep users API here (no usersService yet)
  useEffect(() => {
    if (!currentUserId) return;
    const fetchUsers = async () => {
      try {
        const res = await API.get('/users/list');
        const others = res.data.result?.filter(u => u.id !== currentUserId) || [];
        setUsers(others);
      } catch (err) {
        console.error('❌ User fetch failed:', err);
        setError('Unable to load users.');
      }
    };
    fetchUsers();
  }, [currentUserId]);

  return (
    <section className="inbox-container" role="main" aria-labelledby="inbox-title">
      <h2 id="inbox-title" className="inbox-heading">Messages</h2>

      {error && <p className="inbox-error" role="alert">{error}</p>}

      {/* Inbox list */}
      <div className="inbox-section">
        {inbox.length === 0 || inbox.filter(msg => msg.sender_id && msg.receiver_id && msg.id).length === 0 ? (
          <p className="inbox-empty">You have no messages yet.</p>
        ) : (
          <ul className="inbox-list">
            {inbox.map((msg) => {
              const otherUserId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
              const otherUsername =
                msg.sender_id === currentUserId
                  ? msg.receiver_username
                  : msg.sender_username;

              if (!otherUserId || isNaN(otherUserId)) {
                console.warn("⚠️ Skipping malformed message:", msg);
                return null;
              }

              return (
                <li key={msg.id} className="inbox-item">
                  <Link
                    to={`/messages/${currentUserId}/${otherUserId}`}
                    className="inbox-link"
                    aria-label={`Open chat with ${otherUsername || 'user'}`}
                  >
                    {otherUsername || 'Unknown user'}
                    {!msg.seen && msg.receiver_id === currentUserId && (
                      <span className="inbox-badge" aria-label="New message">●</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="inbox-divider" />

      <h3 className="inbox-subheading">Start New Chat</h3>

      <div className="inbox-section">
        {users.length === 0 ? (
          <p className="inbox-empty">No users available.</p>
        ) : (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id} className="user-item">
                <Link
                  to={`/messages/${currentUserId}/${user.id}`}
                  className="user-link"
                  aria-label={`Message ${user.username || user.firstName}`}
                >
                  {user.username || `${user.firstName} ${user.lastName}`}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
});

export default MessageInbox;
