import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useDevFallbackUser } from '@/hooks/useDevFallbackUser';
import { getCachedMockData } from '@/lib/mockDataCache';
import { JournalEntry } from './useJournalEntries';

/**
 * Hook to fetch a single journal entry by ID
 */
export function useJournalEntry(id: string, options?: { enabled?: boolean }) {
  const { user, isLoaded } = useDevFallbackUser();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['journalEntry', userId, id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Journal entry ID is required');
      }
      
      // For development without a real backend
      if (!userId || process.env.NODE_ENV === 'development') {
        // Use cached mock data
        const cachedData = getCachedMockData('journalEntries') as JournalEntry[];
        if (cachedData) {
          const entry = cachedData.find(e => e.id === id);
          if (entry) return entry;
        }
        throw new Error('Journal entry not found');
      }
      
      // Real implementation with Supabase
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Journal entry not found');
      }
      
      return data as JournalEntry;
    },
    enabled: !!id && isLoaded && (options?.enabled !== false),
  });
} 