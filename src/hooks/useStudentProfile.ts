import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Student, Lesson } from '@/types/schema_extensions';
import { useAuth } from '@clerk/clerk-react';
import { setCachedMockData, getCachedMockData } from '@/lib/mockDataCache';

// Check if we're in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
// For development, use a consistent UUID that works with RLS policies
const DEV_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Mock student profile for fallback
const mockStudentProfile: Student = {
  id: 'mock-student-profile',
  name: 'William Taylor',
  email: 'william.taylor@example.com',
  user_id: DEV_UUID,
  difficulty_level: 'beginner',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  avatar_url: '/images/boy3.jpg',
  phone: '945.375.3651',
  academic_year: '1st year DMA',
  next_lesson_id: null,
  level: 'Beginner',
  last_lesson_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
  next_lesson: 'Sunday, 11:59 PM',
  start_date: '2023-05-01',
  unread_messages: 0
};

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
 * Helper function to update the cache with student profile data
 */
const updateProfileCache = (studentId: string, data: any) => {
  try {
    // Cache with student-profile key
    const profileCacheKey = `student-profile_${studentId}`;
    setCachedMockData(profileCacheKey, data);
    
    // Also cache with student key for compatibility with other functions
    const studentCacheKey = `student_${studentId}`;
    setCachedMockData(studentCacheKey, data);
    
    console.log(`✅ Updated cache for student ${studentId} with profile data`);
  } catch (error) {
    console.error(`Failed to update cache for student ${studentId}:`, error);
  }
};

/**
 * Hook to fetch a student's profile including enhanced fields
 * Uses the three-tier approach: database → cache → mock
 */
export function useStudentProfile(studentId: string) {
  const { userId } = useDevelopmentAuth();
  
  return useQuery<Student>({
    queryKey: ['student-profile', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      
      try {
        console.log(`🔍 Fetching student profile for ${studentId} from database...`);
        
        // Log the Supabase URL for debugging
        console.log(`Using Supabase connection for ${studentId}`);
        
        // Make the database query - ensure we're getting a single object
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .single();
        
        if (error) {
          console.error(`Database error fetching student ${studentId}:`, error);
          throw error;
        }
        
        // If we got data successfully from database
        if (data) {
          console.log(`✅ Successfully fetched student profile for ${studentId} from database:`, data);
          console.log(`Data type:`, typeof data, Array.isArray(data) ? 'array' : 'not array');
          
          // Make sure data is not an array
          const studentData = Array.isArray(data) ? data[0] : data;
          
          // Cache the database response using helper
          updateProfileCache(studentId, studentData);
          
          // Add source info for debugging and ensure the data is properly typed
          const enhancedData = {
            ...studentData,
            _source: 'database' as const
          };
          
          console.log(`Returning data with _source added:`, enhancedData);
          
          return enhancedData as Student;
        }
        
        // If no data found in database, check cache in both locations
        console.warn(`⚠️ No student profile found with ID ${studentId} in database, checking cache...`);
        
        // Check both cache keys to be sure
        let cachedData = getCachedMockData<Student | null>(`student-profile_${studentId}`, null);
        if (!cachedData) {
          // Try the other cache key
          cachedData = getCachedMockData<Student | null>(`student_${studentId}`, null);
        }
        
        if (cachedData) {
          console.log(`📋 Using cached data for student profile ${studentId}:`, cachedData);
          
          // Make sure cached data is not an array
          const studentData = Array.isArray(cachedData) ? cachedData[0] : cachedData;
          
          const enhancedData = {
            ...studentData,
            _source: 'cached' as const
          };
          
          console.log(`Returning cached data with _source added:`, enhancedData);
          
          return enhancedData as Student;
        }
        
        // If still no data, use mock data in development mode
        if (isDevelopmentMode) {
          console.warn(`📝 Using mock data for student profile ${studentId} as final fallback`);
          
          // Create a mock profile with the requested ID and all required fields
          const mockProfile = {
            ...mockStudentProfile,
            id: studentId,
            // Make sure to include all fields the UI expects
            name: `Mock Student ${studentId.substring(0, 4)}`,
            _source: 'mock' as const
          };
          
          console.log(`Generated mock profile:`, mockProfile);
          
          // Cache the mock data using helper
          updateProfileCache(studentId, mockProfile);
          
          return mockProfile as Student;
        }
        
        throw new Error(`Student profile with ID ${studentId} not found`);
      } catch (err) {
        console.error(`Error fetching student profile ${studentId}:`, err);
        
        // In development mode, try cached data before falling back to mock
        if (isDevelopmentMode) {
          // Check both cache keys
          let cachedData = getCachedMockData<Student | null>(`student-profile_${studentId}`, null);
          if (!cachedData) {
            cachedData = getCachedMockData<Student | null>(`student_${studentId}`, null);
          }
          
          if (cachedData) {
            console.log(`📋 Using cached data for student profile ${studentId} after error`);
            
            // Make sure cached data is not an array
            const studentData = Array.isArray(cachedData) ? cachedData[0] : cachedData;
            
            return {
              ...studentData,
              _source: 'cached-fallback'
            } as Student;
          }
          
          // Last resort: mock data
          console.warn(`📝 Using mock data for student profile ${studentId} after error`);
          const mockProfile = {
            ...mockStudentProfile,
            id: studentId,
            name: `Mock Student ${studentId.substring(0, 4)}`,
            _source: 'mock-fallback'
          };
          
          console.log(`Generated fallback mock profile:`, mockProfile);
          
          // Cache using the helper
          updateProfileCache(studentId, mockProfile);
          
          return mockProfile as Student;
        }
        
        throw err;
      }
    },
    enabled: !!studentId && (isDevelopmentMode || !!userId),
  });
}

