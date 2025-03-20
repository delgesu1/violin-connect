import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/schema_extensions';
import { isValidUUID } from '@/lib/id-utils';
import { DEV_CALENDAR_UUIDS, DEV_TEACHER_UUID, DEV_STUDENT_UUIDS } from '@/lib/dev-uuids';

// Check if we're in development mode
const isDev = import.meta.env.VITE_DEV_MODE === 'true';

// Cache key for individual calendar events
const CALENDAR_EVENT_CACHE_KEY = 'calendar_event_cache';

// Helper to get a cached calendar event
const getCachedCalendarEvent = (id: string): CalendarEvent | null => {
  try {
    const cached = localStorage.getItem(`${CALENDAR_EVENT_CACHE_KEY}:${id}`);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.warn(`Error reading calendar event cache for id ${id}:`, err);
    return null;
  }
};

// Helper to set a cached calendar event
const setCachedCalendarEvent = (id: string, event: CalendarEvent) => {
  try {
    localStorage.setItem(
      `${CALENDAR_EVENT_CACHE_KEY}:${id}`, 
      JSON.stringify({ ...event, _source: 'database' as const })
    );
  } catch (err) {
    console.warn(`Error setting calendar event cache for id ${id}:`, err);
  }
};

// Helper to generate a mock calendar event for development
const getMockCalendarEvent = (id: string): CalendarEvent => {
  // Try to match the ID to one of our predefined events
  if (id === DEV_CALENDAR_UUIDS.EMMA_CALENDAR_1) {
    return {
      id,
      title: 'Lesson with Emma',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      teacher_id: DEV_TEACHER_UUID,
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
    };
  }
  
  if (id === DEV_CALENDAR_UUIDS.RECITAL) {
    return {
      id,
      title: 'Student Recital',
      start_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      end_time: new Date(Date.now() + 172800000 + 7200000).toISOString(),
      teacher_id: DEV_TEACHER_UUID,
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
    };
  }
  
  // Generic mock event
  return {
    id,
    title: 'Calendar Event',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString(),
    teacher_id: DEV_TEACHER_UUID,
    student_id: null,
    location: 'Studio',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Required fields
    event_type: 'other',
    description: 'Generic calendar event',
    lesson_id: null,
    all_day: false,
    recurrence_rule: null,
    _source: 'mock'
  };
};

/**
 * Hook to fetch a single calendar event by ID
 * @param id The ID of the calendar event
 * @param options Query options
 */
export function useCalendarEvent(
  id: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['calendar_event', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Validate the UUID format
      if (!isValidUUID(id)) {
        console.error(`Invalid calendar event UUID format: ${id}`);
        
        // In development mode, use mock data for invalid UUIDs
        if (isDev) {
          console.info('Using mock calendar event for invalid UUID in development mode');
          return getMockCalendarEvent(id);
        }
        
        return null;
      }
      
      // First, try to fetch from the database
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Add source tracking
          const eventWithSource = {
            ...data,
            _source: 'database' as const
          };
          
          // Cache the successful result
          setCachedCalendarEvent(id, eventWithSource);
          
          return eventWithSource;
        }
        
        return null;
      } catch (err) {
        console.error('Error fetching calendar event:', err);
        
        // On error, try to get cached data
        const cachedEvent = getCachedCalendarEvent(id);
        if (cachedEvent) {
          console.info('Using cached calendar event after database error');
          return { ...cachedEvent, _source: 'cached' as const };
        }
        
        // As a last resort, use mock data in development
        if (isDev) {
          console.info('Using mock calendar event after database error');
          return getMockCalendarEvent(id);
        }
        
        return null;
      }
    },
    enabled: !!id && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
} 