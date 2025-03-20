import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import type { Database } from '@/types/supabase';
import { defaultMasterRepertoire } from '@/data/defaultRepertoire'; // Used for fallback/testing
import { getCachedMockData, setCachedMockData } from '@/lib/mockDataCache';
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID, DEV_REPERTOIRE_UUIDS } from '@/lib/dev-uuids';

// Check if we're in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

// Types for the hook returns
export type MasterRepertoire = Database['public']['Tables']['master_repertoire']['Row'];
export type NewMasterRepertoire = Database['public']['Tables']['master_repertoire']['Insert'];
export type UpdateMasterRepertoire = Database['public']['Tables']['master_repertoire']['Update'];

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
  const cacheKey = 'masterRepertoire';
  
  return useQuery<(MasterRepertoire & { _source?: string })[]>({
    queryKey: ['masterRepertoire'],
    queryFn: async () => {
      try {
        // STEP 1: Attempt real API call first
        console.log(`🔍 Fetching master repertoire from Supabase...`);
        
        const { data, error } = await supabase
          .from('master_repertoire')
          .select('*')
          .order('title');
          
        // If we got a successful response with data
        if (!error && data && data.length > 0) {
          console.log(`✅ Successfully fetched ${data.length} master repertoire pieces from Supabase`);
          
          // Cache the successful response
          setCachedMockData(cacheKey, data);
          
          // Return with source tracking
          return data.map(item => ({...item, _source: 'database'}));
        }
        
        // Log error if there was one
        if (error) {
          console.error('Error fetching master repertoire:', error);
        } else if (!data || data.length === 0) {
          console.log('No master repertoire found in database');
        }
        
        // STEP 2: Try to use cached data
        const cachedData = getCachedMockData<MasterRepertoire[]>(cacheKey, []);
        if (cachedData && cachedData.length > 0) {
          console.log(`📦 Using ${cachedData.length} cached master repertoire pieces`);
          return cachedData.map(item => ({...item, _source: error ? 'cached-fallback' : 'cached'}));
        }
        
        // STEP 3: Use mock data as final fallback
        console.log('🔄 Using mock master repertoire data as fallback');
        const mockData = generateMockMasterRepertoire();
        
        // Cache the mock data for future use
        setCachedMockData(cacheKey, mockData);
        
        // Return with source tracking
        return mockData.map(item => ({...item, _source: 'mock'}));
      } catch (error) {
        console.error('Error in useMasterRepertoire:', error);
        
        // Try to use cached data as fallback
        const cachedData = getCachedMockData<MasterRepertoire[]>(cacheKey, []);
        if (cachedData && cachedData.length > 0) {
          return cachedData.map(item => ({...item, _source: 'cached-error-fallback'}));
        }
        
        // Use mock data as final fallback
        return generateMockMasterRepertoire().map(item => ({...item, _source: 'mock-error-fallback'}));
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a specific master repertoire piece by ID
 */
export function useMasterRepertoirePiece(id: string | undefined) {
  const queryClient = useQueryClient();
  const cacheKey = `masterRepertoire_${id}`;
  
  return useQuery<(MasterRepertoire & { _source?: string }) | null>({
    queryKey: ['masterRepertoire', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        // STEP 1: Try to get from cache of all pieces first
        const allMasterRepertoire = queryClient.getQueryData<(MasterRepertoire & { _source?: string })[]>(['masterRepertoire']);
        if (allMasterRepertoire) {
          const piece = allMasterRepertoire.find(p => p.id === id);
          if (piece) {
            console.log(`📦 Found piece ${id} in existing query cache`);
            return piece;
          }
        }
        
        // STEP 2: Try the API call if we have a valid UUID
        if (isValidUUID(id)) {
          console.log(`🔍 Fetching piece ${id} from Supabase...`);
          
          const { data, error } = await supabase
            .from('master_repertoire')
            .select('*')
            .eq('id', id)
            .single();
            
          if (!error && data) {
            console.log(`✅ Successfully fetched piece ${id} from Supabase`);
            return { ...data, _source: 'database' };
          }
          
          if (error) {
            console.error(`Error fetching piece ${id}:`, error);
          }
        } else {
          console.log(`⚠️ Skipping API call for piece ${id} - not a valid UUID`);
        }
        
        // STEP 3: Try individual piece cache
        const cachedPiece = getCachedMockData<MasterRepertoire>(cacheKey, null);
        if (cachedPiece) {
          console.log(`📦 Using cached piece ${id}`);
          return { ...cachedPiece, _source: 'cached' };
        }
        
        // STEP 4: Look in mock data
        const mockData = generateMockMasterRepertoire();
        const mockPiece = mockData.find(p => p.id === id);
        
        if (mockPiece) {
          console.log(`🔄 Using mock piece ${id}`);
          setCachedMockData(cacheKey, mockPiece);
          return { ...mockPiece, _source: 'mock' };
        }
        
        // Couldn't find the piece
        console.log(`❌ Piece ${id} not found`);
        return null;
      } catch (error) {
        console.error(`Error in useMasterRepertoirePiece for ${id}:`, error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create a new master repertoire piece
 */
export function useCreateMasterRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPiece: NewMasterRepertoire) => {
      // For development, just log and return mock data
      if (isDevelopmentMode) {
        console.log('Creating master repertoire (mock):', newPiece);
        
        // Generate a new UUID for the piece if not provided
        const pieceId = crypto.randomUUID();
        const mockPiece = { 
          ...newPiece, 
          id: pieceId, 
          created_at: new Date().toISOString() 
        } as MasterRepertoire;
        
        // Update the cached mock data
        const existingData = getCachedMockData<MasterRepertoire[]>('masterRepertoire', []) || generateMockMasterRepertoire();
        setCachedMockData('masterRepertoire', [...existingData, mockPiece]);
        
        return { ...mockPiece, _source: 'mock-created' };
      }
      
      // For production, use the real API
      const { data, error } = await supabase
        .from('master_repertoire')
        .insert(newPiece)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating master repertoire:', error);
        throw error;
      }
      
      return { ...data, _source: 'database-created' } as MasterRepertoire & { _source: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire'] });
      // Also update the individual piece cache
      setCachedMockData(`masterRepertoire_${data.id}`, data);
    },
  });
}

/**
 * Update a master repertoire piece
 */
export function useUpdateMasterRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateMasterRepertoire }) => {
      // Check for valid UUID before attempting database operation
      if (!isValidUUID(id) && !isDevelopmentMode) {
        throw new Error(`Invalid UUID format for piece ID: ${id}`);
      }
      
      // For development, just log and return mock data
      if (isDevelopmentMode) {
        console.log(`Updating master repertoire ${id} (mock):`, updates);
        
        // Update the cached mock data
        const existingData = getCachedMockData<MasterRepertoire[]>('masterRepertoire', []) || generateMockMasterRepertoire();
        const updatedData = existingData.map(piece => 
          piece.id === id ? { ...piece, ...updates } : piece
        );
        setCachedMockData('masterRepertoire', updatedData);
        
        // Find the updated piece
        const updatedPiece = updatedData.find(p => p.id === id);
        if (!updatedPiece) {
          throw new Error(`Piece with ID ${id} not found`);
        }
        
        // Update the individual piece cache too
        setCachedMockData(`masterRepertoire_${id}`, updatedPiece);
        
        return { ...updatedPiece, _source: 'mock-updated' };
      }
      
      // For production, use the real API
      const { data, error } = await supabase
        .from('master_repertoire')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        console.error(`Error updating master repertoire ${id}:`, error);
        throw error;
      }
      
      return { ...data, _source: 'database-updated' } as MasterRepertoire & { _source: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire'] });
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire', data.id] });
      // Also update the individual piece cache
      setCachedMockData(`masterRepertoire_${data.id}`, data);
    },
  });
}

/**
 * Delete a master repertoire piece
 */
export function useDeleteMasterRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Check for valid UUID before attempting database operation
      if (!isValidUUID(id) && !isDevelopmentMode) {
        throw new Error(`Invalid UUID format for piece ID: ${id}`);
      }
      
      // For development, just log and update mock data
      if (isDevelopmentMode) {
        console.log(`Deleting master repertoire ${id} (mock)`);
        
        // Update the cached mock data
        const existingData = getCachedMockData<MasterRepertoire[]>('masterRepertoire', []) || generateMockMasterRepertoire();
        const updatedData = existingData.filter(piece => piece.id !== id);
        setCachedMockData('masterRepertoire', updatedData);
        
        // Remove the individual piece cache too
        setCachedMockData(`masterRepertoire_${id}`, null);
        
        return { id, _source: 'mock-deleted' };
      }
      
      // For production, use the real API
      const { error } = await supabase
        .from('master_repertoire')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error(`Error deleting master repertoire ${id}:`, error);
        throw error;
      }
      
      return { id, _source: 'database-deleted' };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire'] });
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire', data.id] });
      // Also clear the individual piece cache
      setCachedMockData(`masterRepertoire_${data.id}`, null);
    },
  });
} 