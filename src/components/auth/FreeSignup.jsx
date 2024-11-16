import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import bcryptjs from 'bcryptjs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const isDevelopment = import.meta.env.DEV;

// Development-only auth simulation
const devAuth = {
  signUp: async (email, password) => {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userId = 'dev-' + Date.now();
    
    // Store dev credentials
    localStorage.setItem('dev_user', JSON.stringify({
      id: userId,
      email,
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString()
    }));

    // Store dev credits
    localStorage.setItem('dev_credits', JSON.stringify({
      credits_remaining: 1,
      total_optimizations: 0
    }));
    
    localStorage.setItem('user_id', userId);
    
    return { data: { user: { id: userId, email } }, error: null };
  }
};

export default function FreeSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const initializeUserCredits = async (userId) => {
    try {
      const { error } = await supabase
        .from('user_credits')
        .insert([
          {
            user_id: userId,
            credits_remaining: 1,
            total_optimizations: 0
          }
        ]);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error initializing credits:', err);
      // Continue anyway since this is just credits initialization
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let signUpResult;
      
      if (isDevelopment) {
        // Use dev auth in development
        signUpResult = await devAuth.signUp(email, password);
        console.log('Development mode: Bypassing Supabase auth');
      } else {
        // First create the user in auth_users table
        const hashedPassword = await bcryptjs.hash(password, 10);
        const { error: userError } = await supabase
          .from('auth_users')
          .insert([{
            email: email.toLowerCase(),
            password_hash: hashedPassword,
            is_password_set: true,
            is_verified: false
          }]);
        
        if (userError) throw userError;

        // Then sign up with Supabase auth
        signUpResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://your-production-url.com/auth-callback'
          }
        });

        if (signUpResult.error) throw signUpResult.error;

        if (signUpResult.data?.user?.id) {
          await initializeUserCredits(signUpResult.data.user.id);
        }
      }

      if (isDevelopment) {
        navigate('/dashboard', { 
          state: { message: 'Development mode: Email verification bypassed' } 
        });
      } else {
        setError('Please check your email for the verification link');
      }
      
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Create your account
          </h2>
          {isDevelopment && (
            <p className="mt-2 text-sm text-muted-foreground">
              Development Mode - Email verification bypassed
            </p>
          )}
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full"
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
