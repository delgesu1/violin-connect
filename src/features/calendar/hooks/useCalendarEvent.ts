import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/schema_extensions';

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
      
      try {
        const { data, error } = await (supabase
          .from('calendar_events' as any)
          .select('*')
          .eq('id', id)
          .single() as any);
        
        if (error) throw error;
        
        // Safe casting
        return (data as unknown) as CalendarEvent;
      } catch (err) {
        console.error('Error fetching calendar event:', err);
        return null;
      }
    },
    enabled: !!id && (options?.enabled !== false),
  });
} 