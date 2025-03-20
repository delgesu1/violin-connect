import { v5 as uuidv5 } from 'uuid';

// Define a namespace for our UUIDs (using a random UUID as the namespace)
const CLERK_NAMESPACE = '9f58d4c2-0dbd-4a5d-9bbc-8ab8e8f47140';

// Hard-coded mapping for the current user
const SPECIAL_CASES: Record<string, string> = {
  // Add your Clerk ID here
  'user_2uFOgpmUjcplrrAKoCytvCEbpiM': '771ab2f3-ffbd-4ced-a36a-46f07f7a2b59'
};

/**
 * Converts a Clerk user ID to a UUID format that Supabase can use
 * This is needed because Clerk uses string IDs like "user_xxx" while 
 * Supabase expects UUIDs in tables with UUID foreign keys
 */
export function clerkIdToUuid(clerkId: string | null | undefined): string | null {
  if (!clerkId) return null;
  
  // Check for special cases first (for the current user)
  if (SPECIAL_CASES[clerkId]) {
    console.log(`Using special case mapping for Clerk ID: ${clerkId} -> ${SPECIAL_CASES[clerkId]}`);
    return SPECIAL_CASES[clerkId];
  }
  
  // Generate a UUID v5 based on the Clerk ID
  // This will produce a consistent UUID for the same Clerk ID
  return uuidv5(clerkId, CLERK_NAMESPACE);
}

/**
 * Use this function to debug issues with ID conversion
 */
export function logIdConversion(clerkId: string): void {
  console.log(`Converting Clerk ID: ${clerkId}`);
  console.log(`To UUID: ${clerkIdToUuid(clerkId)}`);
} 