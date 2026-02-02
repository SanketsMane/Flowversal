/**
 * Auto Login Utility
 * 
 * Ensures Justin is logged in by default for demo purposes
 */

import { authService } from '@/core/api/services/auth.service';

const JUSTIN_EMAIL = 'justin@gmail.com';
const JUSTIN_PASSWORD = 'justin';

export async function ensureJustinLoggedIn() {
  console.log('[Auto Login] ========== CHECKING LOGIN STATE ==========');
  
  // Check if anyone is currently logged in
  if (authService.isAuthenticated()) {
    const currentUser = authService.getCurrentUser();
    const currentToken = authService.getAccessToken();
    
    console.log('[Auto Login] User already logged in');
    console.log('[Auto Login] Email:', currentUser?.email);
    console.log('[Auto Login] Token:', currentToken?.substring(0, 30));
    
    // If Justin is already logged in, we're good
    if (currentUser?.email === JUSTIN_EMAIL) {
      console.log('[Auto Login] ✅ Justin is already logged in');
      return;
    }
    
    // Someone else is logged in, log them out first
    console.log('[Auto Login] Different user logged in, logging out...');
    await authService.logout();
  }
  
  // Log in as Justin
  console.log('[Auto Login] Logging in as Justin...');
  const result = await authService.login(JUSTIN_EMAIL, JUSTIN_PASSWORD);
  
  if (result.success) {
    console.log('[Auto Login] ✅ Justin logged in successfully');
    console.log('[Auto Login] Token:', authService.getAccessToken()?.substring(0, 30));
  } else {
    console.error('[Auto Login] ❌ Failed to log in Justin:', result.error);
  }
}
