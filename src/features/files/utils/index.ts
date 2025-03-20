// Re-export file-related utilities
// This allows us to start using feature-based imports

export {
  AttachmentEntityType,
  AttachmentType,
  mockAttachments,
  mockAttachmentAssociations,
  createAttachmentId,
  createAttachmentAssociation,
  getAttachmentsForEntity,
  getEntitiesForAttachment
} from '@/lib/attachment-utils'; 