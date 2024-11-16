import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create a fresh Supabase client instance
const supabase = createClient(
  'https://flayyfibpsxcobykocsw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYXl5ZmlicHN4Y29ieWtvY3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzOTgxOTUsImV4cCI6MjA0NTk3NDE5NX0.9Y9BvjdjXDvcQbBweiGMeJtTurtO9T1mNgKcScr3IaU'
);

const SimpleAuthTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage('Attempting signup...');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'http://localhost:5174/auth-callback'
        }
      });

      if (error) throw error;
      
      setMessage('Signup successful! Check email for confirmation.');
      console.log('Signup successful:', data);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Full error:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Simple Supabase Auth Test</h2>
      <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '8px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px', cursor: 'pointer' }}>
          Sign Up
        </button>
      </form>
      <div style={{ marginTop: '20px' }}>
        <strong>Status:</strong> {message}
      </div>
    </div>
  );
};

export default SimpleAuthTest;
