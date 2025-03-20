# Database Management Scripts

This directory contains scripts to manage the Supabase database. These scripts are useful for seeding and maintaining the database.

## Available Scripts

### 1. `seedSupabase.ts`

Seeds the database with initial test data. Creates:
- A test user
- Master repertoire pieces
- Students
- Student repertoire
- Lessons
- Journal entries

Usage:
```
npx tsx src/scripts/seedSupabase.ts
```

### 2. `checkStudents.ts`

Checks the current students in the database and identifies duplicates.

Usage:
```
npx tsx src/scripts/checkStudents.ts
```

### 3. `cleanupDuplicateStudents.ts`

Cleans up duplicate students in the database by keeping only the most recent record for each student name. It handles dependent records like lessons and repertoire.

Usage:
```
npx tsx src/scripts/cleanupDuplicateStudents.ts
```

### 4. `fixStudentsRLS.ts`

Provides SQL to fix the Row Level Security (RLS) policy for the students table. This allows teachers to view all students in the database.

Usage:
```
npx tsx src/scripts/fixStudentsRLS.ts
```

### 5. `checkTables.ts`

Checks all tables in the Supabase database and verifies they're properly connected. This script:
- Verifies that all tables exist
- Counts records in each table
- Validates foreign key relationships
- Attempts to check RLS policies

Usage:
```
npx tsx src/scripts/checkTables.ts
```

### 6. `fixAllRLS.ts`

Fixes all RLS policies in the Supabase database to ensure proper access for teachers and students.
This script updates policies for:
- students
- master_repertoire
- student_repertoire
- lessons
- journal_entries

Usage:
```
npx tsx src/scripts/fixAllRLS.ts
```

Alternatively, you can run the SQL in `fix_rls.sql` directly in the Supabase SQL editor.

### 7. `dropRelationshipsTable.ts`

This script safely drops the unused `student_teacher_relationships` table after transitioning to the direct ownership model.
The script checks if:
- The table has any records
- Any other tables reference it
- RLS policies need to be dropped first

Usage:
```
npx tsx src/scripts/dropRelationshipsTable.ts
```

## Database Models

### Direct Ownership Model

The application uses a direct ownership model for linking students to teachers:
- Students are directly linked to their teacher via the `user_id` field in the `students` table
- This field contains the UUID of the teacher who owns/manages the student
- This approach simplifies queries and RLS policies compared to using a relationship table

Benefits of this model:
- Simpler data structure
- More efficient queries
- Easier to maintain
- Better matches the app's use case where students typically have one primary teacher

## Database Troubleshooting Scripts

### Database Issues

If you encounter issues with your database:

1. **No students showing up in the UI**
   - Check that the user has a teacher role in the user_roles table
   - Verify that RLS policies are set correctly in Supabase
   - Ensure there is data in the students table

2. **RLS Policy Issues**
   - Open the Supabase dashboard SQL Editor
   - Configure RLS policies to allow teachers to see all student data
   - Ensure students can only see their own data

3. **Missing Data**
   - Use the seeding script to add test data:
     ```bash
     npx tsx src/scripts/seedSupabase.ts
     ```

## Database Issues Resolution

### Duplicate Students

If you see duplicate students in the Supabase database (multiple copies of the same student with different IDs), this is caused by running the seed script multiple times. To fix this:

1. Run `checkStudents.ts` to identify duplicates
2. Run `cleanupDuplicateStudents.ts` to remove duplicates
3. Restart the dev server to see the changes

### RLS Policy Issues

If teachers can't see students in the database, it's likely due to restrictive Row Level Security (RLS) policies. To fix this:

1. Run `checkTables.ts` to identify which tables have issues
2. Run `fixAllRLS.ts` to update all RLS policies at once
3. Restart the dev server to see the changes

The proper RLS policies allow users with the teacher role to see all students and their related data in the database.

### Table Relationship Issues

If you're seeing issues with related data not showing up (e.g., student repertoire not showing for a student), it may be due to foreign key relationship issues. To fix this:

1. Run `checkTables.ts` to identify foreign key relationship issues
2. Fix any broken relationships manually or re-run the seed script
3. Restart the dev server to see the changes

# Student Data Enhancement Scripts

This directory contains scripts to enhance student data in the Supabase database for development purposes.

## What We've Done

The scripts in this directory help complete student profiles in the database. Currently, we've successfully:

- Updated basic student information (academic year, email, phone, etc.)
- Added formatted lesson dates for each student
- Set proper next lesson text for all students

## What We Couldn't Do

Due to Supabase Row Level Security (RLS) policies, our scripts couldn't:

- Add repertoire pieces (current and completed) to students
- Add lesson history with details
- Connect lessons to repertoire

This is because these operations require admin access or a service role key.

## How to Fully Enhance Student Data

To fully enhance student data with repertoire and lesson history, follow these steps:

1. **Get a Service Role Key**:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Find the "service_role" key (never expose this in client-side code)

2. **Update Your Script**:
   - Make a copy of the `enhance-student-data.ts` script and name it `enhance-student-data-admin.ts`
   - Replace the `supabase` client initialization with:
   
   ```typescript
   const supabaseAdmin = createClient(supabaseUrl, YOUR_SERVICE_ROLE_KEY, {
     auth: {
       persistSession: false,
       autoRefreshToken: false
     }
   });
   ```
   
   - Use `supabaseAdmin` throughout the script instead of the regular client

3. **Restore Code for Repertoire and Lessons**:
   - Restore the commented sections for creating master repertoire
   - Restore the sections for adding current and completed repertoire
   - Restore the lesson history creation functionality

4. **Run the Enhanced Script**:
   - Run the script with `npx tsx src/scripts/enhance-student-data-admin.ts`
   - This should fully populate student profiles with all required data

## Data Enhancement Specifications

For each student, the ideal data setup should include:

1. **Complete Student Profile**:
   - Academic year (e.g., "1st year Masters")
   - Email and phone number
   - Start date and last lesson date

2. **Repertoire**:
   - 3-5 current pieces with appropriate notes
   - 5-10 completed pieces with dates and performance notes

3. **Lesson History**:
   - 3-5 past lessons with appropriate dates
   - Each lesson connected to 2-3 repertoire pieces
   - Each lesson having summary, notes, and timing information

## Caution

- Never use service role keys in client-side code
- The scripts should only be run in development environment
- Be careful not to overwrite real user data in production

For more information, see the full script implementation in `enhance-student-data.ts`. 