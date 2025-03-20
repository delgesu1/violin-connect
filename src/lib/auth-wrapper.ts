/**
 * Auth wrapper that provides Clerk hooks with dev mode fallbacks
 * Use these imports instead of directly importing from @clerk/clerk-react
 */
import * as React from 'react';
import { 
  useAuth as useClerkAuth, 
  useUser as useClerkUser,
  useClerk as useClerkClerk,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  UserButton as ClerkUserButton,
  UserProfile as ClerkUserProfile,
  SignIn as ClerkSignIn,
  SignUp as ClerkSignUp
} from '@clerk/clerk-react';

import { 
  useMockAuth, 
  useMockUser, 
  useMockClerk, 
  isDevMode 
} from './mock-auth';

// Wrapped hooks that use either real Clerk hooks or mocks based on dev mode
export const useAuth = () => {
  if (isDevMode()) {
    return useMockAuth();
  }
  
  try {
    return useClerkAuth();
  } catch (error) {
    console.warn('Clerk auth error, using mock auth:', error);
    return useMockAuth();
  }
};

export const useUser = () => {
  if (isDevMode()) {
    return useMockUser();
  }
  
  try {
    return useClerkUser();
  } catch (error) {
    console.warn('Clerk user error, using mock user:', error);
    return useMockUser();
  }
};

export const useClerk = () => {
  if (isDevMode()) {
    return useMockClerk();
  }
  
  try {
    return useClerkClerk();
  } catch (error) {
    console.warn('Clerk clerk error, using mock clerk:', error);
    return useMockClerk();
  }
};

// For SignedIn and SignedOut components, we create versions that respect dev mode
export const SignedIn = ({ children }) => {
  if (isDevMode()) {
    return React.createElement(React.Fragment, null, children);
  }
  
  try {
    return React.createElement(ClerkSignedIn, null, children);
  } catch (error) {
    console.warn('Clerk SignedIn error, rendering children directly:', error);
    return React.createElement(React.Fragment, null, children);
  }
};

export const SignedOut = ({ children }) => {
  if (isDevMode()) {
    return null; // In dev mode, we're always "signed in"
  }
  
  try {
    return React.createElement(ClerkSignedOut, null, children);
  } catch (error) {
    console.warn('Clerk SignedOut error, not rendering children:', error);
    return null;
  }
};

// Mocked UserButton component that works in development mode
export const UserButton = (props) => {
  if (isDevMode()) {
    // Return a simple button for development mode
    return React.createElement(
      'button',
      { 
        className: 'w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center',
        onClick: () => console.log('User button clicked in development mode'),
        ...props
      },
      React.createElement('span', null, 'U')
    );
  }
  
  try {
    return React.createElement(ClerkUserButton, props);
  } catch (error) {
    console.warn('Clerk UserButton error, rendering mock button:', error);
    // Return a fallback button if there's an error
    return React.createElement(
      'button',
      { 
        className: 'w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center',
        onClick: () => console.log('User button clicked (fallback)'),
        ...props
      },
      React.createElement('span', null, 'U')
    );
  }
};

// Mocked UserProfile component that works in development mode
export const UserProfile = (props) => {
  if (isDevMode()) {
    // Return a simple mock profile UI for development mode
    return React.createElement(
      'div',
      { 
        className: 'p-4 border rounded-lg',
        ...props
      },
      React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'Mock User Profile'),
      React.createElement('p', { className: 'mb-2' }, 'This is a mock user profile for development.'),
      React.createElement('p', { className: 'text-muted-foreground' }, 'In production, this would show the Clerk user profile UI.')
    );
  }
  
  try {
    return React.createElement(ClerkUserProfile, props);
  } catch (error) {
    console.warn('Clerk UserProfile error, rendering mock profile:', error);
    // Return a fallback if there's an error
    return React.createElement(
      'div',
      { 
        className: 'p-4 border rounded-lg',
        ...props
      },
      React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 'User Profile (Fallback)'),
      React.createElement('p', { className: 'mb-2' }, 'Unable to load the user profile.'),
      React.createElement('p', { className: 'text-muted-foreground' }, 'Please try again later.')
    );
  }
};

// Mocked SignIn component that works in development mode
export const SignIn = (props) => {
  if (isDevMode()) {
    // Return a mock sign-in form for development mode
    return React.createElement(
      'div',
      { 
        className: 'max-w-md mx-auto p-6 bg-card rounded-lg shadow-md',
        ...props
      },
      React.createElement('h2', { className: 'text-2xl font-bold mb-6 text-center' }, 'Sign In (Development Mode)'),
      React.createElement('p', { className: 'mb-4 text-center text-muted-foreground' }, 
        'This is a mock sign-in page. In development mode, authentication is bypassed.'
      ),
      React.createElement(
        'button',
        {
          className: 'w-full py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90',
          onClick: () => {
            // Navigate to home page after "signing in"
            window.location.href = '/';
          }
        },
        'Continue as Mock User'
      )
    );
  }
  
  try {
    return React.createElement(ClerkSignIn, props);
  } catch (error) {
    console.warn('Clerk SignIn error, rendering mock sign-in:', error);
    // Return a fallback if there's an error
    return React.createElement(
      'div',
      { 
        className: 'max-w-md mx-auto p-6 bg-card rounded-lg shadow-md',
        ...props
      },
      React.createElement('h2', { className: 'text-2xl font-bold mb-6 text-center' }, 'Sign In (Fallback)'),
      React.createElement('p', { className: 'mb-4 text-center text-muted-foreground' }, 
        'Unable to load the sign-in form. Try refreshing the page.'
      )
    );
  }
};

// Mocked SignUp component that works in development mode
export const SignUp = (props) => {
  if (isDevMode()) {
    // Return a mock sign-up form for development mode
    return React.createElement(
      'div',
      { 
        className: 'max-w-md mx-auto p-6 bg-card rounded-lg shadow-md',
        ...props
      },
      React.createElement('h2', { className: 'text-2xl font-bold mb-6 text-center' }, 'Sign Up (Development Mode)'),
      React.createElement('p', { className: 'mb-4 text-center text-muted-foreground' }, 
        'This is a mock sign-up page. In development mode, authentication is bypassed.'
      ),
      React.createElement(
        'button',
        {
          className: 'w-full py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90',
          onClick: () => {
            // Navigate to home page after "signing up"
            window.location.href = '/';
          }
        },
        'Create Mock Account'
      )
    );
  }
  
  try {
    return React.createElement(ClerkSignUp, props);
  } catch (error) {
    console.warn('Clerk SignUp error, rendering mock sign-up:', error);
    // Return a fallback if there's an error
    return React.createElement(
      'div',
      { 
        className: 'max-w-md mx-auto p-6 bg-card rounded-lg shadow-md',
        ...props
      },
      React.createElement('h2', { className: 'text-2xl font-bold mb-6 text-center' }, 'Sign Up (Fallback)'),
      React.createElement('p', { className: 'mb-4 text-center text-muted-foreground' }, 
        'Unable to load the sign-up form. Try refreshing the page.'
      )
    );
  }
}; 