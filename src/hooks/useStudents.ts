import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { students as mockStudents } from '@/data/mockStudents'; // Used for fallback/testing
import { useAuth } from '@/lib/auth-wrapper';
import { useUserRoles } from './useUserRoles';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { setCachedMockData, getCachedMockData } from '@/lib/mockDataCache';
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID, DEV_STUDENT_UUIDS } from '@/lib/dev-uuids';

// Define a constant for development mode based on environment variable
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
// For development, use a consistent UUID that works with RLS policies
const DEV_UUID = DEV_TEACHER_UUID;

// Custom hook that provides a fallback for useAuth in development mode
const useDevelopmentAuth = () => {
  // In development mode, return mock auth data
  if (isDevelopmentMode) {
    return { 
      userId: DEV_UUID, 
      isLoaded: true, 
      isSignedIn: true, 
      getToken: async () => "mock-token-for-development" 
    };
  }
  
  // In production, use the real Clerk useAuth
  return useAuth();
};

// Types for our hook returns
export type Student = Database['public']['Tables']['students']['Row'] & {
  _source?: 'database' | 'cached' | 'mock' | 'cached-fallback' | 'mock-fallback' | 'mock-created' | 'mock-updated' | 'mock-deleted';
};
export type NewStudent = Student;
export type UpdateStudent = Partial<Student>;

interface UseStudentsOptions {
  includeNextLesson?: boolean;
}

// Helper to convert mock student data to Student type
const convertMockToStudent = (mockStudent: any, userId: string): Student => {
  return {
    id: mockStudent.id,
    name: mockStudent.name,
    email: mockStudent.email || null,
    user_id: userId,
    difficulty_level: mockStudent.difficulty_level || (mockStudent.level?.toLowerCase() || null),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    avatar_url: mockStudent.avatar_url || mockStudent.avatarUrl || null,
    phone: mockStudent.phone || null,
    academic_year: mockStudent.academic_year || mockStudent.academicYear || null,
    next_lesson_id: mockStudent.next_lesson_id || null,
    level: mockStudent.level || null,
    last_lesson_date: mockStudent.last_lesson_date || null,
    next_lesson: mockStudent.next_lesson || mockStudent.nextLesson || null,
    start_date: mockStudent.start_date || new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days ago by default
    unread_messages: typeof mockStudent.unread_messages !== 'undefined' ? mockStudent.unread_messages : 
                     typeof mockStudent.unreadMessages !== 'undefined' ? mockStudent.unreadMessages : 0
  };
};

/**
 * Hook to fetch all students for the logged-in user (teacher)
 */
export function useStudents(options: UseStudentsOptions = {}) {
  const { userId } = useDevelopmentAuth();
  
  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      let userUuid: string;
      
      if (isDevelopmentMode) {
        userUuid = DEV_UUID;
      } else {
        if (!userId) {
          console.log('No user ID - cannot fetch students');
          return [];
        }
        
        // Convert Clerk ID to Supabase UUID and validate
        userUuid = await clerkIdToUuid(userId);
        if (!isValidUUID(userUuid)) {
          console.error('Invalid UUID format for user ID');
          return [];
        }
      }
      
      try {
        console.log(`🔍 Fetching students for user ${userUuid} from database...`);
        
        // Use the user's Supabase UUID to query data with RLS
        let query;
        
        if (options.includeNextLesson) {
          // Handle complex join query
          query = supabase.from('students').select(`
            *,
            next_lesson:lessons(date, time_start, time_end)
          `);
        } else {
          // Simple query
          query = supabase.from('students').select('*');
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Supabase error details:', error);
          throw error;
        }
        
        // If successful data, cache it for future development use
        if (data && data.length > 0) {
          console.log(`✅ Found ${data.length} students from database`);
          
          // Cache the database response for offline use
          setCachedMockData('students', data);
          
          // Add source indicator for debugging in development
          const studentsWithSource = data.map(student => ({
            ...student,
            _source: 'database'
          } as Student));
          
          return studentsWithSource;
        }
        
        // If no data found, look for cached data first
        console.log(`📦 No students found in database, checking cache...`);
        const cachedData = getCachedMockData<Student[] | null>('students', null);
        
        if (cachedData && cachedData.length > 0) {
          console.log(`📋 Using ${cachedData.length} students from cache`);
          return cachedData.map(student => ({
            ...student,
            _source: 'cached'
          } as Student));
        }
        
        // If no cached data, fall back to mock data
        if (isDevelopmentMode) {
          console.log('🔄 DEV MODE: Using mock student data as final fallback');
          
          // Convert mock students to proper structure with UUIDs
          const mockStudentsWithUuids = mockStudents.map((mockStudent, index) => {
            // Try to use UUID from DEV_STUDENT_UUIDS if available
            const studentUuid = Object.values(DEV_STUDENT_UUIDS)[index] || 
                               `student-${index+1}`;
            
            const student = {
              ...convertMockToStudent({
                ...mockStudent,
                id: studentUuid
              }, userUuid),
              _source: 'mock' as const // Use const assertion for type safety
            };
            
            return student;
          });
          
          // Cache the mock data
          setCachedMockData('students', mockStudentsWithUuids);
          
          return mockStudentsWithUuids;
        }
        
        return [] as Student[];
      } catch (err) {
        console.error('Error in useStudents:', err);
        
        // In development mode, try cached data first before using mock data
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<Student[] | null>('students', null);
          if (cachedData && cachedData.length > 0) {
            console.log('📦 DEV MODE: Falling back to cached student data after error');
            return cachedData.map(student => ({
              ...student,
              _source: 'cached-fallback'
            } as Student));
          }
          
          console.log('🔄 DEV MODE: Falling back to mock student data due to error');
          
          // Convert mock students with UUIDs
          const mockStudentsWithUuids = mockStudents.map((mockStudent, index) => {
            // Try to use UUID from DEV_STUDENT_UUIDS if available
            const studentUuid = Object.values(DEV_STUDENT_UUIDS)[index] || 
                               `student-${index+1}`;
            
            const student = {
              ...convertMockToStudent({
                ...mockStudent,
                id: studentUuid
              }, userUuid),
              _source: 'mock-fallback' as const // Use const assertion for type safety
            };
            
            return student;
          });
          
          return mockStudentsWithUuids;
        }
        
        throw err;
      }
    },
    enabled: isDevelopmentMode || !!userId,
  });
}

