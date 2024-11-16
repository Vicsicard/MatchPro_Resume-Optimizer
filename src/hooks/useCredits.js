import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

      const { data, error: fetchError } = await supabase
        .from('user_credits')
        .select('credits_remaining, total_optimizations')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setCredits(data);
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

      // First check if user has credits
      const { data: currentCredits } = await supabase
        .from('user_credits')
        .select('credits_remaining')
        .eq('user_id', userId)
        .single();

      if (!currentCredits || currentCredits.credits_remaining < 1) {
        navigate('/pricing', { 
          state: { 
            message: 'You have used all your credits. Purchase more credits to continue optimizing resumes.' 
          }
        });
        return false;
      }

      // Update credits and total optimizations
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          credits_remaining: currentCredits.credits_remaining - 1,
          total_optimizations: (currentCredits.total_optimizations || 0) + 1
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Refresh credits
      await fetchCredits();
      return true;
    } catch (err) {
      console.error('Error using credit:', err);
      setError(err.message);
      return false;
    }
  };

  return {
    credits,
    loading,
    error,
    useCredit,
    fetchCredits
  };
}
