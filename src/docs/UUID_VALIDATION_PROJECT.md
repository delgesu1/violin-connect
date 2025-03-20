# UUID Validation Project Tracker

## Project Overview

The Violin Connect application is implementing a comprehensive UUID validation approach to ensure consistent data handling across development, testing, and production environments. This document tracks the progress of identifying and fixing issues related to non-UUID formatted IDs throughout the codebase.

## Project Goals

1. **Ensure database compatibility**: All IDs passed to Supabase queries must be valid UUIDs
2. **Implement consistent hybrid caching**: Follow the approach defined in DATABASE_WORKFLOW.md
3. **Standardize mock data generation**: Use consistent UUIDs from a central definition file
4. **Improve error handling**: Gracefully handle non-UUID IDs in development mode
5. **Add transparency**: Track and display data sources for debugging purposes

## Methodology

### Phase 1: Audit & Assessment
- Run the `audit-data-layer.sh` script to identify all potential issues
- Categorize findings by priority and component area
- Document baseline metrics for tracking progress

### Phase 2: Implementation
- Update core utilities with UUID validation functions
- Fix high-priority components (student details, lesson loaders)
- Implement the template pattern in all data-fetching hooks
- Update mock data generation across the application

### Phase 3: Verification
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
| `defaultRepertoire.ts` | ✅ Complete | 2024-03-20 | Updated to use UUIDs from DEV_REPERTOIRE_UUIDS |
| `useStudentRepertoire.ts` | ✅ Complete | 2024-03-20 | Now uses DEV_REPERTOIRE_UUIDS and has proper validation |
| `Dashboard.tsx` | ✅ Complete | 2024-03-20 | Updated repertoire references to use UUIDs |
| `useStudentById.ts` | 🔄 In Progress | - | - |
| `useLessons.ts` | 🔄 In Progress | - | - |
| `useMasterRepertoire.ts` | 🔄 In Progress | - | - |
| `useAttachments.ts` | ⏳ Not Started | - | - |
| `useCalendarEvents.ts` | ⏳ Not Started | - | - |
| `useTeacherDashboard.ts` | ⏳ Not Started | - | - |
| Component Mocks | ⏳ Not Started | - | - |
| `/features/journal` hooks | ⏳ Not Started | - | - |
| `/features/calendar` hooks | ⏳ Not Started | - | - |
| `/features/repertoire` hooks | ⏳ Not Started | - | - |
| `/features/user` hooks | ⏳ Not Started | - | - |
| `/features/discussions` hooks | ⏳ Not Started | - | - |
| `/features/messages` hooks | ⏳ Not Started | - | - |
| `/features/files` hooks | ⏳ Not Started | - | - |

## Implementation Details

### 1. Core Files Created/Updated

- `src/lib/dev-uuids.ts` - Central UUID constants
- `src/lib/id-utils.ts` - Added UUID validation function and deprecation notices
- `src/lib/hook-template.ts` - Reference implementation
- `scripts/audit-data-layer.sh` - Comprehensive audit script
- `src/docs/UUID_VALIDATION_GUIDE.md` - Developer guide
- `src/components/dev/HookHealthDashboard.tsx` - Data source tracking dashboard
- `.github/PULL_REQUEST_TEMPLATE/uuid_validation_fix.md` - PR template

### 2. Best Practices Enforced

- All IDs passed to Supabase must be validated with `isValidUUID(id)`
- Development mode should skip database queries for non-UUID IDs
- Mock data should use UUIDs from `dev-uuids.ts`
- All data hooks should follow the hybrid caching approach
- Components should handle missing/invalid IDs gracefully

### 3. Current Metrics

- **Initial Issues**: 
  - Non-UUID string IDs: 132 occurrences
  - ID prefix usage: 167 occurrences
  - Missing dev-uuids imports: 41 hooks
  - Missing hybrid caching: 13 hooks
  - Missing UUID validation: 18 hooks
  - Missing source tracking: 12 hooks

- **Current Issues**: 
  - Non-UUID string IDs: 132 → 129 occurrences (-3)
  - ID prefix usage: 167 → 113 occurrences (-54)
  - Missing dev-uuids imports: 41 → 38 hooks (-3)
  - isValidUUID usage: 2 → 5 occurrences (+3)

- **Fixed Issues**: 10 components updated
- **Completion Percentage**: ~12% (10/83 identified issues)

## Priority Areas

Based on the audit results, here are the priority areas to address:

### High Priority (In Progress)
1. **Repertoire Component**: Using "p-" prefixed IDs (113 occurrences, down from 125)
2. **ID Creation System**: Heavy usage of `createPrefixedId` (51 occurrences, down from 78) and `ID_PREFIXES` (58 occurrences, down from 85)
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
     - ✅ Repertoire system: fixed key components (defaultRepertoire, useStudentRepertoire, Dashboard)
     - 🔄 Repertoire system: continue with useMasterRepertoire and other repertoire hooks
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
1. Fix useMasterRepertoire to use UUIDs from dev-uuids.ts
2. Address the remaining P-prefix occurrences
3. Begin replacing usages of createPrefixedId with UUIDs from dev-uuids.ts

### Week 2 Tasks
1. Create a tracking system for complex components
2. Address Calendar and Lesson hooks
3. Update test data to use consistent UUIDs

## Resources

- [DATABASE_WORKFLOW.md](./DATABASE_WORKFLOW.md) - Hybrid caching approach guide
- [UUID_VALIDATION_GUIDE.md](./UUID_VALIDATION_GUIDE.md) - Guide to fixing UUID validation issues 