import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/schema_extensions';
import { useAuth } from '@/lib/auth-wrapper';
import { clerkIdToUuid } from '@/lib/auth-utils';

// Check if we're in development mode
const isDev = import.meta.env.VITE_DEV_MODE === 'true';
// For development, use a consistent UUID that works with RLS policies
const DEV_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export interface UseCalendarEventsOptions {
  startDate?: string;
  endDate?: string;
  studentId?: string;
  enabled?: boolean;
}

/**
 * Hook to fetch calendar events from the database
 * @param options Filtering options for the query
 */
export function useCalendarEvents(options: UseCalendarEventsOptions = {}) {
  const { userId } = useAuth();
  const { startDate, endDate, studentId, enabled = true } = options;

  return useQuery({
    queryKey: ['calendar_events', userId, startDate, endDate, studentId],
    queryFn: async () => {
      if (!userId && !isDev) {
        console.warn('No user ID available, cannot fetch calendar events');
        return [];
      }
      
      // In dev mode, use the dev UUID directly
      const supabaseUUID = isDev ? DEV_UUID : await clerkIdToUuid(userId!);
      
      if (!supabaseUUID) {
        console.warn('Could not convert Clerk ID to Supabase UUID');
        return [];
      }
      
      try {
        // Use any to work around type issues until Supabase schema types are updated
        let query = supabase
          .from('calendar_events' as any)
          .select('*')
          .eq('teacher_id', supabaseUUID);
        
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
        
        const { data, error } = await (query as any);
        
        if (error) {
          console.error('Supabase error details:', error);
          throw error;
        }
        
        // Safe casting: first to unknown, then to the target type
        return ((data || []) as unknown) as CalendarEvent[];
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        return [];
      }
    },
    enabled: enabled && (!!userId || isDev),
  });
} 