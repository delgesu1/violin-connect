// Re-export calendar components from their original locations
// This allows us to start using feature-based imports

// Components that have been moved to the feature directory
export { CalendarEvent } from './CalendarEvent';
export type { CalendarEventData } from './CalendarEvent';

// Re-export components from original locations
export { default as CalendarEventForm } from '@/components/calendar/CalendarEventForm';
export { default as CalendarEventModal } from '@/components/common/CalendarEventModal'; 