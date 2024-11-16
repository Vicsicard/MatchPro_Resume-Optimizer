import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useNavigate } from 'react-router-dom';
import { useCredits } from '../../hooks/useCredits';
import {
  allowedFileTypes,
  handleFileUpload,
  handleOptimization,
  handlePreviewAndDownload,
  handleDownload,
  getFileTypeMessage,
  ResumePreview
} from './TempUploadHandlers';
import { Check } from 'lucide-react';

export default function UploadPage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobPostingFile, setJobPostingFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [optimizedContent, setOptimizedContent] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const { credits, loading: creditsLoading, useCredit } = useCredits();
  const navigate = useNavigate();

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    await handleFileUpload(file, 'resume', {
      setError,
      setFile: setResumeFile
    });
  };

  const handleJobPostingUpload = async (event) => {
    const file = event.target.files[0];
    await handleFileUpload(file, 'jobPosting', {
      setError,
      setFile: setJobPostingFile
    });
  };

  const handleOptimizeClick = async () => {
    // Check if user has credits before proceeding
    const hasCredits = await useCredit();
    if (!hasCredits) {
      return;
    }

    const optimizedContent = await handleOptimization(
      resumeFile,
      jobPostingFile,
      {
        setError,
        setIsOptimizing: setIsLoading,
        setOptimizedContent
      }
    );

    if (optimizedContent) {
      const previewData = await handlePreviewAndDownload(
        optimizedContent,
        {
          setError,
          setPreviewUrl,
          setIsPreviewLoading
        }
      );
      setPreviewData(previewData);
    }
  };

  const handleDownloadClick = async () => {
    await handleDownload(previewData, setError);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Upload Your Resume</h1>
          <div className="text-sm">
            {creditsLoading ? (
              <span className="text-gray-500">Loading credits...</span>
            ) : (
              <span className={credits?.credits_remaining === 0 ? 'text-red-600' : 'text-blue-600'}>
                {credits?.credits_remaining || 0} credit{credits?.credits_remaining !== 1 ? 's' : ''} remaining
              </span>
            )}
          </div>
        </div>
        
        {/* Resume Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Resume {getFileTypeMessage('resume')}
          </label>
          <input
            type="file"
            accept={allowedFileTypes.join(',')}
            onChange={handleResumeUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {resumeFile && (
            <div className="mt-2 text-sm text-green-600 flex items-center">
              <Check className="w-4 h-4 mr-1" />
              {resumeFile.name}
            </div>
          )}
        </div>

        {/* Job Posting Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Job Posting {getFileTypeMessage('jobPosting')}
          </label>
          <input
            type="file"
            accept={allowedFileTypes.join(',')}
            onChange={handleJobPostingUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {jobPostingFile && (
            <div className="mt-2 text-sm text-green-600 flex items-center">
              <Check className="w-4 h-4 mr-1" />
              {jobPostingFile.name}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Optimize Button */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handleOptimizeClick}
            disabled={!resumeFile || !jobPostingFile || isLoading || credits?.credits_remaining === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Optimizing...' : 'Optimize Resume'}
          </Button>

          {credits?.credits_remaining === 0 && (
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              Get More Credits
            </Button>
          )}
        </div>

        {/* Preview Section */}
        {previewUrl && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Preview</h2>
              <Button
                onClick={handleDownloadClick}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Download
              </Button>
            </div>
            <ResumePreview previewUrl={previewUrl} isLoading={isPreviewLoading} />
          </div>
        )}
      </Card>
    </div>
  );
}
