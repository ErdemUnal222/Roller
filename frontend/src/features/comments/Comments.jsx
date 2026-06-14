// /src/components/Comments.jsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  getCommentsByEvent,
  createComment,
  deleteComment,
  updateComment
} from '../../api/commentService';
import "/src/styles/main.scss";

/**
 * Comments Component
 * Allows users to view, post, edit, and delete comments related to a specific event.
 */
function Comments() {
  // Get the event ID from the route URL (e.g., /events/123/comments → id = 123)
  const { id: eventId } = useParams();

  // Current logged-in user (from Redux; same source DeleteMessage.jsx uses).
  // Used to decide who may edit/delete a comment. The BACKEND is the real gate
  // (owner-or-admin); this just stops showing buttons that would 403 anyway.
  const currentUser = useSelector((s) => s.user.user);
  const currentUserId = Number(currentUser?.id);
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  // Can the current user modify a given comment? Owner OR admin — mirrors the backend.
  const canModify = (comment) =>
    isAdmin || Number(comment?.user_id) === currentUserId;

  // State to hold comments and form input values
  const [comments, setComments] = useState([]); // All comments for the event
  const [content, setContent] = useState(''); // New comment input
  const [error, setError] = useState(''); // Error message display
  const [editingId, setEditingId] = useState(null); // Track comment being edited
  const [editContent, setEditContent] = useState(''); // Text content while editing

  /**
   * Fetch comments when the component mounts or event ID changes
   */
  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await getCommentsByEvent(eventId);
        // Ensure state always receives an array
        setComments(
          Array.isArray(response?.result) ? response.result : []
        );
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments.');
      }
    }

    fetchComments();
  }, [eventId]);

  /**
   * Submit a new comment
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return; // Prevent empty comments

    try {
      const response = await createComment(eventId, content);
      if (response?.comment) {
        // Add the new comment to the existing list
        setComments([...comments, response.comment]);
        setContent(''); // Reset input field
        setError('');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Are you logged in?');
    }
  };

  /**
   * Delete a comment
   */
  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this comment?');
    if (!confirm) return;

    try {
      await deleteComment(id);
      // Remove the deleted comment from the list
      setComments(comments.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment.');
    }
  };

  /**
   * Begin editing a comment
   */
  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  /**
   * Save the edited comment
   */
  const handleEditSave = async (id) => {
    if (!editContent.trim()) return;

    try {
      await updateComment(id, { content: editContent });
      // Replace the edited comment in the list
      setComments(
        comments.map((c) =>
          c.id === id ? { ...c, content: editContent } : c
        )
      );
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment.');
    }
  };

  /**
   * Cancel editing mode
   */
  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="comments-section" role="region" aria-labelledby="comments-title">
      <h2 id="comments-title" className="comments-title">Comments</h2>

      {/* Display any error message */}
      {error && <p className="comments-error" role="alert">{error}</p>}

      {/* Form to add a new comment */}
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          rows="3"
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="comment-input"
          aria-label="New comment"
          required
        />
        <button type="submit" className="button button--primary">Post Comment</button>
      </form>

      {/* List all existing comments */}
      <ul className="comment-list">
        {Array.isArray(comments) && comments.length > 0 ? (
          comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <p className="comment-author">{comment.name || 'Anonymous'}</p>

              {/* Edit form shows only while THIS comment is being edited,
                  and only if the user is allowed to modify it. */}
              {editingId === comment.id && canModify(comment) ? (
                <>
                  <textarea
                    className="comment-edit-input"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    aria-label="Edit comment"
                  />
                  <div className="comment-actions">
                    <button className="button button--primary" onClick={() => handleEditSave(comment.id)}>Save</button>
                    <button className="button button--ghost" onClick={handleEditCancel}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="comment-content">{comment.content}</p>
                  {/* Edit/Delete appear only for the comment's author or an admin —
                      matching what the backend actually permits. */}
                  {canModify(comment) && (
                    <div className="comment-actions">
                      <button className="button button--ghost" onClick={() => handleEdit(comment)}>Edit</button>
                      <button className="button button--danger" onClick={() => handleDelete(comment.id)}>Delete</button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))
        ) : (
          <li className="comment-empty">No comments yet.</li>
        )}
      </ul>
    </div>
  );
}

export default Comments;
