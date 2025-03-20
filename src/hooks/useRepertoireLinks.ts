import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { getCachedMockData, setCachedMockData } from '@/lib/mockDataCache';

// Types for our hook returns
export type RepertoireLink = Database['public']['Tables']['repertoire_links']['Row'];
export type NewRepertoireLink = Database['public']['Tables']['repertoire_links']['Insert'];
export type UpdateRepertoireLink = Database['public']['Tables']['repertoire_links']['Update'];

// Mock link data for testing when Supabase is unavailable
const mockRepertoireLinks: RepertoireLink[] = [
  {
    id: 'mock-link-1',
    master_piece_id: 'mock-piece-1',
    user_id: 'mock-user-1',
    title: 'YouTube Performance',
    url: 'https://www.youtube.com/watch?v=example1',
    link_type: 'video',
    description: 'Professional performance',
    thumbnail_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-link-2',
    master_piece_id: 'mock-piece-1',
    user_id: 'mock-user-1',
    title: 'Spotify Recording',
    url: 'https://open.spotify.com/track/example2',
    link_type: 'audio',
    description: 'Studio recording',
    thumbnail_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-link-3',
    master_piece_id: 'mock-piece-2',
    user_id: 'mock-user-1',
    title: 'IMSLP Sheet Music',
    url: 'https://imslp.org/wiki/example3',
    link_type: 'sheet',
    description: 'Public domain sheet music',
    thumbnail_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * Get links for a repertoire piece with hybrid caching
 * Tries Supabase first, then cached data, then mock data
 */
export function useRepertoireLinks(pieceId: string | undefined) {
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  return useQuery<(RepertoireLink & { _source?: string })[]>({
    queryKey: ['repertoireLinks', pieceId],
    queryFn: async () => {
      if (!pieceId) return [];
      
      try {
        // Try to get data from Supabase
        console.log(`🔍 Fetching links for piece ${pieceId} from Supabase...`);
        const { data, error } = await supabase
          .from('repertoire_links')
          .select('*')
          .eq('master_piece_id', pieceId);
          
        if (error) {
          throw error;
        }
        
        // If we got data successfully, return it with source information
        if (data && data.length > 0) {
          console.log(`✅ Supabase returned ${data.length} links for piece ${pieceId}`);
          return data.map(link => ({
            ...link,
            _source: 'database'
          }));
        }
        
        // If we reach here, it means we got an empty array from Supabase
        console.warn(`⚠️ Supabase returned no links for piece ${pieceId}`);
      } catch (error) {
        // Handle connection errors or other issues
        console.error(`❌ Supabase error fetching links for piece ${pieceId}:`, error);
      }
      
      // If we're here, either there was an error or empty data
      // Check for cached data first
      console.log(`🔍 Checking for cached links for piece ${pieceId}...`);
      const cacheKey = `repertoireLinks_${pieceId}`;
      const cachedData = getCachedMockData<(RepertoireLink & { _source?: string })[]>(cacheKey, []);
      
      if (cachedData && cachedData.length > 0) {
        console.log(`📝 Using cached links for piece ${pieceId} (${cachedData.length} links)`);
        return cachedData.map(link => ({
          ...link,
          _source: 'cached'
        }));
      }
      
      console.log(`📝 Using mock links for piece ${pieceId} as final fallback`);
      // Filter mock data for this piece
      const filteredMockLinks = mockRepertoireLinks
        .filter(link => link.master_piece_id === pieceId || pieceId === 'mock-piece-1')
        .map(link => ({
          ...link,
          _source: 'mock'
        }));
      
      // Cache the mock data for future use
      setCachedMockData(cacheKey, filteredMockLinks);
      
      return filteredMockLinks;
    },
    enabled: !!pieceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new link for a repertoire piece
 */
export function useCreateRepertoireLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newLink: NewRepertoireLink) => {
      const { data, error } = await supabase
        .from('repertoire_links')
        .insert(newLink)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate the query cache for this piece
      queryClient.invalidateQueries({ queryKey: ['repertoireLinks', data.master_piece_id] });
      
      // Update the cached data to include the new link
      try {
        const pieceId = data.master_piece_id;
        const cacheKey = `repertoireLinks_${pieceId}`;
        const cachedData = getCachedMockData<(RepertoireLink & { _source?: string })[]>(cacheKey, []);
        
        if (cachedData) {
          // Add the new link with cache source
          const newCachedData = [
            ...cachedData,
            { ...data, _source: 'cached' }
          ];
          
          // Update the cache
          setCachedMockData(cacheKey, newCachedData);
        }
      } catch (error) {
        console.warn('Failed to update cache after creating repertoire link:', error);
      }
    },
  });
}

/**
 * Hook to delete a link from a repertoire piece
 */
export function useDeleteRepertoireLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ linkId, pieceId }: { linkId: string, pieceId: string }) => {
      const { error } = await supabase
        .from('repertoire_links')
        .delete()
        .eq('id', linkId);
        
      if (error) throw error;
      return { linkId, pieceId };
    },
    onSuccess: ({ linkId, pieceId }) => {
      // Invalidate the query cache for this piece
      queryClient.invalidateQueries({ queryKey: ['repertoireLinks', pieceId] });
      
      // Update the cached data to remove the deleted link
      try {
        const cacheKey = `repertoireLinks_${pieceId}`;
        const cachedData = getCachedMockData<(RepertoireLink & { _source?: string })[]>(cacheKey, []);
        
        if (cachedData) {
          // Remove the deleted link from cache
          const newCachedData = cachedData.filter(link => link.id !== linkId);
          
          // Update the cache
          setCachedMockData(cacheKey, newCachedData);
        }
      } catch (error) {
        console.warn('Failed to update cache after deleting repertoire link:', error);
      }
    },
  });
} 