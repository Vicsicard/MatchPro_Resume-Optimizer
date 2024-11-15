import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';
import apiRoutes from './api-routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import stripeWebhookRouter from './stripe-webhook.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to read .env file from project root
console.log('Loading environment variables...');
const envPath = path.resolve(__dirname, '../.env.local');
console.log('Environment file path:', envPath);
dotenv.config({ path: envPath });

// Verify environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('Missing Stripe secret key. Please check your .env file');
  console.log('Available environment variables:', Object.keys(process.env));
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OpenAI API key');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Initialize Stripe and OpenAI with detailed logging
console.log('Initializing Stripe...');
console.log('Stripe key type:', stripeSecretKey.startsWith('sk_test_') ? 'test' : 'live');
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

console.log('Initializing OpenAI...');
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());

// Use the Stripe webhook router
// This should be before the express.json() middleware to properly handle Stripe webhooks
app.use('/api', stripeWebhookRouter);

// Parse JSON requests
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Resume Optimizer API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      root: '/',
      health: '/api/health',
      extract: '/api/extract-text',
      optimize: '/api/optimize-resume',
      checkout: '/api/create-checkout-session',
      verify: '/api/verify-session'
    }
  });
});

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint with detailed info
app.get('/api/health', (req, res) => {
  const stripeMode = stripeSecretKey.startsWith('sk_test_') ? 'test' : 'live';
  console.log(`Health check - Stripe mode: ${stripeMode}`);
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    stripeMode,
    environment: process.env.NODE_ENV || 'development',
    apiVersion: {
      stripe: stripe.VERSION,
      server: '1.0.0'
    }
  });
});

// Error handling middleware with detailed logging
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`${timestamp} - Unhandled error:`, err);
  console.error('Request details:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    timestamp,
    requestId: req.id
  });
});

// Handle 404s with logging
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
});

// Start server with health check
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Server URL: http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Stripe mode: ${stripeSecretKey.startsWith('sk_test_') ? 'test' : 'live'}`);
  
  // Verify Stripe connection
  stripe.paymentMethods.list({ limit: 1 })
    .then(() => console.log('✓ Stripe connection verified'))
    .catch(err => console.error('✗ Stripe connection failed:', err.message));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  app.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;