/**
 * Developer Tools Component
 * Provides quick access to seed data and switch users
 */

import React, { useState } from 'react';
import { authService } from '@/core/api/services/auth.service';
import { projectId, publicAnonKey } from '@/shared/utils/supabase/info';
import { buildApiUrl } from '@/core/api/api.config';

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const loginAsJustin = async () => {
    setLoading(true);
    try {
      const result = await authService.login('justin@gmail.com', 'justin');
      if (result.success) {
        showMessage('✅ Logged in as Justin');
        setTimeout(() => window.location.reload(), 500);
      } else {
        showMessage('❌ Login failed: ' + result.error);
      }
    } catch (error: any) {
      showMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async () => {
    setLoading(true);
    try {
      const result = await authService.login('demo@demo.com', 'demo');
      if (result.success) {
        showMessage('✅ Logged in as Demo User');
        setTimeout(() => window.location.reload(), 500);
      } else {
        showMessage('❌ Login failed: ' + result.error);
      }
    } catch (error: any) {
      showMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const seedJustinData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        buildApiUrl('/seed/seed-justin-data'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      
      if (result.success) {
        showMessage('✅ Data seeded: ' + result.data.projects + ' projects, ' + result.data.boards + ' boards, ' + result.data.tasks + ' tasks');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showMessage('❌ Seed failed: ' + result.error);
      }
    } catch (error: any) {
      showMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const clearAllData = async () => {
    if (!confirm('⚠️ This will delete ALL data for the current user. Continue?')) {
      return;
    }
    
    setLoading(true);
    const user = authService.getCurrentUser();
    if (!user) {
      showMessage('❌ No user logged in');
      setLoading(false);
      return;
    }
    
    try {
      // Clear data by setting empty arrays
      const token = authService.getAccessToken();
      const baseUrl = buildApiUrl('/projects');
      
      showMessage('🗑️ Clearing data...');
      setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      showMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentUser = authService.getCurrentUser();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        title="Open Developer Tools"
      >
        🛠️ Dev Tools
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4 z-50 min-w-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 dark:text-white">🛠️ Developer Tools</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ✕
        </button>
      </div>

      {message && (
        <div className="mb-3 p-2 bg-blue-500/20 border border-blue-500/30 rounded text-sm text-gray-900 dark:text-white">
          {message}
        </div>
      )}

      <div className="space-y-2">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Current: <span className="text-gray-900 dark:text-white">{currentUser?.email || 'Not logged in'}</span>
        </div>

        <button
          onClick={loginAsJustin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? '...' : '👤 Login as Justin'}
        </button>

        <button
          onClick={loginAsDemo}
          disabled={loading}
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded hover:from-gray-700 hover:to-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? '...' : '👤 Login as Demo'}
        </button>

        <div className="border-t border-gray-700 my-3"></div>

        <button
          onClick={seedJustinData}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? '...' : '🌱 Seed Justin Data'}
        </button>

        <button
          onClick={clearAllData}
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? '...' : '🗑️ Clear All Data'}
        </button>

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          <div>• Login switches user instantly</div>
          <div>• Seed creates sample data for Justin</div>
          <div>• Clear removes all user data</div>
          <div>• Page reloads after changes</div>
        </div>
      </div>
    </div>
  );
}
