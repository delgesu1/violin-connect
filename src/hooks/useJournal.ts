import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { format } from 'date-fns';
import { useDevFallbackUser } from './useDevFallbackUser';
import { setCachedMockData, getCachedMockData } from '@/lib/mockDataCache';

// Types for our hook returns
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
export type NewJournalEntry = Database['public']['Tables']['journal_entries']['Insert'];
export type UpdateJournalEntry = Database['public']['Tables']['journal_entries']['Update'];

// Create a shared mock data array to use across all hooks
const mockJournalEntries: JournalEntry[] = [
  {
    "id": "cf2d04a3-cbcb-4524-a262-50e58b758091",
    "user_id": "771ab2f3-ffbd-4ced-a36a-46f07f7a2b59",
    "date": "2025-03-13",
    "practice_goals": "Work on the Tchaikovsky concerto, focusing on intonation in the development section",
    "notes": "Practiced for 2 hours today. Started with scales and arpeggios for warm-up.",
    "went_well": "My double stops are sounding much cleaner after focused practice.",
    "beautified": "The lyrical section in the second movement - worked on varied vibrato.",
    "frustrations": "Still struggling with consistent intonation in the highest positions.",
    "improvements": "Need to practice the difficult passages with drone tones tomorrow.",
    "created_at": "2025-03-13 07:36:08.269158+00",
    "updated_at": "2025-03-13 07:36:08.269158+00"
  },
  {
    "id": "d012f319-8797-4ef1-8409-56e894de2fe4",
    "user_id": "771ab2f3-ffbd-4ced-a36a-46f07f7a2b59",
    "date": "2025-03-12",
    "practice_goals": "Bach Partita - memorize the first page",
    "notes": "Focused solely on the Bach today for 90 minutes.",
    "went_well": "Successfully memorized the first page and can play it reliably.",
    "beautified": "The dance-like quality in the opening section.",
    "frustrations": "Having trouble with consistent tempo when playing from memory.",
    "improvements": "Record myself tomorrow to check tempo consistency.",
    "created_at": "2025-03-13 07:36:08.269158+00",
    "updated_at": "2025-03-13 07:36:08.269158+00"
  },
  {
    "id": "30aa99da-a137-492a-aa85-4bf2a09a58ed",
    "user_id": "771ab2f3-ffbd-4ced-a36a-46f07f7a2b59",
    "date": "2025-03-11",
    "practice_goals": "Work on the Tchaikovsky concerto, focusing on intonation in the development section",
    "notes": "Practiced for 2 hours today. Started with scales and arpeggios for warm-up.",
    "went_well": "My double stops are sounding much cleaner after focused practice.",
    "beautified": "The lyrical section in the second movement - worked on varied vibrato.",
    "frustrations": "Still struggling with consistent intonation in the highest positions.",
    "improvements": "Need to practice the difficult passages with drone tones tomorrow.",
    "created_at": "2025-03-13 07:37:27.148822+00",
    "updated_at": "2025-03-13 07:37:27.148822+00"
  },
  {
    "id": "401fc5c1-1e3e-425c-97ae-88cbd65e6d7d",
    "user_id": "771ab2f3-ffbd-4ced-a36a-46f07f7a2b59",
    "date": "2025-03-10",
    "practice_goals": "Bach Partita - memorize the first page",
    "notes": "Focused solely on the Bach today for 90 minutes.",
    "went_well": "Successfully memorized the first page and can play it reliably.",
    "beautified": "The dance-like quality in the opening section.",
    "frustrations": "Having trouble with consistent tempo when playing from memory.",
    "improvements": "Record myself tomorrow to check tempo consistency.",
    "created_at": "2025-03-13 07:37:27.148822+00",
    "updated_at": "2025-03-13 07:37:27.148822+00"
  },
  {
    "id": "6663d2d9-b03c-400c-99b2-63c2929125de",
    "user_id": "771ab2f3-ffbd-4ced-a36a-46f07f7a2b59",
    "date": "2025-03-09",
    "practice_goals": "Work on the Tchaikovsky concerto, focusing on intonation in the development section",
    "notes": "Practiced for 2 hours today. Started with scales and arpeggios for warm-up.",
    "went_well": "My double stops are sounding much cleaner after focused practice.",
    "beautified": "The lyrical section in the second movement - worked on varied vibrato.",
    "frustrations": "Still struggling with consistent intonation in the highest positions.",
    "improvements": "Need to practice the difficult passages with drone tones tomorrow.",
    "created_at": "2025-03-13 08:26:13.879805+00",
    "updated_at": "2025-03-13 08:26:13.879805+00"
  },
  {
    "id": "ea4e0d8e-59ce-4f0b-bc12-375bf4358907",
    "user_id": "771ab2f3-ffbd-4ced-a36a-46f07f7a2b59",
    "date": "2025-03-08",
    "practice_goals": "Bach Partita - memorize the first page",
    "notes": "Focused solely on the Bach today for 90 minutes.",
    "went_well": "Successfully memorized the first page and can play it reliably.",
    "beautified": "The dance-like quality in the opening section.",
    "frustrations": "Having trouble with consistent tempo when playing from memory.",
    "improvements": "Record myself tomorrow to check tempo consistency.",
    "created_at": "2025-03-13 08:26:13.879805+00",
    "updated_at": "2025-03-13 08:26:13.879805+00"
  },
  {
    "id": "72952d6c-5284-4c39-a311-aaf0025f9939",
    "user_id": "771ab2f3-ffbd-4ced-a36a-46f07f7a2b59",
    "date": "2025-03-07",
    "practice_goals": "Work on the Tchaikovsky concerto, focusing on intonation in the development section",
    "notes": "Practiced for 2 hours today. Started with scales and arpeggios for warm-up.",
    "went_well": "My double stops are sounding much cleaner after focused practice.",
    "beautified": "The lyrical section in the second movement - worked on varied vibrato.",
    "frustrations": "Still struggling with consistent intonation in the highest positions.",
    "improvements": "Need to practice the difficult passages with drone tones tomorrow.",
    "created_at": "2025-03-13 09:31:56.285142+00",
    "updated_at": "2025-03-13 09:31:56.285142+00"
  },
  {
    "id": "b9fd5cae-699d-4395-be0b-441031d0fe7c",
    "user_id": "771ab2f3-ffbd-4ced-a36a-46f07f7a2b59",
    "date": "2025-03-06",
    "practice_goals": "Bach Partita - memorize the first page",
    "notes": "Focused solely on the Bach today for 90 minutes.",
    "went_well": "Successfully memorized the first page and can play it reliably.",
    "beautified": "The dance-like quality in the opening section.",
    "frustrations": "Having trouble with consistent tempo when playing from memory.",
    "improvements": "Record myself tomorrow to check tempo consistency.",
    "created_at": "2025-03-13 09:31:56.285142+00",
    "updated_at": "2025-03-13 09:31:56.285142+00"
  },
  {
    "id": "41a8e72c-c0ac-43df-85a8-ffea598e54e3",
    "user_id": "771ab2f3-ffbd-4ced-a36a-46f07f7a2b59",
    "date": "2025-03-05",
    "practice_goals": "Work on the Tchaikovsky concerto, focusing on intonation in the development section",
    "notes": "Practiced for 2 hours today. Started with scales and arpeggios for warm-up.",
    "went_well": "My double stops are sounding much cleaner after focused practice.",
    "beautified": "The lyrical section in the second movement - worked on varied vibrato.",
    "frustrations": "Still struggling with consistent intonation in the highest positions.",
    "improvements": "Need to practice the difficult passages with drone tones tomorrow.",
    "created_at": "2025-03-13 09:34:54.83993+00",
    "updated_at": "2025-03-13 09:34:54.83993+00"
  },
  {
    "id": "1ebb2395-4a4d-4e66-a3ff-9b38a8b3bc65",
    "user_id": "771ab2f3-ffbd-4ced-a36a-46f07f7a2b59",
    "date": "2025-03-04",
    "practice_goals": "Bach Partita - memorize the first page",
    "notes": "Focused solely on the Bach today for 90 minutes.",
    "went_well": "Successfully memorized the first page and can play it reliably.",
    "beautified": "The dance-like quality in the opening section.",
    "frustrations": "Having trouble with consistent tempo when playing from memory.",
    "improvements": "Record myself tomorrow to check tempo consistency.",
    "created_at": "2025-03-13 09:34:54.83993+00",
    "updated_at": "2025-03-13 09:34:54.83993+00"
  }
];

