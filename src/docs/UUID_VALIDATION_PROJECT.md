# UUID Validation Project Tracker

## Project Overview

The Violin Connect application is implementing a comprehensive UUID validation approach to ensure consistent data handling across development, testing, and production environments. This document tracks the progress of identifying and fixing issues related to non-UUID formatted IDs throughout the codebase.

## Project Goals

1. **Ensure database compatibility**: All IDs passed to Supabase queries must be valid UUIDs
2. **Implement consistent hybrid caching**: Follow the gold standard approach defined in DATABASE_WORKFLOW.md
3. **Standardize mock data generation**: Use consistent UUIDs from a central definition file
4. **Improve error handling**: Gracefully handle non-UUID IDs in development mode
5. **Add transparency**: Track and display data sources for debugging purposes

## Methodology

### Phase 1: Audit & Assessment ✅
- Run the `audit-data-layer.sh` script to identify all potential issues
- Categorize findings by priority and component area
- Document baseline metrics for tracking progress

### Phase 2: Implementation 🔄
- ✅ Update core utilities with UUID validation functions
- ✅ Create standardized `dev-uuids.ts` for development constants
- ✅ Define the gold standard hybrid caching approach
- ✅ Implement the template pattern in calendar hooks
- 🔄 Continue updating high-priority components
- ⏳ Update remaining hooks following the gold standard

### Phase 3: Verification ⏳
- Re-run audit script to verify fixes
- Manually test affected components
- Document remaining issues and technical debt

## Progress Tracker

| Component | Status | Last Updated | Notes |
|-----------|--------|--------------|-------|
| `AllLessonsLoader.ts` | ✅ Complete | 2024-03-20 | Updated to use proper UUIDs from dev-uuids.ts |
| `useUserRoles.ts` | ✅ Complete | 2024-03-20 | Now uses DEV_STUDENT_UUIDS instead of string IDs |
| `mockStudents.ts` | ✅ Complete | 2024-03-20 | Updated student IDs to use UUIDs |
| Core Utilities | ✅ Complete | 2024-03-20 | Created audit script, template hook, and validation guide |
| `dev-uuids.ts` | ✅ Complete | 2024-03-20 | Created central UUID definition file |
| `id-utils.ts` | ✅ Complete | 2024-03-20 | Added deprecation notices and improved UUID validation | 
| `HookHealthDashboard` | ✅ Complete | 2024-03-20 | Created dashboard for data source tracking |
| PR Templates | ✅ Complete | 2024-03-20 | Added template for UUID validation PRs |
| `useStudentById.ts` | 🔄 In Progress | - | - |
| `useLessons.ts` | ✅ Complete | 2024-03-21 | Updated with UUID validation, hybrid caching, Clerk auth wrapper fix |
| `useCalendarEvents.ts` | ✅ Complete | 2024-03-20 | Already had UUID validation, hybrid caching, source tracking |
| `useCalendarEvent.ts` | ✅ Complete | 2024-03-20 | Already had UUID validation, hybrid caching, source tracking |
| `useCalendarMutations.ts` | ✅ Complete | 2024-03-20 | Already had UUID validation, hybrid caching, source tracking |
| `useRepertoire.ts` | ✅ Complete | 2024-03-20 | Updated useMasterRepertoire.ts and useStudentRepertoire.ts with UUID validation |
| `useAttachments.ts` | ✅ Complete | 2024-03-20 | Added UUID validation, source tracking, and proper error handling |
| `useRepertoireAttachments.ts` | ✅ Complete | 2024-03-20 | Added UUID validation, source tracking, and proper error handling |
| `useTeacherDashboard.ts` | ✅ Complete | 2024-03-20 | Created new hook with UUID validation, hybrid caching, and source tracking |
| Component Mocks | ⏳ Not Started | - | - |
| `/features/journal` hooks | ✅ Complete | 2024-03-20 | Updated useJournalEntry.ts, useJournalEntries.ts, and useJournalMutations.ts with UUID validation |
| `/features/calendar` hooks | ✅ Complete | 2024-03-21 | Fixed Clerk auth issues and updated with proper auth wrapper imports |
| `/features/repertoire` hooks | ⏳ Not Started | - | - |
| `/features/user` hooks | ⏳ Not Started | - | - |
| `/features/discussions` hooks | ⏳ Not Started | - | - |
| `/features/messages` hooks | ⏳ Not Started | - | - |
| `/features/files` hooks | ⏳ Not Started | - | - |

