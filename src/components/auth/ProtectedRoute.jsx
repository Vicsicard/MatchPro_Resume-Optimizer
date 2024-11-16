import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

const isDevelopment = import.meta.env.DEV;

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let isAuthenticated = false;

        if (isDevelopment) {
          // Check dev auth in development
          const devUser = localStorage.getItem('dev_user');
          isAuthenticated = !!devUser;
        } else {
          // Check Supabase auth in production
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          isAuthenticated = !!session;
        }

        if (!isAuthenticated) {
          navigate('/auth', { 
            state: { 
              returnTo: window.location.pathname 
            }
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/auth');
      }
    };

    checkAuth();
  }, [navigate]);

  return children;
}
