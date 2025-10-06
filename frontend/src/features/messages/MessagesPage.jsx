import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import Conversation from './Conversation';
import MessageInput from './MessageInput';
import '/src/styles/main.scss';

/**
 * MessagesPage — polished chat layout
 * - Sticky header/back link
 * - Scrollable conversation area with skeletons
 * - Sticky input bar
 * - Better error/empty states
 */
export default function MessagesPage() {
  const { userId1, userId2 } = useParams();
  const reduxUser = useSelector((s) => s.user.user);
  const currentUserId = reduxUser?.id ?? null;

  // Normalize params
  const routeId1 = Number.isFinite(Number(userId1)) ? Number(userId1) : null;
  const routeId2 = Number.isFinite(Number(userId2)) ? Number(userId2) : null;

  // Determine the counterpart (the other participant)
  const receiverId = useMemo(() => {
    if (!currentUserId || !routeId1 || !routeId2) return null;
    return routeId1 === currentUserId ? routeId2 : routeId1;
  }, [currentUserId, routeId1, routeId2]);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    let cancel = false;

    const fetchMessages = async () => {
      if (!currentUserId || !receiverId) return;
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/messages/${currentUserId}/${receiverId}`);
        if (!cancel) setMessages(Array.isArray(data?.result) ? data.result : []);
      } catch (err) {
        if (!cancel) {
          console.error('Error fetching messages:', err);
          const msg = err?.response?.data?.message || 'Failed to load conversation.';
          setError(msg);
        }
      } finally {
        if (!cancel) setLoading(false);
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
        console.warn('Mark-as-read failed:', err?.response?.data?.message || err?.message);
      }
    };

    fetchMessages();
    markAsRead();

    return () => { cancel = true; };
  }, [currentUserId, receiverId]);

  const handleMessageSent = async () => {
    // brief delay for smoother UX and DB write
    await new Promise(r => setTimeout(r, 250));
    try {
      const { data } = await api.get(`/messages/${currentUserId}/${receiverId}`);
      setMessages(Array.isArray(data?.result) ? data.result : []);
    } catch (err) {
      console.error('Refresh after send failed:', err);
    }
  };

  if (!currentUserId) {
    return <div className="chat-shell"><div className="chat-empty">Loading user…</div></div>;
  }

  const titleText = receiverId ? `Conversation with #${receiverId}` : 'Conversation';

  return (
    <div className="chat-shell" role="main" aria-labelledby="messages-title">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          <Link to="/messages" className="chat-back" aria-label="Back to inbox">← Back</Link>
          <h1 id="messages-title" className="chat-title">{titleText}</h1>
        </div>
      </header>

      {/* Body */}
      <section className="chat-body" aria-live="polite">
        {error && (
          <div className="chat-banner error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="chat-skeletons">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`sk-row ${i % 2 ? 'right' : 'left'}`}>
                <div className="sk-bubble" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">No messages yet. Start the conversation below.</div>
        ) : (
          <Conversation messages={messages} currentUserId={currentUserId} />
        )}
      </section>

      {/* Composer */}
      <footer className="chat-input">
        <MessageInput
          senderId={currentUserId}
          receiverId={receiverId}
          onMessageSent={handleMessageSent}
        />
      </footer>
    </div>
  );
}

