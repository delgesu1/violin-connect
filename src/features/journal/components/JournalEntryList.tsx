import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { ChevronRight, Book, Calendar } from 'lucide-react';
import { Button } from '@core/components/ui/inputs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@core/components/ui/data-display';
import type { JournalEntry } from '@/features/journal/types';

interface JournalEntryItemProps {
  entry: JournalEntry;
  onClick: (id: string) => void;
}

/**
 * Single item in the journal entry list
 */
const JournalEntryItem: React.FC<JournalEntryItemProps> = ({ entry, onClick }) => {
  // Helper function for safe date formatting
  const formatSafeDate = (dateString: string | undefined, formatStr: string = 'MMMM d, yyyy') => {
    if (!dateString) return 'Loading...';
    
    // Try to parse as ISO date first
    try {
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        return format(parsedDate, formatStr);
      }
    } catch (e) {
      console.warn('Failed to parse date as ISO:', dateString);
    }
    
    // Add time component and try again
    try {
      const dateWithTime = dateString + 'T00:00:00';
      const date = new Date(dateWithTime);
      if (isValid(date)) {
        return format(date, formatStr);
      }
    } catch (e) {
      console.warn('Failed to parse date with added time component:', dateString);
    }
    
    // Last resort: try direct parsing
    try {
      const date = new Date(dateString);
      if (isValid(date)) {
        return format(date, formatStr);
      }
    } catch (e) {
      console.error('Failed to parse date by any method:', dateString);
    }
    
    return dateString; // Return original string if all parsing fails
  };

  // Check if entry has a practice_goals value
  const hasGoals = entry.practice_goals && entry.practice_goals.trim() !== '';
  
  // Extract a preview of the entry content
  const getPreview = () => {
    // Look first for notes, then for any field with content
    if (entry.notes && entry.notes.trim() !== '') {
      return entry.notes;
    } else if (entry.went_well && entry.went_well.trim() !== '') {
      return entry.went_well;
    } else if (entry.beautified && entry.beautified.trim() !== '') {
      return entry.beautified;
    } else if (entry.frustrations && entry.frustrations.trim() !== '') {
      return entry.frustrations;
    } else if (entry.improvements && entry.improvements.trim() !== '') {
      return entry.improvements;
    } else if (hasGoals) {
      return entry.practice_goals;
    }
    
    return 'No content';
  };
  
  // Create a truncated preview string
  const preview = getPreview();
  const truncatedPreview = preview.length > 120 
    ? preview.substring(0, 120) + '...'
    : preview;

  return (
    <Button
      variant="ghost"
      className="w-full justify-start h-auto py-4 px-4 rounded-lg hover:bg-muted/60"
      onClick={() => onClick(entry.id)}
    >
      <div className="flex items-start w-full">
        <div className="mr-4 mt-1">
          <Book className="h-5 w-5 text-primary/70" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-left">
              {formatSafeDate(entry.date, 'MMM d, yyyy')}
            </h3>
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {hasGoals ? 'Has goals' : 'No goals'}
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-left line-clamp-2">
            {truncatedPreview}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </Button>
  );
};

interface JournalEntryListProps {
  entries: JournalEntry[];
  onEntryClick: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * A scrollable list of journal entries with nice formatting
 */
export default function JournalEntryList({ 
  entries,
  onEntryClick,
  isLoading = false,
  className = ''
}: JournalEntryListProps) {
  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-lg border">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // If no entries, show empty state
  if (!entries || entries.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <Book className="h-12 w-12 text-muted mb-4" />
        <h3 className="text-lg font-medium">No Journal Entries Yet</h3>
        <p className="text-muted-foreground mt-1 text-center max-w-md">
          Start recording your practice sessions to see your entries here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-[calc(100vh-300px)] pr-4 ${className}`}>
      <div className="space-y-1">
        {entries.map(entry => (
          <JournalEntryItem 
            key={entry.id} 
            entry={entry} 
            onClick={onEntryClick} 
          />
        ))}
      </div>
    </ScrollArea>
  );
} 