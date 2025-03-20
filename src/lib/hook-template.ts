/**
 * Hook Template for Database Access
 * 
 * This template demonstrates best practices for implementing data-fetching hooks
 * with proper UUID validation, hybrid caching, and development mode handling.
 * 
 * Use this as a reference when creating or updating database hooks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-wrapper';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID } from '@/lib/dev-uuids';

// Generic type for entity with ID
interface Entity {
  id: string;
  [key: string]: any;
}

// Type for different data sources
type DataSource = 'database' | 'cached' | 'mock';

// Entity with source tracking
type EntityWithSource<T extends Entity> = T & {
  _source: DataSource;
};

/**
 * Template for a query hook that fetches a single entity by ID
 */
export function useEntityById<T extends Entity>(
  id: string | undefined,
  options?: { 
    enabled?: boolean;
    tableName?: string;
    mockData?: T;
    cacheKey?: string;
  }
) {
  const {
    enabled = true,
    tableName = 'entities',
    mockData,
    cacheKey = 'entity',
  } = options || {};
  
  // Development mode check
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  return useQuery({
    queryKey: [cacheKey, id],
    queryFn: async (): Promise<EntityWithSource<T> | null> => {
      // Early return if no ID provided
      if (!id) {
        console.warn('No ID provided to useEntityById');
        return null;
      }
      
      // UUID validation
      if (!isValidUUID(id)) {
        console.error(`Invalid UUID format in useEntityById: ${id}`);
        
        // In development mode, return mock data instead of failing
        if (isDev && mockData) {
          console.info('Using mock data due to invalid UUID in development mode');
          return { 
            ...mockData, 
            id, 
            _source: 'mock' 
          };
        }
        
        return null;
      }
      
      try {
        // Attempt to fetch from database
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error(`Database error in useEntityById:`, error);
          throw error;
        }
        
        // Add source tracking to the result
        return data ? { ...data, _source: 'database' } : null;
      } catch (err) {
        console.error(`Error in useEntityById:`, err);
        
        // In development mode, fall back to mock data
        if (isDev && mockData) {
          console.info('Falling back to mock data after error in development mode');
          return { 
            ...mockData, 
            id, 
            _source: 'mock' 
          };
        }
        
        return null;
      }
    },
    enabled: !!id && enabled,
  });
}

/**
 * Template for a query hook that fetches multiple entities
 */
export function useEntities<T extends Entity>(
  options?: {
    enabled?: boolean;
    filters?: Record<string, any>;
    tableName?: string;
    mockData?: T[];
    cacheKey?: string;
    requireAuth?: boolean;
  }
) {
  const { userId } = useAuth();
  const {
    enabled = true,
    filters = {},
    tableName = 'entities',
    mockData = [],
    cacheKey = 'entities',
    requireAuth = true,
  } = options || {};
  
  // Development mode check
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  return useQuery({
    queryKey: [cacheKey, userId, ...Object.values(filters)],
    queryFn: async (): Promise<EntityWithSource<T>[]> => {
      // Check for authentication if required
      if (requireAuth && !userId && !isDev) {
        console.warn('No user ID available for authenticated query');
        return [];
      }
      
      // In dev mode, use the dev UUID
      const teacherId = isDev ? DEV_TEACHER_UUID : await clerkIdToUuid(userId!);
      
      if (requireAuth && !teacherId) {
        console.warn('Could not convert Clerk ID to Supabase UUID');
        return [];
      }
      
      try {
        // Start building the query
        let query = supabase
          .from(tableName)
          .select('*');
        
        // Add teacher_id filter if authentication is required
        if (requireAuth && teacherId) {
          if (!isValidUUID(teacherId)) {
            console.error(`Invalid teacher UUID format: ${teacherId}`);
            
            // In development mode, return mock data
            if (isDev && mockData.length > 0) {
              return mockData.map(item => ({
                ...item,
                _source: 'mock'
              }));
            }
            
            return [];
          }
          
          query = query.eq('teacher_id', teacherId);
        }
        
        // Add any additional filters
        Object.entries(filters).forEach(([key, value]) => {
          // Skip null/undefined values
          if (value === null || value === undefined) return;
          
          // Validate UUIDs in filters
          if (key.includes('_id') && typeof value === 'string' && !isValidUUID(value)) {
            console.error(`Invalid UUID format for filter ${key}: ${value}`);
            throw new Error(`Invalid UUID format for filter ${key}`);
          }
          
          query = query.eq(key, value);
        });
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) {
          console.error(`Database error in useEntities:`, error);
          throw error;
        }
        
        // Add source tracking to all results
        return (data || []).map(item => ({
          ...item,
          _source: 'database'
        }));
      } catch (err) {
        console.error(`Error in useEntities:`, err);
        
        // In development mode, fall back to mock data
        if (isDev && mockData.length > 0) {
          console.info('Falling back to mock data after error in development mode');
          return mockData.map(item => ({
            ...item,
            _source: 'mock'
          }));
        }
        
        return [];
      }
    },
    enabled: enabled && (!!userId || isDev || !requireAuth),
  });
}

