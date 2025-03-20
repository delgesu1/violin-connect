/**
 * Journal Hooks
 * 
 * Custom hooks for managing journal entries and interactions.
 */

// Export the JournalEntry type
export type { JournalEntry } from './useJournalEntries';

// Export the query hooks
export { useJournalEntries } from './useJournalEntries';
export { useJournalEntry } from './useJournalEntry';
export { useJournalEntryByDate } from './useJournalEntryByDate';

// Export the mutation hooks
export { 
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
} from './useJournalMutations';
export type { NewJournalEntry, UpdateJournalEntry } from './useJournalMutations';

// Export the search hook
export { useSearchJournalEntries } from './useSearchJournalEntries';
export type { SearchJournalParams } from './useSearchJournalEntries';

// Export journal insights hooks from our own implementation
export {
  useJournalInsights,
  useUpsertJournalInsights,
  useGenerateJournalInsights,
  type JournalInsight,
  type NewJournalInsight,
  type UpdateJournalInsight,
  type TypedJournalInsight
} from './useJournalInsights'; 