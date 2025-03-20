import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { getCachedMockData, setCachedMockData } from '@/lib/mockDataCache';

// Types for our hook returns
export type StudentRepertoire = Database['public']['Tables']['student_repertoire']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];

// Type for the return data
export interface StudentHistory {
  id: string;
  student_id: string;
  name: string;
  avatarUrl?: string;
  status: 'current' | 'completed';
  startDate: string;
  endDate?: string;
  _source?: 'database' | 'cached' | 'mock';
}

// Mock student history data for testing when Supabase is unavailable
const mockStudentHistory: StudentHistory[] = [
  {
    id: 'mock-history-1',
    student_id: 'mock-student-1',
    name: 'Emma Johnson',
    avatarUrl: '',
    status: 'current',
    startDate: '2023-01-15',
    _source: 'mock'
  },
  {
    id: 'mock-history-2',
    student_id: 'mock-student-2',
    name: 'Michael Chen',
    avatarUrl: '',
    status: 'current',
    startDate: '2023-02-10',
    _source: 'mock'
  },
  {
    id: 'mock-history-3',
    student_id: 'mock-student-3',
    name: 'Sophia Rodriguez',
    avatarUrl: '',
    status: 'completed',
    startDate: '2022-08-05',
    endDate: '2022-12-15',
    _source: 'mock'
  },
  {
    id: 'mock-history-4',
    student_id: 'mock-student-4',
    name: 'James Wilson',
    avatarUrl: '',
    status: 'completed',
    startDate: '2022-05-20',
    endDate: '2022-09-30',
    _source: 'mock'
  }
];

/**
 * Hook to get student history for a specific piece with hybrid caching
 * Tries Supabase first, then cached data, then mock data
 */
export function usePieceStudentHistory(pieceId: string | undefined) {
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  return useQuery<StudentHistory[]>({
    queryKey: ['pieceStudentHistory', pieceId],
    queryFn: async () => {
      if (!pieceId) return [];
      
      try {
        // Try to get data from Supabase - first get student_repertoire records
        console.log(`🔍 Fetching student history for piece ${pieceId} from Supabase...`);
        const { data: repertoireData, error: repertoireError } = await supabase
          .from('student_repertoire')
          .select('*')
          .eq('master_piece_id', pieceId);
          
        if (repertoireError) {
          throw repertoireError;
        }
        
        // If we got repertoire data, fetch the corresponding student details
        if (repertoireData && repertoireData.length > 0) {
          console.log(`✅ Supabase returned ${repertoireData.length} student records for piece ${pieceId}`);
          
          // Extract student IDs
          const studentIds = repertoireData.map(record => record.student_id);
          
          // Fetch student details
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .in('id', studentIds);
            
          if (studentsError) {
            throw studentsError;
          }
          
          // Combine the data
          const studentHistory: StudentHistory[] = repertoireData.map(repertoireItem => {
            const student = studentsData?.find(s => s.id === repertoireItem.student_id);
            
            return {
              id: repertoireItem.id,
              student_id: repertoireItem.student_id,
              name: student?.name || 'Unknown Student',
              avatarUrl: student?.avatar_url || undefined,
              status: repertoireItem.status === 'completed' ? 'completed' : 'current',
              startDate: repertoireItem.start_date || '',
              endDate: repertoireItem.end_date || undefined,
              _source: 'database' as const
            };
          });
          
          return studentHistory;
        }
        
        // If we reach here, it means we got an empty array from Supabase
        console.warn(`⚠️ Supabase returned no student history for piece ${pieceId}`);
      } catch (error) {
        // Handle connection errors or other issues
        console.error(`❌ Supabase error fetching student history for piece ${pieceId}:`, error);
      }
      
      // If we're here, either there was an error or empty data
      // Check for cached data first
      console.log(`🔍 Checking for cached student history for piece ${pieceId}...`);
      const cacheKey = `pieceStudentHistory_${pieceId}`;
      const cachedData = getCachedMockData<StudentHistory[]>(cacheKey, []);
      
      if (cachedData && cachedData.length > 0) {
        console.log(`📝 Using cached student history for piece ${pieceId} (${cachedData.length} students)`);
        return cachedData.map(student => ({
          ...student,
          _source: 'cached' as const
        }));
      }
      
      console.log(`📝 Using mock student history for piece ${pieceId} as final fallback`);
      // For mock data, use a clean copy with properly typed _source
      const filteredMockHistory: StudentHistory[] = mockStudentHistory.map(student => ({
        ...student,
        _source: 'mock' as const
      }));
      
      // Cache the mock data for future use
      setCachedMockData(cacheKey, filteredMockHistory);
      
      return filteredMockHistory;
    },
    enabled: !!pieceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 