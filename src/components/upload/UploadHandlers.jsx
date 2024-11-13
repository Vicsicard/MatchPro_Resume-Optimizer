import { storeFile } from '../../supabase/storage/files';

// File type validation configurations
export const allowedFileTypes = {
  resume: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg'
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
    ? 'Please upload a PDF, Word document, or image file (PNG, JPEG)'
    : 'Please upload a PDF, Word document, text file, or image (PNG, JPEG)';
};

// Handle file upload and processing
export const handleFileUpload = async (file, type, setStates) => {
  const { 
    setIsLoading, 
    setError, 
    setUploadProgress, 
    setExtractedText,
    setResumeFile,
    setJobPostingFile,
    setShowVerification 
  } = setStates;

  if (!file) return;

  // Validate file type
  if (!allowedFileTypes[type].includes(file.type)) {
    setError(getFileTypeMessage(type));
    return;
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    setError('File size should be less than 10MB');
    return;
  }

  try {
    setIsLoading(true);
    setError('');
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));

    // Store file in Supabase
    const folderName = type === 'resume' ? 'resumes' : 'job-postings';
    const { path: storedFilePath } = await storeFile(file, folderName);
    console.log(`File stored in Supabase: ${storedFilePath}`);
    setUploadProgress(prev => ({ ...prev, [type]: 50 }));

    // Create form data for text extraction
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('filePath', storedFilePath);

    // Send to server for text extraction
    const response = await fetch('http://localhost:5000/api/extract-text', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to extract text from file');
    }

    const data = await response.json();
    setUploadProgress(prev => ({ ...prev, [type]: 100 }));

    // Update extracted text
    setExtractedText(prev => ({
      ...prev,
      [type]: data.extractedText
    }));

    // Store file reference
    const fileWithPath = { ...file, path: storedFilePath };
    if (type === 'resume') {
      setResumeFile(fileWithPath);
      // Check if job posting exists to show verification
      setShowVerification(prev => prev.jobPostingFile ? true : false);
    } else {
      setJobPostingFile(fileWithPath);
      // Check if resume exists to show verification
      setShowVerification(prev => prev.resumeFile ? true : false);
    }

  } catch (err) {
    setError('Error processing file. Please try a different format or check the file quality.');
    console.error('Error:', err);
  } finally {
    setIsLoading(false);
  }
};

// Handle resume optimization submission
export const handleOptimization = async (
  resumeFile,
  jobPostingFile,
  extractedText,
  setStates
) => {
  const { setIsLoading, setError, setOptimizedContent, setShowResults, setShowVerification } = setStates;

  if (!resumeFile || !jobPostingFile) {
    setError('Please upload both resume and job posting');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    const response = await fetch('http://localhost:5000/api/optimize-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: extractedText.resume,
        jobPostingText: extractedText.jobPosting,
        resumePath: resumeFile.path,
        jobPostingPath: jobPostingFile.path
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to process files');
    }

    const data = await response.json();
    
    if (data.success) {
      setOptimizedContent(data.optimizedResume);
      setShowResults(true);
      setShowVerification(false);
      console.log('Optimization summary:', data.summary);
    } else {
      throw new Error(data.error || 'Failed to optimize resume');
    }
  } catch (err) {
    setError(err.message || 'Failed to process files. Please try again.');
    console.error('Error:', err);
  } finally {
    setIsLoading(false);
  }
};

// Handle downloading optimized resume
export const handleDownload = async (optimizedContent, setError) => {
  try {
    // Create text file with optimized content
    const blob = new Blob([optimizedContent], { type: 'text/plain' });
    
    // Store optimized resume in Supabase
    const file = new File([blob], 'optimized-resume.txt', { type: 'text/plain' });
    const { path } = await storeFile(file, 'optimized-resumes');
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-resume.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log('Optimized resume stored in Supabase:', path);
  } catch (err) {
    setError('Failed to download optimized resume');
    console.error('Error:', err);
  }
};