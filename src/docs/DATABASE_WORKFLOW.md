# Database Schema & Development Workflow

This document outlines the best practices for managing database schema changes alongside application development in Violin Connect, incorporating our enhanced hybrid caching approach, safety improvements, and workflow enhancements.

## Core Philosophy: Schema-First Development

We follow a **schema-first** approach to ensure that our database schema and application code evolve together cohesively, even when using cached or mock data for development.

### The Challenge

Development with mock data can lead to **schema drift** - where your mock data structures no longer match what's in your actual database. This causes problems when switching to production mode.

### Our Solution

Our enhanced development workflow addresses this by:

1. **Defining schema changes first** through SQL migrations
2. **Applying migrations locally** before implementing features  
3. **Generating TypeScript types** from the database schema
4. **Using our hybrid caching approach** for development:
   - Attempt real API calls first
   - Cache successful responses
   - Fall back to cached data when needed
   - Use schema-consistent mock data as final fallback
5. **Tracking data sources** for transparent debugging
6. **Using enhanced safety tools** to prevent data loss

## ⚠️ Important Safety Warning ⚠️

Some database operations will **DELETE ALL YOUR DATA**. Always read warnings carefully:

- `db:reset` and `db:apply` operations will erase all data in your local database
- Always use `db:apply-safe` when working with real data
- Backup your database before any schema changes
- Never run destructive commands in production environments

## Improved Development Workflow

### 1. Setting Up Your Environment

```bash
# Install dependencies
npm install

# Start Supabase with CORS enabled
./scripts/db-tools.sh start

# Create a backup before making changes
./scripts/db-tools.sh backup

# Inspect your current database schema
./scripts/db-inspect.sh

# Safely apply existing migrations (preserves data)
./scripts/db-tools.sh apply-safe

# Generate TypeScript types
./scripts/db-tools.sh types

# Start development server
./scripts/db-tools.sh dev
```

### 2. Development Modes

The application has two operation modes:

#### Development Mode (`VITE_DEV_MODE=true`)
- Attempts real API calls first
- Caches successful responses
- Falls back to cached data when API calls fail
- Uses schema-aware mock data as final fallback
- Tracks data source for debugging transparency

#### Production Mode (`VITE_DEV_MODE=false`)
- Connects to Supabase and uses real data
- No caching or fallbacks used
- Requires running Supabase instance
- Tests real database interactions

Toggle between modes by changing `VITE_DEV_MODE` in your `.env` file.

## Hybrid Caching System

Our new hybrid approach provides a more robust development experience while maintaining schema integrity:

### Key Components:

1. **Data Caching Utilities**
   ```typescript
   // Cache successful API responses
   cacheMockData(key: string, data: any): void
   
   // Retrieve cached data with fallback
   getCachedMockData<T>(key: string, defaultValue: T): T
   ```

2. **Enhanced Error Handling**
   - Primary: Attempt real API call
   - Secondary: Try to use cached data
   - Tertiary: Fall back to mock data
   - Always maintain schema consistency

3. **Source Tracking**
   - Data objects include a `_source` property indicating origin:
     - `'database'`: Live API response
     - `'cached'`: Retrieved from cached data
     - `'mock'`: Static mock data
     - `'cached-fallback'`: Cached data used after API error
     - `'mock-fallback'`: Mock data used after API error

4. **Cache Management During Mutations**
   - When creating, updating, or deleting data:
     - Perform the API operation
     - Update all related caches on success
     - Keep cache consistent with server state

## Complete Migration Workflow

Based on our experiences, we've developed an improved workflow for database migrations:

### 1. Discovery Phase
Before making any changes, thoroughly explore the existing database schema:
```bash
./scripts/db-inspect.sh
```
This script provides detailed information about:
- Existing tables and their structures
- Functions and triggers
- Row Level Security (RLS) policies
- Foreign key relationships

### 2. Planning Phase
- Design your TypeScript interfaces first
- Map out all database changes needed
- Identify dependencies between objects
- Plan for both development and production modes

### 3. Backup Phase
Always create a backup before applying migrations:
```bash
# Create an automatic backup
./scripts/db-tools.sh backup

# Or export a manual backup of your current database
npx supabase db dump > backup_$(date +%Y%m%d).sql
```

### 4. Migration Creation
Create simple, focused migrations:
```bash
# Create a new migration
./scripts/db-tools.sh migration add_my_feature
```

