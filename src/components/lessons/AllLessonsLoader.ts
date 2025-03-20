import { supabase } from '@/lib/supabase';
import { getCachedMockData, setCachedMockData } from '@/lib/mockDataCache';

// Define interfaces for the data we're working with
interface Student {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface Lesson {
  id: string;
  teacher_id: string;
  student_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  notes: string | null;
  summary: string | null;
  status: string | null;
  transcript_url?: string | null;
  transcript?: string | null;
  ai_summary?: string | null;
  created_at: string;
  updated_at: string;
  students?: Student;  // From the join
  student?: {  // Our custom structure
    id: string;
    name: string;
    avatar_url: string | null;
  };
  _source?: string;
}

// Type with the specific source values
type LessonWithSource = Lesson & {
  _source: 'database' | 'cached' | 'mock';
};

// Define a helper function to clear the lesson cache
function clearLessonCache() {
  try {
    localStorage.removeItem(`mock_all_lessons`);
    console.log('Cleared lessons cache to get fresh data');
  } catch (e) {
    console.error('Failed to clear lessons cache:', e);
  }
}

/**
 * Loads all lessons with student information using our hybrid caching approach
 * @param teacherId The teacher ID to filter lessons by
 * @returns An array of lesson objects with student information
 */
export async function loadAllLessons(teacherId: string): Promise<LessonWithSource[]> {
  const CACHE_KEY = 'all_lessons';
  const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
  console.log(`Fetching all lessons from Supabase...`);
  
  // Clear the cache on first load to ensure we get fresh data
  // This helps prevent outdated mock data from persisting
  const shouldClearCache = !localStorage.getItem('lessons_cache_cleared_session');
  if (shouldClearCache) {
    clearLessonCache();
    localStorage.setItem('lessons_cache_cleared_session', 'true');
  }
  
  try {
    // STEP 1: Try to fetch from Supabase first
    // In development mode, fetch ALL lessons to make sure we're getting data
    const query = supabase.from('lessons').select('*');
    
    // Only filter by teacher_id in production mode
    if (!isDevelopmentMode) {
      query.eq('teacher_id', teacherId);
    }
    
    const { data: lessons, error: lessonsError } = await query;
    
    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      throw lessonsError;
    }
    
    if (lessons && lessons.length > 0) {
      console.log(`Retrieved ${lessons.length} lessons from Supabase`);
      console.log('Lesson sample:', lessons[0]);
      
      // Get student info for these lessons
      const studentIds = lessons.map(lesson => lesson.student_id).filter(Boolean);
      
      // Log student IDs for debugging
      console.log('Student IDs from lessons:', studentIds);
      
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds);
      
      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      }
      
      if (students && students.length > 0) {
        console.log(`Retrieved ${students.length} students from Supabase`);
        console.log('Student sample:', students[0]);
      }
      
      // Create a map for fast student lookups
      const studentMap = new Map<string, Student>();
      if (students) {
        students.forEach(student => {
          studentMap.set(student.id, student);
        });
      }
      
      // Join the data and add source information
      const lessonsWithStudents = lessons.map(lesson => {
        const student = studentMap.get(lesson.student_id);
        
        return {
          ...lesson,
          student: {
            id: lesson.student_id,
            name: student?.name || 'Unknown Student',
            avatar_url: student?.avatar_url
          },
          _source: 'database'
        } as LessonWithSource;
      });
      
      // In development mode, only take lessons for the specified teacher
      // or limit to a reasonable number 
      const filteredLessons = isDevelopmentMode
        ? lessonsWithStudents.filter(l => l.teacher_id === teacherId || lessonsWithStudents.indexOf(l) < 24)
        : lessonsWithStudents;
      
      // Cache the successful response
      setCachedMockData(CACHE_KEY, JSON.stringify(filteredLessons));
      
      console.log(`Successfully joined ${filteredLessons.length} lessons with students from database`);
      return filteredLessons;
    } else {
      console.log('No lessons found in Supabase database');
    }
    
    // STEP 2: If no database data, try to use cached data
    console.log('No lessons found in database, checking cache...');
    const cachedData = getCachedMockData<string>(CACHE_KEY, '');
    
    if (cachedData) {
      try {
        const parsedCache = JSON.parse(cachedData);
        if (Array.isArray(parsedCache) && parsedCache.length > 0) {
          console.log(`Using ${parsedCache.length} cached lessons`);
          return parsedCache.map(lesson => ({
            ...lesson,
            _source: 'cached'
          })) as LessonWithSource[];
        }
      } catch (e) {
        console.error('Error parsing cached lessons:', e);
      }
    }
    
    // STEP 3: Fall back to mock data
    console.log('No cached lessons found, generating mock data...');
    const mockLessons = generateMockLessons(teacherId, 24); // Generate 24 mock lessons
    
    // Cache the mock data for future use
    setCachedMockData(CACHE_KEY, JSON.stringify(mockLessons));
    
    return mockLessons;
  } catch (error) {
    console.error('Failed to load lessons from database:', error);
    
    // Try to use cached data if available
    console.log('Trying to use cached data after error...');
    const cachedData = getCachedMockData<string>(CACHE_KEY, '');
    
    if (cachedData) {
      try {
        const parsedCache = JSON.parse(cachedData);
        if (Array.isArray(parsedCache) && parsedCache.length > 0) {
          console.log(`Using ${parsedCache.length} cached lessons after error`);
          return parsedCache.map(lesson => ({
            ...lesson,
            _source: 'cached'
          })) as LessonWithSource[];
        }
      } catch (e) {
        console.error('Error parsing cached lessons:', e);
      }
    }
    
    // Last resort: generate mock data
    console.log('Generating mock lessons as fallback after error...');
    const mockLessons = generateMockLessons(teacherId, 24);
    return mockLessons;
  }
}

/**
 * Generates mock lesson data for development/testing
 */
function generateMockLessons(teacherId: string, count: number): LessonWithSource[] {
  const studentIds = ['student-1', 'student-2', 'student-3', 'student-4'];
  const studentNames = ['Emma Johnson', 'Noah Williams', 'Olivia Brown', 'Liam Jones'];
  const locations = ['Studio A', 'Studio B', 'Online', 'Student\'s Home'];
  const statuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'];
  
  return Array.from({ length: count }).map((_, i) => {
    const studentIndex = i % studentIds.length;
    const statusIndex = Math.floor(i / 6) % statuses.length; // Changes every 6 lessons
    const date = new Date();
    date.setDate(date.getDate() - i); // Each lesson is one day earlier
    
    return {
      id: `lesson-${i + 1}`,
      teacher_id: teacherId,
      student_id: studentIds[studentIndex],
      date: date.toISOString().split('T')[0],
      start_time: '14:00:00',
      end_time: '15:00:00',
      location: locations[i % locations.length],
      notes: `Lesson ${i + 1} notes for ${studentNames[studentIndex]}`,
      summary: `Worked on Bach Partita and scales. ${studentNames[studentIndex]} made good progress.`,
      status: statuses[statusIndex],
      transcript_url: i % 3 === 0 ? `https://example.com/transcripts/lesson-${i+1}` : null,
      ai_summary: i % 4 === 0 ? `AI summary for lesson ${i+1}` : null,
      created_at: new Date(date.getTime() - 86400000).toISOString(),
      updated_at: date.toISOString(),
      student: {
        id: studentIds[studentIndex],
        name: studentNames[studentIndex],
        avatar_url: `/images/avatar${studentIndex + 1}.png`
      },
      _source: 'mock'
    } as LessonWithSource;
  });
} 