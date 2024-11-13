export const handleFileUpload = async (file, type, setStates) => {
    const { 
      setIsLoading, 
      setError, 
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
  
      // Create form data for text extraction
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
  
      // Send to server for text extraction
      const response = await fetch('http://localhost:5000/api/extract-text', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to extract text from file');
      }
  
      const data = await response.json();
  
      // Update extracted text
      setExtractedText(prev => ({
        ...prev,
        [type]: data.extractedText
      }));
  
      // Store file reference and check if both files are present
      if (type === 'resume') {
        setResumeFile(file);
        // Only show verification if both files are present
        setShowVerification(jobPostingFile !== null);
      } else {
        setJobPostingFile(file);
        // Only show verification if both files are present
        setShowVerification(resumeFile !== null);
      }
  
    } catch (err) {
      setError('Error processing file. Please try a different format or check the file quality.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };