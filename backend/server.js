import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

import authRoutes from './routes/authRoutes.js';
import competitorRoutes from './routes/competitorRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import intelligenceRoutes from './routes/intelligenceRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/competitors', competitorRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/intelligence', intelligenceRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'GrowVix API is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' });
});

import { startWorker } from './worker.js';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    startWorker();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });
