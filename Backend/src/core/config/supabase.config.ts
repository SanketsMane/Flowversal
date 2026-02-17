import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// DISABLED: Supabase integration (using Neon PostgreSQL instead)
// Author: Sanket - Made Supabase optional to support Neon-only deployments

// Create mock/null clients when Supabase is not configured
const createMockClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
    signUp: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
    signInWithPassword: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
  },
  from: () => ({
    select: () => ({ data: null, error: new Error('Supabase not configured') }),
    insert: () => ({ data: null, error: new Error('Supabase not configured') }),
    update: () => ({ data: null, error: new Error('Supabase not configured') }),
    delete: () => ({ data: null, error: new Error('Supabase not configured') }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
      download: async () => ({ data: null, error: new Error('Supabase not configured') }),
      remove: async () => ({ data: null, error: new Error('Supabase not configured') }),
    }),
  },
});

// Only create real Supabase clients if URL is provided
export const supabaseClient = env.SUPABASE_URL && env.SUPABASE_ANON_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  : createMockClient() as any;

export const supabaseAdmin = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : createMockClient() as any;

export const supabaseStorage = supabaseAdmin;
