/**
 * App Initializer
 * Handles Supabase auth initialization
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/core/stores/core/index';

interface AppInitializerProps {
  children: React.ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { loading, initialized, initialize } = useAuthStore();
  const [initError, setInitError] = useState(false);

  useEffect(() => {
    // Initialize auth if not already done
    if (!initialized && !loading) {
      initialize().catch((error) => {
        console.error('App initialization error:', error);
        setInitError(true);
      });
    }
  }, [initialized, loading, initialize]);

  // Show loading screen while initializing
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-[#0E0E1F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00C6FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Flowversal...</h2>
          <p className="text-[#CFCFE8]">Initializing your workspace</p>
        </div>
      </div>
    );
  }

  // Show error if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen bg-[#0E0E1F] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1A1A2E] border border-red-500/20 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Initialization Failed</h2>
          <p className="text-[#CFCFE8] mb-6">
            Unable to connect to the database. Please check your configuration.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
