/* 
 * Supabase Configuration
 * 
 * IMPORTANT: This file contains placeholder values for development.
 * 
 * To configure Supabase:
 * 1. Create a Supabase project at https://supabase.com/dashboard
 * 2. Get your project URL and anon key from Project Settings > API
 * 3. Update these values below OR set environment variables:
 *    - VITE_SUPABASE_URL (full URL: https://xxxxx.supabase.co)
 *    - VITE_SUPABASE_ANON_KEY
 * 
 * Environment variables take precedence over these hardcoded values.
 */

// Extract project ID from URL if full URL is provided in env
const getProjectIdFromUrl = (url: string): string => {
  if (!url) return '';
  // Handle full URL format: https://xxxxx.supabase.co
  const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : url;
};

// Use environment variables if available, otherwise fall back to placeholders
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const projectId = envSupabaseUrl 
  ? getProjectIdFromUrl(envSupabaseUrl)
  : "PLACEHOLDER_PROJECT_ID"; // Invalid placeholder - will be caught by validation

export const publicAnonKey = envSupabaseKey || "PLACEHOLDER_ANON_KEY";