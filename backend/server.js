// ------------------- SERVER ENTRY POINT -------------------
if (process.env.NODE_ENV !== 'production') {
  console.log('Server starting...');
}

// ------------------- DEPENDENCIES -------------------
const express = require('express');
const mysql = require('promise-mysql');     
const fileUpload = require('express-fileupload');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// ------------------- APP INIT -------------------
const app = express();
app.disable('x-powered-by');     // hide Express signature
app.set('trust proxy', 1);       // safe if behind a proxy (Heroku/Render/Nginx)

// ------------------- CORS SETUP -------------------
// Support multiple origins via .env (comma-separated)
const envOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...envOrigins,
  process.env.FRONTEND_URL,
  'http://localhost:3000',
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight

if (process.env.NODE_ENV !== 'production') {
  console.log('Allowed CORS origins:', allowedOrigins);
}

// ------------------- SECURITY HEADERS (helmet-lite) -------------------
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  // Minimal CSP compatible with Stripe Checkout
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' https://js.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "connect-src 'self' https://api.stripe.com",
    ].join('; ')
  );
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains'); // ~180 days
  }
  next();
});

// ------------------- FILE UPLOADS (safer defaults) -------------------
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  abortOnLimit: true,
  safeFileNames: true,      // strips dangerous chars
  preserveExtension: true,  // keep .png/.jpg/.webp
}));

// ------------------- BODY PARSERS -------------------
// Stripe webhook MUST receive RAW body. Mount this BEFORE JSON parsing.
app.post('/api/v1/webhook/stripe', bodyParser.raw({ type: 'application/json' }), (req, res, next) => next());

// For all other routes, use JSON / urlencoded, but skip the webhook path.
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/webhook/stripe') return next();
  return express.json({ limit: '200kb' })(req, res, next);
});
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/webhook/stripe') return next();
  return express.urlencoded({ extended: false, limit: '200kb' })(req, res, next);
});

// ------------------- STATIC FILES -------------------
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/images',  express.static(path.join(__dirname, 'public', 'images')));

// ------------------- SIMPLE LOGIN RATE-LIMIT (no new deps) -------------------
const loginHits = Object.create(null);
app.use('/api/v1/auth/login', (req, res, next) => {
  if (req.method !== 'POST') return next();
  const key = `${req.ip}`; // optionally: `${req.ip}:${req.body?.email}`
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const limit = 10;                 // 10 attempts per window

  const bucket = (loginHits[key] = (loginHits[key] || []).filter(ts => now - ts < windowMs));
  if (bucket.length >= limit) {
    return res.status(429).json({ ok: false, error: 'Too many login attempts. Try again later.' });
  }
  bucket.push(now);
  next();
});

// ------------------- DATABASE CONNECTION (POOL) -------------------
(async () => {
  try {
    const db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      connectionLimit: 10,
      timezone: 'Z',
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Connected to MySQL (pool).');
    }

    // Keep-alive (optional with pools, kept for consistency)
    setInterval(() => db.query('SELECT 1'), 10000);

    // ------------------- ROUTES -------------------
    app.get('/', (req, res) => {
      res.json({ status: 200, message: 'Welcome to the Roller Derby API' });
    });

    const apiRouter = express.Router();
    require('./routes/index')(apiRouter, db);
    app.use('/api/v1', apiRouter);

    if (process.env.NODE_ENV !== 'production') {
      app.get('/api/v1/debug', (req, res) => {
        console.log('Debug endpoint hit');
        res.json({ status: 'ok' });
      });

      app.get('/test-direct', (req, res) => {
        console.log('/test-direct ping received');
        res.send('OK');
      });
    }

    // ------------------- 404 FALLBACK -------------------
    app.use('*', (req, res) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('No matching route:', req.method, req.originalUrl);
      }
      res.status(404).json({ message: 'Route not found', path: req.originalUrl });
    });

    // ------------------- CENTRAL ERROR HANDLER -------------------
    app.use(errorHandler);

    // ------------------- START SERVER -------------------
    const PORT = process.env.PORT || 9500;
    app.listen(PORT, () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Server running on port ${PORT}`);
      }
    });
  } catch (err) {
    console.error('Database pool init failed:', err);
    process.exit(1);
  }
})();
