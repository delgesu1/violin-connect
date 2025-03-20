import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// We need to access the import.meta.env directly for Vite to replace with actual values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const isDev = import.meta.env.VITE_DEV_MODE === 'true';

// Log the configuration for debugging
console.log(`Supabase Configuration (${isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode):`);
console.log('- URL:', supabaseUrl || 'not set');
console.log('- Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);
console.log('- Service role key available:', !!supabaseServiceRoleKey);
console.log('- URL type:', typeof supabaseUrl);
console.log('- Local URL:', import.meta.env.SUPABASE_URL);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create the Supabase client
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      // Add CORS headers and timeout to the fetch function
      fetch: (url, options: RequestInit = {}) => {
        // In development mode, add CORS preflight handling and timeout
        if (isDev) {
          console.log('🔄 Development mode fetch:', url);
          
          // Modify options to handle CORS
          const modifiedOptions: RequestInit = {
            ...options,
            mode: 'cors' as RequestMode,
            headers: {
              ...(options.headers as Record<string, string>),
              'Origin': window.location.origin,
            },
            // Add short timeout to avoid hanging requests when Supabase is down
            signal: AbortSignal.timeout(3000) // 3 second timeout instead of 5 seconds
          };
          
          return fetch(url, modifiedOptions)
            .catch((error) => {
              console.error('❌ Fetch error (likely CORS or connection):', error);
              // Return an empty response to prevent breaking the app
              // This will trigger the fallback to mock data
              return new Response(JSON.stringify({ data: [], error: { message: 'Connection Error' } }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        }
        
        // In production mode, use normal fetch but with a timeout
        const prodOptions: RequestInit = {
          ...options,
          signal: AbortSignal.timeout(5000) // 5 second timeout for production
        };
        return fetch(url, prodOptions);
      }
    }
  }
);

// Create admin client for development to bypass Row Level Security
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey 
  ? createClient<Database>(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )
  : null;

if (supabaseAdmin) {
  console.log('Supabase Admin client created successfully for development mode');
} else {
  console.log('Supabase Admin client not available - missing URL or service role key');
}

// Listen for auth state changes to update the Supabase auth JWT
supabase.auth.onAuthStateChange((event, session) => {
  // When auth state changes (like sign in), update the auth token
  if (session?.access_token) {
    console.log(`Supabase auth state changed: ${event}`);
    console.log('Access token available:', !!session.access_token);
  }
});

// Log client creation success
console.log('Supabase client created successfully');

// Export a function to get the client - useful for testing
export const getSupabaseClient = () => supabase;

/**
 * Update the Supabase client's auth token with a JWT from Clerk
 * This allows the Supabase client to make authenticated requests
 * using the user's Clerk identity
 */
export const updateSupabaseAuthToken = (token: string) => {
  if (!token) {
    console.error('No JWT token provided to updateSupabaseAuthToken');
    return;
  }
  
  // Set the auth token in the Supabase client
  supabase.auth.setSession({
    access_token: token,
    refresh_token: '',
  });
  
  console.log('Supabase auth token updated with Clerk JWT');
};

// Create admin client for bypassing Row Level Security in development
export const createAdminClient = () => {
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.warn('VITE_SUPABASE_SERVICE_ROLE_KEY not found, admin client not available');
    return null;
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}; 