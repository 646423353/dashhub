import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import uploadRoutes from './routes/upload.js';
import searchRoutes from './routes/search.js';
import oauthRoutes from './routes/oauth.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Initialize database and seed data
async function initializeDatabase() {
  try {
    const { seedData } = await import('./config/initDb.js');
    await seedData();
    console.log('🎉 Database initialized and seeded!');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/oauth', oauthRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DashHub API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 DashHub API running on http://localhost:${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV}`);
  });
}

startServer();
