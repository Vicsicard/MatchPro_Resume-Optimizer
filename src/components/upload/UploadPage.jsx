import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { allowedFileTypes, handleFileUpload, handleOptimization, handleDownload, getFileTypeMessage } from './TempUploadHandlers';
import { Check } from 'lucide-react';

export default function UploadPage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobPostingFile, setJobPostingFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedText, setExtractedText] = useState({ resume: '', jobPosting: '' });
  const [optimizedContent, setOptimizedContent] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!allowedFileTypes[type].includes(file.type)) {
      setError(`Invalid file type. ${getFileTypeMessage(type)}`);
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setError('');
    const states = {
      setIsLoading,
      setError,
      setExtractedText,
      setResumeFile,
      setJobPostingFile,
    };

    await handleFileUpload(file, type, states);
  };

  const handleOptimizeClick = async () => {
    const states = {
      setIsLoading,
      setError,
      setOptimizedContent,
      setShowResults,
    };

    await handleOptimization(resumeFile, jobPostingFile, extractedText, states);
  };

  const handleDownloadClick = () => {
    handleDownload(optimizedContent, setError);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Banner */}
      <div className="bg-blue-50 py-2 px-4 text-center">
        <span className="inline-flex items-center">
          🎉 Ready to optimize your resume with AI? Let's get started!
        </span>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">
          Resume Optimizer
        </h1>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Upload your resume and job posting below to get AI-powered optimization suggestions
        </p>

        {/* File Upload Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
          {/* Resume Upload */}
          <Card className="p-6 border border-gray-200 hover:border-blue-200 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload Resume</h2>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, 'resume')}
              accept={allowedFileTypes.resume.join(',')}
              className="mb-4 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {resumeFile && (
              <p className="text-sm text-gray-600 flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Selected: {resumeFile.name}
              </p>
            )}
          </Card>

          {/* Job Posting Upload */}
          <Card className="p-6 border border-gray-200 hover:border-blue-200 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload Job Posting</h2>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, 'jobPosting')}
              accept={allowedFileTypes.jobPosting.join(',')}
              className="mb-4 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {jobPostingFile && (
              <p className="text-sm text-gray-600 flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Selected: {jobPostingFile.name}
              </p>
            )}
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-4 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Processing your files...</p>
          </div>
        )}

        {/* Optimize Button */}
        {resumeFile && jobPostingFile && !showResults && (
          <div className="text-center mb-12">
            <Button
              onClick={handleOptimizeClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Optimizing...' : 'Optimize Resume'}
            </Button>
          </div>
        )}

        {/* Results Section */}
        {showResults && optimizedContent && (
          <Card className="p-8 max-w-4xl mx-auto border border-gray-200 mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Your Optimized Resume</h2>
            <div className="mb-6">
              <p className="whitespace-pre-wrap text-gray-600 p-6 bg-gray-50 rounded-lg border border-gray-100">
                {optimizedContent}
              </p>
            </div>
            <div className="text-center">
              <Button
                onClick={handleDownloadClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Download Optimized Resume
              </Button>
            </div>
          </Card>
        )}

        {/* Features Section */}
        <div className="mt-20 bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">1. Upload Files</h3>
              <p className="text-gray-600">Upload your resume and job posting (accepts PDF, Word, Text, and Image files)</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-gray-600">Our AI analyzes and matches your qualifications to the job requirements</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">3. Get Results</h3>
              <p className="text-gray-600">Download your optimized resume ready for submission</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
