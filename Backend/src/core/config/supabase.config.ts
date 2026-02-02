import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Supabase client for auth verification (uses anon key)
export const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Supabase admin client for server-side operations (uses service role key)
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Storage client
export const supabaseStorage = supabaseAdmin.storage;

