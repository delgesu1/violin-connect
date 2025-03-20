/**
 * Mock implementations of Clerk authentication hooks for development mode
 * This allows the application to run without Clerk in development
 */

// Mock User object
export const mockUser = {
  id: 'mock-user-id',
  firstName: 'Development',
  lastName: 'User',
  fullName: 'Development User',
  username: 'dev_user',
  imageUrl: 'https://via.placeholder.com/150',
  email: 'dev@example.com',
  primaryEmailAddress: {
    emailAddress: 'dev@example.com',
    id: 'mock-email-id',
    verification: { status: 'verified' },
  },
  emailAddresses: [
    {
      emailAddress: 'dev@example.com',
      id: 'mock-email-id',
      verification: { status: 'verified' },
    },
  ],
};

// Mock useAuth hook
export const useMockAuth = () => {
  return {
    userId: 'mock-user-id',
    sessionId: 'mock-session-id',
    getToken: async () => 'mock-token-for-development',
    isLoaded: true,
    isSignedIn: true,
    sessionClaims: { sub: 'mock-user-id' },
    signOut: async () => console.log('Mock sign out'),
    signIn: async () => console.log('Mock sign in'),
  };
};

// Mock useUser hook
export const useMockUser = () => {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: mockUser,
  };
};

// Mock useClerk hook
export const useMockClerk = () => {
  return {
    openSignIn: () => console.log('Mock open sign in'),
    openSignUp: () => console.log('Mock open sign up'),
    signOut: async () => console.log('Mock sign out'),
    session: {
      id: 'mock-session-id',
      status: 'active',
      expireAt: new Date(Date.now() + 86400000), // 24 hours from now
      lastActiveAt: new Date(),
    },
    user: mockUser,
    client: {
      signIn: {
        create: async () => console.log('Mock sign in create'),
      },
      signUp: {
        create: async () => console.log('Mock sign up create'),
      },
    },
  };
};

// Check if we're in development mode
export const isDevMode = () => import.meta.env.VITE_DEV_MODE === 'true'; 