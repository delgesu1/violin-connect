// Re-export utility functions from their original locations
// This allows us to start using @core paths without breaking anything

// General utilities
export { cn } from '@/lib/utils';

// ID utilities
export * from '@/lib/id-utils';

// Mock data utilities
export * from '@/lib/mockDataCache';

// Auth utilities
export * from '@/lib/auth-utils';

// Attachment utilities
export * from '@/lib/attachment-utils';

// Development mode utilities
export * from '@/lib/development-mode'; 