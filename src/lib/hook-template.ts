/**
 * Best Practice Hook Template
 * 
 * This file serves as a template for creating new data hooks that follow
 * the hybrid caching approach described in DATABASE_WORKFLOW.md.
 * 
 * The pattern includes:
 * 1. Trying real API calls first
 * 2. Caching successful responses
 * 3. Falling back to cached data when API calls fail
 * 4. Using consistent mock data as final fallback
 * 5. Proper UUID validation to prevent database errors
 * 6. Data source tracking for development mode
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-wrapper';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { getCachedMockData, setCachedMockData } from '@/lib/mockDataCache';
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID, DEV_STUDENT_UUIDS } from '@/lib/dev-uuids';

// Check if we're in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

// Define types for your hook return values
export type YourEntityType = {
  id: string;
  name: string;
  // Add other fields based on your database schema
  _source?: 'database' | 'cached' | 'mock' | 'cached-fallback' | 'mock-fallback';
};

// Example mock data
const mockData: YourEntityType[] = [
  {
    id: DEV_STUDENT_UUIDS.STUDENT_1, // Always use UUIDs from dev-uuids.ts
    name: 'William Taylor',
    // Add other fields...
  },
  {
    id: DEV_STUDENT_UUIDS.STUDENT_2,
    name: 'Sophia Chen',
    // Add other fields...
  }
];

/**
 * Hook to fetch data following the hybrid caching approach
 */
export function useYourEntityData() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  
  return useQuery<YourEntityType[]>({
    queryKey: ['your_entity_data'],
    queryFn: async () => {
      // Enable in development mode without login, or in production with login
      if (!userId && !isDevelopmentMode) return [];
      
      try {
        // In development, use the dev UUID
        const userUuid = isDevelopmentMode ? DEV_TEACHER_UUID : await clerkIdToUuid(userId!);
        
        console.log(`Fetching data from Supabase...`);
        
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('your_table_name')
          .select('*')
          .eq('user_id', userUuid);
          
        if (error) {
          console.error('Error fetching data from Supabase:', error);
          throw error;
        }
        
        // If successful, cache the response
        if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} items from database`);
          
          // Cache for future use
          setCachedMockData('your_entity_data', data);
          
          // Add source tracking for development transparency
          return data.map(item => ({
            ...item,
            _source: 'database' as const
          }));
        }
        
        // If database is empty, check cache
        console.log('No data found in database, checking cache...');
        const cachedData = getCachedMockData<YourEntityType[] | null>('your_entity_data', null);
        
        if (cachedData && cachedData.length > 0) {
          console.log('Using cached data');
          return cachedData.map(item => ({
            ...item,
            _source: 'cached' as const
          }));
        }
        
        // Final fallback to mock data
        console.log('No cached data found, using mock data');
        return mockData.map(item => ({
          ...item,
          _source: 'mock' as const
        }));
      } catch (err) {
        console.error('Error in useYourEntityData:', err);
        
        // Try to recover from cache after error
        const cachedData = getCachedMockData<YourEntityType[] | null>('your_entity_data', null);
        if (cachedData && cachedData.length > 0) {
          console.log('Using cached data after error');
          return cachedData.map(item => ({
            ...item,
            _source: 'cached-fallback' as const
          }));
        }
        
        // Last resort: use mock data
        console.log('Using mock data after error');
        return mockData.map(item => ({
          ...item,
          _source: 'mock-fallback' as const
        }));
      }
    },
    enabled: !!userId || isDevelopmentMode,
  });
}

/**
 * Hook to fetch a single entity by ID
 */
export function useYourEntityById(id: string | undefined) {
  const { userId } = useAuth();
  
  return useQuery<YourEntityType | null>({
    queryKey: ['your_entity', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        console.log(`Fetching entity ${id} from database...`);
        
        // Skip Supabase query for non-UUID IDs in development mode
        if (isDevelopmentMode && !isValidUUID(id)) {
          console.log(`Skipping database query for non-UUID id: ${id}`);
          
          // Try cached data first
          const cachedData = getCachedMockData<YourEntityType | null>(`your_entity_${id}`, null);
          if (cachedData) {
            console.log(`Using cached data for entity ${id}`);
            return {
              ...cachedData,
              _source: 'cached' as const
            };
          }
          
          // Fall back to mock data
          console.log(`Using mock data for entity ${id}`);
          const mockItem = mockData.find(item => item.id === id) || {
            ...mockData[0],
            id,
            name: `Mock Entity ${id}`
          };
          
          // Cache the mock data for future use
          setCachedMockData(`your_entity_${id}`, mockItem);
          
          return {
            ...mockItem,
            _source: 'mock' as const
          };
        }
        
        // Make the database query
        const { data, error } = await supabase
          .from('your_table_name')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error(`Error fetching entity ${id}:`, error);
          throw error;
        }
        
        if (data) {
          // Cache the successful response
          setCachedMockData(`your_entity_${id}`, data);
          
          return {
            ...data,
            _source: 'database' as const
          };
        }
        
        throw new Error(`Entity ${id} not found`);
      } catch (err) {
        console.error(`Error fetching entity ${id}:`, err);
        
        // Try cached data after error
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<YourEntityType | null>(`your_entity_${id}`, null);
          if (cachedData) {
            console.log(`Using cached data for entity ${id} after error`);
            return {
              ...cachedData,
              _source: 'cached-fallback' as const
            };
          }
          
          // Fall back to mock data
          console.log(`Using mock data for entity ${id} after error`);
          const mockItem = mockData.find(item => item.id === id) || {
            ...mockData[0],
            id,
            name: `Mock Entity ${id}`
          };
          
          return {
            ...mockItem,
            _source: 'mock-fallback' as const
          };
        }
        
        throw err;
      }
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new entity
 */
export function useCreateYourEntity() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (newEntity: Omit<YourEntityType, 'id' | '_source'>) => {
      if (!userId && !isDevelopmentMode) {
        throw new Error('User not authenticated');
      }
      
      const userUuid = isDevelopmentMode ? DEV_TEACHER_UUID : await clerkIdToUuid(userId!);
      
      // Add user_id to the entity
      const entityToInsert = {
        ...newEntity,
        user_id: userUuid
      };
      
      const { data, error } = await supabase
        .from('your_table_name')
        .insert(entityToInsert)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Update cache with new entity
      if (data && isDevelopmentMode) {
        // Get existing cache
        const cachedEntities = getCachedMockData<YourEntityType[]>('your_entity_data', []);
        // Add new entity to cache
        const updatedCache = [...cachedEntities, data];
        // Update cache
        setCachedMockData('your_entity_data', updatedCache);
        // Also cache the individual entity
        setCachedMockData(`your_entity_${data.id}`, data);
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['your_entity_data'] });
    }
  });
} 