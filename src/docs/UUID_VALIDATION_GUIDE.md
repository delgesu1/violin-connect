# UUID Validation Guide

This guide explains how to fix UUID validation issues throughout the application to ensure consistent behavior with Supabase and improve the reliability of the hybrid caching system.

## Background

The application uses PostgreSQL as its database, which expects UUIDs in the format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`. However, some parts of the codebase use simplified string IDs like:

- `student-1`
- `s-1`
- `lesson-101`

This causes issues when:
1. These simplified IDs are passed to Supabase queries, resulting in database errors
2. Components fall back to basic mock data instead of rich cached data
3. Different parts of the application use inconsistent ID formats

## Recommended Solution

We have implemented a comprehensive solution that involves:

1. **Create a central UUIDs file**: `src/lib/dev-uuids.ts` with proper UUID constants
2. **Add UUID validation function**: `isValidUUID()` in `src/lib/id-utils.ts`
3. **Update data hooks**: Skip Supabase queries for non-UUID IDs in development mode
4. **Update mock data generation**: Use proper UUIDs from the central file

## Implementation Steps

### 1. UUIDs Definition File

Create or ensure `src/lib/dev-uuids.ts` exists with proper UUIDs:

```typescript
// Teacher UUID (main user)
export const DEV_TEACHER_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Student UUIDs
export const DEV_STUDENT_UUIDS = {
  STUDENT_1: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  STUDENT_2: '6c84fb90-12c4-11e1-840d-7b25c5ee775a', 
  STUDENT_3: '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
};

// Lesson UUIDs
export const DEV_LESSON_UUIDS = {
  LESSON_1: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  LESSON_2: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  LESSON_3: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  LESSON_4: '6ba7b813-9dad-11d1-80b4-00c04fd430c8'
};
```

### 2. UUID Validation Function

Add or ensure `isValidUUID()` is defined in `src/lib/id-utils.ts`:

```typescript
/**
 * Checks if a string is a valid UUID
 * @param id String to validate
 * @returns True if the string is a valid UUID
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};
```

### 3. Update Data Hooks

For each data hook that interacts with Supabase:

1. Import the necessary functions and UUIDs:

```typescript
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID, DEV_STUDENT_UUIDS } from '@/lib/dev-uuids';
```

2. Add validation in the query function:

```typescript
// Skip Supabase query for non-UUID IDs in development mode
if (isDevelopmentMode && !isValidUUID(id)) {
  console.log(`Skipping database query for non-UUID id: ${id}`);
  
  // Try cached data first
  const cachedData = getCachedMockData(`entity_${id}`, null);
  if (cachedData) {
    return {
      ...cachedData,
      _source: 'cached' as const
    };
  }
  
  // Fall back to mock data...
}
```

### 4. Update Mock Data Generation

Replace string-based IDs with UUIDs from the central file:

```typescript
// Instead of:
const studentIds = ['student-1', 'student-2', 'student-3'];

// Use:
const studentIds = [
  DEV_STUDENT_UUIDS.STUDENT_1,
  DEV_STUDENT_UUIDS.STUDENT_2,
  DEV_STUDENT_UUIDS.STUDENT_3
];
```

## Testing Your Changes

1. Run the audit script:
   ```bash
   scripts/audit-data-layer.sh
   ```

2. Check the results in the `audit-results` directory

3. Run the app in development mode:
   ```bash
   VITE_DEV_MODE=true npm run dev
   ```

4. Look for database errors in the console and fix any remaining issues

## Reference Implementation

A template hook implementation can be found at `src/lib/hook-template.ts` which follows all the best practices described in DATABASE_WORKFLOW.md, including proper UUID validation. 