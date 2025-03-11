# Repertoire Piece Migration Guide

This document outlines the transition from direct title/composer properties to using masterPieceId references in the Violin Connect application.

## Background

Originally, the application stored piece information directly in RepertoirePiece objects:

```typescript
interface RepertoirePiece {
  id: string;
  title: string;
  composer: string;
  // other properties...
}
```

This led to data duplication and potential inconsistencies when the same piece was assigned to multiple students.

## New Data Model

The new model uses normalized data with a reference system:

```typescript
interface RepertoirePiece {
  id: string;
  masterPieceId: string; // Reference to a master repertoire item
  // other properties...
}
```

With this approach:
- Common piece data (title, composer, etc.) is stored once in a master repertoire list
- Student-specific data (startDate, notes, etc.) is stored in the RepertoirePiece
- Changes to a master piece automatically reflect for all students

## Migration Strategy

We've implemented a phased migration approach:

### Phase 1: Enhanced Utilities

- Created utility functions for accessing piece data safely:
  - `getPieceTitle(piece, repertoireList)`
  - `getPieceComposer(piece, repertoireList)`
  - `getPieceDifficulty(piece, repertoireList)`

- Added caching for performance optimization

### Phase 2: Dual TypeScript Interfaces

- Renamed the original interface to `LegacyRepertoirePiece`
- Created a new `RepertoirePiece` interface with required `masterPieceId`
- Made Student and Lesson interfaces accept both types during migration

### Phase 3: UI Component Updates

- Created a `PieceInfo` component that abstracts away data access details
- Updated existing components to use the new utilities and components
- Refactored `RepertoireDisplay` to use the new approach

### Phase 4: Data Migration

- Created migration utilities in `src/lib/migrations/`:
  - `migrateToMasterPieceReference` for individual pieces
  - `migrateStudentRepertoire` for a student's repertoire
  - `migrateAllStudentPieces` for the entire application

### Phase 5: Runtime Warnings

- Added development-mode warnings when accessing deprecated properties directly

## Using the New System

### Displaying Piece Information

**Old approach (deprecated):**
```tsx
<div>{piece.title} by {piece.composer}</div>
```

**New approach:**
```tsx
<PieceInfo 
  piece={piece} 
  repertoireList={masterRepertoire}
  layout="inline"
/>
```

Or with the utility functions:
```tsx
const title = getPieceTitle(piece, masterRepertoire);
const composer = getPieceComposer(piece, masterRepertoire);
<div>{title} by {composer}</div>
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
// First, ensure the master piece exists
const masterPiece = createMasterPiece(
  "Violin Concerto",
  "Beethoven",
  "advanced"
);

// Then create the student piece that references it
const studentPiece = createStudentPiece(
  masterPiece.id,
  studentId,
  "current",
  "Working on cadenza"
);
```

## Roadmap for Complete Migration

1. **Current Phase:** Dual support for both models
2. **Next Phase:** Update all remaining components to use the new model
3. **Final Phase:** Remove the deprecated properties and LegacyRepertoirePiece interface

## FAQs

### Q: Will my existing code break?

A: No, we've maintained backward compatibility with the `LegacyRepertoirePiece` interface and utility functions that handle both models.

### Q: How do I convert legacy data?

A: Use the `migrateToMasterPieceReference` function:

```typescript
const updatedPiece = migrateToMasterPieceReference(legacyPiece, masterRepertoire);
```

### Q: What if a master piece doesn't exist?

A: The migration utilities will automatically create master pieces when needed. You can also create them manually with `createMasterPiece`.

### Q: How do I search or filter pieces?

A: To ensure compatibility with both models, use the utility functions:

```typescript
const filteredPieces = allPieces.filter(piece => 
  getPieceTitle(piece, masterRepertoire).includes(searchTerm)
);
``` 