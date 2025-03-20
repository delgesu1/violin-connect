import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-wrapper';
import { clerkIdToUuid } from '@/lib/auth-utils';
import type { Database } from '@/types/supabase';
import { Lesson as SchemaLesson } from '@/types/schema_extensions';
import { getCachedMockData, setCachedMockData } from '@/lib/mockDataCache';
import { CalendarEvent } from '@/types/schema_extensions';
import { isValidUUID } from '@/lib/id-utils';
import { DEV_TEACHER_UUID } from '@/lib/dev-uuids';

// Type definitions
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type NewLesson = Omit<Lesson, 'id' | 'created_at' | 'updated_at'>;
export type UpdateLesson = Partial<Omit<Lesson, 'id' | 'created_at' | 'updated_at'>>;

// Types for lesson repertoire
export type LessonRepertoire = Database['public']['Tables']['lesson_repertoire']['Row'];
export type NewLessonRepertoire = Database['public']['Tables']['lesson_repertoire']['Insert'];

// Check if we're in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

// Constants
const DEV_UUID = DEV_TEACHER_UUID; // For backward compatibility

/**
 * Hook to fetch all lessons for the current user (teacher)
 */
export function useLessons() {
  const { userId } = useAuth();
  
  return useQuery<Lesson[]>({
    queryKey: ['lessons'],
    queryFn: async () => {
      if (!userId && !isDevelopmentMode) return [];
      
      try {
        // In development mode, return mock data
        if (isDevelopmentMode) {
          // Check for cached data
          const cachedData = getCachedMockData('lessons');
          if (cachedData) {
            return cachedData as Lesson[];
          }
          
          // Generate mock data if no cache exists
          const mockLessons: Lesson[] = Array.from({ length: 10 }).map((_, i) => ({
            id: `lesson-${i + 1}`,
            teacher_id: DEV_UUID,
            student_id: `student-${(i % 3) + 1}`,
            date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
            start_time: '14:00:00',
            end_time: '15:00:00',
            location: 'Studio A',
            notes: `Lesson ${i + 1} notes`,
            status: i === 0 ? 'scheduled' : (i < 5 ? 'completed' : 'cancelled'),
            created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
            updated_at: new Date(Date.now() - i * 86400000).toISOString(),
          }));
          
          // Cache the mock data
          setCachedMockData('lessons', mockLessons);
          return mockLessons;
        }
        
        // In production, fetch from Supabase
        const supabaseUUID = await clerkIdToUuid(userId!);
        
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('teacher_id', supabaseUUID)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        return data as Lesson[];
      } catch (err) {
        console.error('Error fetching lessons:', err);
        return [];
      }
    },
    enabled: !!userId || isDevelopmentMode,
  });
}

/**
 * Hook to fetch all lessons with more details for dashboard display
 */