/**
 * Template for a mutation hook that creates a new entity
 */
export function useCreateEntity<T extends Omit<Entity, 'id'>>(
  options?: {
    tableName?: string;
    cacheKey?: string;
    requireAuth?: boolean;
  }
) {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const {
    tableName = 'entities',
    cacheKey = 'entities',
    requireAuth = true,
  } = options || {};
  
  // Development mode check
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  return useMutation({
    mutationFn: async (newEntity: T): Promise<EntityWithSource<Entity>> => {
      // Check for authentication if required
      if (requireAuth && !userId && !isDev) {
        throw new Error('No user ID available for authenticated mutation');
      }
      
      // In dev mode, use the dev UUID
      const teacherId = isDev ? DEV_TEACHER_UUID : await clerkIdToUuid(userId!);
      
      if (requireAuth && !teacherId) {
        throw new Error('Could not convert Clerk ID to Supabase UUID');
      }
      
      // Validate teacherId UUID format
      if (requireAuth && !isValidUUID(teacherId)) {
        throw new Error(`Invalid teacher UUID format: ${teacherId}`);
      }
      
      // Validate any UUID fields in the entity
      Object.entries(newEntity).forEach(([key, value]) => {
        if (key.includes('_id') && typeof value === 'string' && !isValidUUID(value)) {
          throw new Error(`Invalid UUID format for ${key}: ${value}`);
        }
      });
      
      // Prepare entity with standard fields
      const entityToInsert = {
        ...newEntity,
        ...(requireAuth ? { teacher_id: teacherId } : {}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      try {
        // Insert into database
        const { data, error } = await supabase
          .from(tableName)
          .insert(entityToInsert)
          .select('*')
          .single();
        
        if (error) {
          console.error(`Database error in useCreateEntity:`, error);
          throw error;
        }
        
        // Add source tracking to result
        return { ...data, _source: 'database' };
      } catch (err) {
        console.error(`Error in useCreateEntity:`, err);
        throw err;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: [cacheKey] });
    },
  });
}

/**
 * Template for a mutation hook that updates an existing entity
 */
export function useUpdateEntity<T extends Partial<Entity>>(
  options?: {
    tableName?: string;
    cacheKey?: string;
  }
) {
  const queryClient = useQueryClient();
  const {
    tableName = 'entities',
    cacheKey = 'entities',
  } = options || {};
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: T & { id: string }): Promise<EntityWithSource<Entity>> => {
      // Validate entity ID
      if (!id) {
        throw new Error('Entity ID is required for update');
      }
      
      // Validate UUID format
      if (!isValidUUID(id)) {
        throw new Error(`Invalid entity UUID format: ${id}`);
      }
      
      // Validate any UUID fields in the updates
      Object.entries(updates).forEach(([key, value]) => {
        if (key.includes('_id') && typeof value === 'string' && !isValidUUID(value)) {
          throw new Error(`Invalid UUID format for ${key}: ${value}`);
        }
      });
      
      // Prepare updates with standard fields
      const updatedFields = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      try {
        // Update in database
        const { data, error } = await supabase
          .from(tableName)
          .update(updatedFields)
          .eq('id', id)
          .select('*')
          .single();
        
        if (error) {
          console.error(`Database error in useUpdateEntity:`, error);
          throw error;
        }
        
        // Add source tracking to result
        return { ...data, _source: 'database' };
      } catch (err) {
        console.error(`Error in useUpdateEntity:`, err);
        throw err;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [cacheKey] });
      queryClient.invalidateQueries({ queryKey: [`${cacheKey.replace(/s$/, '')}`, data.id] });
    },
  });
}

/**
 * Template for a mutation hook that deletes an entity
 */
export function useDeleteEntity(
  options?: {
    tableName?: string;
    cacheKey?: string;
  }
) {
  const queryClient = useQueryClient();
  const {
    tableName = 'entities',
    cacheKey = 'entities',
  } = options || {};
  
  return useMutation({
    mutationFn: async (id: string): Promise<{ id: string }> => {
      // Validate entity ID
      if (!id) {
        throw new Error('Entity ID is required for deletion');
      }
      
      // Validate UUID format
      if (!isValidUUID(id)) {
        throw new Error(`Invalid entity UUID format: ${id}`);
      }
      
      try {
        // Delete from database
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error(`Database error in useDeleteEntity:`, error);
          throw error;
        }
        
        return { id };
      } catch (err) {
        console.error(`Error in useDeleteEntity:`, err);
        throw err;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [cacheKey] });
      queryClient.invalidateQueries({ queryKey: [`${cacheKey.replace(/s$/, '')}`, data.id] });
    },
  });
} 