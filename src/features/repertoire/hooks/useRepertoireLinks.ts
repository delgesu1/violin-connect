import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isDevelopment } from '@/lib/environment';
import type { Database } from '@/types/supabase';

// Types
export type RepertoireLink = Database['public']['Tables']['repertoire_links']['Row'];
export type NewRepertoireLink = Database['public']['Tables']['repertoire_links']['Insert'];

// Link source tracking
export type LinkSourceType = 'api' | 'cache' | 'mock';

// Mock data for testing
const mockLinks: Record<string, RepertoireLink[]> = {};

/**
 * Check if a string appears to be a UUID
 */
function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Hook to fetch repertoire links for a specific piece with hybrid caching approach
 */
export function useRepertoireLinks(pieceId: string | undefined) {
  const cacheKey = `repertoire-links-${pieceId}`;
  const [cachedData, setCachedData] = useLocalStorage<RepertoireLink[]>(cacheKey, []);
  
  return useQuery<(RepertoireLink & { _source?: LinkSourceType })[]>({
    queryKey: ['repertoireLinks', pieceId],
    queryFn: async () => {
      if (!pieceId) return [];
      
      try {
        // STEP 1: Try to fetch from API first
        console.log(`🔍 Fetching links for piece ${pieceId} from Supabase...`);
        
        // For UUID piece IDs, we want to query Supabase directly
        // We need to handle different ID formats - the database uses UUIDs
        const pieceIdForQuery = isUuid(pieceId) ? pieceId : pieceId;
        
        const { data, error } = await supabase
          .from('repertoire_links')
          .select('*')
          .eq('master_piece_id', pieceIdForQuery);
          
        // If we get a successful response, cache it and return with source tracking
        if (!error && data) {
          console.log(`✅ Supabase returned ${data.length} links for piece ${pieceId}`);
          setCachedData(data);
          return data.map(link => ({ ...link, _source: 'api' as LinkSourceType }));
        }
        
        // If API call failed, log the error
        if (error) {
          console.error(`Error fetching links for piece ${pieceId}:`, error);
        }
        
        // STEP 2: Fall back to cached data if available
        if (cachedData && cachedData.length > 0) {
          console.log(`📦 Using ${cachedData.length} cached links for piece ${pieceId}`);
          return cachedData.map(link => ({ ...link, _source: 'cache' as LinkSourceType }));
        }
        
        // STEP 3: Fall back to mock data in development environment
        if (isDevelopment()) {
          // Check for existing mock data
          if (mockLinks[pieceId]) {
            return mockLinks[pieceId].map(link => ({ ...link, _source: 'mock' as LinkSourceType }));
          }
          
          // No mock data exists for this piece yet, create some example links
          const mockLinkData: RepertoireLink[] = [
            {
              id: `link-${pieceId}-1`,
              master_piece_id: pieceId,
              title: 'Performance by Hilary Hahn',
              url: 'https://www.youtube.com/watch?v=example1',
              link_type: 'youtube',
              thumbnail_url: 'https://img.youtube.com/vi/example1/hqdefault.jpg',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              description: 'Masterful performance by Hilary Hahn',
              user_id: 'mock-user-id'
            },
            {
              id: `link-${pieceId}-2`,
              master_piece_id: pieceId,
              title: 'Masterclass with Itzhak Perlman',
              url: 'https://www.youtube.com/watch?v=example2',
              link_type: 'youtube',
              thumbnail_url: 'https://img.youtube.com/vi/example2/hqdefault.jpg',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              description: 'Insightful masterclass with tips for playing this piece',
              user_id: 'mock-user-id'
            },
            {
              id: `link-${pieceId}-3`,
              master_piece_id: pieceId,
              title: 'Historical Analysis from The Strad',
              url: 'https://example.com/article/analysis',
              link_type: 'article',
              thumbnail_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              description: 'Article about the historical context and performance practice',
              user_id: 'mock-user-id'
            }
          ];
          
          // Store for future use
          mockLinks[pieceId] = mockLinkData;
          
          return mockLinkData.map(link => ({ ...link, _source: 'mock' as LinkSourceType }));
        }
        
        // If nothing worked, return empty array
        return [];
      } catch (error) {
        console.error(`Error in useRepertoireLinks for piece ${pieceId}:`, error);
        
        // STEP 2: Fall back to cached data if available
        if (cachedData && cachedData.length > 0) {
          return cachedData.map(link => ({ ...link, _source: 'cache' as LinkSourceType }));
        }
        
        // STEP 3: Fall back to mock data in development
        if (isDevelopment() && mockLinks[pieceId]) {
          return mockLinks[pieceId].map(link => ({ ...link, _source: 'mock' as LinkSourceType }));
        }
        
        return [];
      }
    },
    enabled: !!pieceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new repertoire link
 */
export function useCreateRepertoireLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newLink: NewRepertoireLink) => {
      try {
        // Try to call the API first
        const { data, error } = await supabase
          .from('repertoire_links')
          .insert(newLink)
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Error creating repertoire link:', error);
        
        // If API fails and we're in development, use mock data
        if (isDevelopment()) {
          const mockLink: RepertoireLink = {
            id: `link-${Date.now()}`,
            master_piece_id: newLink.master_piece_id,
            title: newLink.title || 'Unnamed link',
            url: newLink.url,
            link_type: newLink.link_type || 'other',
            thumbnail_url: newLink.thumbnail_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: newLink.description || '',
            user_id: newLink.user_id || 'mock-user-id'
          };
          
          // Add to mock data
          if (!mockLinks[newLink.master_piece_id]) {
            mockLinks[newLink.master_piece_id] = [];
          }
          
          mockLinks[newLink.master_piece_id].push(mockLink);
          
          return mockLink;
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate the links query to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['repertoireLinks', data.master_piece_id] 
      });
    },
  });
}

/**
 * Hook to delete a repertoire link
 */
export function useDeleteRepertoireLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ linkId, pieceId }: { linkId: string; pieceId: string }) => {
      try {
        // Try to call the API first
        const { error } = await supabase
          .from('repertoire_links')
          .delete()
          .eq('id', linkId);
          
        if (error) throw error;
        
        return { id: linkId, pieceId };
      } catch (error) {
        console.error(`Error deleting repertoire link ${linkId}:`, error);
        
        // If API fails and we're in development, update mock data
        if (isDevelopment() && mockLinks[pieceId]) {
          mockLinks[pieceId] = mockLinks[pieceId].filter(link => link.id !== linkId);
          return { id: linkId, pieceId };
        }
        
        throw error;
      }
    },
    onSuccess: (result) => {
      // Invalidate the links query to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['repertoireLinks', result.pieceId] 
      });
    },
  });
} 