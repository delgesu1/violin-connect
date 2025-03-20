import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Student } from '@/types/supabase';
import { useAuth } from '@clerk/clerk-react';
import { useUserRoles } from './useUserRoles';
import { clerkIdToUuid } from '@/lib/auth-utils';

export type NewStudent = Partial<Student>;
export type UpdateStudent = Partial<Student>;

interface UseStudentsOptions {
  includeNextLesson?: boolean;
}

/**
 * Hook to fetch all students from the database
 */
export function useStudentsDb(options: UseStudentsOptions = {}) {
  const { userId } = useAuth();
  const { isTeacher } = useUserRoles();

  return useQuery({
    queryKey: ['students', userId, isTeacher, options.includeNextLesson],
    queryFn: async () => {
      if (!userId) {
        console.warn('No user ID available, cannot fetch students');
        return [];
      }
      
      const supabaseUUID = await clerkIdToUuid(userId);
      
      if (!supabaseUUID) {
        console.warn('Could not convert Clerk ID to Supabase UUID');
        return [];
      }
      
      let query = supabase
        .from('students')
        .select('*');
      
      // If user is a teacher, filter students by user_id matching the teacher's ID
      if (isTeacher) {
        query = query.eq('user_id', supabaseUUID);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch a single student by ID
 */
export function useStudentDb(id: string | undefined) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new student
 */
export function useCreateStudentDb() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (newStudent: NewStudent) => {
      if (!userId) {
        throw new Error('No user ID available, cannot create student');
      }
      
      const supabaseUUID = await clerkIdToUuid(userId);
      
      if (!supabaseUUID) {
        throw new Error('Could not convert Clerk ID to Supabase UUID');
      }
      
      // Ensure user_id is set to the current user and name is provided
      if (!newStudent.name) {
        throw new Error('Student name is required');
      }
      
      const studentData = {
        ...newStudent,
        user_id: supabaseUUID,
        name: newStudent.name // Ensure name is explicitly included
      };
      
      const { data, error } = await supabase
        .from('students')
        .insert(studentData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

/**
 * Hook to update an existing student
 */
export function useUpdateStudentDb() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, student }: { id: string; student: UpdateStudent }) => {
      const { data, error } = await supabase
        .from('students')
        .update(student)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', data.id] });
    },
  });
}

/**
 * Hook to delete a student
 */
export function useDeleteStudentDb() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
} 