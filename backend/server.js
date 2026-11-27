
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import competitorRoutes from './routes/competitorRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import intelligenceRoutes from './routes/intelligenceRoutes.js';
import imageRoutes from './routes/imageRoutes.js';

import { startWorker } from './worker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  'https://web-growvix.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {

    // Allow server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('❌ CORS blocked origin:', origin);

    return callback(new Error('Not allowed by CORS: ' + origin));
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],

  optionsSuccessStatus: 204
};

// Apply CORS globally
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options(/.*/, cors(corsOptions));

// ==========================================
// 2. BODY PARSER
// ==========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/api/images/serve', express.static(path.resolve('uploads/images')));

// ==========================================
// 3. API ROUTES
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/images', imageRoutes);

// ==========================================
// 4. HOME ROUTE
// ==========================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GrowVix API is running',
    status: 'Active'
  });
});

// ==========================================
// 5. 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// ==========================================
// 6. GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {

  console.error('Server Error:', err.stack || err.message);

  if (err.message?.startsWith('Not allowed by CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed by CORS'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : undefined
  });
});

// ==========================================
// 7. DATABASE & SERVER STARTUP
// ==========================================

const startServer = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    // Start background worker
    startWorker();

    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {

      console.log(`🚀 GrowVix server running on port ${PORT}`);

      console.log('🌐 Allowed frontend origins:');

      allowedOrigins.forEach(origin => {
        console.log(`   - ${origin}`);
      });

    });

  } catch (error) {

    console.error(
      '❌ Server startup failed:',
      error.message
    );

    process.exit(1);
  }
};

startServer();
