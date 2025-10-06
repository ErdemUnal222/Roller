const jwt = require('jsonwebtoken');

/**
 * Strict, self-contained admin auth middleware
 * - Accepts only "Bearer <token>" (case-insensitive)
 * - Verifies HS256 JWT signed with process.env.JWT_SECRET
 * - Optionally enforces audience/issuer if JWT_AUDIENCE / JWT_ISSUER are set
 * - Allows CORS preflight (OPTIONS) through without auth
 * - Responds: 401 (no/malformed/invalid token), 403 (not admin)
 */
module.exports = (req, res, next) => {
  // Allow CORS preflight without auth
  if (req.method === 'OPTIONS') return res.sendStatus(204);

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fail fast so misconfiguration is obvious during dev
    // (If you prefer, return 500 instead of throwing)
    throw new Error('JWT_SECRET is not set');
  }

  // Extract Bearer token (case-insensitive)
  const authHeader = req.headers['authorization'];
  let token = null;
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    token = authHeader.replace(/^Bearer\s+/i, '').trim() || null;
  }
  if (!token) {
    return res.status(401).json({ status: 401, msg: 'No or malformed token provided' });
  }

  try {
    // Verification options
    const verifyOpts = { algorithms: ['HS256'] };
    if (process.env.JWT_AUDIENCE) verifyOpts.audience = process.env.JWT_AUDIENCE;
    if (process.env.JWT_ISSUER)   verifyOpts.issuer   = process.env.JWT_ISSUER;

    // Verify & decode
    const decoded = jwt.verify(token, secret, verifyOpts);

    // Attach a minimal, immutable user object
    const user = Object.freeze({ id: decoded.id, role: decoded.role });
    req.user = user;

    if (process.env.NODE_ENV !== 'production') {
      console.log('withAuthAdmin OK -> user:', user);
    }

    // Enforce admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 403, msg: 'Forbidden: Admins only' });
    }

    return next();
  } catch (err) {
    // Expired, bad signature, wrong audience/issuer, etc.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('withAuthAdmin fail:', err.name);
    }
    return res.status(401).json({ status: 401, msg: 'Invalid or expired token' });
  }
};
