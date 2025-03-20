# Database Management Scripts

This directory contains scripts to help with database management, migrations, and data recovery for the Violin Connect application.

## Available Scripts

### Core Database Tools

- **`db-tools.sh`**: Main script for database management
  - `./db-tools.sh start` - Start Supabase with CORS enabled
  - `./db-tools.sh migration <name>` - Create a new migration
  - `./db-tools.sh apply-safe` - Apply migrations WITHOUT resetting the database (SAFE)
  - `./db-tools.sh apply` - Apply migrations by resetting the database (DELETES DATA)
  - `./db-tools.sh types` - Generate TypeScript types from database schema
  - `./db-tools.sh reset` - Reset database and regenerate types (DELETES DATA)
  - `./db-tools.sh inspect` - Inspect database schema before making changes
  - `./db-tools.sh dev` - Start development server
  - `./db-tools.sh backup` - Create a backup of the current database
  - `./db-tools.sh restore <backup_file>` - Restore database from a backup file

### Database Inspection

- **`db-inspect.sh`**: Detailed database schema inspection
  - Lists tables, functions, triggers, and RLS policies
  - Shows detailed table structures
  - Provides information about foreign key relationships

### Migration Management

- **`create-migration.sh`**: Creates migrations with proven templates
  - `./scripts/create-migration.sh feature_name` - Create a migration with all templates
  - `./scripts/create-migration.sh feature_name --table` - Include only table template
  - `./scripts/create-migration.sh feature_name --function` - Include only function template
  - `./scripts/create-migration.sh feature_name --policy` - Include only policy template
  - `./scripts/create-migration.sh feature_name --data` - Include only data template

- **`template-migrations/`**: Directory with proven migration templates
  - `01_table_structure.sql` - Template for table structure changes
  - `02_functions.sql` - Template for function definitions
  - `03_triggers_and_policies.sql` - Template for triggers and RLS policies
  - `04_data_operations.sql` - Template for data operations

### Data Recovery

- **`add-transcript-column.sh`**: Adds the transcript column to the lessons table
  - Tries multiple methods to add the column
  - Provides fallback instructions if automated methods fail

- **`open-supabase-studio.sh`**: Opens the Supabase Studio UI
  - Checks if Supabase is running and starts it if needed
  - Provides the Studio URL
  - Includes instructions for manual data recovery

- **`insert-data.sql`**: SQL script with sample data
  - Contains SQL commands to insert sample lessons and journal entries
  - Can be run in the Supabase Studio SQL Editor

### Example Workflows

- **`example-migration.sh`**: Demonstrates a safe migration workflow
  - Shows how to create and apply migrations
  - Includes example SQL for common operations

## Usage Examples

### Recommended Migration Workflow

```bash
# 1. Start Supabase
./db-tools.sh start

# 2. Create a backup
./db-tools.sh backup

# 3. Inspect the current schema
./db-inspect.sh

# 4. Create a new migration with proven templates
./scripts/create-migration.sh add_my_feature

# 5. Edit the migration file in supabase/migrations/

# 6. Apply the migration safely
./db-tools.sh apply-safe

# 7. Generate TypeScript types
./db-tools.sh types

# 8. Start the development server
./db-tools.sh dev
```

### Data Recovery

If you need to recover from a failed migration:

```bash
# 1. Restore from a backup
./db-tools.sh restore backup_20250314_123456.sql

# OR

# 2. Use manual recovery tools
./add-transcript-column.sh
./open-supabase-studio.sh
# Then run the SQL from insert-data.sql in the Studio
```

## Safety Measures

All destructive operations in these scripts include:
- Clear warnings about data loss
- Confirmation prompts
- Automatic backup options
- Detailed error messages

## Documentation

For more detailed information about database management and migrations, see:
- [Development Workflow Guide](../src/docs/DEVELOPMENT_WORKFLOW.md) 