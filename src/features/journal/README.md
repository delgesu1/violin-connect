# Journal Feature

This feature module manages practice journal functionality in Violin Connect.

## Structure

```
journal/
├── components/             # Journal-specific UI components
│   └── ...                 # Journal components
├── hooks/                  # Data fetching and state
│   └── index.ts            # useJournal, useJournalInsights, etc.
├── pages/                  # Journal pages
│   └── Journal.tsx         # Main journal page
└── utils/                  # Utility functions
    └── index.ts            # Journal-specific utilities
```

## Hooks Usage

```tsx
import { 
  useJournalEntries, 
  useJournalEntryByDate,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useJournalInsights
} from '@features/journal/hooks';

function MyComponent() {
  // Get all journal entries
  const { data: entries, isLoading } = useJournalEntries();
  
  // Get today's entry
  const { data: todaysEntry } = useJournalEntryByDate(new Date());
  
  // Get a specific entry
  const { data: entry } = useJournalEntry(entryId);
  
  // Create a new entry
  const { mutate: createEntry } = useCreateJournalEntry();
  
  // Update an existing entry
  const { mutate: updateEntry } = useUpdateJournalEntry();
  
  // Get insights from journal entries
  const { data: insights } = useJournalInsights();
  
  // Create a new entry
  const handleSubmit = (data) => {
    createEntry({
      date: new Date().toISOString(),
      content: data.content,
      goals: data.goals,
      notes: data.notes,
      // etc...
    });
  };
  
  return (
    // ...
  );
}
```

## Journal Entry Structure

A journal entry typically contains:

```typescript
interface JournalEntry {
  id: string;
  user_id: string;
  date: string;  // ISO date string
  title?: string;
  content: string;
  goals?: string;
  notes?: string;
  achievements?: string;
  frustrations?: string;
  improvements?: string;
  practice_time?: number;  // Minutes
  created_at: string;
  updated_at: string;
}
```

## Practice Insights

The journal feature provides analytics and insights based on practice data:

```tsx
import { useJournalInsights } from '@features/journal/hooks';

function PracticeInsights() {
  const { data: insights } = useJournalInsights();
  
  return (
    <div>
      <h2>Practice Insights</h2>
      
      <h3>Strengths</h3>
      <ul>
        {insights?.strengths.map((strength) => (
          <li key={strength.id}>{strength.text}</li>
        ))}
      </ul>
      
      <h3>Challenges</h3>
      <ul>
        {insights?.challenges.map((challenge) => (
          <li key={challenge.id}>{challenge.text}</li>
        ))}
      </ul>
      
      <div>
        <h3>Practice Time</h3>
        <p>Average: {insights?.averagePracticeTime} min/day</p>
        <p>Total: {insights?.totalPracticeTime} hours</p>
      </div>
    </div>
  );
}
``` 