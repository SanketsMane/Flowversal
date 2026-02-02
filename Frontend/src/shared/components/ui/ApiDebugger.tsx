/**
 * API Debugger
 * Shows real-time API call information
 */

import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '@/shared/utils/supabase/info';
import { authService } from '@/core/api/services/auth.service';
import { buildApiUrl } from '@/core/api/api.config';

export function ApiDebugger() {
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const testEndpoint = async (path: string, method: string = 'GET') => {
    const fullUrl = buildApiUrl(`/projects${path}`);
    const token = authService.getAccessToken() || publicAnonKey;
    
    console.log('');
    console.log('='.repeat(80));
    console.log('🔍 API Test:', method, path);
    console.log('='.repeat(80));
    console.log('🔍 Full URL:', fullUrl);
    console.log('🔍 Token Type:', token === publicAnonKey ? 'ANON KEY' : 'ACCESS TOKEN');
    console.log('🔍 Token Value:', token);
    console.log('🔍 Token Length:', token?.length || 0);
    console.log('🔍 Authorization Header:', `Bearer ${token}`);
    console.log('-'.repeat(80));
    
    try {
      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📥 RESPONSE:');
      console.log('   Status:', response.status, response.statusText);
      console.log('   OK:', response.ok);
      console.log('   Headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('   Body (raw):', text.substring(0, 500));
      
      let json;
      try {
        json = JSON.parse(text);
        console.log('   Body (JSON):', JSON.stringify(json, null, 2));
      } catch (e) {
        json = { error: 'Failed to parse JSON', text: text.substring(0, 200) };
        console.error('   ❌ JSON Parse Error:', e);
      }
      console.log('='.repeat(80));
      console.log('');

      const result = {
        path,
        method,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        response: json,
        timestamp: new Date().toISOString(),
      };

      setResults(prev => [result, ...prev].slice(0, 10));
      return result;
    } catch (error: any) {
      console.error('🔍 Fetch Error:', error);
      const result = {
        path,
        method,
        status: 0,
        statusText: 'Network Error',
        ok: false,
        response: { error: error.message },
        timestamp: new Date().toISOString(),
      };
      setResults(prev => [result, ...prev].slice(0, 10));
      return result;
    }
  };

  const runAllTests = async () => {
    setResults([]);
    await testEndpoint('/test');
    await testEndpoint('/health');
    await testEndpoint('/');
    await testEndpoint('/boards');
    await testEndpoint('/tasks');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-gradient-to-r from-red-500 to-orange-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all z-50 text-sm"
        title="API Debugger"
      >
        🔍 API Debug
      </button>
    );
  }

  const currentUser = authService.getCurrentUser();
  const currentToken = authService.getAccessToken();

  return (
    <div className="fixed bottom-20 right-4 bg-white dark:bg-[#1A1A2E] border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4 z-50 w-[600px] max-h-[600px] overflow-auto">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-[#1A1A2E] pb-2">
        <h3 className="text-gray-900 dark:text-white font-bold">🔍 API Debugger</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs space-y-1">
        <div className="text-gray-900 dark:text-white">
          <strong>User:</strong> {currentUser?.email || 'Not logged in'}
        </div>
        <div className="text-gray-900 dark:text-white break-all">
          <strong>Token:</strong> {currentToken || 'None'}
        </div>
        <div className="text-gray-900 dark:text-white break-all">
          <strong>Base URL:</strong> {buildApiUrl('/projects')}
        </div>
      </div>

      <button
        onClick={runAllTests}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded hover:from-blue-700 hover:to-purple-700 transition-all mb-4"
      >
        🧪 Run All Tests
      </button>

      <div className="space-y-3">
        {results.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            Click "Run All Tests" to check API endpoints
          </div>
        ) : (
          results.map((result, i) => (
            <div
              key={i}
              className={`p-3 rounded border ${
                result.ok
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    result.ok ? 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100' : 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100'
                  }`}>
                    {result.method}
                  </span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    {result.path}
                  </span>
                </div>
                <span className={`text-xs font-bold ${
                  result.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {result.status} {result.statusText}
                </span>
              </div>
              <div className="text-xs font-mono bg-white dark:bg-gray-900 p-2 rounded overflow-auto max-h-32">
                <pre className="text-gray-900 dark:text-white whitespace-pre-wrap break-all">
                  {JSON.stringify(result.response, null, 2)}
                </pre>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(result.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>✅ Green = Success (200-299)</div>
          <div>❌ Red = Error (400-599 or network error)</div>
          <div>Check browser console for detailed logs</div>
        </div>
      </div>
    </div>
  );
}
