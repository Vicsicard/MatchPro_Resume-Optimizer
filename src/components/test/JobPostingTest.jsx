import React, { useState } from 'react';
import { JobPostingUpload } from '../upload/JobPostingUpload';
import { Box, Paper, Typography, Divider } from '@mui/material';

export const JobPostingTest = () => {
  const [extractedJobPosting, setExtractedJobPosting] = useState('');
  const [error, setError] = useState('');

  const handleJobPostingExtracted = (jobPosting) => {
    setExtractedJobPosting(jobPosting);
    setError('');
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Job Posting Extractor Test
      </Typography>
      
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Job Posting
        </Typography>
        <JobPostingUpload onJobPostingExtracted={handleJobPostingExtracted} />
      </Paper>

      {extractedJobPosting && (
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h6" gutterBottom>
            Extracted Job Posting
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
          <Typography
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'monospace',
              backgroundColor: '#f5f5f5',
              padding: 2,
              borderRadius: 1
            }}
          >
            {extractedJobPosting}
          </Typography>
        </Paper>
      )}

      {error && (
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 3, 
            marginTop: 3, 
            backgroundColor: '#ffebee'
          }}
        >
          <Typography color="error" variant="h6" gutterBottom>
            Error
          </Typography>
          <Typography color="error">
            {error}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
