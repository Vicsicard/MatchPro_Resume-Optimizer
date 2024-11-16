require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const { OpenAI } = require('openai');
const apiRoutes = require('./api-routes.cjs');

const app = express();

// Initialize OpenAI (if API key exists)
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

const port = process.env.PORT || 5000;
const maxPortAttempts = 10;
let currentPort = port;

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches our allowed pattern
    const allowedOrigins = Array.from({ length: 20 }, (_, i) => `http://localhost:${5173 + i}`);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Resume Optimizer API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      root: '/',
      health: '/api/health',
      extract: '/api/extract-text',
      optimize: '/api/optimize-resume'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Function to try different ports
const startServer = (attempt = 0) => {
  const server = app.listen(currentPort)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempt < maxPortAttempts) {
        console.log(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
        currentPort++;
        startServer(attempt + 1);
      } else {
        console.error('Server failed to start:', err);
        process.exit(1);
      }
    })
    .on('listening', () => {
      console.log(`Server running on port ${currentPort}`);
      console.log(`Visit http://localhost:${currentPort} to see API status`);
      console.log(`Server environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('CORS enabled for dynamic ports');
    });
};

// Start server with port retry logic
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  app.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
