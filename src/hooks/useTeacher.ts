import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import { clerkIdToUuid } from '@/lib/auth-utils';
import type { Database } from '@/types/supabase';
import { cacheMockData, getCachedMockData } from '@/lib/mockDataCache';

export type Profile = Database['public']['Tables']['profiles']['Row'];

// Check if we're in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
// For development, use a consistent UUID that works with RLS policies
const DEV_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Custom hook that provides a fallback for useAuth in development mode
const useDevelopmentAuth = () => {
  // In development mode, return mock auth data
  if (isDevelopmentMode) {
    return { 
      userId: DEV_UUID, 
      isLoaded: true, 
      isSignedIn: true, 
      getToken: async () => "mock-token-for-development" 
    };
  }
  
  // In production, use the real Clerk useAuth
  return useAuth();
};

/**
 * Hook to fetch the current teacher's profile data
 */
export function useTeacher() {
  const { userId: clerkId, isLoaded, isSignedIn } = useDevelopmentAuth();

  return useQuery<Profile | null>({
    queryKey: ['teacher'],
    queryFn: async () => {
      if (!clerkId && !isDevelopmentMode) return null;
      
      try {
        const targetId = isDevelopmentMode ? DEV_UUID : await clerkIdToUuid(clerkId);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single();
          
        if (error) throw error;
        
        // Cache the data if successful
        if (data) {
          cacheMockData('teacher_profile', data);
          return data;
        }
        
        // Try to get cached data first in development mode
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<Profile | null>('teacher_profile', null);
          if (cachedData) {
            console.log('Using cached teacher profile data');
            return cachedData;
          }
          
          console.log('No teacher profile data available');
        }
        
        return null;
      } catch (err) {
        console.error('Error fetching teacher profile:', err);
        
        // In development mode, try to use cached data
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<Profile | null>('teacher_profile', null);
          if (cachedData) {
            console.log('Using cached teacher profile data after error');
            return cachedData;
          }
          
          console.log('No cached teacher profile data available');
          return null;
        }
        
        throw err;
      }
    },
    enabled: isLoaded && (isSignedIn || isDevelopmentMode),
  });
} 