# UUID Validation Guide

## Overview

This guide outlines best practices for ensuring proper UUID validation across the Violin Connect application. UUIDs (Universally Unique Identifiers) are used as primary keys in our Supabase database, and all database operations must use valid UUID-formatted IDs.

## Why UUID Validation Matters

1. **Database Compatibility**: Supabase expects proper UUIDs for primary key lookups
2. **Consistent Development**: Ensures code works identically in dev and production
3. **Error Prevention**: Avoids cryptic database errors from invalid ID formats
4. **Security**: Validates user-provided IDs before database operations

## Implementation Steps

### 1. Import Required Utilities

```typescript
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID, DEV_STUDENT_UUIDS } from '@/lib/dev-uuids';
```

### 2. Validate UUIDs Before Database Operations

```typescript
// Before querying the database
if (!isValidUUID(id)) {
  console.error(`Invalid UUID format: ${id}`);
  return null; // or fallback to mock data in development
}
```

### 3. Add Source Tracking

Add a `_source` property to your returned data to track where it came from:

```typescript
// Add source tracking to database results
const dataWithSource = data ? {
  ...data,
  _source: 'database'
} : null;

// For mock data
const mockWithSource = {
  ...mockData,
  _source: 'mock'
};
```

### 4. Use Consistent Development UUIDs

Instead of hard-coding UUIDs in each file, import them from the central definition:

```typescript
// AVOID this:
const DEV_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// DO this instead:
import { DEV_TEACHER_UUID } from '@/lib/dev-uuids';
```

### 5. Implement Hybrid Caching

⚠️ **IMPORTANT UPDATE**: We now have a gold standard approach for hybrid caching. 

All implementations MUST follow the standard priority flow:
1. Database (Supabase) first
2. Cache as fallback only if database fails
3. Mock data as a last resort in development mode

For full details and implementation template, see the **[Hybrid Caching System](./DATABASE_WORKFLOW.md#hybrid-caching-system)** section in DATABASE_WORKFLOW.md.

## Common Patterns

### Single Entity Query Hook

```typescript
export function useEntityById(id: string | undefined) {
  return useQuery({
    queryKey: ['entity', id],
    queryFn: async () => {
      // 1. Check for ID existence
      if (!id) return null;
      
      // 2. Validate UUID format
      if (!isValidUUID(id)) {
        console.error(`Invalid UUID format: ${id}`);
        return null;
      }
      
      // 3. Query database
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('id', id)
        .single();
      
      // 4. Add source tracking
      return data ? { ...data, _source: 'database' } : null;
    },
    enabled: !!id
  });
}
```

### Collection Query Hook

```typescript
export function useEntities(options = {}) {
  const { userId } = useAuth();
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  return useQuery({
    queryKey: ['entities', userId],
    queryFn: async () => {
      // 1. Check authentication
      if (!userId && !isDev) return [];
      
      // 2. Get and validate teacher ID
      const teacherId = isDev ? DEV_TEACHER_UUID : await clerkIdToUuid(userId!);
      if (!teacherId || !isValidUUID(teacherId)) return [];
      
      // 3. Query database
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('teacher_id', teacherId);
      
      // 4. Add source tracking
      return (data || []).map(item => ({
        ...item,
        _source: 'database'
      }));
    },
    enabled: !!userId || isDev
  });
}
```

### Mutation Hook

```typescript
export function useCreateEntity() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  return useMutation({
    mutationFn: async (newEntity) => {
      // 1. Check authentication
      if (!userId && !isDev) throw new Error('Not authenticated');
      
      // 2. Get and validate teacher ID
      const teacherId = isDev ? DEV_TEACHER_UUID : await clerkIdToUuid(userId!);
      if (!teacherId || !isValidUUID(teacherId)) {
        throw new Error('Invalid teacher ID');
      }
      
      // 3. Validate any UUID fields in the entity
      if (newEntity.student_id && !isValidUUID(newEntity.student_id)) {
        throw new Error('Invalid student ID');
      }
      
      // 4. Insert with teacher ID
      const { data, error } = await supabase
        .from('entities')
        .insert({ ...newEntity, teacher_id: teacherId })
        .select()
        .single();
      
      // 5. Add source tracking
      return { ...data, _source: 'database' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    }
  });
}
```

## Refactoring Steps

When updating existing hooks, follow these steps:

1. Import the required utilities
2. Add UUID validation for all ID parameters
3. Implement development mode handling
4. Add source tracking to returned data
5. Use consistent development UUIDs from `dev-uuids.ts`
6. Update query options for better TypeScript support

## Reference Implementation

For a complete reference implementation, see:
- `src/lib/hook-template.ts` - Template for all data-fetching hooks

## Testing Your Implementation

Use the `HookHealthDashboard` component to verify your source tracking:

```tsx
<HookHealthDashboard hook={useEntityById(id)} label="Entity Query" />
```

## Common Issues and Solutions

### 1. Missing UUID Validation

**Problem**: Database query fails with cryptic errors for invalid UUIDs.
**Solution**: Add `isValidUUID` check before database operations.

### 2. Inconsistent Development Handling

**Problem**: Code behaves differently in development vs. production.
**Solution**: Use centralized `DEV_TEACHER_UUID` and consistent fallback logic.

### 3. No Source Tracking

**Problem**: Difficult to debug where data is coming from.
**Solution**: Add `_source` property to all returned data.

### 4. Hard-Coded UUIDs

**Problem**: Duplicate UUIDs spread throughout the codebase.
**Solution**: Import UUIDs from `dev-uuids.ts`.

### 5. Improper Error Handling

**Problem**: Errors are swallowed or not properly communicated to the user.
**Solution**: Use explicit error messages for UUID validation failures.

## Next Steps

1. Run the audit script to identify remaining issues
2. Update high-priority components (student and lesson hooks)
3. Remove deprecated ID prefix usage
4. Standardize mock data generation with UUIDs 

## Clerk Authentication Wrapper

### Problem

In development mode, direct imports of Clerk hooks can cause errors:

```typescript
// This causes errors in development mode
import { useAuth } from '@clerk/clerk-react';
```

The error typically appears as:
```
Uncaught Error: @clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component
```

### Solution

Always use the authentication wrapper that handles development mode fallbacks:

```typescript
// Use this instead - provides development mode fallbacks
import { useAuth } from '@/lib/auth-wrapper';
```

The `auth-wrapper.ts` file:
- Detects development mode
- Provides mock auth data when Clerk is bypassed
- Handles errors with appropriate fallbacks
- Creates a consistent experience in all environments

### Audit Command

Find direct Clerk imports that should be replaced:

```bash
grep -r "import.*from '@clerk/clerk-react'" --include="*.ts" --include="*.tsx" src/features/
```

### Testing

After converting imports to use the wrapper:
1. Run the app in development mode
2. Verify there are no Clerk provider errors in the console
3. Verify authentication state is consistent 