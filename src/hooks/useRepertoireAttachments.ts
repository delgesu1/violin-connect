import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { RepertoireFile, RepertoireLink } from '@/types/schema_extensions';

// Type aliases for cleaner code
type NewRepertoireFile = Omit<RepertoireFile, 'id' | 'created_at' | 'updated_at' | 'uploaded_at'>;
type UpdateRepertoireFile = Partial<Omit<RepertoireFile, 'id' | 'created_at' | 'updated_at' | 'uploaded_at' | 'master_piece_id' | 'user_id'>>;

type NewRepertoireLink = Omit<RepertoireLink, 'id' | 'created_at' | 'updated_at'>;
type UpdateRepertoireLink = Partial<Omit<RepertoireLink, 'id' | 'created_at' | 'updated_at' | 'master_piece_id' | 'user_id'>>;

/**
 * Hook to fetch all files for a repertoire piece
 */
export function useRepertoireFiles(masterPieceId: string | undefined) {
  const { userId } = useAuth();
  
  return useQuery<RepertoireFile[]>({
    queryKey: ['repertoire-files', masterPieceId, userId],
    queryFn: async () => {
      if (!masterPieceId || !userId) return [];
      
      const supabaseUUID = clerkIdToUuid(userId);
      if (!supabaseUUID) return [];
      
      const { data, error } = await supabase
        .from('repertoire_files')
        .select('*')
        .eq('master_piece_id', masterPieceId)
        .eq('user_id', supabaseUUID);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!masterPieceId && !!userId,
  });
}

/**
 * Hook to fetch all links for a repertoire piece
 */
export function useRepertoireLinks(masterPieceId: string | undefined) {
  const { userId } = useAuth();
  
  return useQuery<RepertoireLink[]>({
    queryKey: ['repertoire-links', masterPieceId, userId],
    queryFn: async () => {
      if (!masterPieceId || !userId) return [];
      
      const supabaseUUID = clerkIdToUuid(userId);
      if (!supabaseUUID) return [];
      
      const { data, error } = await supabase
        .from('repertoire_links')
        .select('*')
        .eq('master_piece_id', masterPieceId)
        .eq('user_id', supabaseUUID);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!masterPieceId && !!userId,
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
      if (!userId) throw new Error('User not authenticated');
      
      const supabaseUUID = clerkIdToUuid(userId);
      if (!supabaseUUID) throw new Error('Invalid user ID format');
      
      const fileData: NewRepertoireFile = {
        ...newFile,
        user_id: supabaseUUID
      };
      
      const { data, error } = await supabase
        .from('repertoire_files')
        .insert(fileData)
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