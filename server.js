import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import sharp from 'sharp';
import OpenAI from 'openai';
import * as pdfjsLib from 'pdfjs-dist';

// Configure dotenv to read .env.local file
dotenv.config({ path: '.env.local' });

// Verify environment variables are loaded
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

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// Enhanced image processing for OCR
async function preprocessImageForOCR(buffer) {
  try {
    const processedBuffer = await sharp(buffer)
      .grayscale()
      .linear(1.5, -0.2)
      .sharpen({
        sigma: 1,
        flat: 1,
        jagged: 2
      })
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    return buffer;
  }
}

// Enhanced OCR function with progress tracking
async function performOCR(buffer) {
  try {
    const processedBuffer = await preprocessImageForOCR(buffer);
    const { data: { text } } = await Tesseract.recognize(
      processedBuffer,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    return text.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to perform OCR on image');
  }
}

// Enhanced PDF text extraction
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Enhanced Word document text extraction
async function extractTextFromWord(buffer) {
  try {
    const { value } = await mammoth.extractRawText({ buffer });
    return value.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error('Word Document Extraction Error:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'MatchPro Resume API Server',
    status: 'running',
    endpoints: {
      checkout: '/api/create-checkout-session',
      verify: '/api/verify-session',
      extract: '/api/extract-text',
      optimize: '/api/optimize-resume'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    stripeMode: process.env.VITE_STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'test' : 'live'
  });
});
// Text extraction endpoint
app.post('/api/extract-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const startTime = Date.now();
    console.log(`Starting text extraction for ${req.file.originalname}`);

    let extractedText = '';
    const fileType = req.file.mimetype;

    // Process based on file type
    if (fileType.includes('image')) {
      console.log('Processing image with OCR...');
      extractedText = await performOCR(req.file.buffer);
    } else if (fileType.includes('pdf')) {
      console.log('Processing PDF...');
      extractedText = await extractTextFromPDF(req.file.buffer);
    } else if (fileType.includes('word') || fileType.includes('docx') || fileType.includes('doc')) {
      console.log('Processing Word document...');
      extractedText = await extractTextFromWord(req.file.buffer);
    } else if (fileType === 'text/plain') {
      console.log('Processing plain text...');
      extractedText = req.file.buffer.toString('utf-8').trim();
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Text quality check
    if (!extractedText || extractedText.length < 10) {
      throw new Error('Extracted text is too short or empty');
    }

    const processingTime = (Date.now() - startTime) / 1000;
    console.log(`Text extraction completed in ${processingTime} seconds`);

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
      fileName: req.file?.originalname
    });
  }
});

// Resume optimization endpoint
app.post('/api/optimize-resume', async (req, res) => {
  try {
    const { resumeText, jobPostingText } = req.body;
    
    if (!resumeText || !jobPostingText) {
      return res.status(400).json({ error: 'Both resume and job posting text are required' });
    }

    console.log('Starting resume optimization...');

    // First, analyze the job posting
    const jobAnalysis = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "You are an expert ATS resume optimization assistant. Analyze job postings and optimize resumes to match requirements while maintaining honesty and accuracy."
        },
        {
          role: "user",
          content: `Analyze this job posting and extract:
            1. Key technical skills required
            2. Soft skills emphasized
            3. Required experience level
            4. Primary responsibilities
            5. Industry-specific keywords
            
            Job Posting:
            ${jobPostingText}`
        }
      ],
      temperature: 0.3
    });

    // Optimize the resume
    const optimizationResult = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "You are an expert ATS resume optimization assistant. Optimize resumes while maintaining complete truthfulness and professional formatting."
        },
        {
          role: "user",
          content: `Using the job posting analysis, optimize this resume to better match the job requirements.
            
            Guidelines:
            1. Maintain all truthful information from the original resume
            2. Optimize keywords and phrasing to match job requirements
            3. Highlight relevant experience and skills
            4. Use industry-standard formatting
            5. Include original content but rephrase for better ATS matching
            6. Remove any irrelevant information
            7. Ensure all dates and specific details remain unchanged
            
            Job Analysis:
            ${jobAnalysis.choices[0].message.content}
            
            Original Resume:
            ${resumeText}
            
            Provide the optimized resume in a clear, ATS-friendly format.`
        }
      ],
      temperature: 0.3
    });

    // Format the optimized resume
    const finalFormatting = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "You are an expert resume formatter. Format resumes for maximum ATS compatibility while maintaining professional appearance."
        },
        {
          role: "user",
          content: `Format this optimized resume content for maximum ATS compatibility:
            
            ${optimizationResult.choices[0].message.content}
            
            Ensure:
            1. Clean, consistent formatting
            2. Professional section headers
            3. Proper spacing
            4. Bullet points for achievements
            5. Clear contact information section`
        }
      ],
      temperature: 0.3
    });

    // Generate summary of changes
    const changesSummary = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content: "You are an expert resume analyst. Provide clear, concise summaries of resume improvements."
        },
        {
          role: "user",
          content: `Compare the original and optimized resumes and provide a brief summary of the improvements made:
            
            Original Resume:
            ${resumeText}
            
            Optimized Resume:
            ${finalFormatting.choices[0].message.content}
            
            List the key improvements and optimization changes made.`
        }
      ],
      temperature: 0.3
    });

    // Prepare the response
    const response = {
      success: true,
      optimizedResume: finalFormatting.choices[0].message.content,
      summary: {
        changes: changesSummary.choices[0].message.content,
        jobAnalysis: jobAnalysis.choices[0].message.content
      },
      metadata: {
        timestamp: new Date().toISOString(),
        originalLength: resumeText.length,
        optimizedLength: finalFormatting.choices[0].message.content.length,
        model: "gpt-3.5-turbo-1106"
      }
    };

    console.log('Resume optimization completed successfully');
    res.json(response);

  } catch (error) {
    console.error('Error optimizing resume:', error);
    res.status(500).json({ 
      error: 'Failed to optimize resume',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
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