This creates a timestamped SQL file in `supabase/migrations/`

When writing migrations:
- Start with table definitions only
- Use `IF EXISTS` and `IF NOT EXISTS` for all objects
- Keep functions and triggers in separate migrations when possible
- Test each migration in isolation

### 5. Define Your Schema (Carefully)
Edit the SQL file with your database changes:
```sql
-- Example: Adding a new table
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  duration INTEGER NOT NULL,
  repertoire_items JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can only access their own practice sessions" 
ON public.practice_sessions FOR ALL 
USING (auth.uid()::text = user_id);
```

**Best Practices:**
- Use `IF NOT EXISTS` with `CREATE TABLE` to avoid errors
- Use `DROP TABLE IF EXISTS` when removing tables
- Keep functions, triggers, and RLS policies separate from table definitions
- Split complex migrations into multiple, simpler migrations
- Use the simplest possible SQL syntax that accomplishes your goal

### 6. Safe Application
Apply migrations safely to preserve data:
```bash
./scripts/db-tools.sh apply-safe
```

If you're developing from scratch and don't care about data:
```bash
./scripts/db-tools.sh apply
```
⚠️ WARNING: This will delete all your existing data!

### 7. Type Generation
Generate TypeScript types immediately:
```bash
./scripts/db-tools.sh types
```
This creates TypeScript types from your updated schema

### 8. Implementation with Hybrid Caching

Create data hooks using our hybrid caching approach:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { cacheMockData, getCachedMockData } from '@/lib/mockDataCache';
import { mockPracticeSessions } from '@/data/mockData';

// Check if we're in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

// For consistent UUID in development
const DEV_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Fallback for authorization in development mode
const useDevelopmentAuth = () => {
  if (isDevelopmentMode) {
    return { 
      userId: DEV_UUID, 
      isLoaded: true, 
      isSignedIn: true, 
      getToken: async () => "mock-token-for-development" 
    };
  }
  return useAuth();
};

// Enhanced type with source tracking
type EnhancedSession = PracticeSession & {
  _source?: 'database' | 'cached' | 'mock' | 'cached-fallback' | 'mock-fallback';
};

/**
 * Hook to fetch practice sessions
 */
export function usePracticeSessions() {
  const { userId } = useDevelopmentAuth();
  
  return useQuery<EnhancedSession[]>({
    queryKey: ['practice_sessions'],
    queryFn: async () => {
      if (!userId && !isDevelopmentMode) return [];
      
      try {
        // Attempt real API call first
        const { data, error } = await supabase
          .from('practice_sessions')
          .select('*')
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        // If successful, cache the data
        if (data && data.length > 0) {
          cacheMockData('practice_sessions', data);
          
          // Add source indicator for debugging
          return data.map(session => ({
            ...session,
            _source: 'database'
          }));
        }
        
        // In development, try cached data if API returned empty
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<PracticeSession[] | null>('practice_sessions', null);
          if (cachedData && cachedData.length > 0) {
            console.log('Using cached practice session data');
            return cachedData.map(session => ({
              ...session,
              _source: 'cached'
            }));
          }
          
          // Final fallback to mock data
          console.log('Using mock practice session data');
          return mockPracticeSessions.map(session => ({
            ...session,
            _source: 'mock'
          }));
        }
        
        return [];
      } catch (err) {
        console.error('Error fetching practice sessions:', err);
        
        // In development mode, try cached data after error
        if (isDevelopmentMode) {
          const cachedData = getCachedMockData<PracticeSession[] | null>('practice_sessions', null);
          if (cachedData && cachedData.length > 0) {
            console.log('Using cached practice session data after error');
            return cachedData.map(session => ({
              ...session,
              _source: 'cached-fallback'
            }));
          }
          
          // Final fallback to mock data after error
          console.log('Using mock practice session data after error');
          return mockPracticeSessions.map(session => ({
            ...session,
            _source: 'mock-fallback'
          }));
        }
        
        throw err;
      }
    },
    enabled: !!userId || isDevelopmentMode,
  });
}

/**
 * Hook to create a practice session with cache management
 */