export function useAllLessons() {
  const { userId } = useAuth();
  
  return useQuery<any[]>({
    queryKey: ['all_lessons'],
    queryFn: async () => {
      if (!userId && !isDevelopmentMode) return [];
      
      try {
        // Always try to fetch from Supabase first, even in development mode
        const teacherId = isDevelopmentMode ? DEV_TEACHER_UUID : await clerkIdToUuid(userId!);
        
        console.log(`Fetching lessons for teacher ${teacherId} from Supabase...`);
        
        // APPROACH 1: Try using supabaseAdmin first to bypass RLS if in development mode
        let lessonsData, lessonsError;
        
        if (isDevelopmentMode && supabaseAdmin) {
          console.log('Using supabaseAdmin to fetch lessons (bypassing RLS)');
          
          const result = await supabaseAdmin
            .from('lessons')
            .select('*')
            .order('date', { ascending: false });
            
          lessonsData = result.data;
          lessonsError = result.error;
          
          console.log(`Admin query result: ${lessonsData?.length || 0} lessons found, error: ${lessonsError ? 'yes' : 'no'}`);
        }
        
        // APPROACH 2: If admin client didn't return data or had an error, try the regular client with teacher filtering
        if (!lessonsData && !lessonsError) {
          console.log('Using regular client to fetch lessons with teacher filtering');
          
          const result = await supabase
            .from('lessons')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('date', { ascending: false });
            
          lessonsData = result.data;
          lessonsError = result.error;
          
          console.log(`Regular query result: ${lessonsData?.length || 0} lessons found, error: ${lessonsError ? 'yes' : 'no'}`);
        }
        
        // APPROACH 3: As a last resort in development mode, try without teacher filtering
        if ((!lessonsData || lessonsData.length === 0) && isDevelopmentMode) {
          console.log('Trying to fetch all lessons without teacher filtering (development mode only)');
          
          const result = await supabase
            .from('lessons')
            .select('*')
            .order('date', { ascending: false })
            .limit(10);
            
          lessonsData = result.data;
          lessonsError = result.error;
          
          console.log(`Direct query result: ${lessonsData?.length || 0} lessons found, error: ${lessonsError ? 'yes' : 'no'}`);
        }
        
        if (lessonsData && lessonsData.length > 0) {
          console.log(`Retrieved ${lessonsData.length} lessons from Supabase`);
          
          // Get all the student IDs from the lessons
          const studentIds = lessonsData.map(lesson => lesson.student_id).filter(id => id);
          
          // Fetch all relevant students in one query, if there are student IDs
          let studentsData = [];
          let studentsError = null;
          
          if (studentIds.length > 0) {
            // Try using supabaseAdmin first in development mode
            if (isDevelopmentMode && supabaseAdmin) {
              const result = await supabaseAdmin
                .from('students')
                .select('id, name, avatar_url')
                .in('id', studentIds);
                
              studentsData = result.data || [];
              studentsError = result.error;
            }
            
            // If admin client didn't work or we're not in development mode, use regular client
            if ((!studentsData || studentsData.length === 0) && !studentsError) {
              const result = await supabase
                .from('students')
                .select('id, name, avatar_url')
                .in('id', studentIds);
                
              studentsData = result.data || [];
              studentsError = result.error;
            }
            
            if (studentsError) {
              console.error('Error fetching students from Supabase:', studentsError);
              // Continue with empty students data rather than throwing
              studentsData = [];
            }
          }
          
          // Join the data manually
          const formattedData = lessonsData.map(lesson => {
            const student = studentsData?.find(s => s.id === lesson.student_id) || null;
            return {
              ...lesson,
              student,
              // Make sure all required fields exist with defaults
              summary: lesson.summary || null,
              status: lesson.status || 'scheduled',
              ai_summary: lesson.ai_summary || null,
              transcript_url: lesson.transcript_url || null,
              // Tag the source as database
              _source: 'database'
            };
          });
          
          // Cache the successful results for future use
          setCachedMockData('all_lessons', formattedData);
          
          return formattedData;
        }
        
        console.log('No lessons found in Supabase, checking cache...');
        
        // Check for cached data
        const cachedLessons = getCachedMockData<any[]>('all_lessons', []);
        if (cachedLessons && cachedLessons.length > 0) {
          console.log(`Found ${cachedLessons.length} cached lessons`);
          return cachedLessons.map(lesson => ({
            ...lesson,
            _source: 'cached'
          }));
        }
        
        console.log('No cached data, generating mock data');
        
        // Generate mock data for development
        if (isDevelopmentMode) {
          const mockLessons = Array.from({ length: 10 }).map((_, i) => ({
            id: `lesson-${i + 1}`,
            teacher_id: teacherId,
            student_id: `student-${(i % 3) + 1}`,
            date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
            start_time: '14:00:00',
            end_time: '15:00:00',
            location: 'Studio A',
            notes: `Lesson ${i + 1} notes`,
            summary: `Lesson ${i + 1} summary`,
            status: i === 0 ? 'scheduled' : (i < 5 ? 'completed' : 'cancelled'),
            transcript_url: null,
            ai_summary: null,
            created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
            updated_at: new Date(Date.now() - i * 86400000).toISOString(),
            student: {
              id: `student-${(i % 3) + 1}`,
              name: `Student ${(i % 3) + 1}`,
              avatar_url: `/images/avatar${(i % 3) + 1}.png`
            },
            _source: 'mock'
          }));
          
          // Cache the mock data
          setCachedMockData('all_lessons', mockLessons);
          
          return mockLessons;
        }
        
        return [];
      } catch (err) {
        console.error('Error fetching lessons with details:', err);
        
        // Try to get cached data on error
        const cachedLessons = getCachedMockData<any[]>('all_lessons', []);
        if (cachedLessons && cachedLessons.length > 0) {
          console.log(`Found ${cachedLessons.length} cached lessons after error`);
          return cachedLessons.map(lesson => ({
            ...lesson,
            _source: 'cached-fallback'
          }));
        }
        
        // Generate mock data as fallback in development mode
        if (isDevelopmentMode) {
          const mockLessons = Array.from({ length: 10 }).map((_, i) => ({
            id: `lesson-${i + 1}`,
            teacher_id: DEV_TEACHER_UUID,
            student_id: `student-${(i % 3) + 1}`,
            date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
            start_time: '14:00:00',
            end_time: '15:00:00',
            location: 'Studio A',
            notes: `Lesson ${i + 1} notes [error fallback]`,
            summary: `Lesson ${i + 1} summary [error fallback]`,
            status: i === 0 ? 'scheduled' : (i < 5 ? 'completed' : 'cancelled'),
            transcript_url: null,
            ai_summary: null,
            created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
            updated_at: new Date(Date.now() - i * 86400000).toISOString(),
            student: {
              id: `student-${(i % 3) + 1}`,
              name: `Student ${(i % 3) + 1}`,
              avatar_url: `/images/avatar${(i % 3) + 1}.png`
            },
            _source: 'mock-fallback'
          }));
          
          return mockLessons;
        }
        
        return [];
      }
    },
    enabled: !!userId || isDevelopmentMode,
  });
}

