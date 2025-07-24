const uploadProfilePicture = async (req, res, next) => {
  try {
    // Check that a file was actually uploaded with the key "picture"
    if (!req.files || !req.files.picture) {
      return next({ status: 400, message: "No file uploaded" });
    }

    const file = req.files.picture;

    // Generate a unique filename to prevent overwriting existing files
    const fileName = `profile_${Date.now()}_${file.name}`;

    // Move the uploaded file to the public uploads folder
    await file.mv(`./public/uploads/${fileName}`);

    // Return the filename so it can be saved in the database or used in the frontend
    res.status(200).json({ status: 200, filename: fileName });
  } catch (err) {
    // Handle any unexpected errors during upload
    next({ status: 500, message: "Upload failed" });
  }
};

// Export the controller function
module.exports = {
  uploadProfilePicture
};
