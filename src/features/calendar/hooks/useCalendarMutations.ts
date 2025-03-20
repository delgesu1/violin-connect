import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/schema_extensions';
import { useAuth } from '@/lib/auth-wrapper';
import { clerkIdToUuid } from '@/lib/auth-utils';

// Check if we're in development mode
const isDev = import.meta.env.VITE_DEV_MODE === 'true';
// For development, use a consistent UUID that works with RLS policies
const DEV_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export type NewCalendarEvent = Omit<CalendarEvent, 'id' | 'created_at'>;
export type UpdateCalendarEvent = Partial<CalendarEvent>;

/**
 * Hook for creating a new calendar event
 */
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (newEvent: Omit<NewCalendarEvent, 'teacher_id'>) => {
      if (!userId && !isDev) {
        throw new Error('No user ID available, cannot create calendar event');
      }
      
      // In dev mode, use the dev UUID directly
      const teacherId = isDev ? DEV_UUID : await clerkIdToUuid(userId!);
      
      if (!teacherId) {
        throw new Error('Could not convert Clerk ID to Supabase UUID');
      }
      
      const eventWithTeacherId = {
        ...newEvent,
        teacher_id: teacherId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      try {
        const { data, error } = await (supabase
          .from('calendar_events' as any)
          .insert(eventWithTeacherId)
          .select('*')
          .single() as any);
        
        if (error) throw error;
        
        return (data as unknown) as CalendarEvent;
      } catch (err) {
        console.error('Error creating calendar event:', err);
        throw err;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
    }
  });
}

/**
 * Hook for updating an existing calendar event
 */
export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateCalendarEvent & { id: string }) => {
      if (!id) {
        throw new Error('Calendar event ID is required');
      }
      
      const updatedFields = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      try {
        const { data, error } = await (supabase
          .from('calendar_events' as any)
          .update(updatedFields)
          .eq('id', id)
          .select('*')
          .single() as any);
        
        if (error) throw error;
        
        return (data as unknown) as CalendarEvent;
      } catch (err) {
        console.error('Error updating calendar event:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar_event', data.id] });
    }
  });
}

/**
 * Hook for deleting a calendar event
 */
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error('Calendar event ID is required');
      }
      
      try {
        const { error } = await (supabase
          .from('calendar_events' as any)
          .delete()
          .eq('id', id) as any);
        
        if (error) throw error;
        
        return { id };
      } catch (err) {
        console.error('Error deleting calendar event:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar_event', data.id] });
    }
  });
} 