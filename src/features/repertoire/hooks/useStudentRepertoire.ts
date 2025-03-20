import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import type { Database } from '@/types/supabase';
import { getCachedMockData, setCachedMockData } from '@/lib/mockDataCache';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isDevelopment } from '@/lib/environment';
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID, DEV_STUDENT_UUIDS } from '@/lib/dev-uuids';

// Types for our hook returns
export type StudentRepertoire = Database['public']['Tables']['student_repertoire']['Row'];
export type NewStudentRepertoire = Database['public']['Tables']['student_repertoire']['Insert'];
export type UpdateStudentRepertoire = Database['public']['Tables']['student_repertoire']['Update'];

/**
 * Get all repertoire for a specific student
 */
export function useStudentRepertoire(studentId: string | undefined) {
  const cacheKey = `studentRepertoire-${studentId}`;
  const [cachedData, setCachedData] = useLocalStorage<StudentRepertoire[]>(cacheKey, []);
  
  return useQuery<StudentRepertoire[]>({
    queryKey: ['studentRepertoire', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      try {
        // Validate UUID
        if (!isValidUUID(studentId)) {
          console.error(`Invalid student UUID format: ${studentId}`);
          
          // In development, we can still proceed with mock data
          if (isDevelopment()) {
            console.warn(`Using mock data for invalid student UUID: ${studentId}`);
          } else {
            return [];
          }
        }
        
        // STEP 1: Try to fetch from API first
        console.log(`🔍 Fetching repertoire for student ${studentId} from Supabase...`);
        
        const { data, error } = await supabase
          .from('student_repertoire')
          .select('*')
          .eq('student_id', studentId);
          
        // If we get a successful response, cache it and return with source tracking
        if (!error && data) {
          console.log(`✅ Supabase returned ${data.length} repertoire pieces for student ${studentId}`);
          setCachedData(data);
          return data.map(item => ({ ...item, _source: 'database' }));
        }
        
        // If API call failed, log the error
        if (error) {
          console.error(`Error fetching repertoire for student ${studentId}:`, error);
        }
        
        // STEP 2: Fall back to cached data if available
        if (cachedData && cachedData.length > 0) {
          console.log(`📦 Using ${cachedData.length} cached repertoire pieces for student ${studentId}`);
          return cachedData.map(item => ({ ...item, _source: 'cached' }));
        }
      } catch (error) {
        console.error(`Error in useStudentRepertoire for student ${studentId}:`, error);
        
        // Fall back to cached data if available
        if (cachedData && cachedData.length > 0) {
          return cachedData.map(item => ({ ...item, _source: 'cached' }));
        }
      }
      
      // STEP 3: Fall back to mock data in development environment
      if (isDevelopment()) {
        console.log(`🔄 Using mock data for student ${studentId}`);
        
        // Check for cached mock data first
        const mockCacheKey = `studentRepertoire_${studentId}`;
        const cachedMockData = getCachedMockData<StudentRepertoire[]>(mockCacheKey, []);
        if (cachedMockData && cachedMockData.length > 0) {
          return cachedMockData.map(item => ({ ...item, _source: 'mock' }));
        }
        
        // Otherwise generate mock data
        const mockData: StudentRepertoire[] = [
          {
            id: 'sr-1',
            student_id: studentId,
            master_piece_id: 'p-1',
            status: 'current',
            start_date: '2023-01-15',
            end_date: null,
            notes: 'Working on the third movement',
            created_at: '2023-01-15T00:00:00Z',
            updated_at: '2023-01-15T00:00:00Z',
            performance_date: null,
            performance_location: null
          },
          {
            id: 'sr-2',
            student_id: studentId,
            master_piece_id: 'p-2',
            status: 'completed',
            start_date: '2022-10-01',
            end_date: '2022-12-15',
            notes: 'Performed at winter recital',
            created_at: '2022-10-01T00:00:00Z',
            updated_at: '2022-12-15T00:00:00Z',
            performance_date: '2022-12-15',
            performance_location: 'Winter Recital'
          },
          {
            id: 'sr-3',
            student_id: studentId,
            master_piece_id: 'p-3',
            status: 'current',
            start_date: '2023-02-01',
            end_date: null,
            notes: 'Just started',
            created_at: '2023-02-01T00:00:00Z',
            updated_at: '2023-02-01T00:00:00Z',
            performance_date: null,
            performance_location: null
          }
        ];
        
        // Cache the mock data for future use
        setCachedMockData(mockCacheKey, mockData);
        return mockData.map(item => ({ ...item, _source: 'mock' }));
      }
      
      // If nothing worked, return empty array
      return [];
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Assign a piece from the master repertoire to a student
 */
export function useAssignRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      studentId,
      masterPieceId
    }: {
      studentId: string;
      masterPieceId: string;
    }) => {
      // Validate UUIDs
      if (!isValidUUID(studentId)) {
        console.error(`Invalid student UUID format: ${studentId}`);
        if (!isDevelopment()) {
          throw new Error(`Invalid UUID format: ${studentId}`);
        }
      }
      
      if (!isValidUUID(masterPieceId)) {
        console.error(`Invalid master piece UUID format: ${masterPieceId}`);
        if (!isDevelopment()) {
          throw new Error(`Invalid UUID format: ${masterPieceId}`);
        }
      }
      
      // For development, use mock data
      if (isDevelopment()) {
        console.log(`Assigning piece ${masterPieceId} to student ${studentId} (mock)`);
        
        // Create a mock student repertoire item
        const mockData: StudentRepertoire = {
          id: `sr-${Date.now()}`,
          student_id: studentId,
          master_piece_id: masterPieceId,
          status: 'current',
          start_date: new Date().toISOString().split('T')[0],
          end_date: null,
          notes: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          performance_date: null,
          performance_location: null
        };
        
        // Update the cache
        const cacheKey = `studentRepertoire_${studentId}`;
        const existingData = getCachedMockData<StudentRepertoire[]>(cacheKey, []) || [];
        setCachedMockData(cacheKey, [...existingData, mockData]);
        
        return mockData;
      }
      
      // For production, use the real API
      const { data, error } = await supabase
        .from('student_repertoire')
        .insert({
          student_id: studentId,
          master_piece_id: masterPieceId,
          status: 'current',
          start_date: new Date().toISOString().split('T')[0],
          notes: ''
        })
        .select();
        
      if (error) {
        console.error('Error assigning repertoire:', error);
        throw error;
      }
      
      return data[0] as StudentRepertoire;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['studentRepertoire', variables.studentId] });
    },
  });
}

