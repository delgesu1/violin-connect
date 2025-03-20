import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchStudentDashboardData, StudentDashboardData } from '@/api/studentDashboard';

/**
 * Hook to fetch and manage student dashboard data
 */
export function useStudentDashboard() {
  const { userId, isSignedIn } = useAuth();

  return useQuery<StudentDashboardData>({
    queryKey: ['student_dashboard', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      try {
        return await fetchStudentDashboardData(userId);
      } catch (error) {
        console.error('Error fetching student dashboard data:', error);
        // Return empty data on error
        return {
          upcomingLessons: [],
          currentRepertoire: [],
          recentJournalEntries: [],
          teacher: null
        };
      }
    },
    enabled: !!userId && isSignedIn === true,
    // Keep data fresh but don't refetch too often
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Handle errors gracefully
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error instanceof Error && error.message === 'User not authenticated') {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
  });
} 