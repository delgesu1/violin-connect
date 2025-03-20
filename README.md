# Welcome to your Lovable project

## Quick Links

- [**Development Workflow Guide**](./src/docs/DEVELOPMENT_WORKFLOW.md) - Best practices for schema-first development
- [**Database Tools Script**](./scripts/db-tools.sh) - Helpful commands for database management

## Project info

**URL**: https://lovable.dev/projects/29f138a1-e113-483f-802a-b1051187b38a

## Project Architecture

This project follows a feature-based organization pattern to improve maintainability and separation of concerns. For detailed information about the codebase structure, see the [src/README.md](src/README.md) file.

### Key Features

- **Feature-Based Organization**: Code is organized by feature rather than technical concerns
- **Clear Boundaries**: Features have explicit boundaries with well-defined APIs
- **Core UI Library**: Reusable UI components organized by purpose
- **Path Aliases**: Simplified imports with @features/, @core/, and @app/ aliases

### Development Workflow

When working on a feature:

1. Locate the feature directory in src/features/
2. Use existing components and hooks from the feature directories
3. Import from other features only through their public exports
4. Place shared code in the core directory

## Violin Connect - Repertoire Migration Tools

This project includes several tools for migrating the Violin Connect application's repertoire data from directly embedded title/composer properties to the new normalized model using masterPieceId references.

### Migration Documentation

Find the complete documentation about the migration process in:
- [Repertoire Migration Guide](./src/docs/REPERTOIRE_MIGRATION_GUIDE.md)

### Migration Tools

The following tools are available in the application to help with testing and monitoring the migration:

1. **Migration Testing Tool** - Located on the Students page in the "Migration Test" tab. This tool allows:
   - Viewing the current migration status (progress, statistics)
   - Testing individual piece migration to see the before/after changes
   - Running the migration process on all pieces in the application

2. **Migration Utility Functions** - Located in `src/lib/migrations/`:
   - `migrate-all-pieces.ts` - Functions for migrating all pieces in the application
   - `migrate-repertoire-pieces.ts` - Functions for migrating individual pieces or collections
   - `run-migrations.ts` - Functions for running all migrations at application startup

3. **RepertoireContext** - The application context now includes additional functions:
   - `refreshMasterRepertoire` - Update the master repertoire list after a migration
   - `updateStudentsList` - Update all students data after a migration

### Using the Migration Tools

To access the migration tools:
1. Go to the Students page
2. Select any student to view their details
3. Click on the "Migration Test" tab

From this tab, you can:
- View the current migration status across all students and lessons
- Run a migration on a sample piece to see the before/after changes
- Execute a migration across all pieces in the application

During the migration process, the application will:
1. Find all pieces across all students and lessons that don't have a masterPieceId
2. Try to match them with existing master repertoire pieces based on title and composer
3. For unmatched pieces, create new master repertoire entries
4. Update all references to use the new masterPieceId-based approach

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/29f138a1-e113-483f-802a-b1051187b38a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/29f138a1-e113-483f-802a-b1051187b38a) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Database Management

### RLS Policies

To ensure proper data access in Supabase, you need to configure Row Level Security (RLS) policies. These policies determine which users can access which data.

#### Fixing RLS Policies

1. Open the Supabase dashboard for your project
2. Navigate to the SQL Editor
3. Open the `fix_all_rls.sql` file from the project root
4. Copy and paste the SQL code into the SQL Editor
5. Click "Run" to execute the SQL commands

The RLS policies will be configured to:
- Allow teachers to view all students and their related data
- Allow students to only view their own data
- Properly secure all tables in the database

### Database Tables

The application uses the following main tables:
- `profiles` - User profiles
- `students` - Student information
- `master_repertoire` - Music repertoire catalog
- `student_repertoire` - Assigned repertoire for students
- `lessons` - Lesson records
- `lesson_repertoire` - Repertoire covered in lessons
- `invitations` - Student invitations
- `user_roles` - User role assignments
- `journal_entries` - Practice journal entries

### Seeding Data

If you need to seed the database with initial data:

```bash
npx tsx src/scripts/seedSupabase.ts
```

For more database management scripts, see the `/src/scripts` directory and its README.

## Troubleshooting

### Database Issues

If you're experiencing issues with the database or not seeing data in the application:

1. **Supabase Configuration**
   - Ensure your Supabase instance is running
   - Check that your authentication is working correctly
   - Verify your database tables are set up with the correct schema

2. **Row Level Security (RLS)**
   - Ensure users have the correct roles assigned in the user_roles table
   - Check that RLS policies are properly configured for all tables
   - Teachers need the 'teacher' role to view student data

3. **Missing Data**
   - Use the seeding script to add test data if needed:
     ```bash
     npx tsx src/scripts/seedSupabase.ts
     ```

For more database management scripts and detailed instructions, see the [scripts README](src/scripts/README.md).

# Violin Connect

A practice journal and repertoire management app for violin students and teachers.

## Development Workflow

This project uses a hybrid approach with mock data for development while maintaining Supabase schema compatibility.

### Setting Up Development Environment

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Start Supabase with CORS**
   ```bash
   chmod +x start-supabase.sh
   ./start-supabase.sh
   ```

3. **Apply Database Schema**
   ```bash
   supabase db reset
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Development Workflow with Schema Tracking

This project uses a dual-mode approach to development:

1. **Development Mode (`VITE_DEV_MODE=true`)**
   - Uses mock data for faster development
   - No need for Supabase connection
   - Set in `.env` file

2. **Production Mode (`VITE_DEV_MODE=false`)**
   - Uses real Supabase connection
   - Requires running Supabase locally
   - Requires proper authentication

### How to Add New Database Features

1. **Create a Migration**
   ```bash
   supabase migration new add_my_feature
   ```

2. **Edit Migration File**
   Edit the generated SQL file in `supabase/migrations/` with your schema changes.

3. **Apply Migration**
   ```bash
   supabase db reset
   ```

4. **Update TypeScript Types**
   ```bash
   supabase gen types typescript --local > src/types/supabase.ts
   ```

5. **Implement Feature with Mock Data**
   Create your feature using the mock data approach, following the patterns in existing hooks.

### Switching Between Modes

Toggle `VITE_DEV_MODE` in `.env` to switch between development and production modes:

```
VITE_DEV_MODE=true  # Use mock data
VITE_DEV_MODE=false # Use real Supabase connection
```

### Preparing for Production

1. **Test in Production Mode Locally**
   - Set `VITE_DEV_MODE=false`
   - Ensure Supabase is running
   - Verify everything works

2. **Deploy Supabase Schema**
   - Push migrations to production Supabase instance
   - Update environment variables
