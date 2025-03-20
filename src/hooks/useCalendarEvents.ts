import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/supabase';
import { useAuth } from '@/lib/auth-wrapper';
import { clerkIdToUuid } from '@/lib/auth-utils';

// Check if we're in development mode
const isDev = import.meta.env.VITE_DEV_MODE === 'true';
// For development, use a consistent UUID that works with RLS policies
const DEV_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export type NewCalendarEvent = Omit<CalendarEvent, 'id' | 'created_at'>;
export type UpdateCalendarEvent = Partial<CalendarEvent>;

interface UseCalendarEventsOptions {
  startDate?: string;
  endDate?: string;
  studentId?: string;
}

/**
 * Hook to fetch calendar events from the database
 */
export function useCalendarEvents(options: UseCalendarEventsOptions = {}) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: ['calendar_events', userId, options.startDate, options.endDate, options.studentId],
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
        if (options.startDate) {
          query = query.gte('start_time', options.startDate);
        }
        
        if (options.endDate) {
          query = query.lte('end_time', options.endDate);
        }
        
        // Filter by student ID if provided
        if (options.studentId) {
          query = query.eq('student_id', options.studentId);
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
    enabled: !!userId || isDev,
  });
}

/**
 * Hook to fetch a single calendar event by ID
 */
export function useCalendarEvent(id: string | undefined) {
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
        return (data as unknown) as CalendarEvent | null;
      } catch (err) {
        console.error('Error fetching calendar event:', err);
        return null;
      }
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new calendar event
 */
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (newEvent: NewCalendarEvent) => {
      // In dev mode, use the dev UUID
      const supabaseUUID = isDev ? DEV_UUID : await clerkIdToUuid(userId!);
      
      if (!supabaseUUID) {
        throw new Error('Could not convert Clerk ID to Supabase UUID');
      }
      
      const { data, error } = await (supabase
        .from('calendar_events' as any)
        .insert({ ...newEvent, teacher_id: supabaseUUID } as any)
        .select()
        .single() as any);
        
      if (error) throw error;
      return (data as unknown) as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
    },
  });
}

/**
 * Hook to update an existing calendar event
 */
export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, event }: { id: string; event: UpdateCalendarEvent }) => {
      const { data, error } = await (supabase
        .from('calendar_events' as any)
        .update(event as any)
        .eq('id', id)
        .select()
        .single() as any);
        
      if (error) throw error;
      return (data as unknown) as CalendarEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar_event', data.id] });
    },
  });
}

/**
 * Hook to delete a calendar event
 */
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('calendar_events' as any)
        .delete()
        .eq('id', id) as any);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
    },
  });
} 