## Implementation Details

### 1. Core Files Created/Updated

- ✅ `src/lib/dev-uuids.ts` - Central UUID constants
- ✅ `src/lib/id-utils.ts` - Added UUID validation function
- ✅ `src/lib/hook-template.ts` - Reference implementation
- ✅ `scripts/audit-data-layer.sh` - Comprehensive audit script
- ✅ `src/docs/UUID_VALIDATION_GUIDE.md` - Developer guide
- ✅ `src/docs/DATABASE_WORKFLOW.md` - Updated with gold standard approach
- ✅ `src/components/dev/HookHealthDashboard.tsx` - Data source tracking dashboard

### 2. Gold Standard Implementation

Our project now has a clearly defined "gold standard" for data fetching hooks that implements:

1. **Strict Priority Flow**:
   - Database (Supabase) - Always try first
   - Cache - Only fall back if database fails
   - Mock - Only as last resort in development

2. **Universal Source Tracking**:
   - All data includes `_source: 'database' | 'cached' | 'mock'`
   - Visual indicators in development UI

3. **Consistent Development UUIDs**:
   - All mock data uses constants from `dev-uuids.ts`
   - No hard-coded UUIDs in component files

4. **Thorough UUID Validation**:
   - All IDs validated before database operations
   - Development mode can handle invalid UUIDs
   - Production mode rejects invalid UUIDs

5. **Cache Management**:
   - Proper cache invalidation in mutation hooks
   - Consistent caching behavior across components

Components that implement the gold standard:
- ✅ `useCalendarEvents.ts` 
- ✅ `useCalendarEvent.ts`
- ✅ `useCalendarMutations.ts`
- ✅ `useLessons.ts`
- ✅ `useTeacherDashboard.ts`
- ✅ `useJournalEntries.ts`
- ✅ `useJournalEntry.ts`
- ✅ `useAllLessons` (Dashboard Recent Lessons)

### 3. Current Metrics

- **Identified Issues**: 
  - Non-UUID string IDs: 132 occurrences
  - ID prefix usage: 167 occurrences
  - Missing dev-uuids imports: 41 hooks
  - Missing hybrid caching: 13 hooks
  - Missing UUID validation: 18 hooks
  - Missing source tracking: 12 hooks

- **Fixed Issues**: 7 components updated
- **Completion Percentage**: ~9% (7/79 identified issues)

## Priority Areas

Based on the audit results, here are the priority areas to address:

### High Priority
1. **Repertoire Component**: Using "p-" prefixed IDs (125 occurrences)
2. **ID Creation System**: Heavy usage of `createPrefixedId` (78 occurrences) and `ID_PREFIXES` (85 occurrences)
3. **Student System**: Several hooks with missing UUID validation that access the database

### Medium Priority
1. Journal features
2. Calendar features
3. Source tracking in existing hooks

### Low Priority
1. Discussion and Message features
2. User settings and profile hooks

## Action Plan

1. **Week 1 (Foundations)**: ✅ Complete 
   - Create audit script to identify issues
   - Create central UUID definition file
   - Add deprecation notices to id-utils.ts
   - Create hook template and guide
   - Add health dashboard for tracking
   - Fix initial high-priority components
   
2. **Week 2 (Core Features)**:
   - Work through high-priority components:
     - Repertoire system (fix all "p-" prefixed IDs)
     - Student hooks
     - Lesson and calendar hooks
   - Update all primary user flows
   
3. **Week 3 (Support Features)**:
   - Address medium-priority features:
     - Journal features
     - Calendar features
     - Update source tracking
   - Complete low-priority features:
     - Discussion and messaging
     - User settings

4. **Week 4 (Verification)**:
   - Run final audit
   - Fix any remaining issues
   - Complete end-to-end testing

