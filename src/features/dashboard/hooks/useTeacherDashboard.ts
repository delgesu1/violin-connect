import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { isValidUUID } from '@/lib/id-utils';
import { 
  DEV_TEACHER_UUID, 
  DEV_STUDENT_UUIDS 
} from '@/lib/dev-uuids';

// Constants
const isDev = import.meta.env.VITE_DEV_MODE === 'true';
const CACHE_KEY = 'teacher_dashboard_data';

// Types
export interface StudentSummary {
  id: string;
  name: string;
  avatar_url: string | null;
  level: string | null;
  last_lesson_date: string | null;
  next_lesson: string | null;
  unread_messages: number | null;
  _source?: 'database' | 'cached' | 'mock';
}

export interface RecentLesson {
  id: string;
  student_id: string;
  student_name: string;
  date: string;
  summary: string | null;
  status: string | null;
  _source?: 'database' | 'cached' | 'mock';
}

export interface UpcomingEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  event_type: string;
  student_id: string | null;
  student_name?: string;
  _source?: 'database' | 'cached' | 'mock';
}

export interface TeacherDashboardData {
  students: StudentSummary[];
  recentLessons: RecentLesson[];
  upcomingEvents: UpcomingEvent[];
  totalStudents: number;
  totalLessonsThisMonth: number;
  totalPiecesInProgress: number;
  _source?: 'database' | 'cached' | 'mock';
}

// Helper to get cached data
const getCachedDashboardData = (): TeacherDashboardData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    return {
      ...data,
      students: data.students?.map((student: StudentSummary) => ({ ...student, _source: 'cached' })) || [],
      recentLessons: data.recentLessons?.map((lesson: RecentLesson) => ({ ...lesson, _source: 'cached' })) || [],
      upcomingEvents: data.upcomingEvents?.map((event: UpcomingEvent) => ({ ...event, _source: 'cached' })) || [],
      _source: 'cached'
    };
  } catch (err) {
    console.warn('Error reading teacher dashboard cache:', err);
    return null;
  }
};

