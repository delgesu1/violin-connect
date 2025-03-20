// Re-export auth-related hooks from their original locations
// This allows us to start using feature-based imports

// Auth hooks and utilities
export { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
export { useUserRoles } from '@/hooks/useUserRoles';
export { useDevFallbackUser } from '@/hooks/useDevFallbackUser';
export { useAuth } from '@/lib/auth-wrapper';

// Auth utilities
export { clerkIdToUuid, logIdConversion } from '@/lib/auth-utils'; 