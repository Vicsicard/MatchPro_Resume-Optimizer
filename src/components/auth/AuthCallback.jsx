import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../../supabase/client';

export default function AuthCallback() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token_hash and type from URL
        const params = new URLSearchParams(location.search);
        const token_hash = params.get('token_hash');
        const type = params.get('type');
        const next = params.get('next') ?? '/dashboard';

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
          });

          if (error) throw error;

          // Redirect user to specified redirect URL or dashboard
          navigate(next);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setError(error.message);
        // On error, redirect to auth page with error message
        navigate('/auth', { 
          state: { 
            error: 'Email verification failed. Please try again.' 
          }
        });
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4 py-8 text-center">
        {error ? (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Verifying your email...
            </h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
