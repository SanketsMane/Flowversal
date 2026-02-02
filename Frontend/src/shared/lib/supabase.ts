/**
 * Supabase Client Configuration
 * Singleton instance for production database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Validate Supabase credentials
const isValidSupabaseConfig = () => {
  // Check if we have a key
  const hasKey = publicAnonKey && publicAnonKey.length > 10;
  
  // If we have a key, check project ID
  if (hasKey) {
    return projectId && projectId.length >= 0; // Relaxed project ID check as well
  }
  
  return false;
};

// Get Supabase credentials
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Create Supabase client with error handling
let supabase: SupabaseClient;

if (isValidSupabaseConfig()) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
} else {
  console.warn('⚠️ Supabase not configured: Using placeholder client. Configure SUPABASE_URL and SUPABASE_ANON_KEY in environment variables.');
  
  // Create a mock client that won't make network requests
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: async () => {
        throw new Error('Supabase not configured. Please set up your Supabase project.');
      },
    },
  });
}

export { supabase };

// Type exports for database models
export interface Profile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowDB {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  data: any;
  created_at?: string;
  updated_at?: string;
}

export interface ExecutionDB {
  id: string;
  workflow_id: string;
  user_id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  result?: any;
  error?: string;
}