// Helper to set cached data
const setCachedDashboardData = (data: TeacherDashboardData): void => {
  try {
    // Remove _source properties before caching
    const dataToCache = {
      ...data,
      students: data.students?.map(({ _source, ...student }) => student) || [],
      recentLessons: data.recentLessons?.map(({ _source, ...lesson }) => lesson) || [],
      upcomingEvents: data.upcomingEvents?.map(({ _source, ...event }) => event) || [],
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
  } catch (err) {
    console.warn('Error setting teacher dashboard cache:', err);
  }
};

// Helper to generate mock dashboard data
const getMockDashboardData = (): TeacherDashboardData => {
  // Create mock student data
  const mockStudents: StudentSummary[] = [
    {
      id: DEV_STUDENT_UUIDS.EMMA,
      name: 'Emma Thompson',
      avatar_url: 'https://example.com/avatars/emma.jpg',
      level: 'Advanced',
      last_lesson_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      next_lesson: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      unread_messages: 2,
      _source: 'mock'
    },
    {
      id: DEV_STUDENT_UUIDS.JAMES,
      name: 'James Wilson',
      avatar_url: 'https://example.com/avatars/james.jpg',
      level: 'Intermediate',
      last_lesson_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      next_lesson: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      unread_messages: 0,
      _source: 'mock'
    },
    {
      id: DEV_STUDENT_UUIDS.SOPHIA,
      name: 'Sophia Chen',
      avatar_url: 'https://example.com/avatars/sophia.jpg',
      level: 'Beginner',
      last_lesson_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      next_lesson: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      unread_messages: 1,
      _source: 'mock'
    }
  ];

  // Create mock recent lessons
  const mockRecentLessons: RecentLesson[] = [
    {
      id: '6c84fb90-12c4-11e1-840d-7b25c5ee775a',
      student_id: DEV_STUDENT_UUIDS.EMMA,
      student_name: 'Emma Thompson',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Worked on Bach Partita No. 2. Emma is making good progress with the Chaconne section.',
      status: 'completed',
      _source: 'mock'
    },
    {
      id: '6c84fb90-12c4-11e1-840d-7b25c5ee775b',
      student_id: DEV_STUDENT_UUIDS.JAMES,
      student_name: 'James Wilson',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      summary: 'Focused on scales and arpeggios. Need to work more on intonation in the higher positions.',
      status: 'completed',
      _source: 'mock'
    }
  ];

  // Create mock upcoming events
  const mockUpcomingEvents: UpcomingEvent[] = [
    {
      id: '6c84fb90-12c4-11e1-840d-7b25c5ee775c',
      title: 'Lesson with Emma',
      start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      event_type: 'lesson',
      student_id: DEV_STUDENT_UUIDS.EMMA,
      student_name: 'Emma Thompson',
      _source: 'mock'
    },
    {
      id: '6c84fb90-12c4-11e1-840d-7b25c5ee775d',
      title: 'Student Recital',
      start_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      event_type: 'performance',
      student_id: null,
      _source: 'mock'
    }
  ];

  return {
    students: mockStudents,
    recentLessons: mockRecentLessons,
    upcomingEvents: mockUpcomingEvents,
    totalStudents: mockStudents.length,
    totalLessonsThisMonth: 8,
    totalPiecesInProgress: 12,
    _source: 'mock'
  };
};

/**
 * A hook that fetches dashboard data for the teacher
 */
export function useTeacherDashboard() {
  const { userId } = useAuth();
  
  return useQuery<TeacherDashboardData>({
    queryKey: ['teacher_dashboard', userId],
    queryFn: async () => {
      // STEP 1: First, try to fetch from the database
      try {
        // In development mode, use DEV_TEACHER_UUID if no user ID is available
        const teacherId = !userId && isDev 
          ? DEV_TEACHER_UUID 
          : await clerkIdToUuid(userId || '');
          
        // Validate the teacher UUID
        if (!teacherId) {
          console.warn('Could not get a valid teacher ID');
          
          // Try to get cached data
          const cachedData = getCachedDashboardData();
          if (cachedData) {
            console.info('Using cached teacher dashboard data');
            return cachedData;
          }
          
          // Fall back to mock data in development mode
          if (isDev) {
            console.info('Using mock teacher dashboard data in development mode');
            return getMockDashboardData();
          }
          
          throw new Error('No valid teacher ID available');
        }
        
        if (!isValidUUID(teacherId)) {
          console.error(`Invalid teacher UUID format: ${teacherId}`);
          
          // Try to get cached data
          const cachedData = getCachedDashboardData();
          if (cachedData) {
            console.info('Using cached teacher dashboard data');
            return cachedData;
          }
          
          // Fall back to mock data in development mode
          if (isDev) {
            console.info('Using mock teacher dashboard data in development mode');
            return getMockDashboardData();
          }
          
          throw new Error(`Invalid UUID format: ${teacherId}`);
        }
        
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, name, avatar_url, level, last_lesson_date, next_lesson, unread_messages')
          .eq('teacher_id', teacherId);
          
        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          throw studentsError;
        }
        
        // Fetch recent lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, student_id, date, summary, status, students(name)')
          .eq('teacher_id', teacherId)
          .order('date', { ascending: false })
          .limit(5);
          
        if (lessonsError) {
          console.error('Error fetching recent lessons:', lessonsError);
          throw lessonsError;
        }
        
        // Fetch upcoming events
        const { data: eventsData, error: eventsError } = await supabase
          .from('calendar_events')
          .select('id, title, start_time, end_time, event_type, student_id, students(name)')
          .eq('teacher_id', teacherId)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(5);
          
        if (eventsError) {
          console.error('Error fetching upcoming events:', eventsError);
          throw eventsError;
        }
        
        // Fetch stats
        const { data: statsData, error: statsError } = await supabase
          .from('teacher_stats')
          .select('total_students, total_lessons_this_month, total_pieces_in_progress')
          .eq('teacher_id', teacherId)
          .single();
          
        if (statsError) {
          console.error('Error fetching teacher stats:', statsError);
          // Continue without stats, they're not critical
        }
        
        // Format and combine data
        const students = studentsData.map(student => ({
          ...student,
          _source: 'database' as const
        }));
        
        const recentLessons = lessonsData.map(lesson => ({
          ...lesson,
          student_name: lesson.students?.name || 'Unknown Student',
          _source: 'database' as const
        }));
        
        const upcomingEvents = eventsData.map(event => ({
          ...event,
          student_name: event.students?.name || undefined,
          _source: 'database' as const
        }));
        
        const dashboardData: TeacherDashboardData = {
          students,
          recentLessons,
          upcomingEvents,
          totalStudents: statsData?.total_students || students.length,
          totalLessonsThisMonth: statsData?.total_lessons_this_month || 0,
          totalPiecesInProgress: statsData?.total_pieces_in_progress || 0,
          _source: 'database'
        };
        
        // Cache the successful result
        setCachedDashboardData(dashboardData);
        
        return dashboardData;
      } catch (err) {
        console.error('Error fetching teacher dashboard data:', err);
        
        // STEP 2: On error, try to get cached data
        const cachedData = getCachedDashboardData();
        if (cachedData) {
          console.info('Using cached teacher dashboard data after database error');
          return cachedData;
        }
        
        // STEP 3: As a last resort, use mock data in development mode
        if (isDev) {
          console.info('Using mock teacher dashboard data after database error');
          return getMockDashboardData();
        }
        
        // In production with no cache, rethrow the error
        throw err;
      }
    },
    enabled: !!userId || isDev,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 