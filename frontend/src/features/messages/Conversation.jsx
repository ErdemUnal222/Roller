import React, { useEffect, useRef } from 'react';

/**
 * Conversation Component
 * Renders a list of chat messages and auto-scrolls to the bottom when new messages arrive.
 *
 * Props:
 * - messages: Array of message objects (each with sender info, content, timestamps, etc.)
 * - currentUserId: The ID of the user currently logged in (used to distinguish between sent/received messages)
 */
function Conversation({ messages, currentUserId }) {
  // A reference to the invisible div at the bottom of the message list for scrolling
  const endRef = useRef(null);

  // A reference to the container that holds all messages (optional: could be used for future enhancements)
  const containerRef = useRef(null);

  /**
   * useEffect hook triggers every time the `messages` array changes.
   * It ensures the chat auto-scrolls to the latest message.
   */
  useEffect(() => {
    if (!endRef.current) return;

    const scrollToBottom = () => {
      // Smooth scroll to the last message
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    // Delay the scroll slightly to ensure DOM is updated
    const timeout = setTimeout(scrollToBottom, 100);

    // Debug logs only in development to avoid leaking message contents
    if (import.meta.env.DEV) {
      console.log("Conversation props → messages:", messages);
      console.log("currentUserId:", currentUserId);
      console.table(messages);
    }

    // Clean up the timeout if component unmounts or messages change quickly
    return () => clearTimeout(timeout);
  }, [messages]);

  /**
   * If `messages` is not a valid array, display a placeholder.
   * This prevents errors if the data hasn't loaded yet.
   */
  if (!Array.isArray(messages)) {
    return (
      <div className="conversation-placeholder text-gray-500 p-4">
        No conversation loaded.
      </div>
    );
  }

  return (
    <div className="conversation-container" ref={containerRef}>
      {/* Render each message (filtered to remove null/undefined items) */}
      {messages.filter(Boolean).map((msg) => {
        if (!msg || typeof msg !== 'object') return null;

if (import.meta.env.DEV) {
          console.log('💬 msg record:', msg); // Debug log for each message object
        }
        // Compare sender ID with current user ID (convert to numbers to avoid type mismatch)
        const isSentByCurrentUser = Number(msg.sender_id) === Number(currentUserId);

        // Determine who sent the message (label either 'You' or the sender's username)
        const senderLabel = isSentByCurrentUser
          ? 'You'
          : msg.sender_username || `User ${msg.sender_id}`;

        return (
          <div
            key={msg.id}
            className={`conversation-message ${isSentByCurrentUser ? 'sent' : 'received'}`}
            style={{
              border: '1px solid',
              borderColor: isSentByCurrentUser ? '#4caf50' : '#ccc',
              backgroundColor: isSentByCurrentUser ? '#d1f7c4' : '#f1f1f1',
              padding: '8px',
              margin: '8px',
              borderRadius: '8px',
            }}
          >
            <div
              className={`message-bubble ${isSentByCurrentUser ? 'sent' : 'received'} ${
                msg.seen ? '' : 'unread'
              }`}
            >
              {/* Sender Name */}
              <p className="message-sender"><strong>{senderLabel}</strong></p>

              {/* Message Text Content */}
              <p className="message-text">{msg.content || 'No message'}</p>

              {/* Sent Time (formatted as HH:MM) */}
              <p className="message-time">
                {msg.sent_at
                  ? new Date(msg.sent_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Unknown time'}
              </p>
            </div>
          </div>
        );
      })}

      {/* This invisible div helps auto-scroll to the bottom of the conversation */}
      <div ref={endRef} />
    </div>
  );
}

export default Conversation;