/**
 * Hook to fetch a single student by ID
 */
export function useStudent(id: string | undefined) {
  const { userId } = useDevelopmentAuth();
  
  return useQuery<Student | null>({
    queryKey: ['student', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        // Check if ID is a valid UUID before querying database
        if (isValidUUID(id)) {
          console.log(`🔍 Fetching student details for ${id} from database...`);
          const { data, error } = await supabase
            .from('students')
            .select(`
              *,
              next_lesson:lessons(*)
            `)
            .eq('id', id)
            .single();
          
          if (!error && data) {
            console.log(`✅ Successfully fetched student ${id} from database`);
            
            // Cache the database response
            const cacheKey = `student_${id}`;
            setCachedMockData(cacheKey, data);
            
            // Add source info for debugging
            return {
              ...data,
              _source: 'database'
            } as Student;
          }
          
          if (error) {
            console.error(`Error fetching student ${id} from database:`, error);
          }
        } else {
          console.log(`⚠️ Skipping database query for student ${id} - not a valid UUID`);
        }
        
        // If no data found in database or invalid UUID, check cache
        console.log(`📦 Checking cache for student ${id}...`);
        const cacheKey = `student_${id}`;
        const cachedData = getCachedMockData<Student | null>(cacheKey, null);
        
        if (cachedData) {
          console.log(`📋 Using cached data for student ${id}`);
          return {
            ...cachedData,
            _source: 'cached'
          } as Student;
        }
        
        // If still no data, try mock data in development mode
        if (isDevelopmentMode) {
          console.log(`📝 Using mock data for student ${id} as final fallback`);
          
          // Try to map string IDs to UUIDs if needed
          const mappedId = id in DEV_STUDENT_UUIDS 
            ? DEV_STUDENT_UUIDS[id as keyof typeof DEV_STUDENT_UUIDS]
            : id;
            
          // First try exact match with UUID
          const mockStudent = mockStudents.find(s => s.id === mappedId);
          
          if (mockStudent) {
            const convertedStudent = convertMockToStudent(mockStudent, DEV_UUID);
            // Cache the mock data for future use
            setCachedMockData(cacheKey, convertedStudent);
            return {
              ...convertedStudent,
              _source: 'mock'
            } as Student;
          }
        }
        
        console.warn(`❌ Student ${id} not found in any data source`);
        return null;
      } catch (err) {
        console.error(`Error fetching student ${id}:`, err);
        
        // In development mode, try cached data before falling back to mock
        if (isDevelopmentMode) {
          const cacheKey = `student_${id}`;
          const cachedData = getCachedMockData<Student | null>(cacheKey, null);
          if (cachedData) {
            console.log(`📋 Using cached data for student ${id} after error`);
            return {
              ...cachedData,
              _source: 'cached-fallback'
            } as Student;
          }
          
          // As last resort, try mock data
          const mockStudent = mockStudents.find(s => s.id === id);
          if (mockStudent) {
            console.log(`📝 Using mock data for student ${id} after error`);
            const convertedStudent = convertMockToStudent(mockStudent, DEV_UUID);
            return {
              ...convertedStudent,
              _source: 'mock-fallback'
            } as Student;
          }
        }
        
        return null;
      }
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a student
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();
  const { userId } = useDevelopmentAuth();
  
  return useMutation({
    mutationFn: async (newStudent: NewStudent) => {
      let supabaseUserId: string;
      
      if (isDevelopmentMode) {
        supabaseUserId = DEV_UUID;
      } else {
        if (!userId) throw new Error('User not authenticated');
        supabaseUserId = await clerkIdToUuid(userId);
      }
      
      // Set the user ID
      const studentData = {
        ...newStudent,
        user_id: supabaseUserId
      };
      
      const { data, error } = await supabase
        .from('students')
        .insert(studentData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update cache
      if (isDevelopmentMode) {
        setCachedMockData(`student_${data.id}`, data);
      }
      
      return data as Student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

/**
 * Hook to update a student
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      student 
    }: { 
      id: string; 
      student: Partial<Omit<Student, 'id' | 'user_id'>> 
    }) => {
      const { data, error } = await supabase
        .from('students')
        .update(student)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // If successful, update the cache
      if (data && isDevelopmentMode) {
        // Update the individual student cache
        setCachedMockData(`student_${id}`, data);
        
        // Update the entry in the students cache
        const cachedStudents = getCachedMockData<Student[]>('students', []);
        const updatedCache = cachedStudents.map(s => 
          s.id === id ? data : s
        );
        setCachedMockData('students', updatedCache);
      }
      
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
export function useDeleteStudent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // If successful, update the cache
      if (isDevelopmentMode) {
        // Remove from the students cache
        const cachedStudents = getCachedMockData<Student[]>('students', []);
        const updatedCache = cachedStudents.filter(s => s.id !== id);
        setCachedMockData('students', updatedCache);
        
        // Try to remove the individual student cache
        try {
          localStorage.removeItem(`mock_student_${id}`);
        } catch (e) {
          console.warn(`Failed to remove cached student ${id}`, e);
        }
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
} 