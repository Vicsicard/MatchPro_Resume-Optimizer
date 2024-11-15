import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Divider,
  Stack,
  Tabs,
  Tab,
} from '@mui/material';
import { Download, Analytics, Description } from '@mui/icons-material';
import { OptimizationFeedback } from './OptimizationFeedback';

export const OptimizationResults = ({
  originalResume,
  optimizedResume,
  jobPostingText,
  optimizationDetails,
  onDownload,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Resume Optimization Results
        </Typography>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab 
            icon={<Description />} 
            label="Optimized Resume" 
            id="tab-0"
          />
          <Tab 
            icon={<Analytics />} 
            label="Improvements Made" 
            id="tab-1"
          />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Your Optimized Resume
            </Typography>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                mb: 3, 
                maxHeight: '500px', 
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace'
              }}
            >
              {optimizedResume}
            </Paper>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={onDownload}
                size="large"
              >
                Download Optimized Resume
              </Button>
            </Stack>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <OptimizationFeedback
              improvements={optimizationDetails.improvements}
              keywordsAdded={optimizationDetails.keywordsAdded}
              formattingFixes={optimizationDetails.formattingFixes}
              atsImprovements={optimizationDetails.atsImprovements}
            />
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          Your resume has been optimized using AI to better match the job requirements
          while maintaining authenticity and professionalism.
        </Typography>
      </Paper>
    </Container>
  );
};
