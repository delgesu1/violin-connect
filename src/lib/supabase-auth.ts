import { supabase } from './supabase';
import { clerkIdToUuid } from './auth-utils';
import { useAuth } from '@/lib/auth-wrapper';

// Check if we're in development mode
const isDev = import.meta.env.VITE_DEV_MODE === 'true';
// For development, use a consistent UUID that works with RLS policies
const DEV_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

/**
 * Custom hook that returns the current user's ID converted to UUID format
 * for use with Supabase queries
 */
export function useSupabaseUserId() {
  const { userId } = useAuth();
  
  // In development mode, return the dev UUID directly
  if (isDev) {
    return Promise.resolve(DEV_UUID);
  }
  
  return clerkIdToUuid(userId);
}

/**
 * Convert a Clerk user ID to a UUID for use with Supabase
 * For server-side or outside of React context
 */
export function getSupabaseUserId(clerkId: string | null | undefined) {
  // In development mode, return the dev UUID directly
  if (isDev) {
    return Promise.resolve(DEV_UUID);
  }
  
  return clerkIdToUuid(clerkId);
} 