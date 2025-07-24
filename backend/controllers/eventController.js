const path = require('path');

// Exporting a function that receives the EventModel (data access layer)
module.exports = (EventModel) => {

  // Retrieves all events from the database
  const getAllEvents = async (req, res, next) => {
    try {
      const events = await EventModel.getAllEvents();
      res.status(200).json({ status: 200, result: events });
    } catch (err) {
      next(err);
    }
  };

  // Retrieves a single event by its ID
  const getOneEvent = async (req, res, next) => {
    try {
      const event = await EventModel.getOneEvent(req.params.id);
      res.status(200).json({ status: 200, result: event });
    } catch (err) {
      next(err);
    }
  };

  // Creates a new event using request body data
  const saveEvent = async (req, res, next) => {
    try {
      const result = await EventModel.saveOneEvent(req.body);
      res.status(201).json({ status: 201, msg: "Event created successfully.", eventId: result.insertId });
    } catch (err) {
      next(err);
    }
  };

  // Updates an existing event; validates and formats date if provided
  const updateEvent = async (req, res, next) => {
    try {
      const data = req.body;
      const eventId = req.params.id;

      // If a date is included, convert it to MySQL format
      if (data.event_date) {
        const parsedDate = new Date(data.event_date);
        if (isNaN(parsedDate)) {
          return next({ status: 400, message: "Invalid event_date format" });
        }

        // Format: YYYY-MM-DD HH:MM:SS (MySQL-friendly)
        data.event_date = parsedDate.toISOString().slice(0, 19).replace('T', ' ');
      }

      const updated = await EventModel.updateEvent(eventId, data);
      res.status(200).json({ status: 200, result: updated });
    } catch (err) {
      next(err);
    }
  };

  // Deletes an event by ID
  const deleteEvent = async (req, res, next) => {
    try {
      await EventModel.deleteOneEvent(req.params.id);
      res.status(200).json({ status: 200, msg: "Event deleted successfully." });
    } catch (err) {
      next(err);
    }
  };

  // Registers a user to a specific event (if not already registered)
  const registerForEvent = async (req, res) => {
    const userId = req.user && req.user.id;
    const eventId = req.params && req.params.id;

    // Ensure both user and event IDs are present
    if (!userId || !eventId) {
      return res.status(400).json({ message: "Missing user ID or event ID." });
    }

    try {
      // Check if the user is already registered
      const alreadyRegistered = await EventModel.checkUserRegistration(userId, eventId);
      if (alreadyRegistered) {
        return res.status(400).json({ message: "User is already registered to this event." });
      }

      // Register the user
      await EventModel.registerUserToEvent(userId, eventId);
      res.status(201).json({ message: "User successfully registered to event." });
    } catch (error) {
      res.status(500).json({ message: "Server error." });
    }
  };

  // Checks whether the user is already registered for a given event
  const checkIfRegistered = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const eventId = req.params.id;

      const isRegistered = await EventModel.checkUserRegistration(userId, eventId);
      res.status(200).json({ registered: isRegistered });
    } catch (err) {
      next(err);
    }
  };

  // Unregisters a user from an event
  const unregisterFromEvent = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const eventId = req.params.id;

      await EventModel.unregisterUserFromEvent(userId, eventId);
      res.status(200).json({ status: 200, msg: "Successfully unregistered from the event" });
    } catch (err) {
      next(err);
    }
  };

  // Handles image upload for an event (via file upload middleware)
  const savePicture = async (req, res, next) => {
    try {
      // Ensure an image file was included in the request
      if (!req.files || !req.files.image) {
        return next({ status: 400, message: "No image file uploaded." });
      }

      const file = req.files.image;
 const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const fileExtension = path.extname(file.name).toLowerCase();

      if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(fileExtension)) {
        return next({ status: 400, message: 'Invalid file type' });
      }

      if (file.size > 2 * 1024 * 1024) {
        return next({ status: 400, message: 'File too large (max 2MB)' });
      }

      // Sanitize the file name to make it safe for file system use
      const safeFileName = file.name.replace(/[^a-z0-9.\-_]/gi, '_').toLowerCase();

      // Set upload destination path: /public/uploads/filename.ext
      const uploadPath = path.join(__dirname, '..', 'public', 'uploads', safeFileName);

      // Move file to server storage
      file.mv(uploadPath, (err) => {
        if (err) {
          return next({ status: 500, message: "Failed to upload the picture." });
        }

        // Return confirmation and filename
        res.status(200).json({
          status: 200,
          msg: "Picture uploaded successfully.",
          filename: safeFileName
        });
      });
    } catch (err) {
      next(err);
    }
  };

  // Export all controller functions
  return {
    getAllEvents,
    getOneEvent,
    saveEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    checkIfRegistered,
    unregisterFromEvent,
    savePicture
  };
};
