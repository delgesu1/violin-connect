// Re-export file components
// This allows us to start using feature-based imports

// Components that have been moved to the feature directory
export { AttachmentManager } from './AttachmentManager';

// Re-export from original location for backward compatibility
// This can be removed once all imports are updated
import OriginalAttachmentManager from '@/components/common/AttachmentManager';
export { OriginalAttachmentManager }; 