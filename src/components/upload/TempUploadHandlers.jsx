// Define allowed file types and their messages
export const allowedFileTypes = ['.pdf', '.doc', '.docx', '.txt'];

export const getFileTypeMessage = (fileType) => {
  switch (fileType) {
    case 'resume':
      return `Accepted formats: ${allowedFileTypes.join(', ')}`;
    case 'jobPosting':
      return 'Paste job description or upload file';
    default:
      return '';
  }
};

// Handle file upload and validation
export const handleFileUpload = async (file, type, setStates) => {
  const { setError, setFile } = setStates;
  
  try {
    if (!file) {
      throw new Error('No file selected');
    }

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedFileTypes.join(', ')}`);
    }

    setFile(file);
    return true;
  } catch (err) {
    console.error(`Error uploading ${type}:`, err);
    setError(err.message);
    return false;
  }
};

// Handle optimization process
export const handleOptimization = async (resumeFile, jobPostingFile, setStates) => {
  const { setError, setIsOptimizing, setOptimizedContent } = setStates;
  
  try {
    setIsOptimizing(true);
    
    // Call your backend optimization endpoint
    const formData = new FormData();
    formData.append('resume', resumeFile);
    if (jobPostingFile) {
      formData.append('jobPosting', jobPostingFile);
    }
    
    const response = await fetch('/api/optimize-resume', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to optimize resume');
    }
    
    const data = await response.json();
    setOptimizedContent(data.optimizedContent);
    return data.optimizedContent;
    
  } catch (err) {
    console.error('Error during optimization:', err);
    setError('Failed to optimize resume');
    return null;
  } finally {
    setIsOptimizing(false);
  }
};

// Handle preview generation
export const handlePreviewAndDownload = async (optimizedContent, setStates) => {
  const { setError, setPreviewUrl, setIsPreviewLoading } = setStates;
  
  try {
    setIsPreviewLoading(true);
    
    // Format the content with proper sections and spacing
    const formattedContent = formatResumeContent(optimizedContent);
    
    // Generate PDF preview
    const pdfBlob = await formatAsPdf(formattedContent);
    const previewUrl = URL.createObjectURL(pdfBlob);
    setPreviewUrl(previewUrl);

    // Return the blob and format for later download use
    return {
      blob: pdfBlob,
      format: 'pdf'
    };
    
  } catch (err) {
    console.error('Error generating preview:', err);
    setError('Failed to generate preview');
    return null;
  } finally {
    setIsPreviewLoading(false);
  }
};

// Handle the actual download
export const handleDownload = async (previewData, setError) => {
  try {
    if (!previewData || !previewData.blob) {
      throw new Error('Preview data not available');
    }
    
    // Create and trigger download
    const url = URL.createObjectURL(previewData.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized_resume.${previewData.format}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
  } catch (err) {
    console.error('Error downloading file:', err);
    setError('Failed to download optimized resume');
  }
};

// Format resume content with proper sections
const formatResumeContent = (content) => {
  // Add proper formatting logic here
  return content;
};

// Convert content to PDF format
const formatAsPdf = async (content) => {
  // Add PDF conversion logic here
  // For now, return a simple blob
  return new Blob([content], { type: 'application/pdf' });
};

// Preview component
export const ResumePreview = ({ previewUrl, isLoading }) => {
  if (isLoading) {
    return (
      <div className="preview-loading">
        <div className="spinner"></div>
        <p>Generating preview...</p>
      </div>
    );
  }

  if (!previewUrl) {
    return null;
  }

  return (
    <div className="resume-preview">
      <iframe
        src={previewUrl}
        title="Resume Preview"
        width="100%"
        height="600px"
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#fff'
        }}
      />
    </div>
  );
};

// Add styles for the preview component
const styles = `
.resume-preview {
  margin: 20px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f5f5f5;
  border-radius: 8px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2E74B5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}