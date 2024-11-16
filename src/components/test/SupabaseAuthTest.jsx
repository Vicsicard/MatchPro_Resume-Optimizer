import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';

const SupabaseAuthTest = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setUser(session?.user ?? null);
      setStatus(session ? 'Authenticated' : 'Not authenticated');
    } catch (error) {
      console.error('Session check error:', error);
      setStatus('Error checking session');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!testEmail || !testPassword) {
      setStatus('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setStatus('Signing up...');
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: window.location.origin + '/auth-callback',
          data: {
            signup_date: new Date().toISOString(),
          }
        }
      });

      if (error) throw error;
      
      setStatus('Please check your email for the confirmation link!');
      console.log('Signup successful:', data);
      
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!testEmail || !testPassword) {
      setStatus('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setStatus('Signing in...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) throw error;
      
      setStatus('Signed in successfully!');
      setUser(data.user);
      
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setStatus('Signed out successfully');
      setUser(null);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Authentication Test</h2>
      <div className="status-box">
        <p>Status: {status}</p>
        {user && (
          <div className="user-info">
            <p>User: {user.email}</p>
            <p>ID: {user.id}</p>
            <button onClick={handleSignOut} disabled={loading}>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {!user && (
        <form onSubmit={handleSignUp} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            disabled={loading}
          />
          <div className="button-group">
            <button type="submit" disabled={loading}>
              Sign Up
            </button>
            <button type="button" onClick={handleSignIn} disabled={loading}>
              Sign In
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SupabaseAuthTest;
