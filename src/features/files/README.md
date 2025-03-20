# Files Feature

This feature module manages file attachments and documents in Violin Connect.

## Structure

```
files/
├── components/            # File-specific UI components
│   ├── AttachmentManager.tsx  # Component for managing attachments
│   └── ...                    # Other file components
├── hooks/                 # Data fetching and state
│   └── index.ts           # File-related hooks
├── pages/                 # File pages
│   └── Files.tsx          # Main files page
├── types/                 # Type definitions
│   └── index.ts           # File-specific types
└── utils/                 # Utility functions
    └── index.ts           # File-related utilities
```

## Component Usage

### AttachmentManager

The `AttachmentManager` component allows you to manage file and link attachments for various entities in the application.

```tsx
import { AttachmentManager } from '@features/files/components';
import { AttachmentEntityType } from '@features/files/utils';

function MyComponent() {
  return (
    <AttachmentManager 
      entityType={AttachmentEntityType.STUDENT}
      entityId="123" 
      allowUpload={true}
      allowDelete={true}
      showAssociations={false}
      title="Student Files"
      onAttachmentSelect={(attachmentId) => {
        console.log(`Selected attachment: ${attachmentId}`);
      }}
    />
  );
}
```

## Attachment Types

The files feature supports various attachment types:

```typescript
enum AttachmentType {
  DOCUMENT = 'document',
  LINK = 'link',
  AUDIO = 'audio',
  VIDEO = 'video',
  IMAGE = 'image',
}
```

## Entity Associations

Attachments can be associated with different entities in the application:

```typescript
enum AttachmentEntityType {
  STUDENT = 'student',
  REPERTOIRE = 'repertoire',
  LESSON = 'lesson',
  JOURNAL = 'journal',
}
```

## Utilities

```typescript
import { 
  createAttachmentId,
  createAttachmentAssociation,
  getAttachmentsForEntity,
  getEntitiesForAttachment
} from '@features/files/utils';

// Get all attachments for a specific entity
const studentAttachments = getAttachmentsForEntity(
  AttachmentEntityType.STUDENT, 
  studentId
);

// Create a new attachment association
const association = createAttachmentAssociation(
  attachmentId,
  AttachmentEntityType.REPERTOIRE,
  pieceId
);

// Get all entities associated with an attachment
const entities = getEntitiesForAttachment(attachmentId);
``` 