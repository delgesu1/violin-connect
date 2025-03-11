# Repertoire Migration Guide

This document provides a comprehensive guide to the migration from direct title/composer properties to using masterPieceId references in the Violin Connect application.

## Overview

We've implemented a complete solution to migrate from directly storing piece information in RepertoirePiece objects to using a normalized data model with masterPieceId references.

### Benefits of the New System

1. **Data Normalization**: Piece information is stored once in a master list, eliminating duplication
2. **Consistency**: Changes to a piece's details are automatically reflected for all students
3. **Extensibility**: Easier to add new properties to pieces without updating all references
4. **Performance**: Reduced data size and improved caching

## Implementation Details

### 1. Data Model

We've updated the data model to use references:

**Old Model (Legacy):**
```typescript
interface RepertoirePiece {
  id: string;
  title: string;
  composer: string;
  startDate: string;
  // ...other properties
}
```

**New Model:**
```typescript
interface RepertoirePiece {
  id: string;
  masterPieceId: string; // Reference to master piece
  startDate: string;
  // ...other properties
}

// Master piece definition
interface RepertoireItemData {
  id: string;
  title: string;
  composer: string;
  difficulty?: string;
  // ...other properties
}
```

### 2. Backward Compatibility

To ensure a smooth transition, we've implemented:

- **LegacyRepertoirePiece** interface for backward compatibility
- Utility functions that handle both old and new formats
- Runtime warnings when accessing deprecated properties
- Automatic data migration at application startup

### 3. Context Provider

We've created a RepertoireContext that:

- Runs migrations at application startup
- Provides centralized access to piece data
- Offers utility functions for accessing piece information
- Manages the master repertoire list

## Using the New System

### Displaying Piece Information

**Old approach (deprecated):**
```tsx
<div>{piece.title} by {piece.composer}</div>
```

**New approach:**
```tsx
<PieceDisplay 
  piece={piece} 
  layout="inline"
/>
```

### Accessing Piece Data in Components

**Old approach (deprecated):**
```tsx
const { title, composer } = piece;
```

**New approach:**
```tsx
const { getPieceTitle, getPieceComposer } = useRepertoire();
const title = getPieceTitle(piece);
const composer = getPieceComposer(piece);
```

### Creating New Pieces

**Old approach (deprecated):**
```typescript
const newPiece = {
  id: generateId(),
  title: "Violin Concerto",
  composer: "Beethoven",
  startDate: "2023-10-20",
  status: "current"
};
```

**New approach:**
```typescript
// First, ensure the master piece exists or create it
const { addMasterPiece } = useRepertoire();
const masterPiece = addMasterPiece({
  title: "Violin Concerto",
  composer: "Beethoven",
  difficulty: "advanced"
});

// Then create the student piece that references it
const studentPiece = {
  id: generateId(),
  masterPieceId: masterPiece.id,
  startDate: "2023-10-20",
  status: "current"
};
```

## Migration Process

The migration process happens automatically at application startup:

1. The RepertoireProvider loads initial data
2. It calls the migration utilities in `src/lib/migrations/run-migrations.ts`
3. The migration utilities:
   - Find pieces without masterPieceId
   - Look for matching master pieces in the repertoire
   - Create new master pieces if needed
   - Update student pieces with masterPieceId references

## Components Updated to Use the New System

1. **PieceDisplay**: A new component that uses the context to display piece information
2. **LessonHistory**: Updated to use PieceDisplay instead of direct property access
3. **RepertoireContext**: Provides centralized access to piece data and utilities

## Next Steps

To complete the migration:

1. Continue updating remaining components to use PieceDisplay or the context utilities
2. Remove direct access to title/composer properties throughout the codebase
3. Eventually remove the deprecated properties from the RepertoirePiece interface

## Troubleshooting

If you encounter issues:

1. Check the console for warnings about deprecated property access
2. Ensure the RepertoireProvider is available in the component tree
3. Use the `useRepertoire()` hook to access piece data and utilities
4. For pieces without masterPieceId, run the migration utilities manually 