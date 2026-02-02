/**
 * Data Initializer Component
 * 
 * Loads projects, boards, and tasks data from the API on app initialization
 * Provides loading states and error handling
 */

import { authService } from '@/core/api/services/auth.service';
import { useAuth } from '@/core/auth/AuthContext';
import { useProjectStore } from '@/core/stores/projectStore';
import { useEffect, useRef, useState } from 'react';

interface DataInitializerProps {
  children: React.ReactNode;
}

export function DataInitializer({ children }: DataInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const loadAllData = useProjectStore((state) => state.loadAllData);
  const isLoading = useProjectStore((state) => state.isLoading);
  const initializedUserRef = useRef<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      if (!user) {
        console.log('[DataInitializer] No user logged in, skipping data load');
        setIsInitialized(true);
        initializedUserRef.current = null;
        return;
      }

      // Prevent duplicate initialization for the same user
      if (initializedUserRef.current === user.id) {
        return;
      }

      console.log('[DataInitializer] ========== LOADING USER DATA ==========');
      console.log('[DataInitializer] User Email:', user.email);
      console.log('[DataInitializer] User ID:', user.id);
      console.log('[DataInitializer] User Role:', user.role);
      console.log('[DataInitializer] Current Token:', authService.getAccessToken());
      
      // Mark as initialized immediately to allow app to render
      setIsInitialized(true);
      initializedUserRef.current = user.id;
      
      // Load data in background (non-blocking)
      try {
        await loadAllData();
        console.log('[DataInitializer] Data loaded successfully');
      } catch (err: any) {
        console.error('[DataInitializer] Failed to load data:', err);
        setError(err.message || 'Failed to load data');
        // Reset ref on error to allow retry if needed (though infinite retry on error is also bad, maybe better to leave it set)
        // initializedUserRef.current = null; 
      }
    };

    initializeData();
  }, [user?.id, authLoading]); // Re-run when user changes or auth loading changes

  // Show minimal loading state only for auth, allow app to render while data loads
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E0E1F] via-[#1A1A2E] to-[#0E0E1F] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C6FF] mb-2"></div>
          <p className="text-white text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Render app immediately, data will load in background
  // Show minimal loading indicator only if needed, avoid blocking LCP
  return (
    <>
      {/* Only show loading indicator after 3 seconds to avoid LCP impact */}
      {isLoading && isInitialized && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 opacity-75">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
          <span className="text-xs">Syncing...</span>
        </div>
      )}
      {children}
    </>
  );
}
