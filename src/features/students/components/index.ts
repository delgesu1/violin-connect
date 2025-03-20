// Re-export student components from their original locations
// This allows us to start using feature-based imports

export { default as StudentTable } from '@/components/students/StudentTable';
export { InviteStudentDialog } from '@/components/students/InviteStudentDialog';
export { InvitationsList } from '@/components/students/InvitationsList';

// Export native feature components
export { StudentBadge } from './StudentBadge';
export { StudentCard } from './StudentCard'; 