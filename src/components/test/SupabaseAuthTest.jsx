import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';

const SupabaseAuthTest = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Test connection on component mount
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setStatus(`Connected successfully. Session: ${data?.session ? 'Active' : 'None'}`);
        console.log('Connection successful');
      } catch (error) {
        setStatus(`Connection error: ${error.message}`);
        console.error('Connection error:', error);
      }
    };

    testConnection();
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      setStatus('Attempting signup...');
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: 'http://localhost:5174/auth-callback'
        }
      });

      if (error) throw error;
      
      setStatus('Signup successful! Check email for confirmation.');
      console.log('Signup successful:', data);
      
    } catch (error) {
      setStatus(`Signup error: ${error.message}`);
      console.error('Signup error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Supabase Auth Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Status:</strong> {status}
      </div>

      <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Email"
          required
          style={{ padding: '8px' }}
        />
        
        <input
          type="password"
          value={testPassword}
          onChange={(e) => setTestPassword(e.target.value)}
          placeholder="Password"
          required
          style={{ padding: '8px' }}
        />
        
        <button type="submit" style={{ padding: '8px', cursor: 'pointer' }}>
          Test Signup
        </button>
      </form>
    </div>
  );
};

export default SupabaseAuthTest;
