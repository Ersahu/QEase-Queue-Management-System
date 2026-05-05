const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { setupSocketIO } = require('./socket/socketHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const queueRoutes = require('./routes/queueRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const qrRoutes = require('./routes/qrRoutes');

// Initialize app
const app = express();

// CORS: the browser Origin header contains only scheme + host + optional port.
// Keep API/backend URLs out of this list; they are request targets, not origins.
const normalizeOriginUrl = (value) => {
  const rawValue = String(value || '').trim();
  if (!rawValue) return '';

  try {
    const url = new URL(rawValue);
    return url.origin;
  } catch {
    return rawValue.replace(/\/+$/, '');
  }
};

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://q-ease-queue-management-system.vercel.app',
];

const buildAllowedOrigins = () => {
  const set = new Set(DEFAULT_CORS_ORIGINS.map(normalizeOriginUrl));

  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',')
      .map((o) => normalizeOriginUrl(o))
      .filter(Boolean)
      .forEach((o) => set.add(o));
  }

  if (process.env.FRONTEND_URL) {
    set.add(normalizeOriginUrl(process.env.FRONTEND_URL));
  }

  return Array.from(set);
};

const allowedOriginsList = buildAllowedOrigins();

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server tools, health checks, and same-origin/no-Origin requests.
    if (!origin) return callback(null, true);

    if (allowedOriginsList.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  optionsSuccessStatus: 204,
};

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  return allowedOriginsList.includes(origin);
};

console.log('CORS allowed origins:', allowedOriginsList);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create server
const server = http.createServer(app);

// Socket.io: use the same allowlist as REST (array form is reliable across Socket.IO versions)
const io = new Server(server, {
  cors: {
    origin: allowedOriginsList,
    methods: ['GET', 'POST'],
    credentials: false,
  },
});

app.set('io', io);
setupSocketIO(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/qr', qrRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'QEase API is running',
    time: new Date(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to QEase Backend',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// Start server after MongoDB is ready (avoids listen-then-crash; loads .env from this folder)
const PORT = process.env.PORT || 5000;

(async function start() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log("=================================");
      console.log("QEase Server Running");
      console.log(`Port: ${PORT}`);
      console.log("=================================");
    });
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = { app, server, io };