/**
 * Update a student's repertoire piece
 */
export function useUpdateStudentRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateStudentRepertoire }) => {
      // Validate UUID
      if (!isValidUUID(id)) {
        console.error(`Invalid repertoire piece UUID format: ${id}`);
        if (!isDevelopment()) {
          throw new Error(`Invalid UUID format: ${id}`);
        }
      }
      
      // For development, use mock data
      if (isDevelopment()) {
        console.log(`Updating student repertoire ${id} (mock):`, updates);
        
        // Get the cached data
        const cacheKey = `studentRepertoire_${updates.student_id}`;
        const existingData = getCachedMockData<StudentRepertoire[]>(cacheKey, []) || [];
        
        // Find and update the item
        const updatedData = existingData.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
        
        // Save back to cache
        setCachedMockData(cacheKey, updatedData);
        
        // Find the updated item to return
        const updatedItem = updatedData.find(item => item.id === id);
        if (!updatedItem) {
          throw new Error(`Student repertoire item ${id} not found`);
        }
        
        return updatedItem;
      }
      
      // For production, use the real API
      const { data, error } = await supabase
        .from('student_repertoire')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error(`Error updating student repertoire ${id}:`, error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['studentRepertoire', data.student_id] });
    },
  });
}

/**
 * Delete a student's repertoire piece
 */
export function useDeleteStudentRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Validate UUID
      if (!isValidUUID(id)) {
        console.error(`Invalid repertoire piece UUID format: ${id}`);
        if (!isDevelopment()) {
          throw new Error(`Invalid UUID format: ${id}`);
        }
      }
      
      // First, get the item to know the student_id for cache invalidation
      let studentId: string | null = null;
      
      // For development, use mock data
      if (isDevelopment()) {
        console.log(`Deleting student repertoire ${id} (mock)`);
        
        // Find the item in the cache
        // We need to search all student caches
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith('mock_studentRepertoire_')) {
            const data = getCachedMockData<StudentRepertoire[]>(key.replace('mock_', ''), []) || [];
            const item = data.find(item => item.id === id);
            if (item) {
              studentId = item.student_id;
              
              // Update the cache
              const filteredData = data.filter(item => item.id !== id);
              setCachedMockData(key.replace('mock_', ''), filteredData);
              break;
            }
          }
        }
        
        if (!studentId) {
          throw new Error(`Student repertoire item ${id} not found`);
        }
        
        return { id, studentId };
      }
      
      // For production, first get the item to know the student_id
      const { data: itemData, error: itemError } = await supabase
        .from('student_repertoire')
        .select('student_id')
        .eq('id', id)
        .single();
        
      if (itemError) {
        console.error(`Error getting student repertoire ${id}:`, itemError);
        throw itemError;
      }
      
      studentId = itemData.student_id;
      
      // Then delete the item
      const { error } = await supabase
        .from('student_repertoire')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error(`Error deleting student repertoire ${id}:`, error);
        throw error;
      }
      
      return { id, studentId };
    },
    onSuccess: (result) => {
      // Invalidate queries to refetch data
      if (result.studentId) {
        queryClient.invalidateQueries({ queryKey: ['studentRepertoire', result.studentId] });
      }
    },
  });
} 