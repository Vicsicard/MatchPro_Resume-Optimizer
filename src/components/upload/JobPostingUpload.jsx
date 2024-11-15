import React, { useState } from 'react';
import { Box, Tabs, Tab, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { UploadFile, Link, TextFields } from '@mui/icons-material';
import { jobPostingService } from '../../services/jobPostingService';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const JobPostingUpload = ({ onJobPostingExtracted }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const jobPosting = await jobPostingService.extractFromUrl(url);
      onJobPostingExtracted(jobPosting);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setError('');

    try {
      const jobPosting = await jobPostingService.uploadFile(selectedFile);
      onJobPostingExtracted(jobPosting);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError('');

    try {
      const jobPosting = await jobPostingService.processText(text);
      onJobPostingExtracted(jobPosting);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab icon={<Link />} label="URL" />
        <Tab icon={<UploadFile />} label="File Upload" />
        <Tab icon={<TextFields />} label="Paste Text" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <TabPanel value={activeTab} index={0}>
        <form onSubmit={handleUrlSubmit}>
          <TextField
            fullWidth
            label="Job Posting URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter LinkedIn, Indeed, or Glassdoor job posting URL"
            disabled={loading}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={!url || loading}
            sx={{ mt: 2 }}
          >
            Extract Job Posting
          </Button>
        </form>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box sx={{ textAlign: 'center' }}>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="file-upload"
            disabled={loading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="contained"
              component="span"
              disabled={loading}
            >
              Choose File
            </Button>
          </label>
          {file && (
            <Typography sx={{ mt: 2 }}>
              Selected file: {file.name}
            </Typography>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <form onSubmit={handleTextSubmit}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Job Posting Text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste job posting text here"
            disabled={loading}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={!text.trim() || loading}
            sx={{ mt: 2 }}
          >
            Process Text
          </Button>
        </form>
      </TabPanel>
    </Box>
  );
};
