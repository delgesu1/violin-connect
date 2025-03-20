import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import { cacheMockData, getCachedMockData } from '@/lib/mockDataCache';

export type EnhancedStudentRepertoire = any; // TODO: Define proper type

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
 * Hook to fetch a student's repertoire with enhanced fields
 */
export function useStudentRepertoire(studentId: string) {
  const { userId } = useDevelopmentAuth();
  
  return useQuery<EnhancedStudentRepertoire[]>({
    queryKey: ['student-repertoire', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      try {
        // We'll use a join to get the master piece details along with the student repertoire
        const { data, error } = await supabase
          .from('student_repertoire')
          .select(`
            *,
            piece: master_repertoire (*)
          `)
          .eq('student_id', studentId)
          .order('status', { ascending: true })
          .order('start_date', { ascending: false });
        
        if (error) throw error;
        
        // If successful, cache the data
        if (data && data.length > 0) {
          cacheMockData(`student_repertoire_${studentId}`, data);
          return data as EnhancedStudentRepertoire[];
        }
        
        // Try to get cached data first
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<EnhancedStudentRepertoire[] | null>(
            `student_repertoire_${studentId}`, 
            null
          );
          
          if (cachedData && cachedData.length > 0) {
            console.log(`Using cached student repertoire data for student ${studentId}`);
            return cachedData;
          }
          
          // If no cached data, return empty array (or could create mock data in the future)
          console.log(`No repertoire data available for student ${studentId}`);
        }
        
        return [];
      } catch (err) {
        console.error(`Error fetching repertoire for student ${studentId}:`, err);
        
        // In development mode, try to use cached data
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<EnhancedStudentRepertoire[] | null>(
            `student_repertoire_${studentId}`, 
            null
          );
          
          if (cachedData && cachedData.length > 0) {
            console.log(`Using cached student repertoire data for student ${studentId} after error`);
            return cachedData;
          }
          
          console.log(`No cached repertoire data available for student ${studentId}`);
          return [];
        }
        
        throw err;
      }
    },
    enabled: !!studentId && (isDevelopmentMode || !!userId),
  });
}

/**
 * Hook to fetch current repertoire for a student
 */
export function useCurrentRepertoire(studentId: string) {
  const { userId } = useDevelopmentAuth();
  
  return useQuery<EnhancedStudentRepertoire[]>({
    queryKey: ['current-repertoire', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      try {
        const { data, error } = await supabase
          .from('student_repertoire')
          .select(`
            *,
            piece: master_repertoire (*)
          `)
          .eq('student_id', studentId)
          .eq('status', 'current')
          .order('start_date', { ascending: false });
        
        if (error) throw error;
        
        // If successful, cache the data
        if (data && data.length > 0) {
          cacheMockData(`current_repertoire_${studentId}`, data);
          return data as EnhancedStudentRepertoire[];
        }
        
        // Try to get cached data first
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<EnhancedStudentRepertoire[] | null>(
            `current_repertoire_${studentId}`, 
            null
          );
          
          if (cachedData && cachedData.length > 0) {
            console.log(`Using cached current repertoire data for student ${studentId}`);
            return cachedData;
          }
          
          // If no cached data, return empty array
          console.log(`No current repertoire data available for student ${studentId}`);
        }
        
        return [];
      } catch (err) {
        console.error(`Error fetching current repertoire for student ${studentId}:`, err);
        
        // In development mode, try to use cached data
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<EnhancedStudentRepertoire[] | null>(
            `current_repertoire_${studentId}`, 
            null
          );
          
          if (cachedData && cachedData.length > 0) {
            console.log(`Using cached current repertoire data for student ${studentId} after error`);
            return cachedData;
          }
          
          console.log(`No cached current repertoire data available for student ${studentId}`);
          return [];
        }
        
        throw err;
      }
    },
    enabled: !!studentId && (isDevelopmentMode || !!userId),
  });
} 