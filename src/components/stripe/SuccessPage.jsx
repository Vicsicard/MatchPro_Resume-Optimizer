import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          setStatus('error');
          return;
        }

        // Log the session ID for debugging
        console.log('Session ID:', sessionId);

        const response = await fetch('http://localhost:5000/api/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          console.error('Verification failed:', await response.json());
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold">Verifying Payment...</h2>
          <p className="mt-2 text-gray-600">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Verification Failed</h2>
          <p className="mt-2 text-gray-600">
            We couldn't verify your payment. Please contact support if you believe this is an error.
          </p>
          <div className="mt-6 space-y-2">
            <Button
              onClick={() => navigate('/pricing')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Return to Pricing
            </Button>
            <Button
              onClick={() => navigate('/contact')}
              variant="outline"
              className="w-full border-gray-300"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
        <p className="mt-2 text-gray-600">
          Thank you for subscribing to MatchPro Resume. Let's get started on optimizing your resume!
        </p>
        <div className="mt-6">
          <Button
            onClick={() => navigate('/upload')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Optimizing Your Resume
          </Button>
        </div>
      </div>
    </div>
  );
}