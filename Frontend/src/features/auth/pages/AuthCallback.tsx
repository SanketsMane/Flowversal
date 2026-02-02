import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      // Let Supabase finalize the OAuth/hash-based login and then route home
      await supabase.auth.getSession();
      navigate('/', { replace: true });
    };
    handle();
  }, [navigate]);

  return null;
}
/**
 * Auth Callback Page
 * Handles OAuth redirects (Google login)
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';
import { useAuthStore } from '@/core/stores/core/authStore.supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {
          // Initialize auth store with new session
          await initialize();
          
          // Redirect to dashboard
          navigate('/');
        } else {
          // No session, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, initialize]);

  return (
    <div className="min-h-screen bg-[#0E0E1F] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#00C6FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Completing Sign In...</h2>
        <p className="text-[#CFCFE8]">Please wait while we log you in</p>
      </div>
    </div>
  );
}
