import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import Conversation from './Conversation';
import MessageInput from './MessageInput';
import "/src/styles/main.scss";

/**
 * MessagesPage Component
 * Displays a chat interface between two users.
 * Loads previous messages, marks them as read, and allows sending new messages.
 */
function MessagesPage() {
  const { userId1, userId2 } = useParams(); // From the route URL, e.g., /messages/:userId1/:userId2
  const reduxUser = useSelector((state) => state.user.user);
  const currentUserId = reduxUser?.id;

  // Parse IDs from URL
  const routeId1 = parseInt(userId1, 10);
  const routeId2 = parseInt(userId2, 10);

  // Determine the receiver: the other user in the conversation
  const receiverId = routeId1 === currentUserId ? routeId2 : routeId1;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * useEffect to load messages and mark them as read when component mounts or user IDs change.
   */
  useEffect(() => {
    let didCancel = false;

    const fetchMessages = async () => {
      if (!currentUserId || !receiverId) return;
      try {
        const res = await api.get(`/messages/${currentUserId}/${receiverId}`);
        if (!didCancel) {
          setMessages(res.data.result || []);
          setError('');
        }
      } catch (err) {
        if (!didCancel) {
          console.error("Error fetching messages:", err);
          setError('Failed to load conversation.');
        }
      } finally {
        if (!didCancel) {
          setLoading(false);
        }
      }
    };

    const markAsRead = async () => {
      if (!currentUserId || !receiverId) return;
      try {
        await api.post('/messages/mark-read', {
          userId: currentUserId,
          otherUserId: receiverId,
        });
      } catch (err) {
        console.error(" Failed to mark messages as read:", err);
      }
    };

    fetchMessages();
    markAsRead();

    return () => {
      didCancel = true; // Prevent state update if component unmounts
    };
  }, [currentUserId, receiverId]);

  /**
   * Callback triggered after a message is successfully sent.
   * Re-fetches the conversation to include the new message.
   */
  const handleMessageSent = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Slight delay for UX smoothness
      const res = await api.get(`/messages/${currentUserId}/${receiverId}`);
      setMessages(res.data.result || []);
    } catch (err) {
      console.error("Refresh after send failed:", err);
    }
  };

  // Show loading state if current user data is not available yet
  if (!currentUserId) {
    return <p className="messages-loading">Loading user info...</p>;
  }

  return (
    <div className="messages-page" role="main" aria-labelledby="messages-title">
      {/* Header with back link */}
      <header className="messages-header">
        <Link to="/messages" className="back-link" aria-label="Back to message inbox">
          ← Back to inbox
        </Link>
        <h1 id="messages-title" className="visually-hidden">Conversation</h1>
      </header>

      {/* Conversation body */}
      <section className="messages-body">
        {error && <p className="messages-error" role="alert">{error}</p>}

        {loading ? (
          <p className="messages-loading">Loading conversation...</p>
        ) : messages.length === 0 ? (
          <p className="messages-empty">No messages yet. Start the conversation below.</p>
        ) : (
          <Conversation messages={messages} currentUserId={currentUserId} />
        )}
      </section>

      {/* Input area for sending messages */}
      <footer className="messages-input">
        <MessageInput
          senderId={currentUserId}
          receiverId={receiverId}
          onMessageSent={handleMessageSent}
        />
      </footer>
    </div>
  );
}

export default MessagesPage;
