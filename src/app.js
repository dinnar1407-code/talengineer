const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const Sentry = require('@sentry/node');
require('dotenv').config();

const app = express();

// ── CORS: whitelist only known origins ───────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-password'],
  credentials: true,
}));

// ── Body parser ───────────────────────────────────────────────────────────────
// Preserve raw body for Stripe webhook signature verification
app.use((req, res, next) => {
  if (req.path === '/api/payment/webhook') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => { req.rawBody = data; next(); });
  } else {
    next();
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// General API: 100 requests / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Auth endpoints: stricter — 10 requests / 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
const talentRoutes  = require('./routes/talent');
const financeRoutes = require('./routes/finance');
const authRoutes    = require('./routes/auth');
const demandRoutes  = require('./routes/demand');
const paymentRoutes = require('./routes/payment');
const iotRoutes     = require('./routes/iot');
const adminRoutes   = require('./routes/admin');
const connectRoutes        = require('./routes/connect');
const certificationsRoutes = require('./routes/certifications');
const workorderRoutes      = require('./routes/workorder');
const { router: apikeysRouter } = require('./routes/apikeys');
const disputesRoutes       = require('./routes/disputes');
const enterpriseRoutes     = require('./routes/enterprise');
const reviewsRoutes        = require('./routes/reviews');
const messagesRoutes       = require('./routes/messages');

app.use('/api/talent',          talentRoutes);
app.use('/api/finance',         financeRoutes);
app.use('/api/auth',            authRoutes);
app.use('/api/demand',          demandRoutes);
app.use('/api/payment',         paymentRoutes);
app.use('/api/iot',             iotRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/payment/connect', connectRoutes);
app.use('/api/certifications',  certificationsRoutes);
app.use('/api/workorder',       workorderRoutes);
app.use('/api/apikeys',         apikeysRouter);
app.use('/api/disputes',        disputesRoutes);
app.use('/api/enterprise',      enterpriseRoutes);
app.use('/api/reviews',         reviewsRoutes);
app.use('/api/messages',        messagesRoutes);

// ── Page routes ───────────────────────────────────────────────────────────────
app.get('/talent',  (req, res) => res.sendFile(path.join(__dirname, '../public', 'talent.html')));
app.get('/finance', (req, res) => res.sendFile(path.join(__dirname, '../public', 'finance.html')));
app.get('/warroom', (req, res) => res.sendFile(path.join(__dirname, '../public', 'warroom.html')));
app.get('*',        (req, res) => res.sendFile(path.join(__dirname, '../public', 'index.html')));

// ── Sentry error handler (must be before any other error middleware) ──────────
Sentry.setupExpressErrorHandler(app);

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // CORS errors
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('[Server Error]', err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal server error',
  });
});

module.exports = app;
