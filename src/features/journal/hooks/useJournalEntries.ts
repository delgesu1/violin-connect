import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { useDevFallbackUser } from '@/hooks/useDevFallbackUser';
import { getCachedMockData } from '@/lib/mockDataCache';

// Types for our hook returns
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'] & {
  _source?: 'database' | 'cached' | 'mock' | 'cached-fallback' | 'mock-fallback';
};

/**
 * Hook to fetch all journal entries for the current user
 * Optionally filtered by date range
 */
export function useJournalEntries(options?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const { user, isLoaded } = useDevFallbackUser();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['journalEntries', userId, options?.startDate, options?.endDate, options?.limit],
    queryFn: async () => {
      // For development without a real backend
      if (!userId || process.env.NODE_ENV === 'development') {
        // Use cached data if available
        const cachedData = getCachedMockData('journalEntries') as JournalEntry[];
        if (cachedData) {
          let filteredData = [...cachedData];
          
          // Apply date filters if provided
          if (options?.startDate) {
            filteredData = filteredData.filter(entry => entry.date >= options.startDate!);
          }
          
          if (options?.endDate) {
            filteredData = filteredData.filter(entry => entry.date <= options.endDate!);
          }
          
          // Sort by date (newest first)
          filteredData.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          
          // Apply limit if provided
          if (options?.limit) {
            filteredData = filteredData.slice(0, options.limit);
          }
          
          return filteredData;
        }
        
        // Return empty array if no cached data
        return [];
      }
      
      // Real implementation with Supabase
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId);
        
      if (options?.startDate) {
        query = query.gte('date', options.startDate);
      }
      
      if (options?.endDate) {
        query = query.lte('date', options.endDate);
      }
      
      query = query.order('date', { ascending: false });
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data as JournalEntry[];
    },
    enabled: isLoaded && (options?.enabled !== false),
  });
} 