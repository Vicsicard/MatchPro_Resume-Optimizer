import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session data if there is an active session
    const session = supabase.auth.getSession();
    setUser(session?.user ?? null);
    setLoading(false);

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    signIn: (options) => supabase.auth.signIn(options),
    signOut: () => supabase.auth.signOut(),
    signUp: (options) => supabase.auth.signUp(options),
  };
}
