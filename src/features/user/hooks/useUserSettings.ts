import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/lib/auth-wrapper';

/**
 * Interface for user settings/preferences
 */
export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  emailFrequency: 'daily' | 'weekly' | 'never';
  lessonReminders: boolean;
  language: string;
  timezone: string;
  dateFormat: string;
  updatedAt: string;
}

// Mock data for development
const mockUserSettings: Record<string, UserSettings> = {};

/**
 * Hook to fetch the current user's settings
 */
export function useUserSettings() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: ['user_settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Return existing mock settings or create new ones
      if (!mockUserSettings[user.id]) {
        mockUserSettings[user.id] = {
          id: `settings-${user.id}`,
          userId: user.id,
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          emailFrequency: 'weekly',
          lessonReminders: true,
          language: 'en',
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          updatedAt: new Date().toISOString(),
        };
      }
      
      return mockUserSettings[user.id];
    },
    enabled: !!user?.id,
  });
}

/**
 * Hook to update user settings
 * 
 * Note: This is a mock implementation - in a real app, this would save to a database
 */
export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  
  return useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Create settings if they don't exist
      if (!mockUserSettings[user.id]) {
        mockUserSettings[user.id] = {
          id: `settings-${user.id}`,
          userId: user.id,
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          emailFrequency: 'weekly',
          lessonReminders: true,
          language: 'en',
          timezone: 'America/New_York',
          dateFormat: 'MM/DD/YYYY',
          updatedAt: new Date().toISOString(),
        };
      }
      
      // Update the settings
      mockUserSettings[user.id] = {
        ...mockUserSettings[user.id],
        ...settings,
        updatedAt: new Date().toISOString(),
      };
      
      // Log the update for development purposes
      console.log('Updated user settings:', mockUserSettings[user.id]);
      
      return mockUserSettings[user.id];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_settings'] });
    },
  });
}

/**
 * Hook for theme preferences
 */
export function useThemePreference() {
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateUserSettings();
  
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    updateSettings.mutate({ theme });
  };
  
  return {
    theme: settings?.theme || 'system',
    setTheme,
    isLoading: updateSettings.isPending,
  };
}

/**
 * Hook for notification preferences
 */
export function useNotificationPreferences() {
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateUserSettings();
  
  const updateNotifications = (notifications: Partial<UserSettings['notifications']>) => {
    updateSettings.mutate({ 
      notifications: { 
        ...settings?.notifications,
        ...notifications 
      }
    });
  };
  
  const updateEmailFrequency = (frequency: UserSettings['emailFrequency']) => {
    updateSettings.mutate({ emailFrequency: frequency });
  };
  
  const toggleLessonReminders = () => {
    updateSettings.mutate({ 
      lessonReminders: !(settings?.lessonReminders) 
    });
  };
  
  return {
    notifications: settings?.notifications,
    emailFrequency: settings?.emailFrequency,
    lessonReminders: settings?.lessonReminders,
    updateNotifications,
    updateEmailFrequency,
    toggleLessonReminders,
    isLoading: updateSettings.isPending,
  };
} 