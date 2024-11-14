// src/components/upload/TempUploadHandlers.jsx

// File type validation configurations
export const allowedFileTypes = {
  resume: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'text/plain'
  ],
  jobPosting: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ]
};

// Helper function for file type error messages
export const getFileTypeMessage = (type) => {
  return type === 'resume' 
    ? 'Please upload a PDF, Word document, text file, or image file (PNG, JPEG)'
    : 'Please upload a PDF, Word document, text file, or image (PNG, JPEG)';
};

// Handle file upload and processing
export const handleFileUpload = async (file, type, setStates) => {
  const { 
    setIsLoading, 
    setError, 
    setExtractedText,
    setResumeFile,
    setJobPostingFile,
    setShowVerification 
  } = setStates;

  if (!file) {
    setError('No file selected');
    return;
  }

  // Validate file size
  if (file.size === 0) {
    setError('File is empty. Please upload a file with content.');
    return;
  }

  try {
    setIsLoading(true);
    setError('');

    console.log('Starting file upload:', {
      name: file.name,
      type: file.type,
      size: file.size,
      uploadType: type,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // Create form data for text extraction
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    console.log('Sending request to server...');
    
    // Send to server for text extraction
    const response = await fetch('http://localhost:5000/api/extract-text', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include'
    });

    console.log('Server response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Server error:', errorData);
      throw new Error(errorData?.error || 'Failed to extract text from file');
    }

    const data = await response.json();
    console.log('Text extraction successful:', data);

    // Update extracted text
    setExtractedText(prev => {
      const newState = {
        ...prev,
        [type]: data.text || ''
      };
      console.log('Updated extracted text state:', newState);
      return newState;
    });

    // Store file reference
    if (type === 'resume') {
      console.log('Setting resume file');
      setResumeFile(file);
    } else {
      console.log('Setting job posting file');
      setJobPostingFile(file);
    }

    console.log('File upload and processing complete');

  } catch (err) {
    console.error('Error during file upload:', err);
    setError(err.message || 'Error processing file. Please try a different format or check the file quality.');
  } finally {
    setIsLoading(false);
  }
};

// Handle resume optimization
export const handleOptimization = async (resumeFile, jobPostingFile, extractedText, setStates) => {
  const { 
    setIsLoading, 
    setError, 
    setOptimizedContent,
    setShowResults,
    setShowVerification 
  } = setStates;

  try {
    setIsLoading(true);
    setError('');

    console.log('Starting optimization with texts:', {
      resume: extractedText.resume,
      jobPosting: extractedText.jobPosting
    });

    const response = await fetch('http://localhost:5000/api/optimize-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        resumeText: extractedText.resume,
        jobPostingText: extractedText.jobPosting
      })
    });

    console.log('Optimization response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Optimization error response:', errorData);
      throw new Error(errorData.error || 'Failed to optimize resume');
    }

    const data = await response.json();
    console.log('Optimization response data:', data);

    if (!data.optimizedContent) {
      throw new Error('No optimized resume content received');
    }

    setOptimizedContent(data.optimizedContent);
    setShowResults(true);
    setShowVerification(false);

    console.log('Optimization complete, updated states');

  } catch (err) {
    console.error('Error during optimization:', err);
    setError(err.message || 'Failed to optimize resume');
  } finally {
    setIsLoading(false);
  }
};

// Handle optimized resume download
export const handleDownload = (optimizedContent, setError) => {
  try {
    const blob = new Blob([optimizedContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized_resume.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('Error downloading file:', err);
    setError('Failed to download optimized resume');
  }
};