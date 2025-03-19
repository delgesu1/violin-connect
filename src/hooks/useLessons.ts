import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import { clerkIdToUuid } from '@/lib/auth-utils';
import type { Database } from '@/types/supabase';
import { Lesson as SchemaLesson } from '@/types/schema_extensions';
import { cacheMockData, getCachedMockData } from '@/lib/mockDataCache';

// Type definitions
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type NewLesson = Omit<Lesson, 'id' | 'created_at' | 'updated_at'>;
export type UpdateLesson = Partial<Omit<Lesson, 'id' | 'created_at' | 'updated_at'>>;

// Types for lesson repertoire
export type LessonRepertoire = Database['public']['Tables']['lesson_repertoire']['Row'];
export type NewLessonRepertoire = Database['public']['Tables']['lesson_repertoire']['Insert'];

// Check if we're in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
// For development, use a consistent UUID that works with RLS policies
const DEV_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

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

/**
 * Hook to fetch all lessons for the current user (teacher)
 */
export function useLessons() {
  const { userId } = useDevelopmentAuth();
  
  return useQuery<Lesson[]>({
    queryKey: ['lessons'],
    queryFn: async () => {
      if (!userId && !isDevelopmentMode) return [];
      
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        // If successful, cache the data
        if (data && data.length > 0) {
          cacheMockData('lessons', data);
          return data;
        }
        
        // Try to get cached data first in development mode
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<Lesson[] | null>('lessons', null);
          if (cachedData && cachedData.length > 0) {
            console.log('Using cached lessons data');
            return cachedData;
          }
          
          console.log('No lessons data available');
        }
        
        return [];
      } catch (err) {
        console.error('Error fetching lessons:', err);
        
        // In development mode, try to use cached data
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<Lesson[] | null>('lessons', null);
          if (cachedData && cachedData.length > 0) {
            console.log('Using cached lessons data after error');
            return cachedData;
          }
          
          console.log('No cached lessons data available');
          return [];
        }
        
        throw err;
      }
    },
    enabled: !!userId || isDevelopmentMode,
  });
}

/**
 * Hook to fetch all lessons with student details included
 */
export function useAllLessons() {
  const { userId } = useDevelopmentAuth();
  
  return useQuery({
    queryKey: ['lessons', 'all'],
    queryFn: async () => {
      if (!userId && !isDevelopmentMode) return [];
      
      try {
        // First fetch all lessons
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .order('date', { ascending: false });
          
        if (lessonError) throw lessonError;
        
        if (!lessonData || lessonData.length === 0) {
          return [];
        }
        
        // Create a map of student IDs to lookup student data efficiently
        const studentIds = [...new Set(lessonData.map(lesson => lesson.student_id))];
        
        // Fetch all students that match these IDs
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id, name, avatar_url')
          .in('id', studentIds);
          
        if (studentError) throw studentError;
        
        // Create a lookup map from student_id to student
        const studentMap = new Map();
        if (studentData) {
          studentData.forEach(student => {
            studentMap.set(student.id, student);
          });
        }
        
        // Combine the data
        const combinedData = lessonData.map(lesson => {
          const studentInfo = studentMap.get(lesson.student_id) || { 
            id: lesson.student_id,
            name: 'Unknown Student',
            avatar_url: null
          };
          
          return {
            ...lesson,
            student: studentInfo
          };
        });
        
        // Cache the combined data
        if (combinedData.length > 0) {
          cacheMockData('lessons_with_students', combinedData);
        }
        
        return combinedData;
      } catch (err) {
        console.error('Error fetching lessons with students:', err);
        
        // In development mode, try to use cached data
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData('lessons_with_students', []);
          if (cachedData && cachedData.length > 0) {
            console.log('Using cached lessons with students data after error');
            return cachedData;
          }
          
          console.log('No cached lessons with students data available');
          return [];
        }
        
        throw err;
      }
    },
    enabled: !!userId || isDevelopmentMode,
  });
}

/**
 * Hook to fetch lessons for a specific student
 */
