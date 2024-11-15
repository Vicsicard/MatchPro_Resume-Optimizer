import express from 'express';
import multer from 'multer';
import { extractJobPosting } from '../job-posting-extractor.js';
import { validateURL } from '../utils/validators.js';
import { processFile } from '../utils/file-processor.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  },
});

// Handle URL-based job posting extraction
router.post('/extract-from-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validate URL
    if (!url || !validateURL(url)) {
      return res.status(400).json({ error: 'Invalid URL provided' });
    }
    
    // Check if URL is from supported job boards
    if (!url.match(/linkedin\.com|indeed\.com|glassdoor\.com/i)) {
      return res.status(400).json({ 
        error: 'URL must be from LinkedIn, Indeed, or Glassdoor' 
      });
    }
    
    // Extract job posting
    const jobPosting = await extractJobPosting(url);
    
    res.json({ jobPosting });
    
  } catch (error) {
    console.error('Error processing URL:', error);
    res.status(500).json({ 
      error: 'Failed to extract job posting',
      details: error.message 
    });
  }
});

// Handle file upload
router.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Process file content using our file processor
    const jobPosting = await processFile(req.file);
    
    res.json({ jobPosting });
    
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ 
      error: 'Failed to process file',
      details: error.message 
    });
  }
});

// Handle direct text input
router.post('/process-text', express.json(), async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid text input' });
    }
    
    // Process the text (implement text processing logic here)
    const processedText = text.trim();
    
    res.json({ jobPosting: processedText });
    
  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({ 
      error: 'Failed to process text',
      details: error.message 
    });
  }
});

export default router;
