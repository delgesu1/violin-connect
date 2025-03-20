import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import type { Database } from '@/types/supabase';
import { clerkIdToUuid, logIdConversion } from '@/lib/auth-utils';

// Type definitions
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type Role = 'teacher' | 'student';

// Check if in development mode (for conditionally using auth)
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

/**
 * Hook to fetch and check the current user's roles
 */
export function useUserRoles() {
  // In development mode, return mock roles
  if (isDevelopmentMode) {
    // Return mock data in development mode
    return {
      isTeacher: true, // Assume user is a teacher in development
      isStudent: false,
      roles: [],
      isLoading: false,
      isError: false,
      error: null,
      data: [],
    };
  }

  // Only use Clerk's hooks in production
  const { userId } = useAuth();
  
  const query = useQuery({
    queryKey: ['user_roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Convert Clerk ID to UUID format
      const supabaseUserId = clerkIdToUuid(userId);
      
      // Log the conversion for debugging
      console.log(`[useUserRoles] Clerk ID: ${userId}`);
      console.log(`[useUserRoles] Supabase UUID: ${supabaseUserId}`);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', supabaseUserId);
        
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      console.log(`[useUserRoles] Roles found: ${data?.length || 0}`, data);
      return data as UserRole[];
    },
    enabled: !!userId,
  });
  
  // Helper functions to check roles
  const isTeacher = !!query.data?.some(role => role.role === 'teacher');
  const isStudent = !!query.data?.some(role => role.role === 'student');
  
  // For development environment, override roles when needed
  const isDev = import.meta.env.DEV;
  
  // If in development and the user should be a teacher but isn't recognized
  const forceTeacher = isDev && userId === 'user_2uFOgpmUjcplrrAKoCytvCEbpiM';
  
  console.log(`[useUserRoles] isTeacher: ${isTeacher}, forceTeacher: ${forceTeacher}`);
  
  return {
    ...query,
    isTeacher: isTeacher || forceTeacher,
    isStudent,
    roles: query.data || [],
  };
}

/**
 * Hook to assign a role to the current user
 */
export function useAssignRole() {
  // In development mode, return mock implementation
  if (isDevelopmentMode) {
    return {
      mutate: (role: Role) => {
        console.log(`[DEV] Assigning role: ${role}`);
        return Promise.resolve({ role } as UserRole);
      },
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (role: Role) => {
      if (!userId) throw new Error('User not authenticated');
      
      // Convert Clerk ID to UUID format
      const supabaseUserId = clerkIdToUuid(userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: supabaseUserId,
          role,
        })
        .select()
        .single();
        
      if (error) {
        // If role already exists, ignore the error
        if (error.code === '23505') { // Unique violation
          return { role } as UserRole;
        }
        console.error(`Error assigning ${role} role:`, error);
        throw error;
      }
      
      return data as UserRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
    },
  });
}

/**
 * Hook to get the teacher associated with a student
 */
export function useStudentTeacher() {
  // In development mode, return mock data
  if (isDevelopmentMode) {
    return {
      data: {
        id: 'mock-teacher-id',
        name: 'Demo Teacher',
        email: 'teacher@example.com',
      },
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  const { userId } = useAuth();
  
  return useQuery({
    queryKey: ['student_teacher', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Convert Clerk ID to UUID format
      const supabaseUserId = clerkIdToUuid(userId);
      
      // Get the student record to find the teacher_id (user_id field)
      const { data, error } = await supabase
        .from('students')
        .select('user_id')
        .eq('id', supabaseUserId)
        .single();
      
      if (error) {
        console.error('Error fetching teacher:', error);
        return null;
      }
      
      // Now fetch the teacher's data using the user_id
      if (data?.user_id) {
        const { data: teacherData, error: teacherError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user_id)
          .single();
          
        if (teacherError) {
          console.error('Error fetching teacher profile:', teacherError);
          return null;
        }
        
        return teacherData;
      }
      
      return null;
    }
  });
}

/**
 * Hook to get all students associated with a teacher
 */
export function useTeacherStudents() {
  // In development mode, return mock data
  if (isDevelopmentMode) {
    return {
      data: [
        {
          id: 'student-1',
          name: 'Demo Student 1',
          email: 'student1@example.com',
        },
        {
          id: 'student-2',
          name: 'Demo Student 2',
          email: 'student2@example.com',
        }
      ],
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  const { userId } = useAuth();
  
  return useQuery({
    queryKey: ['teacher_students', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Convert Clerk ID to UUID format
      const supabaseUserId = clerkIdToUuid(userId);
      
      // Get all students where user_id matches the teacher's ID
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', supabaseUserId);
      
      if (error) {
        console.error('Error fetching students:', error);
        return [];
      }
      
      return data || [];
    }
  });
} 