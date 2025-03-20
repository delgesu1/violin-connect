/**
 * User Hooks
 * 
 * This file re-exports all user-related hooks for easier imports.
 * These hooks provide functionality for accessing and manipulating user data.
 */

// Re-export user-related hooks from original locations
export { useUser } from '@/lib/auth-wrapper';
export { useUserRoles, useAssignRole, useStudentTeacher, useTeacherStudents } from '@/hooks/useUserRoles';

// Export feature-specific hooks from their implementations
export { 
  useUserProfile, 
  useUpdateUserProfile,
  type UserProfile 
} from './useUserProfile';

export { 
  useUserSettings, 
  useUpdateUserSettings,
  useThemePreference,
  useNotificationPreferences,
  type UserSettings 
} from './useUserSettings'; 