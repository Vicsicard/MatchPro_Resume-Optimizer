import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';
import sharp from 'sharp';
import fs from 'fs';

// Image preprocessing for OCR
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

// OCR processing
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

// Word document processing
async function extractTextFromWord(buffer) {
  try {
    const { value } = await mammoth.extractRawText({ buffer });
    return value.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error('Word processing error:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

// Text file processing
function extractTextFromTxt(buffer) {
  try {
    return buffer.toString('utf8').replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error('Text processing error:', error);
    throw new Error('Failed to process text file');
  }
}

// PDF processing - using OCR as a fallback
async function extractTextFromPDF(buffer) {
  try {
    // For now, treat PDFs as images and use OCR
    console.log('Processing PDF using OCR...');
    return await performOCR(buffer);
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export {
  performOCR,
  extractTextFromWord,
  extractTextFromTxt,
  extractTextFromPDF
};