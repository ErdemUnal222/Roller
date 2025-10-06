// Exporting a factory that takes AvailabilityModel (data access layer)
module.exports = (AvailabilityModel) => {
  // --- Helpers ---
  const normalizeAffected = (res) =>
    (res && (res.affectedRows ?? res.rowCount ?? 0)) || 0;

  // --- Create ---
  const createAvailability = async (req, res, next) => {
    try {
      const { start_date, end_date, comment } = req.body;

      if (!start_date || !end_date) {
        return next({ status: 400, message: "Start date and end date are required" });
      }
      if (new Date(start_date) > new Date(end_date)) {
        return next({ status: 400, message: "Start date cannot be after end date" });
      }

      const result = await AvailabilityModel.addAvailability(
        req.user.id,
        start_date,
        end_date,
        comment ?? null
      );

      res.status(201).json({ status: 201, msg: "Availability created successfully", result });
    } catch (err) {
      next(err);
    }
  };

  // --- Update (owner only) ---
  const updateAvailability = async (req, res, next) => {
    try {
      const { start_date, end_date, comment } = req.body;

      if (!start_date || !end_date) {
        return next({ status: 400, message: "Start date and end date are required" });
      }
      if (new Date(start_date) > new Date(end_date)) {
        return next({ status: 400, message: "Start date cannot be after end date" });
      }

      const result = await AvailabilityModel.updateAvailability(
        req.params.id,      // availability id
        req.user.id,        // owner id
        start_date,
        end_date,
        comment ?? null
      );

      const affected = normalizeAffected(result);
      if (affected === 0) {
        return next({ status: 404, message: "Availability not found or not allowed" });
      }

      res.status(200).json({ status: 200, msg: "Availability updated successfully", result });
    } catch (err) {
      next(err);
    }
  };

  // --- Delete
  // If role === admin and model supports deleteByIdAnyUser, allow deleting any slot.
  // Otherwise, fall back to owner-only delete via deleteAvailability(id, userId).
  const deleteAvailability = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) return next({ status: 400, message: "Missing availability id." });

      const role = req.user?.role?.toLowerCase?.() || "user";
      let result;

      if (role === "admin" && typeof AvailabilityModel.deleteByIdAnyUser === "function") {
        result = await AvailabilityModel.deleteByIdAnyUser(id);
      } else if (typeof AvailabilityModel.deleteByIdForUser === "function") {
        result = await AvailabilityModel.deleteByIdForUser(req.user.id, id);
      } else if (typeof AvailabilityModel.deleteAvailability === "function") {
        // Back-compat with your existing signature: (id, userId)
        result = await AvailabilityModel.deleteAvailability(id, req.user.id);
      } else {
        return next({ status: 500, message: "Delete method not implemented in model." });
      }

      const affected = normalizeAffected(result);
      if (affected === 0) {
        return next({ status: 404, message: "Availability not found or not allowed." });
      }

      return res.status(200).json({ status: 200, msg: "Availability deleted successfully" });
    } catch (err) {
      next(err);
    }
  };

  // --- List by user (public/profile use) ---
  const getAvailabilitiesByUser = async (req, res, next) => {
    try {
      const result = await AvailabilityModel.getAvailabilitiesByUser(req.params.userId);
      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  // --- List all (admin) ---
  const getAllAvailabilities = async (req, res, next) => {
    try {
      const result = await AvailabilityModel.getAllAvailabilities();
      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  // --- List my availabilities (auth) ---
  const getMyAvailabilities = async (req, res, next) => {
    try {
      const result = await AvailabilityModel.getAvailabilitiesByUser(req.user.id);
      res.status(200).json({ status: 200, result });
    } catch (err) {
      next(err);
    }
  };

  // Expose controller methods
  return {
    createAvailability,
    updateAvailability,
    deleteAvailability,
    getAvailabilitiesByUser,
    getAllAvailabilities,
    getMyAvailabilities,
  };
};
