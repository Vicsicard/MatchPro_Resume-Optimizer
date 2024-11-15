// Handle preview and download of optimized resume
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

// Handle the actual download after preview
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
    
    // Store in Supabase for history
    const file = new File([previewData.blob], `optimized_resume.${previewData.format}`, { 
      type: previewData.format === 'pdf' ? 'application/pdf' : 'text/plain' 
    });
    await storeFile(file, 'optimized-resumes');
    
  } catch (err) {
    console.error('Error downloading file:', err);
    setError('Failed to download optimized resume');
  }
};

// Preview component for the resume
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
const previewStyles = `
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
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = previewStyles;
document.head.appendChild(styleSheet);