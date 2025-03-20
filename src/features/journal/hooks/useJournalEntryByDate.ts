import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useDevFallbackUser } from '@/hooks/useDevFallbackUser';
import { getCachedMockData } from '@/lib/mockDataCache';
import { JournalEntry } from './useJournalEntries';
import { format } from 'date-fns';

/**
 * Hook to fetch a journal entry by date
 * @param date A Date object or ISO string date
 */
export function useJournalEntryByDate(date: Date | string, options?: { enabled?: boolean }) {
  const { user, isLoaded } = useDevFallbackUser();
  const userId = user?.id;
  
  // Format date to YYYY-MM-DD if it's a Date object
  const formattedDate = typeof date === 'string' 
    ? date 
    : format(date, 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['journalEntryByDate', userId, formattedDate],
    queryFn: async () => {
      if (!formattedDate) {
        throw new Error('Date is required');
      }
      
      // For development without a real backend
      if (!userId || process.env.NODE_ENV === 'development') {
        // Use cached mock data
        const cachedData = getCachedMockData('journalEntries') as JournalEntry[];
        if (cachedData) {
          const entry = cachedData.find(e => e.date === formattedDate);
          if (entry) return entry;
        }
        
        return null; // No entry for this date
      }
      
      // Real implementation with Supabase
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('date', formattedDate)
        .eq('user_id', userId)
        .maybeSingle(); // Returns null if no entry found
      
      if (error) {
        throw error;
      }
      
      return data as JournalEntry | null;
    },
    enabled: !!formattedDate && isLoaded && (options?.enabled !== false),
  });
} 