# Phase 4: Cleanup Plan

This document outlines the plan for cleaning up the codebase after migrating to a feature-based architecture.

## Progress Update (2025-03-21)

We've continued implementing Phase 4 cleanup with the following progress:

- ✅ Created real hook implementations in `features/repertoire/hooks/`
  - ✅ `useMasterRepertoire.ts` - Implements all master repertoire hooks
  - ✅ `useStudentRepertoire.ts` - Implements all student repertoire hooks
  - ✅ Updated the `index.ts` file to export from these new files
  - ✅ Updated imports in `PieceDetails.tsx` and `Repertoire.tsx`

- ✅ Created real hook implementation for Journal Insights in `features/journal/hooks/`
  - ✅ `useJournalInsights.ts` - Implements journal insights hooks
  - ✅ Updated the `index.ts` file to export from the new implementation

- ✅ Created implementation for Calendar/Lessons hooks in `features/calendar/hooks/`
  - ✅ `useLessons.ts` - Implements lesson management hooks including the missing useCreateLessonWithEvent
  - ✅ Updated the `index.ts` file to export all the hooks

- ✅ Improved implementation for Files hooks in `features/files/hooks/`
  - ✅ Updated `useAttachments.ts` to use the hybrid caching approach
  - ✅ Added proper error handling for all file operations
  - ✅ Added source tracking to indicate whether data comes from API, cache, or mock
  - ✅ Created utility files to support the implementation:
    - ✅ `src/hooks/useLocalStorage.ts` - For caching data locally
    - ✅ `src/lib/environment.ts` - For environment-specific behavior

- ✅ Fixed issues with AllLessonsTable component
  - ✅ Implemented proper hybrid caching for Supabase integration
  - ✅ Added data source badges for debugging (API/Cached/Mock)
  - ✅ Fixed lesson loading and formatting

## Files Already Removed

The following files have been successfully migrated and removed:

- [x] `src/hooks/useRepertoire.ts` → Migrated to features/repertoire/hooks/useMasterRepertoire.ts
- [x] `src/hooks/useJournalInsights.ts` → Migrated to features/journal/hooks/useJournalInsights.ts
- [x] `src/hooks/useLessons.ts` → Migrated to features/calendar/hooks/useLessons.ts

## Remaining Files to Remove

### Hooks
These hooks still need to be migrated to feature-specific locations:

- [ ] `src/hooks/useJournal.ts` → Should migrate to features/journal/hooks
- [ ] `src/hooks/useCalendarEvents.ts` → Should migrate to features/calendar/hooks
- [ ] `src/hooks/useStudentProfile.ts` → Should migrate to features/students/hooks
- [ ] `src/hooks/useStudents.ts` → Should migrate to features/students/hooks
- [ ] `src/hooks/usePieceStudentHistory.ts` → Should migrate to features/repertoire/hooks
- [ ] `src/hooks/useRepertoireLinks.ts` → Should migrate to features/repertoire/hooks
- [ ] `src/hooks/useRepertoireFiles.ts` → Should migrate to features/repertoire/hooks
- [ ] `src/hooks/useTeacher.ts` → Should migrate to features/students/hooks
- [ ] `src/hooks/useInvitations.ts` → Should migrate to features/auth/hooks
- [ ] `src/hooks/useRepertoireAttachments.ts` → Should migrate to features/files/hooks
- [ ] `src/hooks/useStudentDashboard.ts` → Should migrate to features/dashboard/hooks

### Components
These components still need to be migrated to feature-specific locations:

- [ ] `src/components/students/StudentTable.tsx` → Should migrate to features/students/components
- [ ] `src/components/students/InviteStudentDialog.tsx` → Should migrate to features/students/components
- [ ] `src/components/students/InvitationsList.tsx` → Should migrate to features/auth/components
- [ ] `src/components/common/AttachmentManager.tsx` → Should migrate to features/files/components

## Legacy Implementations to Update
These files contain legacy/deprecated implementations that need to be updated:

- [ ] Update or remove legacy attachments in `src/lib/attachment-utils.ts`
- [ ] Remove deprecated `LegacyRepertoirePiece` interface in `src/components/common/StudentCard.tsx`
- [ ] Update references in `src/features/repertoire/hooks/index.ts` to no longer use hooks from `/hooks`

## Verification Steps

Before removing any files, ensure:

1. [ ] Run `grep_search` to find all imports pointing to the old file location
2. [ ] Update all components to use the new feature-based imports
3. [ ] Ensure the new implementation follows our hybrid caching pattern
4. [ ] Verify all features work in both development and production modes
5. [ ] Check that API, cached, and mock data sources are properly handled
6. [ ] Run all tests and verify they pass
7. [ ] Only remove the original file after all imports are updated and functioning correctly

## Cleanup Process

Follow this process for each file to be removed:

1. Check for imports using `grep_search`
2. Update any imports to point to the new feature-based locations
3. Verify that the application builds and runs correctly
4. Remove the old file
5. Mark the item as complete in this document
6. Update the MIGRATION_PROGRESS.md document

## Documentation Updates

After cleanup, update:

1. [ ] README.md with the new architecture overview
2. [ ] Create or update ARCHITECTURE.md with detailed structure explanation
3. [ ] Update any developer onboarding documentation 