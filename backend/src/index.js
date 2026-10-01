require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet  = require('helmet');

const authRoutes  = require('./routes/auth.routes');
const menuRoutes  = require('./routes/menu.routes');
const cartRoutes  = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const aiRoutes    = require('./routes/ai.routes');
const adminRoutes = require('./routes/admin.routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security headers (helmet) ─────────────────────────────────────────────────
// Cross-Origin headers are set by helmet — we must configure it alongside CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow Unsplash images
  contentSecurityPolicy: false,                           // disabled for dev; enable in prod with nonces
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));           // limit request body size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Rate limiting ─────────────────────────────────────────────────────────────

// General: 200 req / 15 min — all API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', limiter);

// Auth: 15 req / 15 min — prevent brute-force, only count failures
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

// Orders: 10 orders per user per hour — prevent order spamming
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip, // per-user limit (user available after protect middleware)
  message: { success: false, message: 'You have placed too many orders recently. Please wait before ordering again.' },
  skip: (req) => req.method !== 'POST', // only limit POST /orders
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI-Smart Ordering API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',   authLimiter, authRoutes);
app.use('/api/menu',   menuRoutes);
app.use('/api/cart',   cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai',     aiRoutes);
app.use('/api/admin',  adminRoutes);

// Note: orderLimiter is applied inside order.routes.js on POST / to have access
// to req.user after the protect middleware runs

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 AI-Smart Ordering Server v2.0 on http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
