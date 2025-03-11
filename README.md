# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/29f138a1-e113-483f-802a-b1051187b38a

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