export function useCreatePracticeSession() {
  const queryClient = useQueryClient();
  const { userId } = useDevelopmentAuth();
  
  return useMutation({
    mutationFn: async (newSession: NewPracticeSession) => {
      if (!userId && !isDevelopmentMode) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('practice_sessions')
        .insert(newSession)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update cache on successful create
      if (data && isDevelopmentMode) {
        // Get existing cache and update it
        const cachedSessions = getCachedMockData<PracticeSession[]>('practice_sessions', []);
        const updatedCache = [...cachedSessions, data];
        cacheMockData('practice_sessions', updatedCache);
        
        // Also cache individual session
        cacheMockData(`practice_session_${data.id}`, data);
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['practice_sessions'] });
    },
  });
}
```

### 9. Testing
Test thoroughly in both modes:
- Development mode: `VITE_DEV_MODE=true`
- Production mode: `VITE_DEV_MODE=false`

Verify data consistency across different sources.

## Debugging with Source Tracking

The `_source` property added to data objects provides transparency during development:

- **database**: Data came directly from a successful API call to Supabase
- **cached**: Data came from localStorage cache (previously cached successful response)
- **mock**: Data came from static mock data files
- **cached-fallback**: Data came from cache after an API error
- **mock-fallback**: Data came from mock data after both API and cache failed

You can use this information in development tools or conditional rendering for debugging:

```tsx
{isDevelopmentMode && data._source && (
  <Badge variant={
    data._source === 'database' ? 'success' : 
    data._source.includes('cached') ? 'warning' : 'error'
  }>
    Source: {data._source}
  </Badge>
)}
```

## Cache Management Guidelines

To ensure cache consistency:

1. **Cache on Success**: Always cache successful API responses
   ```typescript
   if (data) {
     cacheMockData('key', data);
   }
   ```

2. **Update Cache on Mutations**: After create/update/delete operations
   ```typescript
   // After create
   const updatedCache = [...cachedItems, newItem];
   cacheMockData('items', updatedCache);
   
   // After update
   const updatedCache = cachedItems.map(item => 
     item.id === updatedItem.id ? updatedItem : item
   );
   cacheMockData('items', updatedCache);
   
   // After delete
   const updatedCache = cachedItems.filter(item => item.id !== deletedId);
   cacheMockData('items', updatedCache);
   ```

3. **Cache Related Data**: Update all related caches
   ```typescript
   // Also update related caches
   cacheMockData(`item_${id}`, updatedItem);
   ```

4. **Handle Cache Expiration**: Optionally implement cache expiration
   ```typescript
   // When caching, include timestamp
   cacheMockData(key, { data, timestamp: Date.now() });
   
   // When retrieving, check age
   const cached = localStorage.getItem(`mock_${key}`);
   if (cached) {
     const { data, timestamp } = JSON.parse(cached);
     const age = Date.now() - timestamp;
     if (age < MAX_CACHE_AGE) {
       return data;
     }
   }
   ```

## Recovery Strategies

If something goes wrong during migration:

### 1. Restore from Backup
```bash
# Restore from an automatic backup
./scripts/db-tools.sh restore backup_20250314_123456.sql

# Or restore from a manual backup file
npx supabase db restore backup_20250314.sql
```

### 2. Manual Schema Fixes
Use the Supabase Studio to make emergency fixes:
```bash
# Open Supabase Studio
./scripts/open-supabase-studio.sh
```

### 3. Data Recovery Scripts
For complex recovery scenarios, we've created helper scripts:
```bash
# Add missing columns
./scripts/add-transcript-column.sh

# Insert sample data
# Run the SQL from scripts/insert-data.sql in the Supabase Studio SQL Editor
```

## Proven Database Operations

After extensive trial and error, we've established these reliable methods for common database tasks:

### Inspecting the Database Schema

**Always use this as your first step before any schema changes:**

```bash
# The most reliable method to inspect your schema
./scripts/db-inspect.sh
```

If you need to inspect a specific table:
```bash
# View the structure of a specific table
./scripts/db-inspect.sh table_name
```

### Adding Columns to Existing Tables

When adding columns, the most reliable method is:

```sql
-- Use this exact pattern in your migrations
ALTER TABLE IF EXISTS table_name
  ADD COLUMN IF NOT EXISTS column_name DATA_TYPE;
```

If a migration fails to add a column, use our dedicated script:
```bash
# For lessons table transcript column (modify for other tables/columns)
./scripts/add-transcript-column.sh

# For other tables, edit the script and replace the table and column names
```

### Creating Functions Safely

Always use this pattern when creating functions:

```sql
-- Drop the function first if it exists
DROP FUNCTION IF EXISTS function_name(param_type, param_type);

