const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Middleware to protect routes that require authentication
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if the request has an Authorization header in the "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, msg: "No or malformed token provided" });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to req.user
    req.user = decoded;

    // Optionally log the decoded token payload when not in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('🧩 withAuthAdmin: Token decoded', decoded);
    }

    // Ensure the user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 403, msg: 'Forbidden: Admins only' });
    }

    next();
  } catch (err) {
     console.error('❌ Invalid or expired token:', err.message);
    return res.status(401).json({ status: 401, msg: 'Invalid or expired token' });
  }
};
