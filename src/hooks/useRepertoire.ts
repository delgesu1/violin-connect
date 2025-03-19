import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import type { Database } from '@/types/supabase';
import { defaultMasterRepertoire } from '@/data/defaultRepertoire'; // Used for fallback/testing
import { getCachedMockData, setCachedMockData, cacheMockData } from '@/lib/mockDataCache';

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

// Types for our hook returns
export type MasterRepertoire = Database['public']['Tables']['master_repertoire']['Row'];
export type NewMasterRepertoire = Database['public']['Tables']['master_repertoire']['Insert'];
export type UpdateMasterRepertoire = Database['public']['Tables']['master_repertoire']['Update'];

export type StudentRepertoire = Database['public']['Tables']['student_repertoire']['Row'];
export type NewStudentRepertoire = Database['public']['Tables']['student_repertoire']['Insert'];
export type UpdateStudentRepertoire = Database['public']['Tables']['student_repertoire']['Update'];

/**
 * Generate mock master repertoire data for testing
 */
function generateMockMasterRepertoire(): MasterRepertoire[] {
  return defaultMasterRepertoire as unknown as MasterRepertoire[];
}

/**
 * Get master repertoire pieces from API or mock data
 */
export function useMasterRepertoire() {
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  return useQuery<(MasterRepertoire & { _source?: string })[]>({
    queryKey: ['masterRepertoire'],
    queryFn: async () => {
      console.log('🔍 Fetching master repertoire from Supabase...');
      
      try {
        // Try to get data from Supabase
        const { data, error } = await supabase
          .from('master_repertoire')
          .select('*');
          
        // Check response
        console.log(`✅ Supabase returned ${data?.length || 0} master repertoire items:`, { data, error });
        
        if (error) {
          throw error;
        }
        
        // If we got data successfully, return it with source information
        if (data && data.length > 0) {
          return data.map(piece => ({
            ...piece,
            _source: 'database',
          }));
        }
        
        // If we reach here, it means we got an empty array from Supabase
        console.warn('⚠️ Supabase returned empty data');
      } catch (error) {
        // Handle connection errors or other issues
        console.error('❌ Supabase error:', error);
      }
      
      // If we're here, either there was an error or empty data
      // Check for cached data first
      console.log('🔍 Checking for cached data...');
      const cachedData = getCachedMockData<(MasterRepertoire & { _source?: string })[]>('masterRepertoire', []);
      
      if (cachedData && cachedData.length > 0) {
        console.log(`📝 Using cached data (${cachedData.length} pieces)`);
        return cachedData.map(piece => ({
          ...piece,
          _source: 'cached',
        }));
      }
      
      console.log('📝 Using mock master repertoire data as final fallback');
      // Create mock data with source information
      const mockData = generateMockMasterRepertoire().map(piece => ({
        ...piece,
        _source: 'mock',
      }));
      
      // Cache the mock data for future use
      setCachedMockData('masterRepertoire', mockData);
      
      return mockData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single master repertoire piece by ID
 */
export function useMasterRepertoirePiece(id: string | undefined) {
  return useQuery<MasterRepertoire | null>({
    queryKey: ['masterRepertoire', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const { data, error } = await supabase
          .from('master_repertoire')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Error loading master repertoire piece ${id}:`, error);
        
        // For development/testing, if Supabase is not available, return mock data
        if (import.meta.env.DEV) {
          console.warn('Falling back to mock repertoire data');
          const mockPiece = defaultMasterRepertoire.find(p => p.id === id);
          return mockPiece as unknown as MasterRepertoire || null;
        }
        
        throw error;
      }
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new master repertoire piece
 */
export function useCreateMasterRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPiece: NewMasterRepertoire) => {
      const { data, error } = await supabase
        .from('master_repertoire')
        .insert(newPiece)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire'] });
    },
  });
}

/**
 * Hook to update an existing master repertoire piece
 */
export function useUpdateMasterRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, piece }: { id: string; piece: UpdateMasterRepertoire }) => {
      const { data, error } = await supabase
        .from('master_repertoire')
        .update(piece)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire'] });
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire', data.id] });
    },
  });
}

/**
 * Hook to delete a master repertoire piece
 */
export function useDeleteMasterRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('master_repertoire')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire'] });
    },
  });
}

/**
 * Hook to fetch all repertoire pieces for a student
 */
export function useStudentRepertoire(studentId: string | undefined) {
  return useQuery<StudentRepertoire[]>({
    queryKey: ['studentRepertoire', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('student_repertoire')
        .select('*')
        .eq('student_id', studentId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId,
  });
}

/**
 * Hook to assign a repertoire piece to a student
 */
export function useAssignRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newAssignment: NewStudentRepertoire) => {
      const { data, error } = await supabase
        .from('student_repertoire')
        .insert(newAssignment)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['studentRepertoire', data.student_id] });
    },
  });
}

/**
 * Hook to update a student repertoire item status (current/completed)
 */
export function useUpdateStudentRepertoire() {
  const queryClient = useQueryClient();
  const { userId } = useDevelopmentAuth();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status,
      end_date 
    }: { 
      id: string; 
      status: 'current' | 'completed'; 
      end_date?: string | null;
    }) => {
      if (!userId && !isDevelopmentMode) throw new Error('User not authenticated');
      
      const updateData: any = { status };
      
      // If changing to completed, set the end date to today if not provided
      if (status === 'completed' && !end_date) {
        updateData.end_date = new Date().toISOString().split('T')[0];
      } else if (status === 'current') {
        // If changing to current, remove the end date
        updateData.end_date = null;
      } else if (end_date) {
        updateData.end_date = end_date;
      }
      
      const { data, error } = await supabase
        .from('student_repertoire')
        .update(updateData)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      // If in development mode, update the cache
      if (isDevelopmentMode && data) {
        // Get the updated item
        const updatedItem = data[0];
        
        // Update the student_repertoire cache for this specific student
        const studentId = updatedItem.student_id;
        const cacheKey = `student_repertoire_${studentId}`;
        const cachedData = getCachedMockData<any[]>(cacheKey, []);
        
        // Update the specific item in the cached data
        const updatedCache = cachedData.map(item => 
          item.id === id ? { ...item, ...updateData } : item
        );
        
        // Save the updated cache
        cacheMockData(cacheKey, updatedCache);
        
        // Also update the individual item cache if it exists
        cacheMockData(`student_repertoire_item_${id}`, updatedItem);
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries that might be affected by this change
      queryClient.invalidateQueries({ queryKey: ['student-repertoire'] });
      queryClient.invalidateQueries({ queryKey: ['master-repertoire'] });
      
      // Invalidate specific student repertoire queries
      if (variables.id) {
        queryClient.invalidateQueries({ 
          queryKey: ['student-repertoire-item', variables.id] 
        });
      }
    },
  });
}

/**
 * Hook to delete a student repertoire item
 */
export function useDeleteStudentRepertoire() {
  const queryClient = useQueryClient();
  const { userId } = useDevelopmentAuth();
  
  return useMutation({
    mutationFn: async ({ 
      id,
      studentId 
    }: { 
      id: string;
      studentId: string;
    }) => {
      if (!userId && !isDevelopmentMode) throw new Error('User not authenticated');
      
      // Get the item first for cache management
      const { data: itemData } = await supabase
        .from('student_repertoire')
        .select('student_id')
        .eq('id', id)
        .single();
      
      // Store the student_id for cache updates
      const affectedStudentId = itemData?.student_id || studentId;
      
      // Delete the item
      const { error } = await supabase
        .from('student_repertoire')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // If in development mode, update the cache
      if (isDevelopmentMode) {
        // Update the student_repertoire cache
        const cacheKey = `student_repertoire_${affectedStudentId}`;
        const cachedData = getCachedMockData<any[]>(cacheKey, []);
        
        // Remove the deleted item from the cache
        const updatedCache = cachedData.filter(item => item.id !== id);
        
        // Save the updated cache
        cacheMockData(cacheKey, updatedCache);
        
        // Remove the individual item cache if it exists
        try {
          localStorage.removeItem(`mock_student_repertoire_item_${id}`);
        } catch (e) {
          console.warn(`Failed to remove cached item for ${id}`, e);
        }
      }
      
      return { success: true, studentId: affectedStudentId };
    },
    onSuccess: (result) => {
      // Invalidate queries that might be affected by this change
      queryClient.invalidateQueries({ queryKey: ['student-repertoire'] });
      
      // Invalidate specific student's repertoire
      if (result?.studentId) {
        queryClient.invalidateQueries({ 
          queryKey: ['student-repertoire', result.studentId] 
        });
      }
    },
  });
} 