import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // First check if user exists
      const { data: user, error: fetchError } = await supabase
        .from('auth_users')
        .select('id, email, password_hash, is_password_set')
        .eq('email', email.toLowerCase())
        .single();

      if (fetchError) {
        throw new Error('Authentication failed');
      }

      if (!user) {
        throw new Error('No account found with this email. Please check your email or sign up for a new account.');
      }

      // If user hasn't set password yet (Stripe customer)
      if (!user.is_password_set) {
        setIsNewUser(true);
        return;
      }

      // Verify password hash for existing users
      const isValidPassword = await bcryptjs.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      // Update last login
      const { error: updateError } = await supabase
        .from('auth_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to update last login:', updateError);
      }

      // Store session info
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('user_email', user.email);
      localStorage.setItem('auth_token', btoa(user.id)); // Basic session token
      
      navigate(returnTo);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Hash the password
      const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

      // Update user with new password
      const { error: updateError } = await supabase
        .from('auth_users')
        .update({ 
          password_hash: hashedPassword,
          is_password_set: true,
          last_login: new Date().toISOString()
        })
        .eq('email', email.toLowerCase());

      if (updateError) {
        throw new Error('Failed to set password');
      }

      // Get user data
      const { data: user } = await supabase
        .from('auth_users')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .single();

      // Store session info
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('user_email', user.email);
      localStorage.setItem('auth_token', btoa(user.id)); // Basic session token
      
      navigate(returnTo);
    } catch (error) {
      console.error('Set password error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-2">
          {isNewUser ? 'Set Up Your Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-600 text-center mb-8">
          {isNewUser 
            ? 'Create a password to access your premium features'
            : 'Sign in to access your resume optimization tools'}
        </p>
        
        <form onSubmit={isNewUser ? handleSetPassword : handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              {!isNewUser && (
                <button 
                  type="button"
                  onClick={() => navigate('/reset-password')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              minLength={8}
              placeholder={isNewUser ? 'Create a password (min. 8 characters)' : 'Enter your password'}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isNewUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Confirm your password"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isNewUser ? 'Setting up...' : 'Signing in...') 
                : (isNewUser ? 'Create Password' : 'Sign in')}
            </button>

            {!isNewUser && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">New to MatchPro?</span>
                  </div>
                </div>

                <a
                  href="/pricing"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  View Pricing Plans
                </a>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}