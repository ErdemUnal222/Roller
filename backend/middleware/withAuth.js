const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Middleware to protect routes that require authentication (e.g. profile, admin)
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if the request has an Authorization header and if it follows the "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, msg: "No or malformed token provided" });
  }

  // Extract the token part from the "Bearer <token>" string
  const token = authHeader.split(' ')[1];

  try {
    // Use JWT to verify and decode the token using the secret key from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
       // Optionally log the decoded payload in non-production environments
    if (process.env.NODE_ENV !== 'production') {
if (process.env.NODE_ENV !== 'production') {
  console.log("🧩 withAuth: Token decoded", decoded); // <== log decoded payload
}    }


    // Attach the decoded user payload to the request object so we can use it later in controllers
    req.user = decoded;

    // Move forward to the next middleware or route handler
    next();
  } catch (err) {
    // Handle token verification failure (invalid signature, expired token, etc.)
    console.error("Invalid or expired token:", err.message);
    return res.status(401).json({ status: 401, msg: "Invalid or expired token" });
  }
};
