import express from 'express';
import { Router } from 'express';
import multer from 'multer';
import {
  performOCR,
  extractTextFromWord,
  extractTextFromTxt,
  extractTextFromPDF
} from './file-processing.js';
import { stripe } from './server.js';
import { addOptimizationCredits, hasRemainingOptimizations, useOptimization } from './optimization-tracking.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Text extraction endpoint
router.post('/extract-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const startTime = Date.now();
    console.log(`Starting text extraction for ${req.file.originalname}`);
    console.log('File type:', req.file.mimetype);
    console.log('File size:', req.file.size);

    let extractedText = '';
    const fileType = req.file.mimetype;

    if (fileType.includes('image')) {
      console.log('Processing image with OCR...');
      extractedText = await performOCR(req.file.buffer);
    } else if (fileType.includes('word') || fileType.includes('docx') || fileType.includes('doc')) {
      console.log('Processing Word document...');
      extractedText = await extractTextFromWord(req.file.buffer);
    } else if (fileType === 'text/plain') {
      console.log('Processing plain text...');
      extractedText = extractTextFromTxt(req.file.buffer);
    } else if (fileType === 'application/pdf') {
      console.log('Processing PDF document...');
      extractedText = await extractTextFromPDF(req.file.buffer);
    } else {
      console.error('Unsupported file type:', fileType);
      return res.status(400).json({ 
        error: 'Unsupported file type',
        details: `File type ${fileType} is not supported`,
        supportedTypes: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ]
      });
    }

    if (!extractedText || extractedText.length < 10) {
      console.error('Extracted text is too short:', extractedText);
      throw new Error('Extracted text is too short or empty');
    }

    const processingTime = (Date.now() - startTime) / 1000;
    console.log(`Text extraction completed in ${processingTime} seconds`);
    console.log('Extracted text length:', extractedText.length);

    res.json({ 
      extractedText,
      metadata: {
        processingTime,
        originalFileName: req.file.originalname,
        fileType,
        textLength: extractedText.length
      }
    });

  } catch (error) {
    console.error('Text extraction failed:', error);
    res.status(500).json({ 
      error: 'Text extraction failed',
      details: error.message,
      fileName: req.file?.originalname,
      fileType: req.file?.mimetype
    });
  }
});

// Resume optimization endpoint
router.post('/optimize-resume', express.json(), async (req, res) => {
  try {
    console.log('Received optimization request');
    const { resumeText, jobPostingText } = req.body;

    console.log('Request body:', {
      resumeTextLength: resumeText?.length,
      jobPostingTextLength: jobPostingText?.length
    });

    if (!resumeText || !jobPostingText) {
      console.error('Missing required texts');
      return res.status(400).json({ 
        error: 'Both resume and job posting texts are required' 
      });
    }

    // OpenAI API configuration
    const openai_api_key = process.env.OPENAI_API_KEY;
    if (!openai_api_key) {
      console.error('OpenAI API key not found');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured' 
      });
    }

    console.log('Preparing OpenAI request');

    const prompt = `
    As a professional resume optimizer, enhance the following resume to better match the job posting requirements.
    
    Guidelines:
    1. Identify and incorporate key skills and requirements from the job posting
    2. Highlight relevant experience that matches job requirements
    3. Use industry-standard terminology from the job posting
    4. Maintain clear, professional formatting
    5. Keep all content truthful and authentic - do not fabricate experience
    6. Emphasize quantifiable achievements
    7. Remove or minimize irrelevant information
    8. Ensure the optimized resume maintains proper structure with clear sections
    9. Use strong action verbs
    10. Keep original contact information and education details unchanged
    
    Job Posting:
    ${jobPostingText}
    
    Original Resume:
    ${resumeText}
    
    Please provide the optimized resume content with clear section formatting.`;

    console.log('Sending request to OpenAI');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openai_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are an expert resume optimizer that helps improve resumes to better match job requirements while maintaining authenticity and professionalism."
        }, {
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 2048,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to optimize resume');
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const optimizedResume = data.choices[0].message.content;

    // Log token usage for monitoring
    console.log('Token usage:', {
      prompt_tokens: data.usage?.prompt_tokens,
      completion_tokens: data.usage?.completion_tokens,
      total_tokens: data.usage?.total_tokens
    });

    console.log('Sending successful response');
    res.json({ 
      optimizedResume,
      message: 'Resume successfully optimized',
      tokenUsage: data.usage
    });

  } catch (error) {
    console.error('Error optimizing resume:', error);
    res.status(500).json({ 
      error: 'Failed to optimize resume',
      details: error.message 
    });
  }
});

