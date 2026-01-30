require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/businesses', require('./routes/businesses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/entitlements', require('./routes/entitlements'));
app.use('/api/voyages', require('./routes/voyages'));

// Admin routes (rules engine)
app.use('/api/admin', require('./routes/admin'));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║         Lootly API Server                 ║
╠═══════════════════════════════════════════╣
║  Running on: http://localhost:${PORT}        ║
║  Database: PostgreSQL (Neon)              ║
║  ORM: Drizzle                             ║
╚═══════════════════════════════════════════╝
  `);
});
