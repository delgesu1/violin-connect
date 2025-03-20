// Export all calendar-related functionality
export * from './components';
export {
  useCalendarEvents,
  useCalendarEvent,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from './hooks';
export type {
  NewCalendarEvent,
  UpdateCalendarEvent,
  // Explicitly re-export calendar event type to resolve ambiguity
  CalendarEvent as CalendarEventType 
} from './hooks';
export * from './pages'; 