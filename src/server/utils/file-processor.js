import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Process PDF files
export async function processPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF file');
  }
}

// Process DOCX files
export async function processWord(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error processing Word document:', error);
    throw new Error('Failed to process Word document');
  }
}

// Process TXT files
export function processText(buffer) {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Error processing text file:', error);
    throw new Error('Failed to process text file');
  }
}

// Main file processor
export async function processFile(file) {
  const { buffer, mimetype } = file;
  
  try {
    switch (mimetype) {
      case 'application/pdf':
        return await processPDF(buffer);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return await processWord(buffer);
      
      case 'text/plain':
        return processText(buffer);
      
      default:
        throw new Error(`Unsupported file type: ${mimetype}`);
    }
  } catch (error) {
    console.error('File processing error:', error);
    throw error;
  }
}
