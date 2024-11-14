import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Add optimization credits to a user's account
 * @param {string} userId - The user's ID
 * @param {number} credits - Number of credits to add (default: 10)
 */
export async function addOptimizationCredits(userId, credits = 10) {
  try {
    // Check if user already has a record
    const { data: existingRecord } = await supabase
      .from('user_optimizations')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingRecord) {
      // Update existing record
      const { error } = await supabase
        .from('user_optimizations')
        .update({
          remaining_optimizations: existingRecord.remaining_optimizations + credits,
          total_optimizations: existingRecord.total_optimizations + credits,
          last_purchase_date: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Create new record
      const { error } = await supabase
        .from('user_optimizations')
        .insert([{
          user_id: userId,
          remaining_optimizations: credits,
          total_optimizations: credits,
          last_purchase_date: new Date().toISOString()
        }]);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding optimization credits:', error);
    throw error;
  }
}

/**
 * Check if a user has remaining optimization credits
 * @param {string} userId - The user's ID
 * @returns {Promise<boolean>} - Whether the user has credits remaining
 */
export async function hasRemainingOptimizations(userId) {
  try {
    const { data, error } = await supabase
      .from('user_optimizations')
      .select('remaining_optimizations')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return data && data.remaining_optimizations > 0;
  } catch (error) {
    console.error('Error checking remaining optimizations:', error);
    throw error;
  }
}

/**
 * Use one optimization credit
 * @param {string} userId - The user's ID
 * @returns {Promise<{remaining: number}>} - Number of remaining credits
 */
export async function useOptimization(userId) {
  try {
    // Get current remaining optimizations
    const { data: current } = await supabase
      .from('user_optimizations')
      .select('remaining_optimizations')
      .eq('user_id', userId)
      .single();

    if (!current || current.remaining_optimizations <= 0) {
      throw new Error('No remaining optimizations');
    }

    // Update the record
    const { data, error } = await supabase
      .from('user_optimizations')
      .update({
        remaining_optimizations: current.remaining_optimizations - 1
      })
      .eq('user_id', userId)
      .select('remaining_optimizations')
      .single();

    if (error) throw error;

    return { remaining: data.remaining_optimizations };
  } catch (error) {
    console.error('Error using optimization:', error);
    throw error;
  }
}

/**
 * Get user's optimization stats
 * @param {string} userId - The user's ID
 */
export async function getOptimizationStats(userId) {
  try {
    const { data, error } = await supabase
      .from('user_optimizations')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return data || {
      remaining_optimizations: 0,
      total_optimizations: 0,
      last_purchase_date: null
    };
  } catch (error) {
    console.error('Error getting optimization stats:', error);
    throw error;
  }
}
