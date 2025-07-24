import { useState } from 'react';
import api from '../../api/axios';
import "/src/styles/main.scss";

/**
 * MessageInput Component
 * Renders an input field and a button to send messages between users.
 * Handles message submission via click or Enter key and notifies parent on success.
 *
 * Props:
 * - senderId (number): ID of the user sending the message
 * - receiverId (number): ID of the user receiving the message
 * - onMessageSent (function): Callback triggered after a successful message is sent
 */
function MessageInput({ senderId, receiverId, onMessageSent }) {
  const [content, setContent] = useState('');   // Stores the message input content
  const [error, setError] = useState('');       // Holds any error message for display

  /**
   * Sends a message to the backend if the input is valid.
   * On success, it clears the input and triggers the onMessageSent callback.
   */
  const handleSend = async () => {
    const trimmed = content.trim(); // Remove spaces from start and end
    if (!trimmed) return; // Ignore empty messages

    try {
      const res = await api.post('/messages', {
        senderId,
        receiverId,
        content: trimmed
      });

      if (res.data?.result) {
        // Notify parent component that a message was sent (e.g., to refresh conversation)
        onMessageSent?.();
        setContent('');  // Clear input field
        setError('');    // Clear any previous error
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  /**
   * Handles "Enter" key to send message, but allows Shift+Enter for multi-line input.
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default newline behavior
      handleSend();       // Trigger send
    }
  };

  return (
    <div className="message-input-container" role="form" aria-label="Send a message">
      <input
        type="text"
        className="message-input-field"
        placeholder="Type your message..."
        value={content}
        onChange={(e) => setContent(e.target.value)} // Update state as user types
        onKeyDown={handleKeyDown} // Support Enter key to send
        aria-label="Message input field"
      />
      <button
        onClick={handleSend}
        className="message-send-button"
        aria-label="Send message"
      >
        Send
      </button>

      {/* Show error message if sending fails */}
      {error && <p className="message-error" role="alert">{error}</p>}
    </div>
  );
}

export default MessageInput;
