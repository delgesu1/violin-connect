# Migration Strategy: Updating Imports and Removing Legacy Files

This document outlines the strategy for safely updating imports and removing legacy files during Phase 4 of our feature-based architecture migration.

## General Approach

1. **Gradual Migration**: Update imports one feature at a time
2. **Test After Each Change**: Build and test after each significant set of changes
3. **Use Re-Export Files**: Leverage the index.ts files in each feature to maintain compatibility
4. **Remove One File At A Time**: Remove files only after all imports are updated

## Directory Structure Conventions

For each feature, follow this pattern:
```
src/features/[feature-name]/
  ├── components/
  │   └── index.ts  # Re-exports all components
  ├── hooks/
  │   └── index.ts  # Re-exports all hooks
  ├── pages/
  │   └── index.ts  # Re-exports all pages
  ├── contexts/     # Optional, for feature-specific contexts
  └── utils/        # Optional, for feature-specific utilities
```

## Import Pattern Migration

### Old Import Pattern
```typescript
import { useFeatureHook } from '@/hooks/useFeature';
import { FeatureComponent } from '@/components/common/FeatureComponent';
```

### New Import Pattern 
```typescript
import { useFeatureHook } from '@/features/feature-name/hooks';
import { FeatureComponent } from '@/features/feature-name/components';
```

## Migration Steps for Each Feature

1. **Identify All Imports**:
   - Use `grep_search` to find all imports for each legacy file
   
2. **Update Imports in Feature Pages First**:
   - Start with the feature's own pages, components, and hooks
   - Update to use the new import pattern
   
3. **Update Cross-Feature Imports**:
   - Find places where other features import this feature's hooks/components
   - Update to use the new import pattern
   
4. **Test Thoroughly**:
   - Verify the build succeeds
   - Test affected features manually
   
5. **Remove Legacy Files**:
   - Only after all imports are updated
   - Remove one file at a time
   - Test after each removal

## Immediate Next Steps

1. **Begin with Repertoire Feature**:
   - Implement real hook files in features/repertoire/hooks/ instead of just re-exports
   - Update imports in repertoire feature pages and components
   - Update imports in other features
   - Remove legacy repertoire hook files from src/hooks/

2. **Continue with Journal Feature**:
   - Follow the same pattern for journal-related hooks and components
   
3. **Proceed Feature by Feature**:
   - Students
   - Calendar
   - Files
   - Auth
   - Messages
   - Dashboard
   - Discussions
   - User

## Handling Edge Cases

### Context Providers
- Move context providers to features/[feature-name]/contexts/
- Update imports in App.tsx and other files

### Shared Utilities
- For truly shared utilities, keep in src/lib/
- For feature-specific utilities, move to features/[feature-name]/utils/

### Type Definitions
- For shared types, keep in src/types/
- For feature-specific types, move to features/[feature-name]/types/

## Final Cleanup

1. Remove empty directories
2. Update documentation
3. Add architecture diagrams 