/**
 * Hook to fetch all journal entries for the current user
 */
export function useJournalEntries() {
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';

  return useQuery<(JournalEntry & { _source?: 'database' | 'cached' | 'mock' | 'cached-fallback' | 'mock-fallback' })[]>({
    queryKey: ['journalEntries', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No user ID available, returning empty journal entries array');
        return [];
      }
      
      console.log(`Fetching journal entries for user ID: ${userId}`);
      console.log(`Running in ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
      
      try {
        // Always try to get data from Supabase first, even in development mode
        console.log('Querying Supabase for journal entries');
        
        // Execute the main query for the user's entries
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
          
        if (error) {
          console.error('Error fetching journal entries:', error);
          throw error;
        }
        
        // If we get data successfully
        if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} journal entries from database`);
          
          // Cache the successful response for future fallback
          setCachedMockData('journalEntries_' + userId, data);
          
          // Return data with source information
          return data.map(entry => ({
            ...entry,
            _source: 'database'
          }));
        }
        
        console.log('No journal entries found in database');
      } catch (err) {
        console.error('Exception fetching journal entries from Supabase:', err);
        
        // If we're in production, we can't use cached or mock data
        if (!isDev) throw err;
        
        console.log('Will try to use cached data as fallback due to Supabase error');
      }
      
      // If we're here, either:
      // 1. We're in development mode and hit an error with Supabase
      // 2. We got no results from Supabase
      
      // Try to get data from cache
      if (isDev) {
        console.log('Checking for cached journal entries...');
        const cachedEntries = getCachedMockData<JournalEntry[]>('journalEntries_' + userId, []);
        
        if (cachedEntries && cachedEntries.length > 0) {
          console.log(`Using ${cachedEntries.length} cached journal entries`);
          
          // Return cached data with source information
          return cachedEntries.map(entry => ({
            ...entry,
            _source: 'cached-fallback'
          }));
        }
        
        // As a last resort, use mock data
        console.log('No cached entries found, using mock journal entries as final fallback');
        
        // Filter for entries that match the current user ID
        const userEntries = mockJournalEntries.filter(entry => entry.user_id === userId);
        console.log(`Using ${userEntries.length} mock entries for user ${userId}`);
        
        // Sort by date descending - newest first
        const sortedEntries = userEntries.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        // Cache the mock data for future use
        setCachedMockData('journalEntries_' + userId, sortedEntries);
        
        // Return mock data with source information
        return sortedEntries.map(entry => ({
          ...entry,
          _source: 'mock-fallback'
        }));
      }
      
      // If we get here in production mode, return empty array
      return [];
    },
    enabled: !!userId,
    retry: 1, // Retry once on error
    retryDelay: 1000, // Wait 1 second before retrying
  });
}

