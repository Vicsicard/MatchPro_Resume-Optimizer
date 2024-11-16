import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';

const TestSupabase = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [authStatus, setAuthStatus] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Test basic connection
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        setConnectionStatus('Successfully connected to Supabase!');
        console.log('Connection test:', {
          hasSession: !!data?.session,
          user: data?.session?.user?.email || 'no user',
          url: supabase.supabaseUrl
        });
        
      } catch (err) {
        console.error('Connection error:', err);
        setError(err.message);
        setConnectionStatus('Failed to connect to Supabase');
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting signup...', {
        email: testEmail,
        passwordLength: testPassword.length
      });

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });

      if (error) throw error;
      
      console.log('Signup response:', data);
      
      if (data?.user) {
        setAuthStatus(data);
        alert('Success! Check your email for confirmation link.');
      } else {
        alert('Something went wrong. Please try again.');
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) throw error;
      
      console.log('Sign in successful:', data);
      setAuthStatus(data);
      alert('Successfully signed in!');
    } catch (error) {
      console.error('Signin error:', error);
      setError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      {/* Debug Information */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="font-bold">Debug Information:</h2>
        <p>Status: {loading ? 'Loading...' : connectionStatus || 'Ready'}</p>
        <p>URL: {supabase.supabaseUrl}</p>
        <p>API Key Format: {supabase.supabaseKey?.startsWith('eyJ') ? 'Legacy JWT' : 'New Format'}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
      </div>

      {/* Auth Form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-2">Email:</label>
          <input
            id="email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block mb-2">Password:</label>
          <input
            id="password"
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
            minLength={6}
          />
        </div>

        <div className="space-x-4">
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
          
          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </div>
      </form>

      {/* Auth Status */}
      {authStatus && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Auth Status:</h2>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestSupabase;
