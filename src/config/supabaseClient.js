import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Validate configuration
if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase anonymous key. Please check your environment variables.');
}

// Create Supabase client with enhanced configuration
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'matchpro-auth',
    flowType: 'pkce',
    debug: import.meta.env.DEV,
    redirectTo: import.meta.env.DEV 
      ? 'http://localhost:5175/auth-callback'
      : 'https://your-production-url.com/auth-callback',
    // Skip email verification in development
    shouldCreateUser: () => import.meta.env.DEV,
    skipEmailVerification: import.meta.env.DEV
  },
  global: {
    headers: {
      'x-client-info': 'matchpro-web@1.0.0'
    }
  },
  db: {
    schema: 'public'
  }
});

// Add auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (import.meta.env.DEV) {
    console.log('Auth event:', event);
    if (session?.user) {
      console.log('User authenticated:', session.user.email);
    }
  }
  
  // Track session activity
  if (event === 'SIGNED_IN' && session?.user) {
    localStorage.setItem('matchpro-last-active', Date.now().toString());
  }
});

export { supabase };
