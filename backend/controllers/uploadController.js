const path = require("path");

const uploadProfilePicture = async (req, res, next) => {
  try {
    // Check that a file was uploaded
    if (!req.files || !req.files.picture) {
      return next({ status: 400, message: "No file uploaded" });
    }

    const file = req.files.picture;

    // Allowed extensions and MIME types
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    // Get extension in lowercase
    const ext = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
      return next({ status: 400, message: "Invalid file type. Only JPG, PNG, and WEBP are allowed." });
    }

    // Optional: size limit (e.g. 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      return next({ status: 400, message: "File too large. Max 2MB allowed." });
    }

    // Sanitize and generate unique filename
    const safeBaseName = path.basename(file.name, ext).replace(/[^a-z0-9_\-]/gi, "_");
    const fileName = `profile_${Date.now()}_${safeBaseName}${ext}`;

    // Move to uploads folder
    await file.mv(`./public/uploads/${fileName}`);

    res.status(200).json({ status: 200, filename: fileName });
  } catch (err) {
    next({ status: 500, message: "Upload failed" });
  }
};

module.exports = {
  uploadProfilePicture,
};
