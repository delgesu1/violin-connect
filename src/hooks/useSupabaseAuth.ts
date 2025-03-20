import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { updateSupabaseAuthToken } from '@/lib/supabase';

// Mock for development mode
const useMockAuth = () => {
  return {
    userId: 'mock-user-id', // You can set a fixed ID for development
    getToken: async () => 'mock-token-for-development',
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'mock-user-id',
      fullName: 'Development User',
      imageUrl: 'https://via.placeholder.com/150',
    }
  };
};

// Use the appropriate auth hook based on dev mode
const useAuth = () => {
  const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
  
  if (DEV_MODE) {
    console.log('Using mock auth in development mode');
    return useMockAuth();
  }
  
  try {
    return useClerkAuth();
  } catch (error) {
    console.error('Clerk auth error:', error);
    return useMockAuth();
  }
};

export function useSupabaseAuth() {
  const { userId, getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const updateToken = async () => {
      try {
        if (!userId) {
          console.log('No user ID available, skipping Supabase auth');
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        
        // In development mode, we'll use a simplified approach
        const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
        if (DEV_MODE) {
          console.log('DEV MODE: Using mock authentication');
          // Create a dummy token for development
          updateSupabaseAuthToken('mock-development-token');
          setIsLoading(false);
          return;
        }
        
        console.log('PRODUCTION MODE: Initializing Supabase auth with Clerk JWT');
        
        try {
          // Get JWT token from Clerk that's configured for Supabase
          console.log(`Requesting JWT token for user ${userId} with template "supabase"`);
          const token = await getToken({ template: 'supabase' });
          
          if (token) {
            console.log('Received JWT token:', token.substring(0, 15) + '...');
            // Update the Supabase client with the token
            updateSupabaseAuthToken(token);
            console.log('✅ Supabase auth initialized with Clerk JWT template');
            setIsLoading(false);
            return;
          } else {
            console.warn('⚠️ No token returned from Clerk for template "supabase"');
            console.warn('Please check your Clerk JWT Templates configuration');
            setIsError(true);
          }
        } catch (e) {
          console.error('⚠️ Error getting Supabase template token:', e);
          console.error('Make sure you have configured a JWT Template in Clerk with the name "supabase"');
          console.error('Visit https://dashboard.clerk.com/last-active?path=jwt-templates to set up the template');
          setIsError(true);
        }
      } catch (error) {
        console.error('❌ Error setting up Supabase auth:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    updateToken();
  }, [userId, getToken]);

  return { isLoading, isError };
}

// Export the mock auth hook for components that need Clerk auth directly
export { useAuth }; 