import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          setStatus('error');
          setError('No session ID found');
          return;
        }

        // Log the session ID for debugging
        console.log('Session ID:', sessionId);

        const response = await fetch('http://localhost:3000/api/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setError(data.message || 'Payment verification failed');
          console.error('Verification failed:', data);
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setStatus('error');
        setError('Network error - please try again');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleRetry = () => {
    setStatus('loading');
    setError('');
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

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
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Payment Verification Failed</h2>
          <p className="mt-2 text-gray-600">{error || 'Something went wrong. Please try again.'}</p>
          <div className="mt-6 space-y-2">
            <Button onClick={handleRetry} className="w-full">
              Retry Verification
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-green-600 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Payment Successful!</h2>
        <p className="mt-2 text-gray-600">
          Thank you for your purchase. You now have access to all premium features.
        </p>
        <div className="mt-6">
          <Button onClick={handleGoHome} className="w-full">
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}