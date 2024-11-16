import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';

const isDevelopment = import.meta.env.DEV;

export function useCredits() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (isDevelopment) {
        // Get credits from localStorage in development
        const devCredits = localStorage.getItem('dev_credits');
        if (devCredits) {
          setCredits(JSON.parse(devCredits));
        } else {
          // Initialize dev credits if not found
          const initialCredits = {
            credits_remaining: 1,
            total_optimizations: 0
          };
          localStorage.setItem('dev_credits', JSON.stringify(initialCredits));
          setCredits(initialCredits);
        }
      } else {
        // Get credits from Supabase in production
        const { data, error: fetchError } = await supabase
          .from('user_credits')
          .select('credits_remaining, total_optimizations')
          .eq('user_id', userId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setCredits(data);
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const useCredit = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (isDevelopment) {
        // Update credits in localStorage for development
        const devCredits = JSON.parse(localStorage.getItem('dev_credits'));
        if (!devCredits || devCredits.credits_remaining <= 0) {
          throw new Error('No credits remaining');
        }

        const updatedCredits = {
          credits_remaining: devCredits.credits_remaining - 1,
          total_optimizations: devCredits.total_optimizations + 1
        };
        localStorage.setItem('dev_credits', JSON.stringify(updatedCredits));
        setCredits(updatedCredits);
        return true;
      } else {
        // Update credits in Supabase for production
        const { data: currentCredits, error: fetchError } = await supabase
          .from('user_credits')
          .select('credits_remaining')
          .eq('user_id', userId)
          .single();

        if (fetchError) throw fetchError;
        if (!currentCredits || currentCredits.credits_remaining <= 0) {
          throw new Error('No credits remaining');
        }

        const { error: updateError } = await supabase
          .from('user_credits')
          .update({
            credits_remaining: currentCredits.credits_remaining - 1,
            total_optimizations: currentCredits.total_optimizations + 1
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;

        // Refresh credits after update
        await fetchCredits();
        return true;
      }
    } catch (err) {
      console.error('Error using credit:', err);
      if (err.message === 'No credits remaining') {
        navigate('/pricing');
      }
      return false;
    }
  };

  return { credits, loading, error, useCredit, fetchCredits };
}
