
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Initialize logger first
const logger = require('./config/logger');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');

const app = express();

// Log application start
logger.info('Starting ThoughtCatcher6 server...');
logger.debug('Environment variables loaded');

// Log important configuration
logger.debug(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
// Ensure JWT secret exists in development
if (!process.env.JWT_SECRET) {
  const { jwtSecret } = require('./config/keys');
  process.env.JWT_SECRET = jwtSecret;
  logger.warn('JWT_SECRET not found in env; using development default from config/keys.js');
}

logger.debug(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);

// Bodyparser Middleware
app.use(express.json());

// HTTP request logging with morgan
app.use(morgan('combined', { stream: logger.stream }));

// CORS Middleware
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : (process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3670']);
app.use(cors({
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Log all incoming requests
app.use((req, res, next) => {
  logger.debug(`Incoming request: ${req.method} ${req.originalUrl}`, {
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  next();
});

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to Mongo with better logging
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('MongoDB connected successfully');
  logger.debug(`Connected to database: ${db.split('@').pop()}`);
})
.catch(err => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

// MongoDB connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from DB');
});

// Use Routes with logging
app.use('/api/users', require('./routes/api/users'));
app.use('/api/mindmaps', require('./routes/api/mindmaps'));
app.use('/api/nodes', require('./routes/api/nodes'));
app.use('/api/connections', require('./routes/api/connections'));
app.use('/api/logs', require('./routes/logs'));

// Health check endpoint with logging
app.get('/health', (req, res) => {
  logger.debug('Health check requested');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static assets in production (must be before 404 handler)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, '..', 'client', 'dist')));

    app.get('/{*path}', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'));
    });
}

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error('Server error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
      user: req.user ? req.user.id : 'unauthenticated'
    });
  } else {
    logger.warn('Client error:', {
      status: statusCode,
      message: err.message,
      path: req.path,
      method: req.method
    });
  }

  // Never expose internal details to the client in production
  const clientMessage = process.env.NODE_ENV === 'production'
    ? (statusCode === 404 ? 'Not found' : 'An unexpected error occurred')
    : (err.message || 'An unexpected error occurred');

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  });
});

const port = process.env.PORT || 3671;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`\nBackend server started on port ${port}`);
    console.log('---');
    console.log(`Backend Health Check: http://localhost:${port}/health`);
    console.log('Frontend available at: http://localhost:3670');
    console.log('---\\n');
  });
}

// Export app for testing without starting a second server
module.exports = app;
