import React, { useState, useEffect } from 'react';
import { handlePreviewAndDownload, handleDownload, ResumePreview } from '../upload/TempUploadHandlers';

const ResumePreviewDownload = ({ optimizedContent }) => {
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    // Clean up preview URL when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handlePreview = async () => {
    const data = await handlePreviewAndDownload({
      setError,
      setPreviewUrl,
      setIsPreviewLoading
    });
    setPreviewData(data);
  };

  const handleDownloadClick = async () => {
    await handleDownload(previewData, setError);
  };

  return (
    <div className="resume-preview-download">
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <div className="preview-actions" style={{ marginBottom: '1rem' }}>
        <button
          onClick={handlePreview}
          disabled={isPreviewLoading}
          className="preview-button"
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: '#2E74B5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isPreviewLoading ? 'Generating Preview...' : 'Preview Resume'}
        </button>
        
        {previewData && (
          <button
            onClick={handleDownloadClick}
            className="download-button"
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Download Resume
          </button>
        )}
      </div>

      <ResumePreview previewUrl={previewUrl} isLoading={isPreviewLoading} />
    </div>
  );
};

export default ResumePreviewDownload;