/**
 * Hook to fetch a student's next lesson
 * Uses the three-tier approach: database → cache → mock
 */
export function useStudentNextLesson(studentId: string) {
  const { userId } = useDevelopmentAuth();
  
  return useQuery<Lesson | null>({
    queryKey: ['student-next-lesson', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      
      try {
        console.log(`🔍 Fetching next lesson for student ${studentId}...`);
        
        // First get the student to check for next_lesson_id
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('next_lesson_id')
          .eq('id', studentId)
          .single();
        
        if (studentError) throw studentError;
        
        // If we have a next lesson ID, fetch that specific lesson
        if (student.next_lesson_id) {
          const { data: lesson, error: lessonError } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', student.next_lesson_id)
            .single();
          
          if (lessonError) throw lessonError;
          
          if (lesson) {
            console.log(`✅ Found next lesson (${student.next_lesson_id}) for student ${studentId}`);
            
            // Cache the lesson data
            const cacheKey = `student-next-lesson_${studentId}`;
            setCachedMockData(cacheKey, lesson);
            
            return {
              ...lesson,
              _source: 'database'
            } as unknown as Lesson;
          }
        }
        
        // Otherwise, fetch the next upcoming lesson for this student
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('student_id', studentId)
          .gt('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .limit(1);
        
        if (lessonsError) throw lessonsError;
        
        if (lessons && lessons.length > 0) {
          console.log(`✅ Found upcoming lesson for student ${studentId}`);
          
          // Cache the lesson data
          const cacheKey = `student-next-lesson_${studentId}`;
          setCachedMockData(cacheKey, lessons[0]);
          
          return {
            ...lessons[0],
            _source: 'database'
          } as unknown as Lesson;
        }
        
        // If no lesson found in database, check cache
        console.warn(`⚠️ No next lesson found for student ${studentId}, checking cache...`);
        const cacheKey = `student-next-lesson_${studentId}`;
        const cachedData = getCachedMockData<Lesson | null>(cacheKey, null);
        
        if (cachedData) {
          console.log(`📋 Using cached next lesson data for student ${studentId}`);
          return {
            ...cachedData,
            _source: 'cached'
          } as Lesson;
        }
        
        // If still no data and in development mode, create mock lesson
        if (isDevelopmentMode) {
          console.log(`📝 Using mock next lesson data for student ${studentId}`);
          const mockNextLesson = {
            id: `mock-lesson-${studentId}`,
            student_id: studentId,
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
            time_start: '15:00',
            time_end: '16:00',
            status: 'scheduled',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            location: 'Studio',
            notes: 'Mock lesson for development',
            _source: 'mock'
          } as unknown as Lesson;
          
          // Cache the mock data
          setCachedMockData(cacheKey, mockNextLesson);
          
          return mockNextLesson;
        }
        
        return null;
      } catch (err) {
        console.error(`Error fetching next lesson for student ${studentId}:`, err);
        
        // In development mode, try cached data before falling back to mock
        if (isDevelopmentMode) {
          const cacheKey = `student-next-lesson_${studentId}`;
          const cachedData = getCachedMockData<Lesson | null>(cacheKey, null);
          
          if (cachedData) {
            console.log(`📋 Using cached next lesson data after error for student ${studentId}`);
            return {
              ...cachedData,
              _source: 'cached-fallback'
            } as Lesson;
          }
          
          // Last resort: create mock data
          console.warn(`📝 Creating mock next lesson data after error for student ${studentId}`);
          const mockNextLesson = {
            id: `mock-lesson-${studentId}`,
            student_id: studentId,
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
            time_start: '15:00',
            time_end: '16:00',
            status: 'scheduled',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            location: 'Studio',
            notes: 'Mock lesson for development (fallback after error)',
            _source: 'mock-fallback'
          } as unknown as Lesson;
          
          return mockNextLesson;
        }
        
        throw err;
      }
    },
    enabled: !!studentId && (isDevelopmentMode || !!userId),
  });
}

/**
 * Hook to update a student's profile
 */
export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  const { userId } = useDevelopmentAuth();
  
  return useMutation({
    mutationFn: async ({ 
      studentId, 
      updates
    }: { 
      studentId: string; 
      updates: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at' | 'user_id'>>
    }) => {
      if (!userId && !isDevelopmentMode) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update cache with the updated student profile
      updateProfileCache(studentId, data);
      
      return data as Student;
    },
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['student-profile', data.id] });
      queryClient.invalidateQueries({ queryKey: ['student', data.id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      
      if (data.next_lesson_id) {
        queryClient.invalidateQueries({ queryKey: ['student-next-lesson', data.id] });
      }
    },
  });
}

/**
 * Hook to update a student's difficulty level
 */
export function useUpdateStudentDifficulty() {
  const updateProfile = useUpdateStudentProfile();
  
  return useMutation({
    mutationFn: async ({ 
      studentId, 
      difficultyLevel 
    }: { 
      studentId: string; 
      difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional' | null
    }) => {
      return updateProfile.mutateAsync({
        studentId,
        updates: { difficulty_level: difficultyLevel }
      });
    }
  });
}

/**
 * Hook to set a student's next lesson
 */
export function useSetStudentNextLesson() {
  const updateProfile = useUpdateStudentProfile();
  
  return useMutation({
    mutationFn: async ({ studentId, lessonId }: { studentId: string; lessonId: string | null }) => {
      return updateProfile.mutateAsync({
        studentId,
        updates: { next_lesson_id: lessonId }
      });
    }
  });
} 