// Exporting a function that takes CommentModel (data access layer) as input
module.exports = (CommentModel) => {

  // Adds a new comment to a specific event
  const addComment = async (req, res, next) => {
    try {
      const { eventId } = req.params;       // Event ID from the route
      const { text } = req.body;            // Comment text from request body
      const userId = req.user.id;           // ID of the logged-in user

      // Make sure the comment text is not empty
      if (!text) {
        return next({ status: 400, message: "Text is required" });
      }

      // Save the comment to the database
      const newComment = await CommentModel.addComment({
        text,
        event_id: eventId,
        user_id: userId,
      });

      // Return the newly created comment
      res.status(201).json({ status: 201, comment: newComment });
    } catch (error) {
      // Pass error to centralized error handler
      next(error);
    }
  };

  // Updates an existing comment (only by its owner)
  const updateComment = async (req, res, next) => {
    try {
      const { content } = req.body;

      // Make sure updated content is provided
      if (!content) {
        return next({ status: 400, message: "Updated content is required" });
      }

      // Update the comment in the database
      const result = await CommentModel.updateComment(
        req.params.id,       // Comment ID from route
        req.user.id,         // Logged-in user ID (for ownership check)
        content
      );

      res.status(200).json({ status: 200, msg: "Comment updated successfully", result });
    } catch (err) {
      next(err);
    }
  };

  // Deletes a comment if it belongs to the logged-in user
  const deleteComment = async (req, res, next) => {
    try {
      const result = await CommentModel.deleteComment(
        req.params.id,       // Comment ID
        req.user.id          // Logged-in user ID (for ownership check)
      );

      res.status(200).json({ status: 200, msg: "Comment deleted successfully", result });
    } catch (err) {
      next(err);
    }
  };

  // Retrieves all comments for a given event ID
  const getByEvent = async (req, res, next) => {
    try {
      const eventId = req.params.eventId;
      const comments = await CommentModel.getByEvent(eventId);

      res.status(200).json({ status: 200, result: comments });
    } catch (err) {
      next(err);
    }
  };

  // Retrieves all comments related to a specific product
  const getByProduct = async (req, res, next) => {
    try {
      const result = await CommentModel.getCommentsByProduct(req.params.productId);

      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  // Retrieves all comments in the system (used by admin or global comment view)
  const getAllComments = async (req, res, next) => {
    try {
      const result = await CommentModel.getAllComments();

      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  // Return all controller methods
  return {
    addComment,
    updateComment,
    deleteComment,
    getByEvent,
    getByProduct,
    getAllComments
  };
};
