const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Clean text content from HTML and CSS
function cleanTextContent(text) {
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove CSS
    .replace(/{[^}]*}/g, '')
    .replace(/\s*{[^}]*}\s*/g, '')
    // Remove JavaScript
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Text extraction endpoint
router.post('/extract-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', req.file.originalname);
    console.log('File type:', req.file.mimetype);

    let extractedText = '';
    
    if (req.file.mimetype === 'text/plain') {
      // For text files, directly convert buffer to string and clean
      extractedText = cleanTextContent(req.file.buffer.toString('utf8'));
    } else {
      return res.status(400).json({ 
        error: 'Unsupported file type',
        details: `File type ${req.file.mimetype} is not supported`
      });
    }

    // Basic validation
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Extracted text is empty' });
    }

    res.json({ text: extractedText });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Resume optimization endpoint
router.post('/optimize-resume', express.json(), async (req, res) => {
  try {
    const { resumeText, jobPostingText } = req.body;

    if (!resumeText || !jobPostingText) {
      return res.status(400).json({
        error: 'Missing required data',
        message: 'Both resume and job posting text are required'
      });
    }

    // Clean any remaining HTML/CSS from the texts
    const cleanedResume = cleanTextContent(resumeText);
    const cleanedJobPosting = cleanTextContent(jobPostingText);

    // For now, return a simple optimization response
    // TODO: Implement actual optimization logic
    const optimizedResume = `Here is your optimized resume based on the job posting:\n\n${cleanedResume}`;

    res.json({ 
      success: true,
      optimizedContent: optimizedResume
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({
      error: 'Failed to optimize resume',
      details: error.message
    });
  }
});

module.exports = router;
