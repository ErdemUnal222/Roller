// ------------------- SERVER ENTRY POINT -------------------
if (process.env.NODE_ENV !== 'production') {
  console.log("Server starting...");
}

// ------------------- DEPENDENCIES -------------------
const express = require("express");
const mysql = require("promise-mysql");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// ------------------- APP INIT -------------------
const app = express();

// ------------------- CORS SETUP -------------------
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight

if (process.env.NODE_ENV !== 'production') {
  console.log("Allowed CORS origins:", allowedOrigins);
}

// ------------------- MIDDLEWARE -------------------
app.use(fileUpload({ createParentPath: true }));

// Stripe raw body
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/webhook/stripe') {
    bodyParser.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: false }));

// ------------------- STATIC FILES -------------------
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// ------------------- DATABASE CONNECTION -------------------
mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
}).then((db) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log("Connected to MySQL database.");
  }

  // Keep-alive
  setInterval(() => db.query('SELECT 1'), 10000);

  // ------------------- ROUTES -------------------
  app.get('/', (req, res) => {
    res.json({ status: 200, message: "Welcome to the Roller Derby API" });
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

  app.use(errorHandler);

  const PORT = process.env.PORT || 9500;
  app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Server running on port ${PORT}`);
    }
  });

}).catch((err) => {
  console.error("Database connection failed:", err);

  app.use('*', (req, res) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn("No matching route:", req.method, req.originalUrl);
    }
    res.status(404).json({ message: "Route not found", path: req.originalUrl });
  });
});
