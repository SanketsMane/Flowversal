/**
 * Core Stores Index
 * Currently using localStorage mode (works out of the box)
 * 
 * To enable Supabase production mode:
 * See /PRODUCTION_SETUP_GUIDE.md
 */

import './storeFactory'; // This logs which mode we're in

// Export localStorage stores (works without any setup)
export { useAuthStore } from './authStore';
export { useUserStore } from './userStore';
export { useWorkflowRegistryStore } from './workflowRegistryStore';
export { useExecutionStore } from './executionStore';

// When you add Supabase credentials to .env, 
// uncomment the lines below and comment out the exports above:

/*
import { isSupabaseConfigured } from './storeFactory';

if (isSupabaseConfigured) {
  // Production mode - use Supabase
  export { useAuthStore } from './authStore.supabase';
  export { useUserStore } from './userStore.supabase';
  export { useWorkflowRegistryStore } from './workflowRegistryStore.supabase';
  export { useExecutionStore } from './executionStore.supabase';
} else {
  // Development mode - use localStorage
  export { useAuthStore } from './authStore';
  export { useUserStore } from './userStore';
  export { useWorkflowRegistryStore } from './workflowRegistryStore';
  export { useExecutionStore } from './executionStore';
}
*/
