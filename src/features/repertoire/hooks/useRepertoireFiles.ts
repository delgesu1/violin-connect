import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isDevelopment } from '@/lib/environment';
import type { Database } from '@/types/supabase';

// Types
export type RepertoireFile = Database['public']['Tables']['repertoire_files']['Row'];
export type NewRepertoireFile = Database['public']['Tables']['repertoire_files']['Insert'];

// File source tracking
export type FileSourceType = 'api' | 'cache' | 'mock';

// Mock data for testing
const mockFiles: Record<string, RepertoireFile[]> = {};

/**
 * Check if a string appears to be a UUID
 */
function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Hook to fetch repertoire files for a specific piece with hybrid caching approach
 */
export function useRepertoireFiles(pieceId: string | undefined) {
  const cacheKey = `repertoire-files-${pieceId}`;
  const [cachedData, setCachedData] = useLocalStorage<RepertoireFile[]>(cacheKey, []);
  
  return useQuery<(RepertoireFile & { _source?: FileSourceType })[]>({
    queryKey: ['repertoireFiles', pieceId],
    queryFn: async () => {
      if (!pieceId) return [];
      
      try {
        // STEP 1: Try to fetch from API first
        console.log(`🔍 Fetching files for piece ${pieceId} from Supabase...`);
        
        // For UUID piece IDs, we want to query Supabase directly
        // We need to handle different ID formats - the database uses UUIDs
        const pieceIdForQuery = isUuid(pieceId) ? pieceId : pieceId;
        
        const { data, error } = await supabase
          .from('repertoire_files')
          .select('*')
          .eq('master_piece_id', pieceIdForQuery);
          
        // If we get a successful response, cache it and return with source tracking
        if (!error && data) {
          console.log(`✅ Supabase returned ${data.length} files for piece ${pieceId}`);
          setCachedData(data);
          return data.map(file => ({ ...file, _source: 'api' as FileSourceType }));
        }
        
        // If API call failed, log the error
        if (error) {
          console.error(`Error fetching files for piece ${pieceId}:`, error);
        }
        
        // STEP 2: Fall back to cached data if available
        if (cachedData && cachedData.length > 0) {
          console.log(`📦 Using ${cachedData.length} cached files for piece ${pieceId}`);
          return cachedData.map(file => ({ ...file, _source: 'cache' as FileSourceType }));
        }
        
        // STEP 3: Fall back to mock data in development environment
        if (isDevelopment()) {
          // Check for existing mock data
          if (mockFiles[pieceId]) {
            return mockFiles[pieceId].map(file => ({ ...file, _source: 'mock' as FileSourceType }));
          }
          
          // No mock data exists for this piece yet, create some example files
          const mockFileData: RepertoireFile[] = [
            {
              id: `file-${pieceId}-1`,
              master_piece_id: pieceId,
              file_name: 'Score.pdf',
              file_type: 'application/pdf',
              file_size: 1024000,
              file_url: '#',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              description: 'Full score PDF',
              uploaded_at: new Date().toISOString(),
              user_id: 'mock-user-id'
            },
            {
              id: `file-${pieceId}-2`,
              master_piece_id: pieceId,
              file_name: 'Practice Guide.pdf',
              file_type: 'application/pdf',
              file_size: 512000,
              file_url: '#',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              description: 'Practice techniques and exercises',
              uploaded_at: new Date().toISOString(),
              user_id: 'mock-user-id'
            },
            {
              id: `file-${pieceId}-3`,
              master_piece_id: pieceId,
              file_name: 'Recording.mp3',
              file_type: 'audio/mpeg',
              file_size: 4096000,
              file_url: '#',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              description: 'Professional recording for reference',
              uploaded_at: new Date().toISOString(),
              user_id: 'mock-user-id'
            }
          ];
          
          // Store for future use
          mockFiles[pieceId] = mockFileData;
          
          return mockFileData.map(file => ({ ...file, _source: 'mock' as FileSourceType }));
        }
        
        // If nothing worked, return empty array
        return [];
      } catch (error) {
        console.error(`Error in useRepertoireFiles for piece ${pieceId}:`, error);
        
        // STEP 2: Fall back to cached data if available
        if (cachedData && cachedData.length > 0) {
          return cachedData.map(file => ({ ...file, _source: 'cache' as FileSourceType }));
        }
        
        // STEP 3: Fall back to mock data in development
        if (isDevelopment() && mockFiles[pieceId]) {
          return mockFiles[pieceId].map(file => ({ ...file, _source: 'mock' as FileSourceType }));
        }
        
        return [];
      }
    },
    enabled: !!pieceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new repertoire file
 */
export function useCreateRepertoireFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newFile: NewRepertoireFile) => {
      try {
        // Try to call the API first
        const { data, error } = await supabase
          .from('repertoire_files')
          .insert(newFile)
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error('Error creating repertoire file:', error);
        
        // If API fails and we're in development, use mock data
        if (isDevelopment()) {
          const mockFile: RepertoireFile = {
            id: `file-${Date.now()}`,
            master_piece_id: newFile.master_piece_id,
            file_name: newFile.file_name || 'Unnamed file',
            file_type: newFile.file_type || 'application/pdf',
            file_size: newFile.file_size || 0,
            file_url: newFile.file_url || '#',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: newFile.description || '',
            uploaded_at: new Date().toISOString(),
            user_id: newFile.user_id || 'mock-user-id'
          };
          
          // Add to mock data
          if (!mockFiles[newFile.master_piece_id]) {
            mockFiles[newFile.master_piece_id] = [];
          }
          
          mockFiles[newFile.master_piece_id].push(mockFile);
          
          return mockFile;
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate the files query to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['repertoireFiles', data.master_piece_id] 
      });
    },
  });
}

/**
 * Hook to delete a repertoire file
 */
export function useDeleteRepertoireFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fileId, pieceId }: { fileId: string; pieceId: string }) => {
      try {
        // Try to call the API first
        const { error } = await supabase
          .from('repertoire_files')
          .delete()
          .eq('id', fileId);
          
        if (error) throw error;
        
        return { id: fileId, pieceId };
      } catch (error) {
        console.error(`Error deleting repertoire file ${fileId}:`, error);
        
        // If API fails and we're in development, update mock data
        if (isDevelopment() && mockFiles[pieceId]) {
          mockFiles[pieceId] = mockFiles[pieceId].filter(file => file.id !== fileId);
          return { id: fileId, pieceId };
        }
        
        throw error;
      }
    },
    onSuccess: (result) => {
      // Invalidate the files query to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['repertoireFiles', result.pieceId] 
      });
    },
  });
} 