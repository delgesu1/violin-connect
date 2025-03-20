import { useUser } from "@clerk/clerk-react";

/**
 * A hook that provides a development mode fallback for the Clerk useUser hook
 * Can be used in place of useUser() when dev mode is enabled but ClerkProvider isn't available
 */
export const useDevFallbackUser = () => {
  const isDev = import.meta.env.VITE_DEV_MODE === 'true';
  
  if (isDev) {
    console.log('Using mock user in development mode');
    // Creation date one year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return {
      user: {
        // Use the ID of the user with journal entries
        id: '771ab2f3-ffbd-4ced-a36a-46f07f7a2b59', // User with journal entries
        firstName: 'Developer',
        lastName: 'User',
        fullName: 'Developer User',
        primaryEmailAddress: {
          emailAddress: 'dev@example.com',
          id: 'dev-email-id'
        },
        emailAddresses: [{
          emailAddress: 'dev@example.com',
          id: 'dev-email-id'
        }],
        imageUrl: 'https://via.placeholder.com/150',
        username: 'devuser',
        publicMetadata: {},
        privateMetadata: {},
        unsafeMetadata: {},
        createdAt: oneYearAgo.toISOString(),
        updatedAt: new Date().toISOString(),
        lastSignInAt: new Date().toISOString()
      },
      isLoaded: true,
      isSignedIn: true
    };
  }
  
  // If not in dev mode, use the actual Clerk hook
  return useUser();
}; 