-- Then create the function
CREATE OR REPLACE FUNCTION function_name(
  param_name param_type,
  param_name param_type
) RETURNS return_type AS $$
BEGIN
  -- Function logic
END;
$$ LANGUAGE plpgsql;
```

### Handling Triggers

When creating triggers, always drop them first:

```sql
-- Remove the trigger if it exists
DROP TRIGGER IF EXISTS trigger_name ON table_name;

-- Create the trigger
CREATE TRIGGER trigger_name
BEFORE UPDATE ON table_name
FOR EACH ROW EXECUTE FUNCTION function_name();
```

### Applying Migrations Safely

**Never use `db reset` on a database with real data.** Instead:

```bash
# Apply migrations without resetting the database
./scripts/db-tools.sh apply-safe
```

### Recovering from Migration Failures

If a migration fails, follow these exact steps:

1. Check the error message carefully
2. Open the Supabase Studio:
   ```bash
   ./scripts/open-supabase-studio.sh
   ```
3. Manually apply the changes that failed:
   ```sql
   -- Example: Adding a column
   ALTER TABLE public.table_name ADD COLUMN IF NOT EXISTS column_name DATA_TYPE;
   
   -- Example: Creating a function
   CREATE OR REPLACE FUNCTION public.function_name() 
   RETURNS return_type AS $$ 
   BEGIN 
     -- Function logic 
   END; 
   $$ LANGUAGE plpgsql;
   ```
4. Regenerate TypeScript types:
   ```bash
   ./scripts/db-tools.sh types
   ```

### Rebuilding Data After Loss

If you've lost data, use this exact process:

1. Ensure your transcript column exists:
   ```bash
   ./scripts/add-transcript-column.sh
   ```
2. Open Supabase Studio:
   ```bash
   ./scripts/open-supabase-studio.sh
   ```
3. Run the data insertion SQL in the Studio SQL Editor:
   ```bash
   # Copy the contents of this file and paste into the SQL Editor
   cat scripts/insert-data.sql
   ```

### The Most Reliable Migration Pattern

Based on our experience, this exact migration pattern works most reliably:

1. Separate your migrations into multiple files:
   - First migration: Table structure changes only
   - Second migration: Function definitions
   - Third migration: Triggers and policies
   - Final migration: Data insertion/updates

2. For table changes:
   ```sql
   -- Add columns
   ALTER TABLE IF EXISTS table_name
     ADD COLUMN IF NOT EXISTS column1 TYPE1,
     ADD COLUMN IF NOT EXISTS column2 TYPE2;
   ```

3. For upserting data, create and use dedicated functions:
   ```sql
   -- Create a safe upserting function
   CREATE OR REPLACE FUNCTION upsert_record(
     p_id UUID,
     p_field1 TYPE,
     p_field2 TYPE
   ) RETURNS UUID AS $$
   DECLARE
     record_id UUID;
   BEGIN
     -- Check if record exists
     SELECT id INTO record_id FROM table_name WHERE id = p_id;
     
     IF record_id IS NOT NULL THEN
       -- Update
       UPDATE table_name SET
         field1 = p_field1,
         field2 = p_field2
       WHERE id = p_id;
     ELSE
       -- Insert
       INSERT INTO table_name (id, field1, field2)
       VALUES (p_id, p_field1, p_field2)
       RETURNING id INTO record_id;
     END IF;
     
     RETURN record_id;
   END;
   $$ LANGUAGE plpgsql;
   ```

## Supabase-Specific Tips

### 1. Reuse Existing Functions
Check for existing utility functions before creating new ones:
```sql
-- Example: handle_updated_at() is a common function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. Use DROP IF EXISTS
Always use DROP IF EXISTS to prevent errors:
```sql
DROP TRIGGER IF EXISTS handle_updated_at ON my_table;
DROP FUNCTION IF EXISTS my_function();
```

### 3. Test Migrations in Isolation
Test each migration separately before combining:
```bash
# Apply only the latest migration
npx supabase migration up --db-url postgresql://postgres:postgres@localhost:54322/postgres
```

### 4. Simplify RLS Policies
Keep RLS policies simple and consistent:
```sql
-- Example: Standard user-based RLS policy
CREATE POLICY "Users can only access their own data"
ON public.my_table
FOR ALL
USING (auth.uid()::text = user_id);
```

## Managing Multiple Development Ports

When running multiple instances of the development server, Vite automatically selects the next available port:

