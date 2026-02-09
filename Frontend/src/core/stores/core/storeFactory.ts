/**
 * Store Factory
 * Returns the appropriate store based on environment configuration
 */
// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
// Log which mode we're in
if (isSupabaseConfigured) {
} else {
}
// For now, we'll use localStorage mode by default
// When you're ready for production:
// 1. Install: npm install @supabase/supabase-js
// 2. Create .env file with your Supabase credentials
// 3. Run database schema in Supabase
// 4. Restart the dev server
// The stores will automatically switch to Supabase mode!
export const MODE = isSupabaseConfigured ? 'production' : 'development';
