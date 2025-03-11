# ID Handling in Violin Connect

This document explains the ID system used throughout the Violin Connect application.

## ID Format Standard

Each entity in the system has a unique identifier with a consistent format:

```
{prefix}-{id}
```

Where:
- `prefix` is a short string identifying the entity type
- `id` is a numeric or string identifier

## Prefixes by Entity Type

| Entity Type | Prefix | Example |
|-------------|--------|---------|
| Student     | `s-`   | `s-1`   |
| Lesson      | `l-`   | `l-101` |
| Piece (Master Repertoire) | `p-` | `p-42` |
| Student Piece | `sp-` | `sp-1-2` (student 1, piece 2) |
| File Attachment | `f-` | `f-123` |
| Message     | `m-`   | `m-456` |
| Link        | `link-` | `link-789` |

## Utility Functions

The `src/lib/id-utils.ts` file provides a set of functions for working with IDs:

### Basic ID Operations

- `createPrefixedId(prefix, id)` - Create a prefixed ID
- `getIdWithoutPrefix(prefixedId)` - Extract the ID portion without prefix
- `isIdOfType(id, type)` - Check if an ID has a specific prefix
- `getEntityTypeFromId(prefixedId)` - Determine entity type from an ID
- `ensureIdHasPrefix(id, expectedPrefix)` - Ensure an ID has the correct prefix
- `idsMatch(id1, id2)` - Compare IDs ignoring prefix differences

### Factory Methods

The `IdGenerator` class provides factory methods for creating IDs:

```typescript
// Create a student ID
const studentId = IdGenerator.student('1');  // 's-1'

// Create a lesson ID
const lessonId = IdGenerator.lesson('101');  // 'l-101'

// Create a student piece ID (combines student and piece)
const studentPieceId = IdGenerator.studentPiece('1', '2');  // 'sp-1-2'
```

## Handling Legacy IDs

For backward compatibility, the system can handle both prefixed and unprefixed IDs:

1. Lookup utilities accept both formats (`s-1` and `1`)
2. Functions like `idsMatch()` compare IDs safely ignoring prefixes
3. `ensureIdHasPrefix()` can convert old unprefixed IDs to the new format

## Best Practices

1. **Always use the utility functions** to create, validate, and manipulate IDs
2. Use `IdGenerator` factory methods when creating new entities
3. When looking up entities, use `idsMatch()` for prefix-agnostic comparisons
4. For debugging ID issues, use `logIdInconsistency()` to track non-standard IDs

## Migration Path

When working with entity IDs:

1. For new code, always use the `IdGenerator` class
2. When modifying existing code, update it to use `idsMatch()` for ID comparisons
3. Gradually replace direct string manipulation with utility functions

## Testing

Unit tests for ID utilities are available in `src/lib/__tests__/id-utils.test.ts`.
Integration tests showing usage patterns are in `src/lib/__tests__/id-integration.test.tsx`. 