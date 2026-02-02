/**
 * Configuration and Utility Modules
 * Centralized configuration for external services
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// ============================================================================
// Supabase Configuration
// ============================================================================

export const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
export const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// ============================================================================
// Stripe Configuration
// ============================================================================

export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
});

export const STRIPE_PRICE_IDS = {
  pro_monthly: Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') || 'price_pro_monthly',
  pro_yearly: Deno.env.get('STRIPE_PRICE_PRO_YEARLY') || 'price_pro_yearly',
  enterprise_monthly: Deno.env.get('STRIPE_PRICE_ENTERPRISE_MONTHLY') || 'price_enterprise_monthly',
  enterprise_yearly: Deno.env.get('STRIPE_PRICE_ENTERPRISE_YEARLY') || 'price_enterprise_yearly',
};

// ============================================================================
// AI/Embedding Configuration
// ============================================================================

export const pineconeApiKey = Deno.env.get('PINECONE_API_KEY');
export const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
export const pineconeIndexName = Deno.env.get('PINECONE_INDEX_NAME');

// ============================================================================
// Server Configuration
// ============================================================================

export const SERVER_PREFIX = '/make-server-020d2c80';

export const CORS_CONFIG = {
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
};
