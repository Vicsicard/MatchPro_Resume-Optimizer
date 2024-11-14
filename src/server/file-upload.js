import multer from 'multer';
import { extractTextFromTxt } from './file-processing.js';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Process uploaded file and extract text
async function processUploadedFile(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  console.log('Processing file:', file.originalname);
  console.log('File type:', file.mimetype);

  let extractedText = '';
  
  try {
    if (file.mimetype === 'text/plain') {
      // For text files, directly convert buffer to string
      extractedText = file.buffer.toString('utf8');
    } else {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    // Basic validation
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Extracted text is empty');
    }

    // Clean up the text
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    return extractedText;
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
}

export { upload, processUploadedFile };
