
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  'https://web-growvix.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without an Origin header (e.g. server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==========================================
// 2. BODY PARSER
// ==========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. IMPORT ROUTES
// ==========================================

import authRoutes from './routes/authRoutes.js';
import competitorRoutes from './routes/competitorRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import intelligenceRoutes from './routes/intelligenceRoutes.js';

// ==========================================
// 4. API ROUTES
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/intelligence', intelligenceRoutes);

// ==========================================
// 5. HOME ROUTE
// ==========================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GrowVix API is running',
    status: 'Active'
  });
});

// ==========================================
// 6. 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// ==========================================
// 7. GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack || err.message);

  res.status(err.message?.startsWith('Not allowed by CORS') ? 403 : 500)
    .json({
      success: false,
      message: err.message?.startsWith('Not allowed by CORS')
        ? 'Origin not allowed by CORS'
        : 'Internal server error',
      error: process.env.NODE_ENV === 'development'
        ? err.message
        : undefined
    });
});

// ==========================================
// 8. DATABASE & SERVER STARTUP
// ==========================================

import { startWorker } from './worker.js';

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    // Start background worker
    startWorker();

    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 GrowVix server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
