#!/bin/bash
# Example migration script for Violin Connect
# This demonstrates a safe workflow for adding a new table

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}   Migration Workflow Example        ${NC}"
echo -e "${BLUE}=====================================${NC}"

echo -e "\n${YELLOW}This script demonstrates a safe migration workflow${NC}"
echo -e "It will guide you through creating a notes table as an example"

echo -e "\n${BLUE}Step 1: Start Supabase and inspect current schema${NC}"
read -p "Press Enter to start Supabase... " -r

./scripts/db-tools.sh start

echo -e "\n${BLUE}Step 2: Inspect your current database schema${NC}"
echo -e "This helps you understand what already exists before making changes"
read -p "Press Enter to inspect the schema... " -r

./scripts/db-tools.sh inspect

echo -e "\n${BLUE}Step 3: Create a new migration${NC}"
echo -e "This creates a timestamped SQL file where you'll define your schema changes"
read -p "Press Enter to create the migration... " -r

./scripts/db-tools.sh migration add_notes_table

echo -e "\n${YELLOW}Now let's edit the migration file to create a notes table${NC}"
echo -e "The migration file is located in supabase/migrations/ directory"
echo -e "For this example, I'll provide sample SQL to copy:"

echo -e "\n${GREEN}-- Create a simple notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own notes
CREATE POLICY \"Users can manage their own notes\" 
ON public.notes FOR ALL 
USING (auth.uid()::text = user_id);

-- Updated at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();${NC}"

echo -e "\n${YELLOW}After adding this SQL to your migration file, press Enter to continue...${NC}"
read -r

echo -e "\n${BLUE}Step 4: Safely apply the migration${NC}"
echo -e "This applies migrations without resetting your database, preserving your data"
read -p "Press Enter to apply the migration... " -r

./scripts/db-tools.sh apply-safe

echo -e "\n${BLUE}Step 5: Generate TypeScript types${NC}"
echo -e "This creates TypeScript types from your updated schema"
read -p "Press Enter to generate types... " -r

./scripts/db-tools.sh types

echo -e "\n${BLUE}Step 6: Implement features using the new schema${NC}"
echo -e "At this point, you'd create hooks and components that use the new notes table"
echo -e "Don't forget to create matching mock data for development mode"

echo -e "\n${GREEN}Congratulations! You've completed the safe migration workflow example.${NC}"
echo -e "Your database now has a notes table, and TypeScript types have been updated."
echo -e "\nRemember:"
echo -e "  - Always inspect the schema before creating migrations"
echo -e "  - Use safe migrations whenever possible"
echo -e "  - Test in both development and production modes"
echo -e "  - Create matching mock data for development mode" 