import dotenv from 'dotenv';
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import morgan from 'morgan';
import logger from './config/logger';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// --------------------
// App Setup
// --------------------
const app = express();
const PORT = Number(process.env.PORT) || 3671;

logger.info('Starting ThoughtCatcher6 (TS) server...');
logger.debug(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

if (!process.env.JWT_SECRET) {
  const { jwtSecret } = require('./config/keys');
  process.env.JWT_SECRET = jwtSecret;
  logger.warn('JWT_SECRET not found in env; using development default from config/keys.js');
}

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3670',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);
app.use(morgan('combined', { stream: logger.stream }));

// DB
const db = require('./config/keys').mongoURI as string;
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true } as any)
  .then(() => logger.info('MongoDB connected successfully'))
  .catch((err: Error) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// TODO: import other route modules once migrated to TS
app.use('/api/users', require('./routes/api/users'));
app.use('/api/mindmaps', require('./routes/api/mindmaps'));
app.use('/api/nodes', require('./routes/api/nodes'));
app.use('/api/connections', require('./routes/api/connections'));

// 404
app.use((req: Request, _res: Response, next: NextFunction) => {
  const error: any = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || 500;
  logger[statusCode >= 500 ? 'error' : 'warn']('API error:', {
    statusCode,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({ success: false, message: err.message });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\nBackend server (TS) started on port ${PORT}`);
  });
}

export default app;
