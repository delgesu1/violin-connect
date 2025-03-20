import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { RepertoireFile, RepertoireLink } from '@/types/schema_extensions';
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID } from '@/lib/dev-uuids';
import { isDevelopment } from '@/lib/environment';

// Source types for tracking data origin
type FileSourceType = 'database' | 'cached' | 'mock';
type LinkSourceType = 'database' | 'cached' | 'mock';

// Type aliases for cleaner code
type NewRepertoireFile = Omit<RepertoireFile, 'id' | 'created_at' | 'updated_at' | 'uploaded_at'>;
type UpdateRepertoireFile = Partial<Omit<RepertoireFile, 'id' | 'created_at' | 'updated_at' | 'uploaded_at' | 'master_piece_id' | 'user_id'>>;

type NewRepertoireLink = Omit<RepertoireLink, 'id' | 'created_at' | 'updated_at'>;
type UpdateRepertoireLink = Partial<Omit<RepertoireLink, 'id' | 'created_at' | 'updated_at' | 'master_piece_id' | 'user_id'>>;

// Mock data for development mode
const mockFiles: Record<string, RepertoireFile[]> = {};
const mockLinks: Record<string, RepertoireLink[]> = {};

/**
 * Hook to fetch all files for a repertoire piece
 */
export function useRepertoireFiles(masterPieceId: string | undefined) {
  const { userId } = useAuth();
  const cacheKey = `repertoire-files-${masterPieceId}`;
  
  return useQuery<(RepertoireFile & { _source?: FileSourceType })[]>({
    queryKey: ['repertoire-files', masterPieceId, userId],
    queryFn: async () => {
      if (!masterPieceId) return [];
      
      // Validate master piece UUID
      if (!isValidUUID(masterPieceId)) {
        console.error(`Invalid UUID format for masterPieceId: ${masterPieceId}`);
        
        // In development mode, we can still proceed with mock data
        if (!isDevelopment()) {
          return [];
        }
      }
      
      try {
        // Get user UUID for database calls
        const supabaseUUID = userId ? await clerkIdToUuid(userId) : isDevelopment() ? DEV_TEACHER_UUID : null;
        
        if (!supabaseUUID) {
          console.warn('No valid user ID available for repertoire files fetch');
          return [];
        }
        
        // STEP 1: Try to fetch from database
        const { data, error } = await supabase
          .from('repertoire_files')
          .select('*')
          .eq('master_piece_id', masterPieceId)
          .eq('user_id', supabaseUUID);
          
        if (error) {
          console.error(`Error fetching files for piece ${masterPieceId}:`, error);
          throw error;
        }
        
        // Add source tracking
        return (data || []).map(file => ({ 
          ...file, 
          _source: 'database' as FileSourceType 
        }));
      } catch (error) {
        console.error(`Error in useRepertoireFiles for piece ${masterPieceId}:`, error);
        
        // STEP 2: Fall back to mock data in development mode
        if (isDevelopment()) {
          // Check if we have mock data for this piece
          if (mockFiles[masterPieceId] && mockFiles[masterPieceId].length > 0) {
            return mockFiles[masterPieceId].map(file => ({ 
              ...file, 
              _source: 'mock' as FileSourceType 
            }));
          }
          
          // Create some mock data
          const mockFileData: RepertoireFile[] = [
            {
              id: `file-${Date.now()}-1`,
              master_piece_id: masterPieceId,
              user_id: userId || DEV_TEACHER_UUID,
              file_name: 'Sample Sheet Music.pdf',
              file_url: 'https://example.com/files/sample-sheet.pdf',
              file_type: 'application/pdf',
              file_size: 1024 * 1024 * 2, // 2MB
              description: 'Sample sheet music for development',
              uploaded_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          
          // Store in mock data for future use
          mockFiles[masterPieceId] = mockFileData;
          
          return mockFileData.map(file => ({ 
            ...file, 
            _source: 'mock' as FileSourceType 
          }));
        }
        
        return [];
      }
    },
    enabled: !!masterPieceId && (!!userId || isDevelopment()),
  });
}

/**
 * Hook to fetch all links for a repertoire piece
 */
export function useRepertoireLinks(masterPieceId: string | undefined) {
  const { userId } = useAuth();
  const cacheKey = `repertoire-links-${masterPieceId}`;
  
  return useQuery<(RepertoireLink & { _source?: LinkSourceType })[]>({
    queryKey: ['repertoire-links', masterPieceId, userId],
    queryFn: async () => {
      if (!masterPieceId) return [];
      
      // Validate master piece UUID
      if (!isValidUUID(masterPieceId)) {
        console.error(`Invalid UUID format for masterPieceId: ${masterPieceId}`);
        
        // In development mode, we can still proceed with mock data
        if (!isDevelopment()) {
          return [];
        }
      }
      
      try {
        // Get user UUID for database calls
        const supabaseUUID = userId ? await clerkIdToUuid(userId) : isDevelopment() ? DEV_TEACHER_UUID : null;
        
        if (!supabaseUUID) {
          console.warn('No valid user ID available for repertoire links fetch');
          return [];
        }
        
        // STEP 1: Try to fetch from database
        const { data, error } = await supabase
          .from('repertoire_links')
          .select('*')
          .eq('master_piece_id', masterPieceId)
          .eq('user_id', supabaseUUID);
          
        if (error) {
          console.error(`Error fetching links for piece ${masterPieceId}:`, error);
          throw error;
        }
        
        // Add source tracking
        return (data || []).map(link => ({ 
          ...link, 
          _source: 'database' as LinkSourceType 
        }));
      } catch (error) {
        console.error(`Error in useRepertoireLinks for piece ${masterPieceId}:`, error);
        
        // STEP 2: Fall back to mock data in development mode
        if (isDevelopment()) {
          // Check if we have mock data for this piece
          if (mockLinks[masterPieceId] && mockLinks[masterPieceId].length > 0) {
            return mockLinks[masterPieceId].map(link => ({ 
              ...link, 
              _source: 'mock' as LinkSourceType 
            }));
          }
          
          // Create some mock data
          const mockLinkData: RepertoireLink[] = [
            {
              id: `link-${Date.now()}-1`,
              master_piece_id: masterPieceId,
              user_id: userId || DEV_TEACHER_UUID,
              title: 'Sample Performance',
              url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
              link_type: 'youtube',
              description: 'Sample performance for development',
              thumbnail_url: 'https://example.com/thumbnails/sample.jpg',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          
          // Store in mock data for future use
          mockLinks[masterPieceId] = mockLinkData;
          
          return mockLinkData.map(link => ({ 
            ...link, 
            _source: 'mock' as LinkSourceType 
          }));
        }
        
        return [];
      }
    },
    enabled: !!masterPieceId && (!!userId || isDevelopment()),
  });
}

/**
 * Hook to add a file to a repertoire piece
 */
export function useAddRepertoireFile() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (newFile: Omit<NewRepertoireFile, 'user_id'>) => {
      if (!userId && !isDevelopment()) {
        throw new Error('User not authenticated');
      }
      
      // Validate master piece UUID
      if (!isValidUUID(newFile.master_piece_id)) {
        console.error(`Invalid UUID format for masterPieceId: ${newFile.master_piece_id}`);
        
        if (!isDevelopment()) {
          throw new Error(`Invalid UUID format: ${newFile.master_piece_id}`);
        }
      }
      
      // Get user UUID for database calls
      const supabaseUUID = userId ? await clerkIdToUuid(userId) : isDevelopment() ? DEV_TEACHER_UUID : null;
      
      if (!supabaseUUID) {
        throw new Error('Invalid user ID format');
      }
      
      const fileData: NewRepertoireFile = {
        ...newFile,
        user_id: supabaseUUID
      };
      
      try {
        // In development mode, can use mock data
        if (isDevelopment() && !isValidUUID(newFile.master_piece_id)) {
          console.log('Using mock data for adding repertoire file');
          
          const mockFile: RepertoireFile = {
            id: `file-${Date.now()}`,
            ...fileData,
            uploaded_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Add to mock data
          if (!mockFiles[newFile.master_piece_id]) {
            mockFiles[newFile.master_piece_id] = [];
          }
          
          mockFiles[newFile.master_piece_id].push(mockFile);
          
          return { ...mockFile, _source: 'mock' as FileSourceType };
        }
        
        // Use Supabase for valid UUIDs
        const { data, error } = await supabase
          .from('repertoire_files')
          .insert(fileData)
          .select()
          .single();
          
        if (error) throw error;
        return { ...data, _source: 'database' as FileSourceType };
      } catch (error) {
        console.error('Error adding repertoire file:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repertoire-files', data.master_piece_id] });
    },
  });
}

/**
 * Hook to update a repertoire file
 */
export function useUpdateRepertoireFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateRepertoireFile }) => {
      const { data, error } = await supabase
        .from('repertoire_files')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repertoire-files', data.master_piece_id] });
    },
  });
}

