# Students Feature

This feature module handles everything related to student management in Violin Connect.

## Structure

```
students/
├── components/            # Student-specific UI components
│   ├── StudentBadge.tsx   # Badge showing student level/difficulty
│   ├── StudentCard.tsx    # Card displaying student summary
│   └── ...                # Other student components
├── hooks/                 # Data fetching and state management
│   └── index.ts           # Exports useStudents, useStudentProfile, etc.
├── pages/                 # Student-related pages
│   ├── Students.tsx       # Main students list page
│   └── StudentDetail.tsx  # Individual student page
└── types/                 # Type definitions
    └── index.ts           # Student, Lesson, RepertoirePiece types
```

## Component Usage

### StudentBadge

```tsx
import { StudentBadge } from '@features/students/components';
import { Student } from '@features/students/types';

function MyComponent({ student }: { student: Student }) {
  return (
    <div>
      <h2>{student.name}</h2>
      <StudentBadge student={student} />
    </div>
  );
}
```

### StudentCard

```tsx
import { StudentCard } from '@features/students/components';
import { Student } from '@features/students/types';

function MyComponent({ student }: { student: Student }) {
  return <StudentCard student={student} />;
}
```

## Hooks Usage

```tsx
import { useStudents, useStudentProfile } from '@features/students/hooks';

function MyComponent() {
  // Get all students
  const { data: students, isLoading } = useStudents();
  
  // Get a specific student
  const { data: student } = useStudentProfile(studentId);
  
  return (
    // ...
  );
}
```

## Types

The main types available in this feature are:

- `Student` - Core student data structure
- `Lesson` - Student lesson information
- `RepertoirePiece` - A piece in a student's repertoire

Import these types from `@features/students/types`. 