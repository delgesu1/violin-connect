# Repertoire Migration Plan

## Phase 1: Initial Setup and Core Components (Completed)
- ✅ Create `RepertoireContext` and utilities
- ✅ Create `PieceDisplay` component
- ✅ Update `LessonHistory` component
- ✅ Update `RepertoireDisplay` component
- ✅ Fix type issues in Index.tsx
- ✅ Fix React Hooks violations and reference errors

## Phase 2: Remaining Component Updates (In Progress)
- ⏳ Update `RepertoireItem` in the Repertoire List
  - Ensure it uses context for accessing piece data
  - Replace direct title/composer access with utilities
  
- ⏳ Update `Student.tsx`
  - Modify student repertoire displays to use `PieceDisplay`
  - Ensure consistent usage of `masterPieceId` references
  
- ⏳ Update `StudentDetail.tsx`
  - Modify any pieces display to use the context utilities
  - Ensure consistent usage in student's current and past repertoire

## Phase 3: Testing and Refinement
- 🔄 Create comprehensive tests
  - Test pieces with both legacy and new data structures
  - Verify migrations run correctly at startup
  - Test edge cases and error handling

- 🔄 Refine type definitions
  - Create cleaner interfaces for the transition period
  - Improve type safety for mixed data sources

- 🔄 Address console warnings
  - Identify remaining direct property access
  - Fix useContext hook issues if they persist
  - Address any new bugs found during testing

## Phase 4: Final Cleanup and Documentation
- 🔜 Remove deprecated properties
  - Once all components are updated, remove direct title/composer properties
  - Update types to require masterPieceId

- 🔜 Remove adapter components
  - When no longer needed for backward compatibility
  - Simplify the codebase

- 🔜 Update documentation
  - Update migration guide with final state
  - Remove deprecated code examples
  - Create developer guidelines for future repertoire handling

## Implementation Strategy

For each component that needs updating, follow these steps:

1. **Analyze**: Identify all places where direct title/composer properties are accessed
2. **Plan**: Determine if PieceDisplay can be used or if custom integration is needed
3. **Implement**: Make the changes, ensuring consistent context usage
4. **Test**: Verify the component works with both legacy and new data
5. **Refine**: Clean up any code smells or type issues

## Timeline

- Phase 2: Remaining Component Updates (2-3 days)
- Phase 3: Testing and Refinement (1-2 days)  
- Phase 4: Final Cleanup and Documentation (1 day)

Total estimated time to completion: 4-6 days

## Success Criteria

1. No direct access to title/composer properties in components
2. All components use context utilities consistently
3. No console warnings about deprecated property usage
4. Clean type definitions that enforce proper usage
5. Comprehensive documentation for future development 