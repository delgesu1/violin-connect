import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import type { Database } from '@/types/supabase';
import { defaultMasterRepertoire } from '@/data/defaultRepertoire'; // Used for fallback/testing
import { getCachedMockData, setCachedMockData } from '@/lib/mockDataCache';
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID } from '@/lib/dev-uuids';

// Check if we're in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

// Custom hook that provides a fallback for useAuth in development mode
const useDevelopmentAuth = () => {
  // In development mode, return mock auth data
  if (isDevelopmentMode) {
    return { 
      userId: DEV_TEACHER_UUID, 
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
        
        return mockData.map(item => ({...item, _source: 'mock-fallback'}));
      } catch (err) {
        console.error('Unexpected error fetching master repertoire:', err);
        
        // STEP 2 (after error): Try to use cached data
        const cachedData = getCachedMockData<MasterRepertoire[]>(cacheKey, []);
        if (cachedData && cachedData.length > 0) {
          console.log(`📦 Using ${cachedData.length} cached master repertoire pieces after error`);
          return cachedData.map(item => ({...item, _source: 'cached-fallback'}));
        }
        
        // STEP 3 (after error): Use mock data as final fallback
        console.log('🔄 Using mock master repertoire data after error');
        const mockData = generateMockMasterRepertoire();
        
        return mockData.map(item => ({...item, _source: 'mock-fallback'}));
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a single master repertoire piece by ID
 */
export function useMasterRepertoirePiece(id: string | undefined) {
  const { data: allPieces } = useMasterRepertoire();
  const cacheKey = `masterRepertoirePiece-${id}`;
  
  return useQuery<MasterRepertoire | null>({
    queryKey: ['masterRepertoire', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        // CRITICAL: For UUID format IDs, try to fetch directly from Supabase first
        if (isValidUUID(id)) {
          console.log(`🔍 Attempting to fetch piece with UUID ${id} from Supabase...`);
          
          const { data, error } = await supabase
            .from('master_repertoire')
            .select('*')
            .eq('id', id)
            .single();
            
          if (!error && data) {
            // Successfully found in database
            console.log(`✅ Found piece with UUID ${id} in Supabase`);
            
            // Cache the successful response
            setCachedMockData(cacheKey, data);
            
            return { ...data, _source: 'database' };
          }
          
          if (error) {
            console.error(`Error fetching piece with UUID ${id}:`, error);
          }
        } else if (isDevelopmentMode) {
          console.warn(`Invalid UUID format: ${id}, using fallback in development mode`);
        } else {
          console.error(`Invalid UUID format: ${id}, cannot fetch from database`);
          return null;
        }
        
        // Try to find in the existing data first
        if (allPieces && allPieces.length > 0) {
          const exactMatch = allPieces.find(p => p.id === id);
          if (exactMatch) {
            console.log(`📦 Found piece with ID ${id} in cached collection data`);
            return { ...exactMatch, _source: exactMatch._source || 'cached' };
          }
        }
        
        // Check if we have this specific piece cached
        const cachedPiece = getCachedMockData<MasterRepertoire | null>(cacheKey, null);
        if (cachedPiece) {
          console.log(`📦 Using cached data for piece ${id}`);
          return { ...cachedPiece, _source: 'cached' };
        }
        
        // If we're dealing with a UUID that we couldn't find, create a fallback with mock data
        if (isValidUUID(id) || isDevelopmentMode) {
          console.log(`⚠️ Creating fallback data for ID ${id}`);
          
          // Get mock data to use as template
          const mockData = generateMockMasterRepertoire();
          if (mockData.length > 0) {
            const fallbackPiece = { 
              ...mockData[0], 
              id, 
              title: `Piece ${id.substr(0, 6)}...`,
              _source: 'mock-fallback' 
            };
            
            // Cache this fallback for future use
            setCachedMockData(cacheKey, fallbackPiece);
            
            return fallbackPiece;
          }
        }
        
        console.log(`⚠️ No piece found with ID ${id}`);
        return null;
      } catch (err) {
        console.error(`Unexpected error fetching piece with ID ${id}:`, err);
        
        // Check if we have this specific piece cached after error
        const cachedPiece = getCachedMockData<MasterRepertoire | null>(cacheKey, null);
        if (cachedPiece) {
          console.log(`📦 Using cached data for piece ${id} after error`);
          return { ...cachedPiece, _source: 'cached-fallback' };
        }
        
        // If nothing else works, return null
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
        const id = `m-${Date.now()}`;
        const mockPiece = { ...newPiece, id, created_at: new Date().toISOString() } as MasterRepertoire;
        
        // Update the cached mock data
        const existingData = getCachedMockData<MasterRepertoire[]>('masterRepertoire', []) || generateMockMasterRepertoire();
        setCachedMockData('masterRepertoire', [...existingData, mockPiece]);
        
        return mockPiece;
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
      
      return data as MasterRepertoire;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire'] });
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
      // For development, just log and return mock data
      if (isDevelopmentMode) {
        console.log(`Updating master repertoire ${id} (mock):`, updates);
        
        // Update the cached mock data
        const existingData = getCachedMockData<MasterRepertoire[]>('masterRepertoire', []) || generateMockMasterRepertoire();
        const updatedData = existingData.map(piece => 
          piece.id === id ? { ...piece, ...updates } : piece
        );
        setCachedMockData('masterRepertoire', updatedData);
        
        return { id, ...updates } as MasterRepertoire;
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
      
      return data as MasterRepertoire;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire'] });
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire', data.id] });
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
      // For development, just log and update mock data
      if (isDevelopmentMode) {
        console.log(`Deleting master repertoire ${id} (mock)`);
        
        // Update the cached mock data
        const existingData = getCachedMockData<MasterRepertoire[]>('masterRepertoire', []) || generateMockMasterRepertoire();
        const updatedData = existingData.filter(piece => piece.id !== id);
        setCachedMockData('masterRepertoire', updatedData);
        
        return { id };
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
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterRepertoire'] });
    },
  });
} 