```
Port 8080 is in use, trying another one...
VITE v5.4.14  ready in 134 ms
➜  Local:   http://localhost:8081/
```

This is normal behavior. Always use the URL provided in the console for accessing your development server.

## Lessons Learned from Migration Issues

Based on our experience, here are key lessons for smoother migrations:

### 1. Understand the Schema First
Always explore the database before writing migrations. Use:
```bash
./scripts/db-inspect.sh
```

### 2. Keep Migrations Simple
Break complex migrations into multiple, smaller changes:
- First migration: Create basic tables
- Second migration: Add functions and triggers
- Third migration: Add RLS policies

### 3. Handle Dependencies Properly
When a migration includes functions/tables that depend on other objects:
- Check if dependent objects exist before using them
- Create dependencies first within the same migration
- Use `IF EXISTS` and `IF NOT EXISTS` liberally

### 4. Avoid Destructive Operations With Real Data
- Never use `db:reset` on a database with important data
- Always back up before schema changes
- Use confirmation prompts for destructive operations

### 5. Design with TypeScript in Mind
- Create database tables with TypeScript-friendly structures
- Generate types immediately after schema changes
- Design your mock data to match the actual database schema

## Common Pitfalls to Avoid

1. **Direct Schema Changes**: Never make schema changes directly in the Supabase Studio without creating a migration
2. **Schema Drift**: Keep mock data structures matching your database schema
3. **Missing Types**: Always regenerate TypeScript types after schema changes
4. **Forgotten RLS Policies**: Include security policies in your migrations
5. **Inconsistent Caching**: Update all related caches when mutating data
6. **Data Loss**: Using `db:reset` or `db:apply` on databases with real data
7. **Complex Single Migrations**: Trying to do too much in a single migration file

## Deploying to Production

When ready to deploy:

1. **Test in Production Mode Locally**
   - Set `VITE_DEV_MODE=false` in `.env`
   - Ensure your local Supabase is running
   - Verify all features work with real data

2. **Deploy Schema Changes**
   - Back up your production database first!
   - Apply migrations to your production Supabase instance
   - Verify schema changes are applied correctly

3. **Deploy Application Code**
   - Build and deploy your application code
   - Set `VITE_DEV_MODE=false` in production environment
   - Configure production Supabase URL and key

## Enhanced Utility Scripts

The following scripts are available to improve the development workflow:

1. **Database Inspection Script** (`db-inspect.sh`): 
   - Provides detailed information about the database schema
   - Lists tables, functions, triggers, and RLS policies
   - Shows table structures and relationships

2. **Column Addition Script** (`add-transcript-column.sh`):
   - Safely adds missing columns to tables
   - Tries multiple methods to ensure success
   - Provides fallback instructions for manual fixes

3. **Supabase Studio Helper** (`open-supabase-studio.sh`):
   - Opens the Supabase Studio UI
   - Includes instructions for manual data recovery
   - Provides SQL commands for data manipulation

4. **Sample Data Script** (`insert-data.sql`):
   - Contains SQL commands to insert sample data
   - Helps rebuild test data after schema changes

5. **Enhanced `db-tools.sh`**:
   - Added backup and restore commands
   - Improved error handling and feedback
   - Added confirmation prompts for destructive operations

## Cache Utilities Reference

Our new caching utilities provide a robust development experience:

### Mock Data Cache API

```typescript
// src/lib/mockDataCache.ts

/**
 * Cache data for development mode
 * @param key Unique key for the cached data
 * @param data Data to cache
 */
export function cacheMockData(key: string, data: any): void {
  if (import.meta.env.VITE_DEV_MODE !== 'true') return;
  
  try {
    localStorage.setItem(`mock_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to cache mock data for ${key}`, e);
  }
}

/**
 * Get cached data for development mode
 * @param key Unique key for the cached data
 * @param defaultValue Default value if cache miss
 * @returns Cached data or default value
 */
export function getCachedMockData<T>(key: string, defaultValue: T): T {
  if (import.meta.env.VITE_DEV_MODE !== 'true') return defaultValue;
  
  try {
    const item = localStorage.getItem(`mock_${key}`);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Failed to retrieve cached mock data for ${key}`, e);
    return defaultValue;
  }
}
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Migration Guide](https://supabase.com/docs/guides/database/migrations)
- [Tanstack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- Example Component: [SchemaExample.tsx](../components/examples/SchemaExample.tsx)
- [Scripts README](../../scripts/README.md) 