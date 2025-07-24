const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const MessageModel = require("../models/MessageModel");

dotenv.config();

module.exports = (UsersModel) => {
  // REGISTER a new user
  const saveUser = async (req, res, next) => {
    try {
      // Check if the email already exists
      const existing = await UsersModel.getUserByEmail(req.body.email);
      if (existing.code) return next({ status: 500, message: "Error checking email" });
      if (existing.length > 0) return next({ status: 401, message: "Email already in use" });
      
         // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(req.body.password)) {
        return next({
          status: 400,
          message:
            "Password must be at least 8 characters long and include uppercase, lowercase, and a number.",
        });
      }

      // Hash the password before saving it
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const userData = { ...req.body, password: hashedPassword };

      // Save the new user to the database
      const result = await UsersModel.saveOneUser(userData);
      if (result.code) return next({ status: 500, message: "Error saving user" });

      res.status(201).json({ status: 201, msg: "User registered successfully" });
    } catch (err) {
      next(err);
    }
  };
const getOtherUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const users = await UsersModel.getAllOtherUsers(currentUserId);
    res.status(200).json({ status: 200, result: users });
  } catch (err) {
    console.error("Error fetching other users:", err);
    next({ status: 500, message: "Unable to fetch users" });
  }
};

  // LOGIN a user and return their JWT token
  const connectUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await UsersModel.getUserByEmail(email);

      if (!result || result.length === 0) {
        return next({ status: 401, message: "Invalid email or password" });
      }

      const userRecord = result[0];

      // Compare password with hashed password in database
      const isMatch = await bcrypt.compare(password, userRecord.password);
      if (!isMatch) {
        return next({ status: 401, message: "Invalid email or password" });
      }

      // Create payload and generate JWT
      const payload = { id: userRecord.id, role: userRecord.role };
if (process.env.NODE_ENV !== 'production') {
        console.log("🔑 JWT payload before signing:", payload);
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

      // Return token and safe user object
      const user = {
        id: userRecord.id,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        email: userRecord.email,
        address: userRecord.address,
        complement: userRecord.complement,
        zip: userRecord.zip,
        city: userRecord.city,
        role: userRecord.role,
        picture: userRecord.picture
      };

      res.status(200).json({ token, user });
    } catch (err) {
      next(err);
    }
  };

  // UPDATE user profile information
  const updateUser = async (req, res, next) => {
    const targetId = parseInt(req.params.id, 10);
const userId = req.user.id;
    const userRole = req.user.role;
 if (userId !== targetId && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: You cannot modify another user's data." });
    }
    try {
      const result = await UsersModel.updateUser(req.body, req.params.id);
      if (result.code) return next({ status: 500, message: "Error updating user" });

      const updated = await UsersModel.getOneUser(req.params.id);
      if (updated.code) return next({ status: 500, message: "Error fetching updated user" });

      const user = updated[0];
      res.status(200).json({ status: 200, newUser: user });
    } catch (err) {
      next(err);
    }
  };

  // SOFT DELETE user by marking them as deleted (does not remove from DB)
  const deleteUser = async (req, res, next) => {
    const targetId = parseInt(req.params.id, 10);
 const userId = req.user.id;
    const userRole = req.user.role;
 if (userId !== targetId && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: You cannot modify another user's data." });
    }
    try {
      const result = await UsersModel.softDeleteUser(req.params.id);
      if (result.code) return next({ status: 500, message: result.message });

      res.status(200).json({ status: 200, msg: "User marked as deleted" });
    } catch (err) {
      next(err);
    }
  };

  // UPLOAD and assign a profile picture to a user
 const path = require('path');

const uploadProfilePicture = async (req, res, next) => {
  const targetId = parseInt(req.params.id, 10);
const userId = req.user.id;
  const userRole = req.user.role;

if (userId !== targetId && userRole !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: You cannot modify another user's data." });
  }
  try {
    if (!req.files || !req.files.picture) {
      return next({ status: 400, message: "No file uploaded" });
    }

    const file = req.files.picture;
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = path.extname(file.name).toLowerCase();

    if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(fileExtension)) {
      return next({ status: 400, message: "Invalid file type" });
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      return next({ status: 400, message: "File too large (max 2MB)" });
    }

    const sanitizedFileName = file.name.replace(/[^a-z0-9_.-]/gi, '_');
    const fileName = `profile_${Date.now()}_${sanitizedFileName}`;
    const uploadPath = `./public/uploads/${fileName}`;

    await file.mv(uploadPath);

    const result = await UsersModel.updateUser({ picture: fileName }, req.params.id);
    if (result.code) return next({ status: 500, message: "Failed to update user with picture" });

    res.status(200).json({ status: 200, message: "Profile picture updated", filename: fileName });
  } catch (err) {
    next({ status: 500, message: "Upload failed", error: err });
  }
};


  // VALIDATE JWT token and return the user info
  const checkToken = async (req, res, next) => {
    try {
      const result = await UsersModel.getOneUser(req.user.id);
      if (result.code) return next({ status: 500, message: "Error validating token" });

      const user = result[0];
      res.status(200).json({ status: 200, user });
    } catch (err) {
      next(err);
    }
  };

  // GET all users (admin panel access)
  const getAllUsers = async (req, res, next) => {
    try {
      const users = await UsersModel.getAllUsers();
      if (users.code) return next({ status: 500, message: "Error retrieving users" });

      res.status(200).json({ status: 200, result: users });
    } catch (err) {
      next(err);
    }
  };

  // GET a user by their ID
  const getOneUser = async (req, res, next) => {
    try {
      const result = await UsersModel.getOneUser(req.params.id);
      if (result.code || result.length === 0) {
        return next({ status: 404, message: "User not found" });
      }

      res.status(200).json({ status: 200, user: result[0] });
    } catch (err) {
      next(err);
    }
  };

  // GET current authenticated user
  const getCurrentUser = async (req, res, next) => {
    try {
      const result = await UsersModel.getOneUser(req.user.id);
      if (!result || result.length === 0) {
        return next({ status: 404, message: "User not found" });
      }

      res.status(200).json({ status: 200, user: result[0] });
    } catch (err) {
      next(err);
    }
  };

  // ALIAS for getCurrentUser (used as /profile)
  const getProfile = getCurrentUser;

  // SEND a message to another user
  const sendMessage = async (req, res, next) => {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user.id;

      if (!receiverId || !content) {
        return next({ status: 400, message: "Receiver ID and content are required" });
      }

      // Save the message to the database
      const insertResult = await MessageModel.saveOneMessage(senderId, receiverId, content);
      if (insertResult.code) return next({ status: insertResult.code, message: insertResult.message });

      // Retrieve the newly saved message for confirmation
      const insertedId = insertResult.insertId;
      const fullMessage = await MessageModel.getMessageById(insertedId);

      if (!fullMessage) {
        return next({ status: 500, message: "Failed to retrieve saved message" });
      }

      res.status(201).json({ status: 201, result: fullMessage });
    } catch (err) {
      next(err);
    }
  };

  // Return all exported functions
  return {
    sendMessage,
    saveUser,
    connectUser,
    updateUser,
    deleteUser,
    checkToken,
    getAllUsers,
    getOneUser,
    getCurrentUser,
    uploadProfilePicture,
    getProfile,
    getOtherUsers,
  };
};
