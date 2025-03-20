import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useDevFallbackUser } from '@/hooks/useDevFallbackUser';
import { getCachedMockData } from '@/lib/mockDataCache';
import { JournalEntry } from './useJournalEntries';

export interface SearchJournalParams {
  query: string;
  fields?: ('practice_goals' | 'notes' | 'went_well' | 'beautified' | 'frustrations' | 'improvements')[];
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * Hook to search journal entries by content
 */
export function useSearchJournalEntries(params: SearchJournalParams, options?: { enabled?: boolean }) {
  const { user, isLoaded } = useDevFallbackUser();
  const userId = user?.id;
  
  const { query, fields, startDate, endDate, limit } = params;
  
  return useQuery({
    queryKey: ['journalSearch', userId, query, fields, startDate, endDate, limit],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return [];
      }
      
      // For development without a real backend
      if (!userId || process.env.NODE_ENV === 'development') {
        const cachedData = getCachedMockData('journalEntries') as JournalEntry[];
        if (cachedData) {
          let results = [...cachedData];
          
          // Apply date filters
          if (startDate) {
            results = results.filter(entry => entry.date >= startDate);
          }
          
          if (endDate) {
            results = results.filter(entry => entry.date <= endDate);
          }
          
          // Apply search filter
          const searchFields = fields || ['practice_goals', 'notes', 'went_well', 'beautified', 'frustrations', 'improvements'];
          
          results = results.filter(entry => {
            return searchFields.some(field => {
              const value = entry[field];
              return value && typeof value === 'string' && 
                value.toLowerCase().includes(query.toLowerCase());
            });
          });
          
          // Sort by relevance (simple algorithm - contains in title gets higher priority)
          results.sort((a, b) => {
            const aHasInTitle = a.practice_goals?.toLowerCase().includes(query.toLowerCase()) || false;
            const bHasInTitle = b.practice_goals?.toLowerCase().includes(query.toLowerCase()) || false;
            
            if (aHasInTitle && !bHasInTitle) return -1;
            if (!aHasInTitle && bHasInTitle) return 1;
            
            // Secondary sort by date (newer first)
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          
          // Apply limit
          if (limit) {
            results = results.slice(0, limit);
          }
          
          return results;
        }
        
        return [];
      }
      
      // Build search query for Supabase
      const searchQuery = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId);
      
      // Apply date range filters if provided
      if (startDate) {
        searchQuery.gte('date', startDate);
      }
      
      if (endDate) {
        searchQuery.lte('date', endDate);
      }
      
      // Apply content search (with OR conditions for each field)
      const searchFields = fields || ['practice_goals', 'notes', 'went_well', 'beautified', 'frustrations', 'improvements'];
      
      // Build 'or' conditions for text search
      const orConditions = searchFields.map(field => 
        `${field}.ilike.%${query}%`
      ).join(',');
      
      if (orConditions) {
        searchQuery.or(orConditions);
      }
      
      // Add sorting and limit
      searchQuery.order('date', { ascending: false });
      
      if (limit) {
        searchQuery.limit(limit);
      }
      
      const { data, error } = await searchQuery;
      
      if (error) {
        throw error;
      }
      
      return data as JournalEntry[];
    },
    enabled: isLoaded && !!query && query.trim().length >= 2 && (options?.enabled !== false),
  });
} 