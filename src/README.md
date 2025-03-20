# Violin Connect Project Structure

This application follows a feature-based architecture to improve maintainability and organization.

## Directory Structure

```
src/
├── app/                    # Application-level components
│   ├── layout/             # Layout components (AppLayout, Sidebar)
│   └── App.tsx             # Main App component with routing
├── core/                   # Core shared code
│   ├── components/         # Shared UI components
│   │   └── ui/             # UI component library
│   │       ├── data-display/  # Tables, cards, badges, etc.
│   │       ├── inputs/        # Form controls, buttons
│   │       ├── feedback/      # Alerts, toasts
│   │       ├── navigation/    # Tabs, menus
│   │       ├── layout/        # Layout components
│   │       └── overlays/      # Dialogs, modals, popovers
│   ├── utils/              # Core utility functions
│   └── types/              # Shared TypeScript types
├── features/               # Feature modules
│   ├── students/           # Student management feature
│   ├── repertoire/         # Repertoire management
│   ├── calendar/           # Calendar and scheduling
│   ├── journal/            # Practice journal
│   ├── messages/           # Messaging system
│   ├── discussions/        # Community discussions
│   ├── files/              # File management
│   ├── dashboard/          # Dashboard views
│   ├── auth/               # Authentication
│   └── user/               # User profile and settings
└── main.tsx               # Application entry point
```

## Feature Structure

Each feature follows a consistent organization:

```
features/feature-name/
├── components/            # Feature-specific components
├── hooks/                 # Feature-specific data hooks
├── pages/                 # Feature pages
├── types/                 # Feature-specific types
├── utils/                 # Feature-specific utilities
└── index.ts              # Feature exports
```

## Import Conventions

Use these import patterns for consistent code organization:

```typescript
// Import from core UI components
import { Button, Card } from '@core/components/ui';

// Import from a specific feature
import { useStudents } from '@features/students/hooks';
import { StudentCard } from '@features/students/components';

// Import a feature page
import { Dashboard } from '@features/dashboard/pages';

// Import from app layout
import { AppLayout } from '@app/layout';
```

## Adding New Features

When adding a new feature:

1. Create a directory in `src/features/` with the feature name
2. Follow the standard feature structure with components, hooks, etc.
3. Export functionality through the feature's index.ts file
4. Import the feature in App.tsx for routing or wherever needed

## Migrating Existing Components

To move an existing component to the new feature-based structure:

1. **Identify the component's feature domain**:
   - Determine which feature the component belongs to
   - If it's used across multiple features, it might belong in `core/components`

2. **Create the new component file**:
   - Create the file in the appropriate feature directory
   - Update imports to use the new path aliases (@core, @features, etc.)
   - Make sure the component is properly exported

3. **Update the feature's exports**:
   - Add the component to the appropriate index.ts file
   - Initially keep the old component file for backward compatibility

4. **Update imports gradually**:
   - Start using the new import location in new or refactored code
   - Gradually update existing imports across the codebase

5. **Remove the original file**:
   - Once all imports have been updated, remove the original file

### Example: Moving a Component

**Step 1**: Identify the component (e.g., StudentCard belongs to the students feature)

**Step 2**: Create the new file
```typescript
// in src/features/students/components/StudentCard.tsx
import { Card } from '@core/components/ui/data-display';
import { cn } from '@core/utils';
// ... rest of component
```

**Step 3**: Update the feature exports
```typescript
// in src/features/students/components/index.ts
export { StudentCard } from './StudentCard';
```

**Step 4**: Use the new imports
```typescript
// Old import
import { StudentCard } from '@/components/common/StudentCard';

// New import
import { StudentCard } from '@features/students/components';
```

**Step 5**: Eventually remove the original file 