// Stripe endpoints
router.post('/create-checkout-session', async (req, res) => {
  try {
    console.log('Creating checkout session...');
    console.log('Request body:', req.body);
    
    const { successUrl, cancelUrl, userId, priceId, credits } = req.body;
    
    if (!userId) {
      throw new Error('User ID is required for checkout');
    }

    // Map of price IDs to their respective Stripe price IDs
    const priceIds = {
      price_starter: 'price_starter_id', // 20 credits for $19.99
      price_professional: 'price_professional_id', // 50 credits for $39.99
      price_enterprise: 'price_enterprise_id' // 200 credits for $99.99
    };

    const stripePriceId = priceIds[priceId];
    if (!stripePriceId) {
      throw new Error('Invalid price ID');
    }

    // Use provided URLs or fallback to environment variables
    const baseUrl = process.env.VITE_BASEURL || 'http://localhost:5173';
    const finalSuccessUrl = successUrl || `${baseUrl}/upload`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/pricing`;
    
    console.log('Creating session with:', {
      priceId: stripePriceId,
      successUrl: finalSuccessUrl,
      cancelUrl: finalCancelUrl,
      userId,
      credits
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${finalSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: finalCancelUrl,
      metadata: {
        userId,
        credits,
        product_type: 'premium_package',
        created_at: new Date().toISOString()
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      submit_type: 'pay',
    });

    console.log('Checkout session created successfully:', {
      sessionId: session.id,
      url: session.url
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', {
      message: error.message,
      type: error.type,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message,
      type: error.type
    });
  }
});

// Verify session endpoint
router.post('/verify-session', async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    
    if (!sessionId) {
      console.log('No session ID provided');
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!userId) {
      console.log('No user ID provided');
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Retrieving session:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Session status:', session.payment_status);
    
    if (session.payment_status === 'paid') {
      console.log('Payment verified successfully');

      // Add 10 optimization credits to the user's account
      try {
        await addOptimizationCredits(userId);
        console.log('Added 10 optimization credits to user:', userId);
      } catch (error) {
        console.error('Error adding optimization credits:', error);
        // Continue with the response even if credits failed to add
      }

      res.json({ 
        verified: true,
        customerId: session.customer,
        paymentIntent: session.payment_intent,
        amount: session.amount_total,
        credits: 10
      });
    } else {
      console.log('Payment not verified:', session.payment_status);
      res.status(400).json({ 
        error: 'Payment not verified',
        status: session.payment_status,
        lastError: session.last_payment_error
      });
    }
  } catch (error) {
    console.error('Error verifying session:', error);
    
    let errorMessage = 'Failed to verify session';
    let statusCode = 500;
    
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid session ID';
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      type: error.type,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check remaining optimizations endpoint
router.get('/remaining-optimizations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const hasCredits = await hasRemainingOptimizations(userId);
    res.json({ hasCredits });
  } catch (error) {
    console.error('Error checking optimizations:', error);
    res.status(500).json({ 
      error: 'Failed to check remaining optimizations',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test endpoints for optimization tracking
router.post('/test-optimization/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    let result;
    switch (action) {
      case 'add':
        // Add 5 test credits
        result = await addOptimizationCredits(userId, 5);
        return res.json({ message: 'Added 5 credits', result });
      
      case 'check':
        // Check remaining credits
        result = await hasRemainingOptimizations(userId);
        return res.json({ hasCredits: result });
      
      case 'use':
        // Use one credit
        result = await useOptimization(userId);
        return res.json({ message: 'Used 1 credit', remaining: result.remaining });
      
      case 'stats':
        // Get stats
        result = await getOptimizationStats(userId);
        return res.json(result);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;