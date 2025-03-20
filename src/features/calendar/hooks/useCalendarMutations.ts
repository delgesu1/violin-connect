import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/schema_extensions';
import { useAuth } from '@/lib/auth-wrapper';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID } from '@/lib/dev-uuids';

// Check if we're in development mode
const isDev = import.meta.env.VITE_DEV_MODE === 'true';

// Cache keys for calendar events
const CALENDAR_EVENTS_CACHE_KEY = 'calendar_events_cache';
const CALENDAR_EVENT_CACHE_KEY = 'calendar_event_cache';

export type NewCalendarEvent = Omit<CalendarEvent, 'id' | 'created_at' | '_source'>;
export type UpdateCalendarEvent = Partial<CalendarEvent>;

// Helper to invalidate calendar event caches
const invalidateCalendarEventCaches = (id?: string) => {
  try {
    // Get all cache keys from localStorage
    const allKeys = Object.keys(localStorage);
    
    // Find and remove relevant cache entries
    allKeys.forEach(key => {
      if (key.startsWith(CALENDAR_EVENTS_CACHE_KEY) || 
          (id && key === `${CALENDAR_EVENT_CACHE_KEY}:${id}`)) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.warn('Error invalidating calendar event caches:', err);
  }
};

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
      const teacherId = isDev ? DEV_TEACHER_UUID : await clerkIdToUuid(userId!);
      
      if (!teacherId) {
        throw new Error('Could not convert Clerk ID to Supabase UUID');
      }
      
      // Validate the teacher UUID format
      if (!isValidUUID(teacherId)) {
        throw new Error(`Invalid teacher UUID format: ${teacherId}`);
      }
      
      // Validate student_id if present
      if (newEvent.student_id && !isValidUUID(newEvent.student_id)) {
        throw new Error(`Invalid student UUID format: ${newEvent.student_id}`);
      }
      
      // Validate lesson_id if present
      if (newEvent.lesson_id && !isValidUUID(newEvent.lesson_id)) {
        throw new Error(`Invalid lesson UUID format: ${newEvent.lesson_id}`);
      }
      
      const eventWithTeacherId = {
        ...newEvent,
        teacher_id: teacherId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .insert(eventWithTeacherId)
          .select('*')
          .single();
        
        if (error) throw error;
        
        // Add source tracking
        const eventWithSource = {
          ...data,
          _source: 'database'
        } as CalendarEvent;
        
        // Invalidate relevant caches
        invalidateCalendarEventCaches();
        
        return eventWithSource;
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
      
      // Validate the event UUID format
      if (!isValidUUID(id)) {
        throw new Error(`Invalid calendar event UUID format: ${id}`);
      }
      
      // Validate student_id if it's being updated
      if (updates.student_id && !isValidUUID(updates.student_id)) {
        throw new Error(`Invalid student UUID format: ${updates.student_id}`);
      }
      
      // Validate teacher_id if it's being updated
      if (updates.teacher_id && !isValidUUID(updates.teacher_id)) {
        throw new Error(`Invalid teacher UUID format: ${updates.teacher_id}`);
      }
      
      // Validate lesson_id if it's being updated
      if (updates.lesson_id && !isValidUUID(updates.lesson_id)) {
        throw new Error(`Invalid lesson UUID format: ${updates.lesson_id}`);
      }
      
      // Remove source property if it exists (as it's not a database field)
      const { _source, ...updatesWithoutSource } = updates as any;
      
      const updatedFields = {
        ...updatesWithoutSource,
        updated_at: new Date().toISOString()
      };
      
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .update(updatedFields)
          .eq('id', id)
          .select('*')
          .single();
        
        if (error) throw error;
        
        // Add source tracking
        const eventWithSource = {
          ...data,
          _source: 'database'
        } as CalendarEvent;
        
        // Invalidate relevant caches
        invalidateCalendarEventCaches(id);
        
        return eventWithSource;
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
      
      // Validate the event UUID format
      if (!isValidUUID(id)) {
        throw new Error(`Invalid calendar event UUID format: ${id}`);
      }
      
      try {
        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Invalidate relevant caches
        invalidateCalendarEventCaches(id);
        
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