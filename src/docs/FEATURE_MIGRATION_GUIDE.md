# Feature Migration Guide

This guide explains how to migrate code to the new feature-based architecture in Violin Connect.

## Overview of the New Architecture

We're transitioning from a technical-based directory structure (components, hooks, pages) to a **feature-based** structure. This makes the codebase more maintainable by grouping related code together.

```
src/
├── app/                    # Application-level components
├── core/                   # Core shared code
└── features/               # Feature modules
    ├── students/           # Student management feature
    ├── repertoire/         # Repertoire management
    ├── calendar/           # Calendar and scheduling
    └── ...                 # Other features
```

## Why We're Migrating

- **Better organization**: Related code lives together
- **Clearer boundaries**: Features have well-defined APIs
- **Improved maintainability**: Easier to understand and modify features
- **Easier onboarding**: New developers can understand the system faster

## How to Work With the New Structure

### Importing Components and Hooks

Instead of importing directly from components or hooks directories, import from feature directories:

```typescript
// OLD WAY
import { StudentCard } from '@/components/common/StudentCard';
import { useStudents } from '@/hooks/useStudents';

// NEW WAY
import { StudentCard } from '@features/students/components';
import { useStudents } from '@features/students/hooks';
```

### Core Utilities and Components

For shared utilities and UI components:

```typescript
// Import shared utilities
import { cn } from '@core/utils';

// Import UI components by category
import { Button } from '@core/components/ui/inputs';
import { Card } from '@core/components/ui/data-display';
import { Toaster } from '@core/components/ui/feedback';
```

## How to Migrate Your Code

When working on a feature, follow these steps to migrate it:

### 1. Identify the Feature Domain

Determine which feature your code belongs to. If it's used across multiple features, it might belong in `core/`.

### 2. Create or Update Feature Files

If you're adding a new component or hook to an existing feature:

```typescript
// In src/features/[feature-name]/components/MyComponent.tsx
import { ... } from '@core/components/ui';
import { ... } from '@features/[feature-name]/hooks';

export function MyComponent() {
  // Implementation
}
```

### 3. Update Exports

Make sure your component is exported from the feature's index:

```typescript
// In src/features/[feature-name]/components/index.ts
export { MyComponent } from './MyComponent';
```

### 4. Update Imports

When using the component elsewhere, import from the feature:

```typescript
import { MyComponent } from '@features/[feature-name]/components';
```

## Migration Strategy for Existing Code

1. **Start with new code**: Apply the feature-based approach to new code first
2. **Refactor one feature at a time**: Don't try to migrate everything at once
3. **Use re-exports for backward compatibility**: This prevents breaking existing code
4. **Update imports gradually**: As you touch files, update their imports
5. **Remove old files when safe**: Only after all imports have been updated

## Testing After Migration

After migrating code:

1. Run the build to ensure everything still compiles
2. Test the affected features in the UI
3. Make sure there are no runtime errors in the console

## Feature Documentation

Each feature has its own README file that documents:

- Its purpose and functionality
- Component usage examples
- Hook usage examples
- Types and interfaces
- Utility functions

See the [students README](src/features/students/README.md) or [repertoire README](src/features/repertoire/README.md) for examples. 