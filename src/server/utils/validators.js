// URL validation
export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// File type validation
export function validateFileType(mimetype) {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  return allowedTypes.includes(mimetype);
}

// File size validation (in bytes)
export function validateFileSize(size, maxSize = 10 * 1024 * 1024) { // Default 10MB
  return size <= maxSize;
}

// Text content validation
export function validateTextContent(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  // Check if text is not just whitespace
  if (text.trim().length === 0) {
    return false;
  }
  
  // Check if text is not too long (e.g., 1MB)
  if (text.length > 1024 * 1024) {
    return false;
  }
  
  return true;
}
