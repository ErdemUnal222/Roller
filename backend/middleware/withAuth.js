const jwt = require('jsonwebtoken');

// tiny helpers
const ensureSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set'); // fail fast so you notice in dev
  }
  return process.env.JWT_SECRET;
};

const extractBearer = (req) => {
  const h = req.headers['authorization'];
  if (!h) return null;
  // case-insensitive "Bearer "
  if (/^Bearer\s+/i.test(h)) {
    const token = h.replace(/^Bearer\s+/i, '').trim();
    return token || null;
  }
  return null;
};

module.exports = (req, res, next) => {
  // allow CORS preflight without auth
  if (req.method === 'OPTIONS') return res.sendStatus(204);

  const token = extractBearer(req);
  if (!token) {
    return res.status(401).json({ status: 401, msg: 'No or malformed token provided' });
  }

  try {
    const opts = { algorithms: ['HS256'] };
    // Optional claims hardening—only enforced if you set envs
    if (process.env.JWT_AUDIENCE) opts.audience = process.env.JWT_AUDIENCE;
    if (process.env.JWT_ISSUER)   opts.issuer   = process.env.JWT_ISSUER;

    const decoded = jwt.verify(token, ensureSecret(), opts);

    // attach a minimal, immutable user object
    req.user = Object.freeze({ id: decoded.id, role: decoded.role });

    if (process.env.NODE_ENV !== 'production') {
      // keep logs minimal; do not print full token or PII
      console.log('withAuth OK -> user:', req.user);
    }
    return next();
  } catch (err) {
    // jwt.verify throws on expiration, bad sig, bad aud/iss, etc.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('withAuth fail:', err.name);
    }
    return res.status(401).json({ status: 401, msg: 'Invalid or expired token' });
  }
};
