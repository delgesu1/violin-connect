import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isDevelopment } from '@/lib/environment';
import type { Database } from '@/types/supabase';

// Types
export type StudentRepertoire = Database['public']['Tables']['student_repertoire']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];
export type StudentHistoryEntry = StudentRepertoire & {
  student_name?: string;
  student_photo_url?: string;
  _source?: HistorySourceType;
};

// History source tracking
export type HistorySourceType = 'api' | 'cache' | 'mock';

// Mock data for testing
const mockStudentHistory: Record<string, StudentHistoryEntry[]> = {};

/**
 * Check if a string appears to be a UUID
 */
function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Hook to fetch student history for a specific piece with hybrid caching approach
 */
export function usePieceStudentHistory(pieceId: string | undefined) {
  const cacheKey = `piece-student-history-${pieceId}`;
  const [cachedData, setCachedData] = useLocalStorage<StudentHistoryEntry[]>(cacheKey, []);
  
  return useQuery<StudentHistoryEntry[]>({
    queryKey: ['pieceStudentHistory', pieceId],
    queryFn: async () => {
      if (!pieceId) return [];
      
      try {
        // STEP 1: Try to fetch from API first
        console.log(`🔍 Fetching student history for piece ${pieceId} from Supabase...`);
        
        // For UUID piece IDs, we want to query Supabase directly
        // We need to handle different ID formats - the database uses UUIDs
        const pieceIdForQuery = isUuid(pieceId) ? pieceId : pieceId;
        
        // First get the student repertoire entries
        const { data: repertoireData, error: repertoireError } = await supabase
          .from('student_repertoire')
          .select('*')
          .eq('master_piece_id', pieceIdForQuery);
          
        if (repertoireError) {
          console.error(`Error fetching student repertoire for piece ${pieceId}:`, repertoireError);
          throw repertoireError;
        }
        
        if (!repertoireData || repertoireData.length === 0) {
          console.log(`No student history found for piece ${pieceId}`);
          return [];
        }
        
        // Get student IDs from the repertoire data
        const studentIds = repertoireData.map(entry => entry.student_id);
        
        // Fetch student details
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .in('id', studentIds);
          
        if (studentError) {
          console.error(`Error fetching students for piece ${pieceId}:`, studentError);
          // Continue with just the repertoire data
        }
        
        // Combine repertoire and student data
        const result = repertoireData.map(entry => {
          const student = studentData?.find(s => s.id === entry.student_id);
          
          // Map from students table structure to our internal structure
          return {
            ...entry,
            student_name: student ? student.name : 'Unknown Student',
            student_photo_url: student?.avatar_url,
            _source: 'api' as HistorySourceType
          };
        });
        
        console.log(`✅ Supabase returned ${result.length} student records for piece ${pieceId}`);
        
        // Cache the result
        setCachedData(result);
        
        return result;
      } catch (error) {
        console.error(`Error in usePieceStudentHistory for piece ${pieceId}:`, error);
        
        // STEP 2: Fall back to cached data if available
        if (cachedData && cachedData.length > 0) {
          console.log(`📦 Using ${cachedData.length} cached student history records for piece ${pieceId}`);
          return cachedData.map(entry => ({ ...entry, _source: 'cache' as HistorySourceType }));
        }
        
        // STEP 3: Fall back to mock data in development environment
        if (isDevelopment()) {
          // Check for existing mock data
          if (mockStudentHistory[pieceId]) {
            return mockStudentHistory[pieceId].map(entry => ({ ...entry, _source: 'mock' as HistorySourceType }));
          }
          
          // No mock data exists for this piece yet, create some example student history
          const mockHistoryData: StudentHistoryEntry[] = [
            {
              id: `sr-${pieceId}-1`,
              student_id: '921e16df-3f73-4207-998b-f76998caf75e',
              master_piece_id: pieceId,
              status: 'current',
              start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
              end_date: null,
              performance_date: null,
              performance_location: null,
              updated_at: new Date().toISOString(),
              notes: 'Working on the third movement',
              created_at: new Date().toISOString(),
              student_name: 'Emily Johnson',
              student_photo_url: null,
              _source: 'mock' as HistorySourceType
            },
            {
              id: `sr-${pieceId}-2`,
              student_id: '9e905663-a2b6-4b57-b002-e009cf20b7db',
              master_piece_id: pieceId,
              status: 'completed',
              start_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days ago
              end_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days ago
              performance_date: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 55 days ago
              performance_location: 'Winter Recital',
              updated_at: new Date().toISOString(),
              notes: 'Performed at the winter recital',
              created_at: new Date().toISOString(),
              student_name: 'Michael Smith',
              student_photo_url: null,
              _source: 'mock' as HistorySourceType
            }
          ];
          
          // Store for future use
          mockStudentHistory[pieceId] = mockHistoryData;
          
          return mockHistoryData;
        }
        
        // If nothing worked, return empty array
        return [];
      }
    },
    enabled: !!pieceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 