import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRoutes from './api-routes.js';
import jobPostingRoutes from './routes/job-posting-routes.js';
import dashboardRoutes from './routes/dashboard-routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to read .env file from project root
console.log('Loading environment variables...');
const envPath = path.resolve(__dirname, '../.env.local');
console.log('Environment file path:', envPath);
dotenv.config({ path: envPath });

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/job-posting', jobPostingRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Resume Optimizer API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      root: '/',
      health: '/api/health',
      jobPosting: {
        url: '/api/job-posting/extract-from-url',
        file: '/api/job-posting/upload-file',
        text: '/api/job-posting/process-text'
      },
      dashboard: {
        history: '/api/dashboard/history',
        stats: '/api/dashboard/stats',
        optimization: '/api/dashboard/optimization/:id'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Server URL: http://localhost:${port}`);
});