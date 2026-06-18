import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { MulterError } from 'multer';
import uploadRouter from './routes/upload.js';
import validateFileRouter from './routes/validate-file.js';
import extractFileRouter from './routes/extract-file.js';
import validateFileStreamRouter from './routes/validate-file-stream.js';
import extractFileStreamRouter from './routes/extract-file-stream.js';

const app = express();
const PORT = 3001;

// CORS configuration - supports multiple origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'https://w21xlrdn-5173.inc1.devtunnels.ms'];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins if wildcard is configured
    if (allowedOrigins.includes('*')) {
      callback(null, true);
      return;
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));
app.use(express.json());

// Ensure uploads directory exists
await fs.mkdir('uploads', { recursive: true });

// Routes - File Upload
app.use('/api', uploadRouter);

// Routes - File-based validation and extraction
app.use('/api', validateFileRouter);
app.use('/api', extractFileRouter);
app.use('/api', validateFileStreamRouter);
app.use('/api', extractFileStreamRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response): void => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Unhandled error:', error);

  // Handle multer-specific errors
  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 10MB'
      });
      return;
    }
    res.status(400).json({
      error: 'File upload error',
      message: error.message
    });
    return;
  }

  // Handle file filter errors (invalid file type)
  if (error.message.includes('Invalid file type')) {
    res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, (): void => {
  console.log(`🚀 Venue Vetting Bridge Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${process.cwd()}/uploads`);
  console.log(`🔗 CORS enabled for: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', (): void => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', (): void => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
