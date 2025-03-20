import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/schema_extensions';
import { useAuth } from '@/lib/auth-wrapper';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID, DEV_CALENDAR_UUIDS, DEV_STUDENT_UUIDS } from '@/lib/dev-uuids';

// Check if we're in development mode
const isDev = import.meta.env.VITE_DEV_MODE === 'true';

export interface UseCalendarEventsOptions {
  startDate?: string;
  endDate?: string;
  studentId?: string;
  enabled?: boolean;
}

// Cache key for calendar events
const CALENDAR_EVENTS_CACHE_KEY = 'calendar_events_cache';

// Helper to get cached calendar events
const getCachedCalendarEvents = (): Record<string, CalendarEvent[]> => {
  try {
    const cached = localStorage.getItem(CALENDAR_EVENTS_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (err) {
    console.warn('Error reading calendar events cache:', err);
    return {};
  }
};

// Helper to set cached calendar events
const setCachedCalendarEvents = (cacheKey: string, events: CalendarEvent[]) => {
  try {
    const cache = getCachedCalendarEvents();
    cache[cacheKey] = events.map(event => ({ ...event, _source: 'database' as const }));
    localStorage.setItem(CALENDAR_EVENTS_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('Error setting calendar events cache:', err);
  }
};

// Generate mock calendar events for development
const getMockCalendarEvents = (teacherId: string, options: UseCalendarEventsOptions): CalendarEvent[] => {
  // Create some generic mock events
  const mockEvents: CalendarEvent[] = [
    {
      id: DEV_CALENDAR_UUIDS.EMMA_CALENDAR_1,
      title: 'Lesson with Emma',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      teacher_id: teacherId,
      student_id: DEV_STUDENT_UUIDS.EMMA,
      location: 'Online',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Required fields
      event_type: 'lesson',
      description: 'Regular violin lesson with Emma',
      lesson_id: null,
      all_day: false,
      recurrence_rule: null,
      _source: 'mock'
    },
    {
      id: DEV_CALENDAR_UUIDS.JAMES_CALENDAR_1,
      title: 'Lesson with James',
      start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(),
      teacher_id: teacherId,
      student_id: DEV_STUDENT_UUIDS.JAMES,
      location: 'Studio',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Required fields
      event_type: 'lesson',
      description: 'Regular violin lesson with James',
      lesson_id: null,
      all_day: false,
      recurrence_rule: null,
      _source: 'mock'
    },
    {
      id: DEV_CALENDAR_UUIDS.RECITAL,
      title: 'Student Recital',
      start_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      end_time: new Date(Date.now() + 172800000 + 7200000).toISOString(),
      teacher_id: teacherId,
      student_id: null,
      location: 'Concert Hall',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Required fields
      event_type: 'performance',
      description: 'End of semester student recital',
      lesson_id: null,
      all_day: false,
      recurrence_rule: null,
      _source: 'mock'
    }
  ];
  
  // Apply filters if provided
  let filteredEvents = [...mockEvents];
  
  if (options.studentId) {
    filteredEvents = filteredEvents.filter(event => 
      event.student_id === options.studentId
    );
  }
  
  if (options.startDate) {
    filteredEvents = filteredEvents.filter(event => 
      event.start_time >= options.startDate
    );
  }
  
  if (options.endDate) {
    filteredEvents = filteredEvents.filter(event => 
      event.end_time <= options.endDate
    );
  }
  
  return filteredEvents;
};

/**
 * Hook to fetch calendar events from the database
 * @param options Filtering options for the query
 */
export function useCalendarEvents(options: UseCalendarEventsOptions = {}) {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { startDate, endDate, studentId, enabled = true } = options;
  
  // Build a cache key based on the query parameters
  const cacheKey = `teacher:${userId}:start:${startDate || 'none'}:end:${endDate || 'none'}:student:${studentId || 'none'}`;
  
  return useQuery({
    queryKey: ['calendar_events', userId, startDate, endDate, studentId],
    queryFn: async () => {
      // UUID validation for student ID if provided
      if (studentId && !isValidUUID(studentId)) {
        console.error(`Invalid student UUID format: ${studentId}`);
        return [];
      }
      
      // Always try to fetch from database first
      try {
        // In dev mode, use the dev teacher UUID if no user ID is available
        const teacherId = !userId && isDev ? DEV_TEACHER_UUID : await clerkIdToUuid(userId || '');
        
        if (!teacherId) {
          console.warn('Could not get a valid teacher ID');
          
          // Try to get cached data
          const cache = getCachedCalendarEvents();
          if (cache[cacheKey]) {
            console.info('Using cached calendar events');
            return cache[cacheKey].map(event => ({ ...event, _source: 'cached' as const }));
          }
          
          // Fall back to mock data in development mode
          if (isDev) {
            console.info('Using mock calendar events in development mode');
            return getMockCalendarEvents(DEV_TEACHER_UUID, options);
          }
          
          return [];
        }
        
        // Validate the teacher UUID
        if (!isValidUUID(teacherId)) {
          console.error(`Invalid teacher UUID format: ${teacherId}`);
          
          // Try to get cached data
          const cache = getCachedCalendarEvents();
          if (cache[cacheKey]) {
            console.info('Using cached calendar events');
            return cache[cacheKey].map(event => ({ ...event, _source: 'cached' as const }));
          }
          
          // Fall back to mock data in development mode
          if (isDev) {
            console.info('Using mock calendar events in development mode');
            return getMockCalendarEvents(DEV_TEACHER_UUID, options);
          }
          
          return [];
        }
        
        // Build the query
        let query = supabase
          .from('calendar_events')
          .select('*')
          .eq('teacher_id', teacherId);
        
        // Apply date range filters if provided
        if (startDate) {
          query = query.gte('start_time', startDate);
        }
        
        if (endDate) {
          query = query.lte('end_time', endDate);
        }
        
        // Filter by student ID if provided
        if (studentId) {
          query = query.eq('student_id', studentId);
        }
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) {
          console.error('Supabase error details:', error);
          throw error;
        }
        
        // Add source tracking to each event
        const eventsWithSource = (data || []).map(event => ({
          ...event,
          _source: 'database' as const
        }));
        
        // Cache the successful result for offline use
        setCachedCalendarEvents(cacheKey, eventsWithSource);
        
        return eventsWithSource;
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        
        // On error, try to get cached data
        const cache = getCachedCalendarEvents();
        if (cache[cacheKey]) {
          console.info('Using cached calendar events after database error');
          return cache[cacheKey].map(event => ({ ...event, _source: 'cached' as const }));
        }
        
        // As a last resort, use mock data in development mode
        if (isDev) {
          console.info('Using mock calendar events after database error');
          return getMockCalendarEvents(DEV_TEACHER_UUID, options);
        }
        
        return [];
      }
    },
    enabled: enabled && (!!userId || isDev),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
} 