/**
 * Hook to fetch lessons for a specific student
 */
export function useStudentLessons(studentId: string | undefined) {
  const { userId } = useAuth();
  
  return useQuery<Lesson[]>({
    queryKey: ['student_lessons', studentId],
    queryFn: async () => {
      if (!studentId || (!userId && !isDevelopmentMode)) return [];
      
      try {
        // In development mode, return mock data
        if (isDevelopmentMode) {
          // Check for cached data
          const cacheKey = `student_lessons_${studentId}`;
          const cachedData = getCachedMockData(cacheKey);
          if (cachedData) {
            return cachedData as Lesson[];
          }
          
          // Generate mock data if no cache exists
          const mockLessons: Lesson[] = Array.from({ length: 5 }).map((_, i) => ({
            id: `lesson-s${studentId}-${i + 1}`,
            teacher_id: DEV_UUID,
            student_id: studentId,
            date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
            start_time: '14:00:00',
            end_time: '15:00:00',
            location: 'Studio A',
            notes: `Lesson ${i + 1} notes for student ${studentId}`,
            status: i === 0 ? 'scheduled' : (i < 3 ? 'completed' : 'cancelled'),
            created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
            updated_at: new Date(Date.now() - i * 86400000).toISOString(),
          }));
          
          // Cache the mock data
          setCachedMockData(cacheKey, mockLessons);
          return mockLessons;
        }
        
        // In production, fetch from Supabase
        const supabaseUUID = await clerkIdToUuid(userId!);
        
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('teacher_id', supabaseUUID)
          .eq('student_id', studentId)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        return data as Lesson[];
      } catch (err) {
        console.error(`Error fetching lessons for student ${studentId}:`, err);
        return [];
      }
    },
    enabled: !!studentId && (!!userId || isDevelopmentMode),
  });
}

/**
 * Hook to fetch a specific lesson by ID
 */
export function useLesson(id: string | undefined) {
  return useQuery<Lesson | null>({
    queryKey: ['lesson', id],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        // In development mode, try to use mock data
        if (isDevelopmentMode) {
          // Try to find in cached lessons
          const allLessons = getCachedMockData('lessons') as Lesson[] || [];
          const lesson = allLessons.find(l => l.id === id);
          
          if (lesson) return lesson;
          
          // If not found in cache, generate a mock lesson
          return {
            id,
            teacher_id: DEV_UUID,
            student_id: `student-1`,
            date: new Date().toISOString().split('T')[0],
            start_time: '14:00:00',
            end_time: '15:00:00',
            location: 'Studio A',
            notes: `Lesson details for ${id}`,
            status: 'scheduled',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        
        // In production, fetch from Supabase
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        return data as Lesson;
      } catch (err) {
        console.error(`Error fetching lesson ${id}:`, err);
        return null;
      }
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new lesson
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async (newLesson: Omit<NewLesson, 'teacher_id'>) => {
      if (!userId && !isDevelopmentMode) {
        throw new Error('No user ID available, cannot create lesson');
      }
      
      // In development mode, use mock data
      if (isDevelopmentMode) {
        console.log('Creating mock lesson:', newLesson);
        
        const mockLesson: Lesson = {
          id: `lesson-${Date.now()}`,
          teacher_id: DEV_UUID,
          ...newLesson,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Update cached lessons
        const cachedLessons = getCachedMockData('lessons') as Lesson[] || [];
        setCachedMockData('lessons', [mockLesson, ...cachedLessons]);
        
        return mockLesson;
      }
      
      // In production, create in Supabase
      const supabaseUUID = await clerkIdToUuid(userId!);
      
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          ...newLesson,
          teacher_id: supabaseUUID,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data as Lesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['all_lessons'] });
    },
  });
}

