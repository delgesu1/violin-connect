# Database Data Recovery Process

This document outlines the process for recovering lost data in the Violin Connect application database.

## Overview

We've created a safe migration process to restore lost data without risking existing data. The approach follows these principles:

1. **Non-destructive migrations**: We use `migration up` instead of `db reset` to preserve existing data
2. **Safe upsert functions**: We created functions that check if records exist before inserting/updating
3. **Backup first**: We always create a backup before applying any changes
4. **TypeScript integration**: We regenerate types after schema changes

## Recovery Scripts

We've created several scripts to facilitate the recovery process:

### 1. `scripts/rebuild-data.sh`

This is the main script for applying the migrations and rebuilding the data. It:
- Creates a backup of the current database
- Applies the migrations to update the schema and add the upsert functions
- Populates the database with the lost data
- Generates TypeScript types

Usage:
```bash
./scripts/rebuild-data.sh
```

### 2. `scripts/generate-data-migration.js`

This Node.js script can be used to generate a complete SQL migration file from JSON data. You can:
1. Edit the script to include all the JSON data
2. Run the script to generate a migration file
3. Apply the migration using the rebuild script

Usage:
```bash
node scripts/generate-data-migration.js
```

## Migration Files

The recovery process uses these migration files:

1. `supabase/migrations/20250314095020_rebuild_lessons_table.sql`
   - Adds missing columns to the lessons table
   - Creates the `upsert_lesson` function

2. `supabase/migrations/20250314095037_rebuild_journal_entries.sql`
   - Ensures the journal_entries table has all required fields
   - Creates the `upsert_journal_entry` function

3. `supabase/migrations/20250314095057_populate_data.sql`
   - Contains SQL to populate the database with the lost data
   - Uses the upsert functions to safely merge data

## Manual Data Recovery

If you need to manually recover additional data, you can:

1. Use the upsert functions directly in SQL:
   ```sql
   SELECT upsert_lesson(
     '4afd4fa0-47b1-4817-bb64-fc18a0fd33ba',  -- id
     '1333665c-ec92-47f1-adb1-99bfaecf25c1',  -- student_id
     '2023-10-15',                           -- date
     'Worked on B Major scale with focus on intonation of thirds. Discussed fingering options.', -- summary
     -- other fields...
   );
   ```

2. Edit the migration file and run the rebuild script again:
   ```bash
   # Edit the file
   nano supabase/migrations/20250314095057_populate_data.sql
   
   # Apply the changes
   ./scripts/rebuild-data.sh
   ```

## Verifying Recovery

After running the recovery process, you should:

1. Check that the data appears in the application
2. Verify that existing data was preserved
3. Ensure that the TypeScript types match the database schema

## Troubleshooting

If you encounter issues:

1. Check the backup file created by the rebuild script
2. Restore from backup if needed:
   ```bash
   npx supabase db restore backup_before_rebuild_TIMESTAMP.sql
   ```
3. Look for error messages in the migration output
4. Try running individual migrations manually:
   ```bash
   npx supabase migration up --to 20250314095020
   ``` 