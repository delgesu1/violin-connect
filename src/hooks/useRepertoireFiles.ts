import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { getCachedMockData, setCachedMockData } from '@/lib/mockDataCache';

// Types for our hook returns
export type RepertoireFile = Database['public']['Tables']['repertoire_files']['Row'];
export type NewRepertoireFile = Database['public']['Tables']['repertoire_files']['Insert'];
export type UpdateRepertoireFile = Database['public']['Tables']['repertoire_files']['Update'];

// Mock file data for testing when Supabase is unavailable
const mockRepertoireFiles: RepertoireFile[] = [
  {
    id: 'mock-file-1',
    master_piece_id: 'mock-piece-1',
    user_id: 'mock-user-1',
    file_name: 'Sample Score.pdf',
    file_url: '/mock/sample-score.pdf',
    file_type: 'application/pdf',
    file_size: 2500000,
    description: 'Full score with annotations',
    uploaded_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-file-2',
    master_piece_id: 'mock-piece-1',
    user_id: 'mock-user-1',
    file_name: 'Recording.mp3',
    file_url: '/mock/recording.mp3',
    file_type: 'audio/mpeg',
    file_size: 5000000,
    description: 'Professional recording',
    uploaded_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mock-file-3',
    master_piece_id: 'mock-piece-2',
    user_id: 'mock-user-1',
    file_name: 'Practice Notes.pdf',
    file_url: '/mock/practice-notes.pdf',
    file_type: 'application/pdf',
    file_size: 1200000,
    description: 'Suggested practice routine',
    uploaded_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * Get files for a repertoire piece with hybrid caching
 * Tries Supabase first, then cached data, then mock data
 */
export function useRepertoireFiles(pieceId: string | undefined) {
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  return useQuery<(RepertoireFile & { _source?: string })[]>({
    queryKey: ['repertoireFiles', pieceId],
    queryFn: async () => {
      if (!pieceId) return [];
      
      try {
        // Try to get data from Supabase
        console.log(`🔍 Fetching files for piece ${pieceId} from Supabase...`);
        const { data, error } = await supabase
          .from('repertoire_files')
          .select('*')
          .eq('master_piece_id', pieceId);
          
        if (error) {
          throw error;
        }
        
        // If we got data successfully, return it with source information
        if (data && data.length > 0) {
          console.log(`✅ Supabase returned ${data.length} files for piece ${pieceId}`);
          return data.map(file => ({
            ...file,
            _source: 'database'
          }));
        }
        
        // If we reach here, it means we got an empty array from Supabase
        console.warn(`⚠️ Supabase returned no files for piece ${pieceId}`);
      } catch (error) {
        // Handle connection errors or other issues
        console.error(`❌ Supabase error fetching files for piece ${pieceId}:`, error);
      }
      
      // If we're here, either there was an error or empty data
      // Check for cached data first
      console.log(`🔍 Checking for cached files for piece ${pieceId}...`);
      const cacheKey = `repertoireFiles_${pieceId}`;
      const cachedData = getCachedMockData<(RepertoireFile & { _source?: string })[]>(cacheKey, []);
      
      if (cachedData && cachedData.length > 0) {
        console.log(`📝 Using cached files for piece ${pieceId} (${cachedData.length} files)`);
        return cachedData.map(file => ({
          ...file,
          _source: 'cached'
        }));
      }
      
      console.log(`📝 Using mock files for piece ${pieceId} as final fallback`);
      // Filter mock data for this piece
      const filteredMockFiles = mockRepertoireFiles
        .filter(file => file.master_piece_id === pieceId || pieceId === 'mock-piece-1')
        .map(file => ({
          ...file,
          _source: 'mock'
        }));
      
      // Cache the mock data for future use
      setCachedMockData(cacheKey, filteredMockFiles);
      
      return filteredMockFiles;
    },
    enabled: !!pieceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new file for a repertoire piece
 */
export function useCreateRepertoireFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newFile: NewRepertoireFile) => {
      const { data, error } = await supabase
        .from('repertoire_files')
        .insert(newFile)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate the query cache for this piece
      queryClient.invalidateQueries({ queryKey: ['repertoireFiles', data.master_piece_id] });
      
      // Update the cached data to include the new file
      try {
        const pieceId = data.master_piece_id;
        const cacheKey = `repertoireFiles_${pieceId}`;
        const cachedData = getCachedMockData<(RepertoireFile & { _source?: string })[]>(cacheKey, []);
        
        if (cachedData) {
          // Add the new file with cache source
          const newCachedData = [
            ...cachedData,
            { ...data, _source: 'cached' }
          ];
          
          // Update the cache
          setCachedMockData(cacheKey, newCachedData);
        }
      } catch (error) {
        console.warn('Failed to update cache after creating repertoire file:', error);
      }
    },
  });
}

/**
 * Hook to delete a file from a repertoire piece
 */
export function useDeleteRepertoireFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fileId, pieceId }: { fileId: string, pieceId: string }) => {
      const { error } = await supabase
        .from('repertoire_files')
        .delete()
        .eq('id', fileId);
        
      if (error) throw error;
      return { fileId, pieceId };
    },
    onSuccess: ({ fileId, pieceId }) => {
      // Invalidate the query cache for this piece
      queryClient.invalidateQueries({ queryKey: ['repertoireFiles', pieceId] });
      
      // Update the cached data to remove the deleted file
      try {
        const cacheKey = `repertoireFiles_${pieceId}`;
        const cachedData = getCachedMockData<(RepertoireFile & { _source?: string })[]>(cacheKey, []);
        
        if (cachedData) {
          // Remove the deleted file from cache
          const newCachedData = cachedData.filter(file => file.id !== fileId);
          
          // Update the cache
          setCachedMockData(cacheKey, newCachedData);
        }
      } catch (error) {
        console.warn('Failed to update cache after deleting repertoire file:', error);
      }
    },
  });
} 