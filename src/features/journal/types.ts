import type { Database } from '@/types/supabase';

// Re-export the types from the hook for cleaner imports
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'] & {
  // Add optional source field for development mode
  _source?: 'database' | 'cached' | 'mock' | 'cached-fallback' | 'mock-fallback';
};

export type NewJournalEntry = Database['public']['Tables']['journal_entries']['Insert'];
export type UpdateJournalEntry = Database['public']['Tables']['journal_entries']['Update']; 