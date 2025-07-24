// Exporting a function that takes AvailabilityModel (data access layer) as a parameter
module.exports = (AvailabilityModel) => {

    // Creates a new availability entry for the authenticated user
    const createAvailability = async (req, res, next) => {
        try {
            const { start_date, end_date, comment } = req.body;

            // Validate required fields
            if (!start_date || !end_date) {
                return next({ status: 400, message: "Start date and end date are required" });
            }

            // Insert new availability into the database, linked to the logged-in user
            const result = await AvailabilityModel.addAvailability(
                req.user.id,
                start_date,
                end_date,
                comment
            );

            res.status(201).json({ status: 201, msg: "Availability created successfully", result });
        } catch (err) {
            // Pass any error to the centralized error handler
            next(err);
        }
    };

    // Updates an existing availability entry belonging to the current user
    const updateAvailability = async (req, res, next) => {
        try {
            const { start_date, end_date, comment } = req.body;

            // Validate required fields
            if (!start_date || !end_date) {
                return next({ status: 400, message: "Start date and end date are required" });
            }

            // Update availability only if the entry belongs to the logged-in user
            const result = await AvailabilityModel.updateAvailability(
                req.params.id,       // Availability ID from URL
                req.user.id,         // Logged-in user ID from token
                start_date,
                end_date,
                comment
            );

            res.status(200).json({ status: 200, msg: "Availability updated successfully", result });
        } catch (err) {
            next(err);
        }
    };
//     const updateAvailability = (req, res, next) => {
//     const { start_date, end_date, comment } = req.body;

//     if (!start_date || !end_date) {
//         return next({ status: 400, message: "Start date and end date are required" });
//     }

//     AvailabilityModel.updateAvailability(
//         req.params.id,
//         req.user.id,
//         start_date,
//         end_date,
//         comment
//     )
//     .then((result) => {
//         res.status(200).json({ status: 200, msg: "Availability updated successfully", result });
//     })
//     .catch((err) => {
//         next(err);
//     });
// };

    // Deletes an availability entry, only if it belongs to the logged-in user
    const deleteAvailability = async (req, res, next) => {
        try {
            const result = await AvailabilityModel.deleteAvailability(
                req.params.id,       // Availability ID from URL
                req.user.id          // Logged-in user ID from token
            );

            res.status(200).json({ status: 200, msg: "Availability deleted successfully", result });
        } catch (err) {
            next(err);
        }
    };

    // Retrieves all availability entries for a specific user (public or profile use)
    const getAvailabilitiesByUser = async (req, res, next) => {
        try {
            const result = await AvailabilityModel.getAvailabilitiesByUser(req.params.userId);

            res.status(200).json({ status: 200, result });
        } catch (err) {
            next(err);
        }
    };

    // Retrieves all availabilities in the system (admin-level access)
    const getAllAvailabilities = async (req, res, next) => {
        try {
            const result = await AvailabilityModel.getAllAvailabilities();

            res.status(200).json({ status: 200, result });
        } catch (err) {
            next(err);
        }
    };

    // Expose all controller methods so they can be used in route files
    return {
        createAvailability,
        updateAvailability,
        deleteAvailability,
        getAvailabilitiesByUser,
        getAllAvailabilities
    };
};
