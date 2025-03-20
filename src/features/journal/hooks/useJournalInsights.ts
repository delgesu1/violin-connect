import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database, Json } from '@/types/supabase';
import { useDevFallbackUser } from '@/hooks/useDevFallbackUser';

// Types for our hook returns
export type JournalInsight = Database['public']['Tables']['journal_insights']['Row'];
export type NewJournalInsight = Database['public']['Tables']['journal_insights']['Insert'];
export type UpdateJournalInsight = Database['public']['Tables']['journal_insights']['Update'];

// Helper type for strongly typed arrays
export interface TypedJournalInsight {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  strengths: string[];
  challenges: string[];
  generation_method: string | null;
  last_generated_at: string | null;
}

// Convert database type to typed version
const convertToTyped = (insight: JournalInsight | null): TypedJournalInsight | null => {
  if (!insight) return null;
  
  // Convert JSON fields to typed arrays
  const strengths = Array.isArray(insight.strengths) 
    ? insight.strengths as string[]
    : [];
    
  const challenges = Array.isArray(insight.challenges)
    ? insight.challenges as string[]
    : [];
  
  return {
    ...insight,
    strengths,
    challenges
  };
};

// Mock data for development mode
const mockJournalInsights: TypedJournalInsight = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  user_id: "771ab2f3-ffbd-4ced-a36a-46f07f7a2b59",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  strengths: [
    'Remarkable progress in left-hand facility, particularly in fast passages',
    'Expressive vibrato in lyrical sections',
    'Strong rhythmic accuracy in complex meters'
  ],
  challenges: [
    'Maintaining consistent intonation across position changes',
    'Developing a more varied color palette through bow control',
    'Sustaining energy through longer practice sessions'
  ],
  generation_method: 'automatic',
  last_generated_at: new Date().toISOString()
};

/**
 * Hook to fetch journal insights for the current user
 */
export function useJournalInsights(options?: { enabled?: boolean }) {
  const { user, isLoaded } = useDevFallbackUser();
  const userId = user?.id;
  
  return useQuery({
    queryKey: ['journalInsights', userId],
    queryFn: async () => {
      if (!userId || process.env.NODE_ENV === 'development') {
        // Return mock data in development mode
        return mockJournalInsights;
      }
      
      // Real implementation with Supabase
      const { data, error } = await supabase
        .from('journal_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching journal insights:', error);
        return null;
      }
      
      return convertToTyped(data);
    },
    enabled: isLoaded && (options?.enabled !== false),
  });
}

/**
 * Hook to update journal insights
 * If no insights exist, create a new one
 */
export function useUpsertJournalInsights() {
  const queryClient = useQueryClient();
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  
  return useMutation({
    mutationFn: async (insights: {
      strengths: string[];
      challenges: string[];
      generation_method?: string;
    }) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // For development mode, just log and return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Mock updating journal insights:', insights);
        return {
          ...mockJournalInsights,
          strengths: insights.strengths,
          challenges: insights.challenges,
          updated_at: new Date().toISOString()
        };
      }
      
      // First check if the user already has insights
      const { data: existingInsights, error: fetchError } = await supabase
        .from('journal_insights')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error checking for existing insights:', fetchError);
        throw fetchError;
      }
      
      let result;
      
      if (existingInsights?.id) {
        // Update existing insights
        const { data, error } = await supabase
          .from('journal_insights')
          .update({
            strengths: insights.strengths,
            challenges: insights.challenges,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingInsights.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating journal insights:', error);
          throw error;
        }
        
        result = data;
      } else {
        // Create new insights
        const { data, error } = await supabase
          .from('journal_insights')
          .insert({
            user_id: userId,
            strengths: insights.strengths,
            challenges: insights.challenges,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating journal insights:', error);
          throw error;
        }
        
        result = data;
      }
      
      return convertToTyped(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalInsights'] });
    }
  });
}

/**
 * Hook to generate journal insights from entries
 */
export function useGenerateJournalInsights() {
  const queryClient = useQueryClient();
  const { user } = useDevFallbackUser();
  const userId = user?.id;
  
  return useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // For development mode, just log and return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Mock generating journal insights');
        
        // In a real implementation, we would analyze journal entries to generate insights
        // Return predefined mock insights for development
        return mockJournalInsights;
      }
      
      // In a real implementation, we would make an API call to analyze journal entries
      // For now, return a mock implementation
      return {
        ...mockJournalInsights,
        updated_at: new Date().toISOString()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalInsights'] });
    }
  });
} 