/**
 * Hook to update an existing lesson
 */
export function useUpdateLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateLesson }) => {
      if (!id) {
        throw new Error('Lesson ID is required for update');
      }
      
      // In development mode, use mock data
      if (isDevelopmentMode) {
        console.log(`Updating mock lesson ${id}:`, updates);
        
        // Update cached lessons
        const cachedLessons = getCachedMockData('lessons') as Lesson[] || [];
        const updatedLessons = cachedLessons.map(lesson => {
          if (lesson.id === id) {
            return {
              ...lesson,
              ...updates,
              updated_at: new Date().toISOString(),
            };
          }
          return lesson;
        });
        
        setCachedMockData('lessons', updatedLessons);
        
        const updatedLesson = updatedLessons.find(l => l.id === id);
        return updatedLesson || null;
      }
      
      // In production, update in Supabase
      const { data, error } = await supabase
        .from('lessons')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data as Lesson;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['all_lessons'] });
      queryClient.invalidateQueries({ queryKey: ['student_lessons'] });
    },
  });
}

/**
 * Hook to delete a lesson
 */
export function useDeleteLesson() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error('Lesson ID is required for deletion');
      }
      
      // In development mode, use mock data
      if (isDevelopmentMode) {
        console.log(`Deleting mock lesson ${id}`);
        
        // Update cached lessons
        const cachedLessons = getCachedMockData('lessons') as Lesson[] || [];
        const updatedLessons = cachedLessons.filter(lesson => lesson.id !== id);
        
        setCachedMockData('lessons', updatedLessons);
        
        return id;
      }
      
      // In production, delete from Supabase
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['all_lessons'] });
      queryClient.invalidateQueries({ queryKey: ['student_lessons'] });
    },
  });
}

/**
 * Hook to create a lesson and calendar event together
 */
export function useCreateLessonWithEvent() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      lesson, 
      event 
    }: { 
      lesson: Omit<NewLesson, 'teacher_id'>;
      event: Omit<CalendarEvent, 'id' | 'teacher_id' | 'created_at'>;
    }) => {
      if (!userId && !isDevelopmentMode) {
        throw new Error('No user ID available, cannot create lesson with event');
      }
      
      // In development mode, use mock data
      if (isDevelopmentMode) {
        console.log('Creating mock lesson with event:', { lesson, event });
        
        const mockLessonId = `lesson-${Date.now()}`;
        const mockEventId = `event-${Date.now()}`;
        
        const mockLesson: Lesson = {
          id: mockLessonId,
          teacher_id: DEV_UUID,
          ...lesson,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const mockEvent: CalendarEvent = {
          id: mockEventId,
          teacher_id: DEV_UUID,
          ...event,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          lesson_id: mockLessonId,
        };
        
        // Update cached lessons and events
        const cachedLessons = getCachedMockData('lessons') as Lesson[] || [];
        setCachedMockData('lessons', [mockLesson, ...cachedLessons]);
        
        const cachedEvents = getCachedMockData('calendar_events') as CalendarEvent[] || [];
        setCachedMockData('calendar_events', [mockEvent, ...cachedEvents]);
        
        return { lesson: mockLesson, event: mockEvent };
      }
      
      // In production, create both in Supabase using a transaction
      const supabaseUUID = await clerkIdToUuid(userId!);
      
      // Start a transaction
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          ...lesson,
          teacher_id: supabaseUUID,
        })
        .select()
        .single();
        
      if (lessonError) throw lessonError;
      
      const createdLesson = lessonData as Lesson;
      
      // Create the calendar event linked to the lesson
      const { data: eventData, error: eventError } = await supabase
        .from('calendar_events')
        .insert({
          ...event,
          teacher_id: supabaseUUID,
          lesson_id: createdLesson.id,
        })
        .select()
        .single();
        
      if (eventError) {
        // If event creation fails, attempt to rollback by deleting the lesson
        await supabase.from('lessons').delete().eq('id', createdLesson.id);
        throw eventError;
      }
      
      return { 
        lesson: createdLesson, 
        event: eventData as CalendarEvent 
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['all_lessons'] });
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
    },
  });
} 