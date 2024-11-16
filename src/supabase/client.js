import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './config';

const isDevelopment = import.meta.env.DEV;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce',
    debug: isDevelopment,
    redirectTo: isDevelopment 
      ? 'http://localhost:5174/auth-callback'
      : 'https://your-production-url.com/auth-callback',
    sessionTime: 30 * 24 * 60 * 60,
    retryAttempts: isDevelopment ? 5 : 2,
    retryInterval: isDevelopment ? 1000 : 3000,
    timeout: 30000
  },
  global: {
    headers: {
      'x-client-info': 'matchpro-web@1.0.0',
    }
  },
  db: {
    schema: 'public'
  }
});

// Development mode handler
if (isDevelopment) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth event in development:', event, session?.user?.email);
    
    if (event === 'SIGNED_UP' && session?.user) {
      try {
        // Auto-confirm email in development
        await supabase.auth.updateUser({
          data: { 
            email_confirmed: true,
            auth_method: 'development'
          }
        });
        
        // Automatically sign in after signup
        await supabase.auth.signInWithPassword({
          email: session.user.email,
          password: localStorage.getItem('tempPass') // We'll store this temporarily during signup
        });
        
        // Clear any temporary data
        localStorage.removeItem('tempPass');
      } catch (error) {
        console.warn('Development mode auth error:', error);
      }
    }
  });
}

// Session activity tracking
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    localStorage.setItem('matchpro-last-active', Date.now().toString());
  }
});

// Track signup attempts with more sophisticated rate limiting
const signupAttempts = new Map();
const SIGNUP_COOLDOWN = isDevelopment ? 0 : 60000; // 60 seconds in production
const MAX_ATTEMPTS_PER_HOUR = isDevelopment ? Infinity : 30; // Match Supabase's default rate limit

export const canAttemptSignup = (email) => {
  if (isDevelopment) return true;
  
  const now = Date.now();
  const attempts = signupAttempts.get(email) || { lastAttempt: 0, count: 0, resetTime: now };
  
  // Reset counter if an hour has passed
  if (now - attempts.resetTime >= 3600000) {
    attempts.count = 0;
    attempts.resetTime = now;
  }
  
  // Check cooldown and hourly limit
  if (now - attempts.lastAttempt < SIGNUP_COOLDOWN || attempts.count >= MAX_ATTEMPTS_PER_HOUR) {
    return false;
  }
  
  // Update attempts
  attempts.lastAttempt = now;
  attempts.count++;
  signupAttempts.set(email, attempts);
  
  return true;
};

// Health check with improved error handling
export const checkConnection = async () => {
  try {
    const { error } = await supabase.from('auth').select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.warn('Connection check warning:', error.message);
    return true; // Don't fail on error
  }
};

// Development mode helper
export const isDevelopmentMode = () => isDevelopment;

// Session helper
export const getLastActive = () => {
  const lastActive = localStorage.getItem('matchpro-last-active');
  return lastActive ? parseInt(lastActive, 10) : null;
};

export default supabase;