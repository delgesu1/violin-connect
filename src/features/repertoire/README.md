# Repertoire Feature

This feature module manages the music repertoire functionality in Violin Connect.

## Structure

```
repertoire/
├── components/             # Repertoire-specific UI components
│   ├── RepertoireItem.tsx  # Component for displaying a repertoire piece
│   └── ...                 # Other repertoire components
├── contexts/               # State management
│   └── index.ts            # RepertoireProvider and useRepertoire
├── hooks/                  # Data fetching and state
│   └── index.ts            # useMasterRepertoire, useStudentRepertoire, etc.
├── pages/                  # Repertoire pages
│   ├── Repertoire.tsx      # Main repertoire listing page
│   └── PieceDetails.tsx    # Individual piece details page
├── types/                  # Type definitions
│   └── index.ts            # Repertoire-specific types
└── utils/                  # Utility functions
    └── index.ts            # Repertoire-specific utilities
```

## Component Usage

### RepertoireItem

```tsx
import { RepertoireItem, RepertoireItemData } from '@features/repertoire/components';

function MyComponent() {
  const piece: RepertoireItemData = {
    id: '123',
    title: 'Violin Concerto in E minor',
    composer: 'Mendelssohn, Felix',
    startedDate: '2023-01-15',
    difficulty: 'advanced'
  };

  return (
    <RepertoireItem 
      item={piece}
      layout="card" // 'card' | 'grid' | 'table'
      onClick={() => console.log('Piece clicked')}
    />
  );
}
```

## Hooks Usage

```tsx
import { 
  useMasterRepertoire, 
  useStudentRepertoire 
} from '@features/repertoire/hooks';

function MyComponent() {
  // Get all master repertoire
  const { data: masterRepertoire, isLoading } = useMasterRepertoire();
  
  // Get a student's repertoire
  const { data: studentRepertoire } = useStudentRepertoire(studentId);
  
  return (
    // ...
  );
}
```

## Context Provider

Wrap components that need to access repertoire data with the RepertoireProvider:

```tsx
import { RepertoireProvider } from '@features/repertoire/contexts';

function App() {
  return (
    <RepertoireProvider>
      {/* Your components that need repertoire data */}
    </RepertoireProvider>
  );
}
```

## Utilities

```tsx
import { 
  getPieceTitle, 
  getPieceComposer,
  createMasterPiece
} from '@features/repertoire/utils';

// Get piece title safely
const title = getPieceTitle(piece, masterRepertoire);

// Create a new master piece
const newPiece = createMasterPiece(
  'Violin Sonata No. 1', 
  'Bach, J.S.', 
  'advanced'
);
``` 