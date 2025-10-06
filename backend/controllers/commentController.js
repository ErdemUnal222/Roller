// Controller factory
module.exports = (CommentModel) => {
  // Create
  const addComment = async (req, res, next) => {
    try {
      const eventId = Number(req.params.eventId);
      const userId = Number(req.user.id);
      const text = (req.body?.text ?? "").trim();

      if (!eventId || Number.isNaN(eventId)) return next({ status: 400, message: "Invalid event id." });
      if (!text) return next({ status: 400, message: "Text is required." });

      const newComment = await CommentModel.addComment({
        text,
        event_id: eventId,
        user_id: userId,
      });

      res.status(201).json({ status: 201, comment: newComment });
    } catch (error) {
      next(error);
    }
  };

  // Update (owner only; admin override)
  const updateComment = async (req, res, next) => {
    try {
      const commentId = Number(req.params.id);
      const content = (req.body?.content ?? "").trim(); // keep "content" in payload
      const userId = Number(req.user.id);
      const isAdmin = req.user?.role === "admin";

      if (!commentId || Number.isNaN(commentId)) return next({ status: 400, message: "Invalid comment id." });
      if (!content) return next({ status: 400, message: "Updated content is required." });

      let result;
      if (isAdmin && typeof CommentModel.updateCommentAdmin === "function") {
        // Admin: edit any comment
        result = await CommentModel.updateCommentAdmin(commentId, content);
      } else {
        // Owner-only path
        result = await CommentModel.updateComment(commentId, userId, content);
      }

      const affected = result?.affectedRows ?? result?.rowCount ?? 0;
      if (affected === 0) {
        const status = isAdmin ? 404 : 403;
        const message = isAdmin ? "Comment not found." : "You can only edit your own comment.";
        return res.status(status).json({ status, message });
      }

      res.status(200).json({ status: 200, msg: "Comment updated successfully" });
    } catch (err) {
      next(err);
    }
  };

  // Delete (owner only; admin override)
  const deleteComment = async (req, res, next) => {
    try {
      const commentId = Number(req.params.id);
      const userId = Number(req.user.id);
      const isAdmin = req.user?.role === "admin";

      if (!commentId || Number.isNaN(commentId)) return next({ status: 400, message: "Invalid comment id." });

      let result;
      if (isAdmin && typeof CommentModel.forceDeleteComment === "function") {
        // Admin: delete any comment
        result = await CommentModel.forceDeleteComment(commentId);
      } else {
        // Owner-only path
        result = await CommentModel.deleteComment(commentId, userId);
      }

      const affected = result?.affectedRows ?? result?.rowCount ?? 0;
      if (affected === 0) {
        const status = isAdmin ? 404 : 403;
        const message = isAdmin ? "Comment not found." : "You can only delete your own comment.";
        return res.status(status).json({ status, message });
      }

      res.status(200).json({ status: 200, msg: "Comment deleted successfully" });
    } catch (err) {
      next(err);
    }
  };

  // Read: by event
  const getByEvent = async (req, res, next) => {
    try {
      const eventId = Number(req.params.eventId);
      if (!eventId || Number.isNaN(eventId)) return next({ status: 400, message: "Invalid event id." });

      const comments = await CommentModel.getByEvent(eventId);
      res.status(200).json({ status: 200, result: comments });
    } catch (err) {
      next(err);
    }
  };

  // Read: by product
  const getByProduct = async (req, res, next) => {
    try {
      const productId = Number(req.params.productId);
      if (!productId || Number.isNaN(productId)) return next({ status: 400, message: "Invalid product id." });

      const result = await CommentModel.getCommentsByProduct(productId);
      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  // Admin: all comments
  const getAllComments = async (req, res, next) => {
    try {
      const result = await CommentModel.getAllComments();
      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  return {
    addComment,
    updateComment,
    deleteComment,
    getByEvent,
    getByProduct,
    getAllComments,
  };
};
