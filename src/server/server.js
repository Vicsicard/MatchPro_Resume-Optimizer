import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';
import apiRoutes from './api-routes.js';

// Configure dotenv to read .env.local file
dotenv.config({ path: '.env.local' });

// Verify environment variables
if (!process.env.VITE_STRIPE_SECRET_KEY) {
  console.error('Missing Stripe secret key');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OpenAI API key');
  process.exit(1);
}

const app = express();

// Initialize Stripe and OpenAI
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(express.json());
app.use(cors());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'MatchPro Resume API Server',
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

// Stripe endpoints
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'MatchPro Resume Premium Package',
              description: 'Advanced ATS optimization and 10 resume optimizations'
            },
            unit_amount: 1999, // $19.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.VITE_BASEURL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_BASEURL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Verify session endpoint
app.post('/api/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      console.log('No session ID provided');
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      res.json({ verified: true });
    } else {
      res.status(400).json({ 
        error: 'Payment not verified',
        status: session.payment_status 
      });
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ 
      error: 'Failed to verify session',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    stripeMode: process.env.VITE_STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'test' : 'live'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
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

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see API status`);
  console.log(`Using Stripe key type: ${process.env.VITE_STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'test' : 'live'}`);
  console.log(`Server environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;