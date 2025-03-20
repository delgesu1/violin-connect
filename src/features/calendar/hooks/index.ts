/**
 * Calendar Hooks
 * 
 * Hooks for managing calendar events, appointments, and scheduling.
 */

// Export the CalendarEvent type
export type { CalendarEvent } from '@/types/schema_extensions';

// Export the query hooks
export { useCalendarEvents } from './useCalendarEvents';
export type { UseCalendarEventsOptions } from './useCalendarEvents';
export { useCalendarEvent } from './useCalendarEvent';

// Export the mutation hooks
export { 
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from './useCalendarMutations';
export type { 
  NewCalendarEvent, 
  UpdateCalendarEvent 
} from './useCalendarMutations';

// Export lesson-related hooks
export {
  useLessons,
  useAllLessons,
  useStudentLessons,
  useLesson,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useCreateLessonWithEvent,
  // Types
  type Lesson,
  type NewLesson,
  type UpdateLesson,
  type LessonRepertoire,
  type NewLessonRepertoire
} from './useLessons'; 