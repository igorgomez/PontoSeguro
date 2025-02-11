import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection
supabase
  .from('users')
  .select('*')
  .then(({ data, error }) => {
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
    } else {
      console.log('Connection to Supabase successful:', data);
    }
  });