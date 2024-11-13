import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { 
  handleFileUpload 
} from './TempUploadHandlers';
import { 
  handleOptimization, 
  handleDownload 
} from './uploadhandlers';

export default function UploadPage() {
  // State management
  const [resumeFile, setResumeFile] = useState(null);
  const [jobPostingFile, setJobPostingFile] = useState(null);
  const [extractedText, setExtractedText] = useState({ resume: '', jobPosting: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState('');
  const [error, setError] = useState('');

  // File change handler
  const onFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      await handleFileUpload(file, type, {
        setIsLoading,
        setError,
        setExtractedText,
        setResumeFile,
        setJobPostingFile,
        setShowVerification
      });
    }
  };

  // Submit handler
  const onSubmit = async () => {
    await handleOptimization(
      resumeFile,
      jobPostingFile,
      extractedText,
      {
        setIsLoading,
        setError,
        setOptimizedContent,
        setShowResults,
        setShowVerification
      }
    );
  };

  // Download handler
  const onDownload = () => {
    handleDownload(optimizedContent, setError);
  };

  return (
    <div className="min-h-screen bg-blue-600">
      <div className="container mx-auto px-4 py-12 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Ready to boost your career?</h1>
        <h2 className="text-3xl font-bold mb-4">Start optimizing your resume today.</h2>
        <p className="mb-8">
          Join thousands of successful job seekers who have improved their chances with MatchPro Resume.
     
        </p>

        <div className="bg-white rounded-lg p-8 max-w-2xl mx-auto text-left">
          {!showVerification && !showResults && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">MatchPro Resume</h2>
              <p className="text-gray-600 mb-6">
                Upload your resume and job posting to get a tailored resume
              </p>

              <div>
                <Label className="text-gray-700">Resume</Label>
                <div className="mt-1">
                  <Input
                    type="file"
                    onChange={(e) => onFileChange(e, 'resume')}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="w-full"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Upload PDF, Word, or image file (PNG, JPEG)
                  </p>
                  {resumeFile && (
                    <p className="mt-1 text-sm text-green-600">
                      Resume uploaded: {resumeFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-gray-700">Job Posting</Label>
                <div className="mt-1">
                  <Input
                    type="file"
                    onChange={(e) => onFileChange(e, 'jobPosting')}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    className="w-full"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Upload PDF, Word, text, or image file (PNG, JPEG)
                  </p>
                  {jobPostingFile && (
                    <p className="mt-1 text-sm text-green-600">
                      Job posting uploaded: {jobPostingFile.name}
                    </p>
                  )}
                </div>
              </div>

              <Button onClick={onSubmit} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Optimize Resume'}
              </Button>
            </div>
          )}

          {showVerification && (
            <>
              <Card className="p-4 mt-6">
                <Label className="text-gray-700 mb-2">Resume Content</Label>
                <textarea
                  className="w-full h-40 p-2 border rounded text-gray-700"
                  value={extractedText.resume}
                  onChange={(e) => setExtractedText((prev) => ({
                    ...prev,
                    resume: e.target.value,
                  }))}
                />
              </Card>

              <Card className="p-4 mt-6">
                <Label className="text-gray-700 mb-2">Job Posting Content</Label>
                <textarea
                  className="w-full h-40 p-2 border rounded text-gray-700"
                  value={extractedText.jobPosting}
                  onChange={(e) => setExtractedText((prev) => ({
                    ...prev,
                    jobPosting: e.target.value,
                  }))}
                />
              </Card>

              <Button onClick={onSubmit} className="mt-4">
                Confirm & Optimize
              </Button>
            </>
          )}

          {showResults && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Optimized Resume</h2>
              <p className="text-gray-600 mb-6">Your resume has been optimized for the job posting!</p>
              <div className="bg-gray-100 p-4 rounded text-gray-700 mb-4">
                {optimizedContent}
              </div>
              <Button onClick={onDownload}>Download Optimized Resume</Button>
            </div>
          )}

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}
