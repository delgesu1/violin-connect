# Migration Templates

These are proven, reliable migration templates based on our experience. Use these templates to avoid trial and error when creating new migrations.

## How to Use These Templates

1. When creating a new migration, use these templates as a starting point:
   ```bash
   # Create a new migration
   ./scripts/db-tools.sh migration my_feature_name
   ```

2. Copy the relevant parts from these templates into your new migration file.

3. Replace the placeholder names with your actual table and column names.

4. Follow the proven pattern of separating concerns:
   - Table structure changes
   - Function definitions
   - Triggers and policies
   - Data operations

## Template Descriptions

### 01_table_structure.sql
- Patterns for creating new tables
- Patterns for adding columns to existing tables
- Patterns for adding constraints and indexes
- Enabling Row Level Security

### 02_functions.sql
- Pattern for utility functions like `handle_updated_at`
- Pattern for safe upsert functions
- Proper function drop and replacement

### 03_triggers_and_policies.sql
- Pattern for creating update triggers
- Patterns for Row Level Security (RLS) policies
- Proper trigger and policy dropping before creation

### 04_data_operations.sql
- Pattern for inserting data using upsert functions
- Pattern for bulk operations with transactions
- Pattern for direct SQL inserts with conflict handling

## Best Practices

1. **Always** test your migrations locally before applying them in production.
2. Use `IF EXISTS` and `IF NOT EXISTS` liberally to make migrations idempotent.
3. Break complex migrations into multiple files.
4. Apply migrations with the safe method:
   ```bash
   ./scripts/db-tools.sh apply-safe
   ```
5. Generate TypeScript types after applying migrations:
   ```bash
   ./scripts/db-tools.sh types
   ```

## When Things Go Wrong

If your migration fails:

1. Check the error message carefully.
2. Open Supabase Studio:
   ```bash
   ./scripts/open-supabase-studio.sh
   ```
3. Apply the failed changes manually in the SQL Editor.
4. Regenerate types:
   ```bash
   ./scripts/db-tools.sh types
   ``` 