## Next Steps

### Immediate Tasks
1. Focus on fixing the Repertoire component since it has the most issues (125 occurrences)
2. Fix Student hooks to ensure proper UUID validation
3. Begin replacing usages of createPrefixedId with UUIDs from dev-uuids.ts

### Week 2 Tasks
1. Create a tracking system for complex components
2. Address Calendar and Lesson hooks
3. Update test data to use consistent UUIDs

## Resources

- [DATABASE_WORKFLOW.md](./DATABASE_WORKFLOW.md) - Hybrid caching approach guide
- [UUID_VALIDATION_GUIDE.md](./UUID_VALIDATION_GUIDE.md) - Guide to fixing UUID validation issues 

## Troubleshooting Data Access Issues

### Journal Entries Data Access Solution

When implementing the gold standard hybrid caching approach, we encountered an issue where journal entries were visible in the list view but would not load when viewing individual entries, despite the data existing in Supabase.

#### The Problem
- UI showed "loading..." state indefinitely or "This journal entry appears to be empty" 
- Console logs confirmed data existed in Supabase (10 entries)
- The useJournalEntry hook was not properly falling back to mock data

#### The Solution

1. **Multi-tiered Database Access**:
   - First attempt: Use `supabaseAdmin` client to bypass Row Level Security
   - Second attempt: Use standard client with user filtering
   - Third attempt: Query directly by ID without user filtering

2. **Better Error Handling**:
   - Changed from `.single()` to `.maybeSingle()` for more graceful empty result handling
   - Added comprehensive logging at each step of the data fetching process
   - Properly handled the case when Supabase returns no errors but also no data

3. **Proper State Management**:
   - Added small delay with setTimeout when switching between views to ensure state updates completed
   - Improved the way IDs are passed between components

4. **Example Implementation:**
   ```typescript
   // Try multiple database access strategies
   let data, error;
   
   // Strategy 1: Admin client (bypass RLS)
   if (isDev && supabaseAdmin) {
     const result = await supabaseAdmin
       .from('table_name')
       .select('*')
       .eq('id', id)
       .maybeSingle();
     
     data = result.data;
     error = result.error;
   }
   
   // Strategy 2: Standard client
   if (!data && !error) {
     const result = await supabase
       .from('table_name')
       .select('*')
       .eq('id', id)
       .maybeSingle();
     
     data = result.data;
     error = result.error;
   }
   
   // Strategy 3: Direct ID query (dev mode)
   if (!data && isDev) {
     const result = await supabase
       .from('table_name')
       .select('*')
       .eq('id', id)
       .maybeSingle();
     
     data = result.data;
     error = result.error;
   }
   ```

### Clerk Authentication Issue in Development Mode

When running the application in development mode, we encountered a critical issue with Clerk authentication that prevented certain pages from loading:

#### The Problem
- Error: `Uncaught Error: @clerk/clerk-react: useAuth can only be used within the <ClerkProvider /> component`
- Pages would fail to render in development mode
- The issue only occurred with certain hooks that directly imported `useAuth` from Clerk

#### The Solution

1. **Use Existing Auth Wrapper**:
   - The application already had an auth wrapper (`auth-wrapper.ts`) with development mode fallbacks 
   - Changed imports to use this wrapper instead of importing directly from Clerk

2. **Import Change Example**:
   ```typescript
   // 🔴 WRONG - Causes errors in development mode
   import { useAuth } from '@clerk/clerk-react';
   
   // ✅ CORRECT - Uses the wrapper with development mode fallback
   import { useAuth } from '@/lib/auth-wrapper';
   ```

3. **Why This Works**:
   - In development mode, `auth-wrapper.ts` returns a mock auth object instead of using Clerk's hooks
   - This prevents the error about missing ClerkProvider
   - The `auth-wrapper.ts` file handles the try/catch and provides appropriate fallbacks

4. **Prevention Strategy**:
   - Always use `@/lib/auth-wrapper` instead of direct Clerk imports
   - The ESLint rules should be updated to warn about direct imports from Clerk
   - Consider adding this check to the audit script 