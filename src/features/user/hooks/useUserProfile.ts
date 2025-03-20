import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/lib/auth-wrapper';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { useDevFallbackUser } from '@/hooks/useDevFallbackUser';

/**
 * Interface for user profile data
 */
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  bio?: string;
  imageUrl?: string;
  phone?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Interface for Supabase profile data structure
interface SupabaseProfile {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  social_links?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch the current user's profile
 */
export function useUserProfile() {
  const { user: clerkUser } = useUser();
  const { user: devUser, isLoaded: isDevLoaded } = useDevFallbackUser();
  
  // Use either the real Clerk user or the dev fallback
  const user = clerkUser || devUser;
  const isLoaded = clerkUser !== undefined || isDevLoaded;
  
  return useQuery({
    queryKey: ['user_profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // For development or when using mock auth, return mock data
      if (import.meta.env.VITE_DEV_MODE === 'true' || !clerkUser) {
        return {
          id: user.id,
          firstName: user.firstName || 'Demo',
          lastName: user.lastName || 'Teacher',
          fullName: user.fullName || 'Demo Teacher',
          email: user.emailAddresses?.[0]?.emailAddress || 'demo@example.com',
          bio: 'Violin teacher with over 10 years of experience.',
          imageUrl: user.imageUrl,
          phone: '555-123-4567',
          location: 'New York, NY',
          website: 'https://example.com',
          socialLinks: {
            twitter: 'https://twitter.com/example',
            instagram: 'https://instagram.com/example',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as UserProfile;
      }
      
      // For production with real auth
      try {
        // Convert Clerk ID to UUID format for Supabase
        const supabaseUserId = clerkIdToUuid(user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUserId)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }
        
        const profile = data as SupabaseProfile;
        
        // Split the name into first/last name components if needed
        let firstName = user.firstName || '';
        let lastName = user.lastName || '';
        
        if (!firstName && !lastName && profile.name) {
          const nameParts = profile.name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Combine Supabase data with Clerk user data
        return {
          id: user.id,
          firstName: firstName,
          lastName: lastName,
          fullName: user.fullName || profile.name,
          imageUrl: user.imageUrl || profile.avatar_url,
          email: user.emailAddresses?.[0]?.emailAddress || '',
          bio: profile.bio,
          phone: profile.phone,
          location: profile.location,
          website: profile.website,
          socialLinks: profile.social_links,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        } as UserProfile;
      } catch (error) {
        console.error('Error in useUserProfile:', error);
        return null;
      }
    },
    enabled: isLoaded && !!user?.id,
  });
}

/**
 * Hook to update the user's profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  
  return useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // For development or when using mock auth, just log and return the data
      if (import.meta.env.VITE_DEV_MODE === 'true') {
        console.log('Mock updating user profile:', profileData);
        return profileData;
      }
      
      // Convert Clerk ID to UUID format for Supabase
      const supabaseUserId = clerkIdToUuid(user.id);
      
      // Combine first and last name for the name field
      const fullName = profileData.firstName && profileData.lastName 
        ? `${profileData.firstName} ${profileData.lastName}`
        : undefined;
      
      // Map the profile data to Supabase column format
      const supabaseData = {
        name: fullName,
        avatar_url: profileData.imageUrl,
        bio: profileData.bio,
        phone: profileData.phone,
        location: profileData.location,
        website: profileData.website,
        social_links: profileData.socialLinks,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(supabaseData)
        .eq('id', supabaseUserId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_profile'] });
    },
  });
} 