/**
 * Hook to fetch a single journal entry by ID
 */
export function useJournalEntry(id: string | undefined) {
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';

  return useQuery<(JournalEntry & { _source?: 'database' | 'cached' | 'mock' | 'cached-fallback' | 'mock-fallback' }) | null>({
    queryKey: ['journalEntries', id, userId],
    queryFn: async () => {
      if (!id || !userId) return null;
      
      console.log(`Fetching journal entry with ID: ${id} for user ID: ${userId}`);
      console.log(`Running in ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
      
      try {
        // Always try Supabase first, even in development mode
        console.log('Querying Supabase for journal entry by ID');
        
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId);
          
        if (error) {
          console.error('Error fetching journal entry by ID:', error.message);
          throw error;
        }
        
        // If we get data successfully
        if (data && data.length > 0) {
          console.log(`Retrieved journal entry with ID: ${id} from database`);
          console.log('Entry data:', data);
          
          // Extract the first item from the array
          const entryData = data[0];
          
          // Cache the successful response for future fallback
          setCachedMockData(`journalEntry_${id}_${userId}`, entryData);
          
          // Return data with source information
          const result = {
            ...entryData,
            _source: 'database' as const
          };
          
          console.log('Returning entry result:', result);
          return result;
        }
        
        console.log(`No journal entry found in database with ID: ${id}`);
      } catch (err) {
        console.error('Exception fetching journal entry from Supabase:', err);
        
        // If we're in production, we can't use cached or mock data
        if (!isDev) throw err;
        
        console.log('Will try to use cached data as fallback due to Supabase error');
      }
      
      // Try to get data from cache
      if (isDev) {
        console.log(`Checking for cached journal entry with ID: ${id}...`);
        const cachedEntry = getCachedMockData<JournalEntry | null>(
          `journalEntry_${id}_${userId}`, 
          null
        );
        
        if (cachedEntry) {
          console.log(`Using cached journal entry with ID: ${id}`);
          
          // Return cached data with source information
          return {
            ...cachedEntry,
            _source: 'cached-fallback'
          };
        }
        
        // As a last resort, use mock data
        console.log(`No cached entry found, checking mock data for ID: ${id}`);
        
        // Find entry with this specific ID and user
        const mockEntry = mockJournalEntries.find(
          entry => entry.id === id && entry.user_id === userId
        );
        
        if (mockEntry) {
          console.log(`Found mock entry with ID: ${id}`);
          
          // Cache the mock data for future use
          setCachedMockData(`journalEntry_${id}_${userId}`, mockEntry);
          
          // Return mock data with source information
          return {
            ...mockEntry,
            _source: 'mock-fallback'
          };
        }
        
        console.log(`No mock entry found with ID: ${id}`);
      }
      
      // If nothing found, return null
      return null;
    },
    enabled: !!id && !!userId,
  });
}

/**
 * Hook to fetch a journal entry by date for the current user
 */
export function useJournalEntryByDate(date: Date | string | undefined) {
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  const formattedDate = date ? (typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')) : undefined;
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';

  return useQuery<(JournalEntry & { _source?: 'database' | 'cached' | 'mock' | 'cached-fallback' | 'mock-fallback' }) | null>({
    queryKey: ['journalEntry', 'byDate', formattedDate, userId],
    queryFn: async () => {
      if (!formattedDate) {
        console.log('No date provided, returning null');
        return null;
      }
      
      if (!userId) {
        console.log('No user ID available, returning null for journal entry by date');
        return null;
      }

      console.log(`Fetching journal entry for date: ${formattedDate} and user ID: ${userId}`);
      console.log(`Running in ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);

      try {
        // Always try Supabase first, even in development mode
        console.log('Querying Supabase for journal entry by date');
        
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('date', formattedDate)
          .eq('user_id', userId)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching journal entry by date:', error.message);
          throw error;
        }
        
        // If we get data successfully
        if (data) {
          console.log(`Retrieved journal entry for date: ${formattedDate} from database`);
          
          // Cache the successful response for future fallback
          setCachedMockData(`journalEntry_${formattedDate}_${userId}`, data);
          
          // Return data with source information
          return {
            ...data,
            _source: 'database'
          };
        }
        
        console.log(`No journal entry found in database for date: ${formattedDate}`);
      } catch (err) {
        console.error('Exception fetching journal entry from Supabase:', err);
        
        // If we're in production, we can't use cached or mock data
        if (!isDev) throw err;
        
        console.log('Will try to use cached data as fallback due to Supabase error');
      }
      
      // If we're here, either:
      // 1. We're in development mode and hit an error with Supabase
      // 2. We got no results from Supabase
      
      // Try to get data from cache
      if (isDev) {
        console.log(`Checking for cached journal entry for date: ${formattedDate}...`);
        const cachedEntry = getCachedMockData<JournalEntry | null>(
          `journalEntry_${formattedDate}_${userId}`, 
          null
        );
        
        if (cachedEntry) {
          console.log(`Using cached journal entry for date: ${formattedDate}`);
          
          // Return cached data with source information
          return {
            ...cachedEntry,
            _source: 'cached-fallback'
          };
        }
        
        // As a last resort, use mock data
        console.log(`No cached entry found, checking mock data for date: ${formattedDate}`);
        
        // Find entry for this specific date and user
        const mockEntry = mockJournalEntries.find(
          entry => entry.user_id === userId && entry.date === formattedDate
        );
        
        if (mockEntry) {
          console.log(`Found mock entry for date: ${formattedDate}`);
          
          // Cache the mock data for future use
          setCachedMockData(`journalEntry_${formattedDate}_${userId}`, mockEntry);
          
          // Return mock data with source information
          return {
            ...mockEntry,
            _source: 'mock-fallback'
          };
        }
        
        console.log(`No mock entry found for date: ${formattedDate}`);
      }
      
      // If nothing found, return null
      return null;
    },
    enabled: !!formattedDate && !!userId,
    retry: 1, // Retry once on error
    retryDelay: 1000, // Wait 1 second before retrying
  });
}

