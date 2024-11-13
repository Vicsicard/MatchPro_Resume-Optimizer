import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './config';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;