/**
 * Hook to delete a repertoire file
 */
export function useDeleteRepertoireFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, masterPieceId }: { id: string; masterPieceId: string }) => {
      const { error } = await supabase
        .from('repertoire_files')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return { id, masterPieceId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repertoire-files', data.masterPieceId] });
    },
  });
}

/**
 * Hook to add a link to a repertoire piece
 */
export function useAddRepertoireLink() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (newLink: Omit<NewRepertoireLink, 'user_id'>) => {
      if (!userId) throw new Error('User not authenticated');
      
      const supabaseUUID = clerkIdToUuid(userId);
      if (!supabaseUUID) throw new Error('Invalid user ID format');
      
      const linkData: NewRepertoireLink = {
        ...newLink,
        user_id: supabaseUUID
      };
      
      const { data, error } = await supabase
        .from('repertoire_links')
        .insert(linkData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repertoire-links', data.master_piece_id] });
    },
  });
}

/**
 * Hook to update a repertoire link
 */
export function useUpdateRepertoireLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateRepertoireLink }) => {
      const { data, error } = await supabase
        .from('repertoire_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repertoire-links', data.master_piece_id] });
    },
  });
}

/**
 * Hook to delete a repertoire link
 */
export function useDeleteRepertoireLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, masterPieceId }: { id: string; masterPieceId: string }) => {
      const { error } = await supabase
        .from('repertoire_links')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return { id, masterPieceId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repertoire-links', data.masterPieceId] });
    },
  });
} 