/**
 * Hook to create a new journal entry
 */
export function useCreateJournalEntry() {
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!userId) {
        console.error('No user ID available, cannot create journal entry');
        throw new Error('User not authenticated');
      }

      console.log(`Creating journal entry for user ID: ${userId}`);
      console.log(`Running in ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
      console.log('Entry data:', entry);
      
      // Always try to insert into Supabase first, even in development mode
      try {
        console.log('Inserting journal entry into Supabase');
        
        const entryWithUserId: NewJournalEntry = {
          ...entry,
          user_id: userId
        };
        
        console.log('Preparing to insert entry:', entryWithUserId);
        
        const { data, error } = await supabase
          .from('journal_entries')
          .insert(entryWithUserId)
          .select()
          .single();
          
        if (error) {
          console.error('Error creating journal entry:', error);
          // In production mode, throw the error
          if (!isDev) throw new Error(`Failed to create journal entry: ${error.message}`);
          // In development mode, continue to mock fallback
          console.log('Falling back to mock creation in development mode');
        } else {
          console.log('Journal entry created successfully in database:', data);
          
          // Update the cache with the new entry
          // First get existing cached entries
          const cachedEntries = getCachedMockData<JournalEntry[]>('journalEntries_' + userId, []);
          
          // Add the new entry to the cache
          const updatedCache = [data, ...cachedEntries];
          
          // Save back to cache
          setCachedMockData('journalEntries_' + userId, updatedCache);
          
          // Also cache the individual entry by date
          setCachedMockData(`journalEntry_${data.date}_${userId}`, data);
          
          return data;
        }
      } catch (err) {
        console.error('Exception creating journal entry in Supabase:', err);
        
        // If in production mode, re-throw the error
        if (!isDev) throw err;
        
        console.log('Using mock fallback for journal entry creation');
      }
      
      // If we're here, it means we're in development mode and Supabase operation failed
      // Create a mock entry
      const newEntry: JournalEntry = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        user_id: userId,
        ...entry,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to the mock entries array for future reference
      mockJournalEntries.push(newEntry);
      console.log('Created mock journal entry:', newEntry);
      
      // Update the cache with the new entry
      // First get existing cached entries
      const cachedEntries = getCachedMockData<JournalEntry[]>('journalEntries_' + userId, []);
          
      // Add the new entry to the cache
      const updatedCache = [newEntry, ...cachedEntries];
          
      // Save back to cache
      setCachedMockData('journalEntries_' + userId, updatedCache);
          
      // Also cache the individual entry by date
      setCachedMockData(`journalEntry_${newEntry.date}_${userId}`, newEntry);
      
      return newEntry;
    },
    onSuccess: (data) => {
      console.log('Invalidating queries after successful creation');
      queryClient.invalidateQueries({ queryKey: ['journalEntries', userId] });
      queryClient.invalidateQueries({ queryKey: ['journalEntry', 'byDate', data.date, userId] });
      
      // Log success details
      console.log(`Journal entry for ${data.date} created successfully`);
    },
    onError: (error) => {
      console.error('Mutation error in useCreateJournalEntry:', error);
    }
  });
}

/**
 * Hook to update an existing journal entry
 */
export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  return useMutation({
    mutationFn: async ({ id, entry }: { id: string; entry: UpdateJournalEntry }) => {
      if (!userId) {
        throw new Error('No user ID available. Cannot update journal entry.');
      }
      
      console.log(`Updating journal entry ${id} for user ${userId}`);
      console.log(`Entry update data:`, entry);
      
      try {
        // Always try Supabase first, even in development mode
        const { data, error } = await supabase
          .from('journal_entries')
          .update(entry)
          .eq('id', id)
          .eq('user_id', userId) // Ensure the user can only update their own entries
          .select()
          .single();
          
        if (error) {
          console.error('Error updating journal entry:', error);
          // In production mode, throw the error
          if (!isDev) throw error;
          // In development mode, continue to mock fallback
          console.log('Falling back to mock update in development mode');
        } else {
          console.log('Journal entry updated successfully in database:', data);
          
          // Update the cache for this entry
          const date = data.date;
          
          // Update individual entry cache
          setCachedMockData(`journalEntry_${date}_${userId}`, data);
          
          // Update entry in journal entries list cache
          const cachedEntries = getCachedMockData<JournalEntry[]>('journalEntries_' + userId, []);
          const updatedEntries = cachedEntries.map(cachedEntry => 
            cachedEntry.id === id ? data : cachedEntry
          );
          setCachedMockData('journalEntries_' + userId, updatedEntries);
          
          return {
            ...data,
            _source: 'database' as const
          };
        }
      } catch (err) {
        console.error('Exception updating journal entry in Supabase:', err);
        if (!isDev) throw err;
      }
      
      // If we're here, it means we're in development mode and Supabase operation failed
      // Update the mock entry
      const mockIndex = mockJournalEntries.findIndex(e => e.id === id && e.user_id === userId);
      
      if (mockIndex === -1) {
        throw new Error(`Journal entry with ID ${id} not found.`);
      }
      
      // Get the existing entry to merge with updates
      const existingEntry = mockJournalEntries[mockIndex];
      
      // Create updated entry
      const updatedEntry: JournalEntry = {
        ...existingEntry,
        ...entry,
        updated_at: new Date().toISOString()
      };
      
      // Update the mock entry
      mockJournalEntries[mockIndex] = updatedEntry;
      
      // Update the caches for this entry
      // Update individual entry cache
      setCachedMockData(`journalEntry_${updatedEntry.date}_${userId}`, updatedEntry);
      
      // Update entry in journal entries list cache
      const cachedEntries = getCachedMockData<JournalEntry[]>('journalEntries_' + userId, []);
      const updatedEntries = cachedEntries.map(cachedEntry => 
        cachedEntry.id === id ? updatedEntry : cachedEntry
      );
      setCachedMockData('journalEntries_' + userId, updatedEntries);
      
      console.log('Updated mock journal entry:', updatedEntry);
      
      return {
        ...updatedEntry,
        _source: 'mock-fallback' as const
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries', userId] });
      queryClient.invalidateQueries({ queryKey: ['journalEntry', 'byDate', data.date, userId] });
    },
  });
}

/**
 * Hook to delete a journal entry
 */
export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) {
        throw new Error('No user ID available. Cannot delete journal entry.');
      }
      
      // First get the entry to know its date
      const { data: entry } = await supabase
        .from('journal_entries')
        .select('date')
        .eq('id', id)
        .eq('user_id', userId) // Ensure the user can only delete their own entries
        .single();
      
      const date = entry?.date;
      
      // Then delete it
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Ensure the user can only delete their own entries
        
      if (error) {
        console.error('Error deleting journal entry:', error);
        throw error;
      }
      return { id, date };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries', userId] });
      if (data.date) {
        queryClient.invalidateQueries({ queryKey: ['journalEntries', 'byDate', data.date, userId] });
      }
    },
  });
}

/**
 * Hook to search journal entries
 */
export function useSearchJournalEntries(query: string, enabled = false) {
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  
  return useQuery<JournalEntry[]>({
    queryKey: ['journalEntries', 'search', query, userId],
    queryFn: async () => {
      if (!query || query.length < 2 || !userId) return [];
      
      // Search across multiple fields using filter
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId) // Filter by user ID
        .or(`practice_goals.ilike.%${query}%,notes.ilike.%${query}%,went_well.ilike.%${query}%,beautified.ilike.%${query}%,frustrations.ilike.%${query}%,improvements.ilike.%${query}%`)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error searching journal entries:', error);
        throw error;
      }
      return data || [];
    },
    enabled: enabled && query.length >= 2 && !!userId,
  });
} 