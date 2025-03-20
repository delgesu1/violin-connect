// Re-export student-related hooks from their original locations
// This allows us to start using feature-based imports

// From useStudents
export {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  type Student
} from '@/hooks/useStudents';

// From useStudentProfile  
export { 
  useStudentProfile,
  useUpdateStudentProfile,
  useUpdateStudentDifficulty
} from '@/hooks/useStudentProfile';

// Other hooks
export * from '@/hooks/useStudentColor';
export * from '@/hooks/useStudentDashboard';
export * from '@/hooks/useStudentRepertoire';
export * from '@/hooks/useInvitations';
export * from '@/hooks/useStudentsDb'; 