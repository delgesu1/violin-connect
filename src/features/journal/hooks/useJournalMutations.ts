import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useDevFallbackUser } from '@/hooks/useDevFallbackUser';
import { getCachedMockData, setCachedMockData } from '@/lib/mockDataCache';
import { JournalEntry } from './useJournalEntries';
import type { Database } from '@/types/supabase';

// Types for our mutations
export type NewJournalEntry = Database['public']['Tables']['journal_entries']['Insert'];
export type UpdateJournalEntry = Database['public']['Tables']['journal_entries']['Update'];

/**
 * Hook for creating a new journal entry
 */
export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  
  return useMutation({
    mutationFn: async (newEntry: Omit<NewJournalEntry, 'user_id' | 'created_at' | 'updated_at'>) => {
      // For development without a real backend
      if (!userId || process.env.NODE_ENV === 'development') {
        const cachedData = getCachedMockData('journalEntries') as JournalEntry[] || [];
        
        const mockEntry: JournalEntry = {
          id: crypto.randomUUID(),
          user_id: userId || 'mock-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...newEntry
        };
        
        const updatedData = [mockEntry, ...cachedData];
        setCachedMockData('journalEntries', updatedData);
        
        return mockEntry;
      }
      
      // Real implementation with Supabase
      const entryWithUserId = {
        ...newEntry,
        user_id: userId
      };
      
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entryWithUserId)
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as JournalEntry;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    }
  });
}

/**
 * Hook for updating an existing journal entry
 */
export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateJournalEntry & { id: string }) => {
      if (!id) {
        throw new Error('Journal entry ID is required');
      }
      
      // For development without a real backend
      if (!userId || process.env.NODE_ENV === 'development') {
        const cachedData = getCachedMockData('journalEntries') as JournalEntry[] || [];
        
        const entryIndex = cachedData.findIndex(entry => entry.id === id);
        if (entryIndex === -1) {
          throw new Error('Journal entry not found');
        }
        
        const updatedEntry = {
          ...cachedData[entryIndex],
          ...updates,
          updated_at: new Date().toISOString()
        };
        
        const updatedData = [...cachedData];
        updatedData[entryIndex] = updatedEntry;
        
        setCachedMockData('journalEntries', updatedData);
        
        return updatedEntry;
      }
      
      // Real implementation with Supabase
      const { data, error } = await supabase
        .from('journal_entries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as JournalEntry;
    },
    onSuccess: (data) => {
      // Invalidate and update relevant queries
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['journalEntry', userId, data.id] });
      queryClient.invalidateQueries({ queryKey: ['journalEntryByDate', userId, data.date] });
    }
  });
}

/**
 * Hook for deleting a journal entry
 */
export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error('Journal entry ID is required');
      }
      
      // For development without a real backend
      if (!userId || process.env.NODE_ENV === 'development') {
        const cachedData = getCachedMockData('journalEntries') as JournalEntry[] || [];
        
        const entryToDelete = cachedData.find(entry => entry.id === id);
        if (!entryToDelete) {
          throw new Error('Journal entry not found');
        }
        
        const updatedData = cachedData.filter(entry => entry.id !== id);
        setCachedMockData('journalEntries', updatedData);
        
        return entryToDelete;
      }
      
      // Real implementation with Supabase
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      return { id };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    }
  });
} 