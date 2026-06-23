/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables safely
const getMetaEnv = () => {
  try {
    return (import.meta as any).env || {};
  } catch (e) {
    return {};
  }
};

const metaEnv = getMetaEnv();
const supabaseUrl = String(metaEnv.VITE_SUPABASE_URL || metaEnv.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = String(metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

console.log('--- SUPABASE INITIALIZATION CHECK ---');
console.log('Supabase URL resolved: ', supabaseUrl ? supabaseUrl : 'NOT CONFIGURED');
console.log('Supabase Key exists: ', supabaseAnonKey ? 'YES' : 'NO');
console.log('------------------------------------');

// Clean check to make sure variables are present and are not placeholders
const isPlaceHolder = (val: string) => {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    lower.includes('placeholder') || 
    lower.includes('your-project') || 
    lower.includes('your-anon-key') || 
    lower.includes('...')
  );
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !isPlaceHolder(supabaseUrl) && 
  !isPlaceHolder(supabaseAnonKey)
);

// We construct the client safely and catch any constructor exception (e.g. malformed JWT or URL formats)
const createSafeSupabaseClient = () => {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // Avoid touching localStorage inside the Supabase library to prevent Sandboxed iframe block exceptions
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

export const supabase = createSafeSupabaseClient();

/**
 * A helper to get the client or throw a readable error
 */
export function getSupabase() {
  if (!supabase) {
    console.warn('Supabase is not fully configured. Using simulated local state.');
  }
  return supabase;
}