export function useStudentLessons(studentId: string | undefined) {
  const { userId } = useDevelopmentAuth();
  
  return useQuery<(Lesson & { _source?: 'database' | 'cached' | 'mock' | 'cached-fallback' | 'mock-fallback' })[]>({
    queryKey: ['lessons', 'student', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      console.log(`Fetching lessons for student ${studentId}`);
      console.log(`Running in ${isDevelopmentMode ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
      
      try {
        // Always try Supabase first, even in development mode
        console.log('Querying Supabase for student lessons');
        
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('student_id', studentId)
          .order('date', { ascending: false });
          
        if (error) {
          console.error(`Error fetching lessons for student ${studentId}:`, error);
          throw error;
        }
        
        // If we get data successfully
        if (data && data.length > 0) {
          console.log(`Retrieved ${data.length} lessons for student ${studentId} from database`);
          
          // Cache the successful response for future fallback
          cacheMockData(`student_lessons_${studentId}`, data);
          
          // Return data with source information
          return data.map(lesson => ({
            ...lesson,
            _source: 'database' as const
          }));
        }
        
        console.log(`No lessons found in database for student ${studentId}`);
      } catch (err) {
        console.error(`Error fetching lessons for student ${studentId} from Supabase:`, err);
        
        // If we're in production, we can't use cached or mock data
        if (!isDevelopmentMode) throw err;
        
        console.log('Will try to use cached data as fallback due to Supabase error');
      }
      
      // If we're here, either:
      // 1. We're in development mode and hit an error with Supabase
      // 2. We got no results from Supabase
      
      // Try to get data from cache
      if (isDevelopmentMode) {
        console.log(`Checking for cached lessons for student ${studentId}...`);
        const cachedLessons = getCachedMockData<Lesson[]>(`student_lessons_${studentId}`, []);
        
        if (cachedLessons && cachedLessons.length > 0) {
          console.log(`Using ${cachedLessons.length} cached lessons for student ${studentId}`);
          
          // Return cached data with source information
          return cachedLessons.map(lesson => ({
            ...lesson,
            _source: 'cached-fallback' as const
          }));
        }
        
        // As a last resort, use mock data
        console.log(`No cached lessons found, using mock lessons as final fallback for student ${studentId}`);
        
        // Create some mock lessons for this student
        const today = new Date();
        const mockLessons: Lesson[] = Array.from({ length: 5 }).map((_, index) => {
          const lessonDate = new Date();
          lessonDate.setDate(today.getDate() - (index * 7)); // One lesson per week going back
          
          return {
            id: `mock-lesson-${index}-${studentId}`,
            student_id: studentId,
            teacher_id: userId || 'mock-teacher-id',
            date: lessonDate.toISOString().split('T')[0],
            start_time: '15:00:00',
            end_time: '16:00:00',
            status: 'completed',
            location: 'Virtual',
            summary: `Mock lesson ${index + 1} for student`,
            notes: `These are notes for mock lesson ${index + 1}`,
            transcript_url: null,
            ai_summary: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });
        
        // Cache the mock data for future use
        cacheMockData(`student_lessons_${studentId}`, mockLessons);
        
        // Return mock data with source information
        return mockLessons.map(lesson => ({
          ...lesson,
          _source: 'mock-fallback' as const
        }));
      }
      
      // If we get here in production mode, return empty array
      return [];
    },
    enabled: !!studentId && (!!userId || isDevelopmentMode),
  });
}

/**
 * Hook to fetch a single lesson by ID
 */
export function useLesson(id: string | undefined) {
  const { userId } = useDevelopmentAuth();
  
  return useQuery<Lesson | null>({
    queryKey: ['lessons', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // If successful, cache the data
        if (data) {
          cacheMockData(`lesson_${id}`, data);
          return data;
        }
        
        // Try to get cached data first in development mode
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<Lesson | null>(`lesson_${id}`, null);
          if (cachedData) {
            console.log(`Using cached data for lesson ${id}`);
            return cachedData;
          }
          
          console.log(`No lesson data available for ID ${id}`);
        }
        
        return null;
      } catch (err) {
        console.error(`Error fetching lesson ${id}:`, err);
        
        // In development mode, try to use cached data
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<Lesson | null>(`lesson_${id}`, null);
          if (cachedData) {
            console.log(`Using cached data for lesson ${id} after error`);
            return cachedData;
          }
          
          console.log(`No cached lesson data available for ID ${id}`);
          return null;
        }
        
        throw err;
      }
    },
    enabled: !!id && (isDevelopmentMode || !!userId),
  });
}

/**
 * Hook to create a new lesson
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();
  const { userId } = useDevelopmentAuth();
  
  return useMutation({
    mutationFn: async (newLesson: NewLesson) => {
      // Ensure we have a user ID in development mode
      if (!userId && !isDevelopmentMode) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('lessons')
        .insert(newLesson)
        .select()
        .single();
        
      if (error) throw error;
      
      // If successful, update the cache
      if (data && isDevelopmentMode) {
        // Update the lessons cache
        const cachedLessons = getCachedMockData<Lesson[]>('lessons', []);
        const updatedCache = [...cachedLessons, data];
        cacheMockData('lessons', updatedCache);
        
        // Update the student lessons cache
        const cachedStudentLessons = getCachedMockData<Lesson[]>(`student_lessons_${data.student_id}`, []);
        const updatedStudentCache = [...cachedStudentLessons, data];
        cacheMockData(`student_lessons_${data.student_id}`, updatedStudentCache);
        
        // Cache the individual lesson
        cacheMockData(`lesson_${data.id}`, data);
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lessons', 'student', data.student_id] });
    },
  });
}

/**
 * Hook to update an existing lesson
 */
export function useUpdateLesson() {
  const queryClient = useQueryClient();
  const { userId } = useDevelopmentAuth();
  
  return useMutation({
    mutationFn: async ({ id, lesson }: { id: string; lesson: UpdateLesson }) => {
      // Ensure we have a user ID in development mode
      if (!userId && !isDevelopmentMode) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('lessons')
        .update(lesson)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // If successful, update the cache
      if (data && isDevelopmentMode) {
        // Update the individual lesson cache
        cacheMockData(`lesson_${id}`, data);
        
        // Update the lesson in the lessons cache
        const cachedLessons = getCachedMockData<Lesson[]>('lessons', []);
        const updatedCache = cachedLessons.map(l => l.id === id ? data : l);
        cacheMockData('lessons', updatedCache);
        
        // Update the lesson in the student lessons cache
        const cachedStudentLessons = getCachedMockData<Lesson[]>(`student_lessons_${data.student_id}`, []);
        const updatedStudentCache = cachedStudentLessons.map(l => l.id === id ? data : l);
        cacheMockData(`student_lessons_${data.student_id}`, updatedStudentCache);
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lessons', data.id] });
      queryClient.invalidateQueries({ queryKey: ['lessons', 'student', data.student_id] });
    },
  });
}

/**
 * Hook to delete a lesson
 */
export function useDeleteLesson() {
  const queryClient = useQueryClient();
  const { userId } = useDevelopmentAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Ensure we have a user ID in development mode
      if (!userId && !isDevelopmentMode) throw new Error('User not authenticated');
      
      // First get the lesson to know which student it belongs to
      const { data: lesson } = await supabase
        .from('lessons')
        .select('student_id')
        .eq('id', id)
        .single();
      
      const studentId = lesson?.student_id;
      
      // Then delete it
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // If successful, update the cache
      if (isDevelopmentMode && studentId) {
        // Update the lessons cache
        const cachedLessons = getCachedMockData<Lesson[]>('lessons', []);
        const updatedCache = cachedLessons.filter(l => l.id !== id);
        cacheMockData('lessons', updatedCache);
        
        // Update the student lessons cache
        const cachedStudentLessons = getCachedMockData<Lesson[]>(`student_lessons_${studentId}`, []);
        const updatedStudentCache = cachedStudentLessons.filter(l => l.id !== id);
        cacheMockData(`student_lessons_${studentId}`, updatedStudentCache);
        
        // Remove the individual lesson cache
        try {
          localStorage.removeItem(`mock_lesson_${id}`);
        } catch (e) {
          console.warn(`Failed to remove cached lesson ${id}`, e);
        }
      }
      
      return { id, studentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      if (data.studentId) {
        queryClient.invalidateQueries({ queryKey: ['lessons', 'student', data.studentId] });
      }
    },
  });
}

/**
 * Hook to fetch repertoire pieces for a specific lesson
 */
export function useLessonRepertoire(lessonId: string | undefined) {
  return useQuery<LessonRepertoire[]>({
    queryKey: ['lessonRepertoire', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      
      const { data, error } = await supabase
        .from('lesson_repertoire')
        .select('*')
        .eq('lesson_id', lessonId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!lessonId,
  });
}

/**
 * Hook to add a repertoire piece to a lesson
 */
export function useAddLessonRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newLessonPiece: NewLessonRepertoire) => {
      const { data, error } = await supabase
        .from('lesson_repertoire')
        .insert(newLessonPiece)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessonRepertoire', data.lesson_id] });
    },
  });
}

/**
 * Hook to remove a repertoire piece from a lesson
 */
export function useRemoveLessonRepertoire() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First get the lesson repertoire to know which lesson it belongs to
      const { data: lessonRepertoire } = await supabase
        .from('lesson_repertoire')
        .select('lesson_id')
        .eq('id', id)
        .single();
      
      const lessonId = lessonRepertoire?.lesson_id;
      
      // Then delete it
      const { error } = await supabase
        .from('lesson_repertoire')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return { id, lessonId };
    },
    onSuccess: (data) => {
      if (data.lessonId) {
        queryClient.invalidateQueries({ queryKey: ['lessonRepertoire', data.lessonId] });
      }
    },
  });
} 