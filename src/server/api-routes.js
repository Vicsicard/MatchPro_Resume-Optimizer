import { Router } from 'express';
import multer from 'multer';
import {
  performOCR,
  extractTextFromWord,
  extractTextFromTxt
} from './file-processing.js';

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
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

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

// Temporary placeholder for resume optimization
router.post('/optimize-resume', async (req, res) => {
  res.json({
    message: "Resume optimization endpoint placeholder - OpenAI integration pending"
  });
});

export default router;