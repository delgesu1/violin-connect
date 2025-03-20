#!/bin/bash
# Safe database migration script for Supabase
# Applies migrations without resetting the database

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}   Supabase Safe Migration Tool     ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if the supabase server is running
if ! npx supabase status | grep -q "Started"; then
  echo -e "${RED}Error: Supabase doesn't appear to be running.${NC}"
  echo -e "Please start Supabase with: ${YELLOW}npx supabase start${NC}"
  exit 1
fi

# Backup the database first
timestamp=$(date +%Y%m%d_%H%M%S)
backup_file="backup_${timestamp}.sql"
echo -e "\n${YELLOW}Creating database backup: ${backup_file}${NC}"
npx supabase db dump > "${backup_file}"

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to create backup.${NC}"
  echo -e "Please ensure Supabase is running correctly and try again."
  exit 1
fi

echo -e "${GREEN}Backup created successfully.${NC}"

# Apply migrations without resetting the database
echo -e "\n${YELLOW}Applying migrations...${NC}"
npx supabase migration up

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to apply migrations.${NC}"
  echo -e "You can restore the backup with: ${YELLOW}npx supabase db restore ${backup_file}${NC}"
  exit 1
fi

echo -e "${GREEN}Migrations applied successfully.${NC}"

# Generate TypeScript types
echo -e "\n${YELLOW}Generating TypeScript types...${NC}"
npx supabase gen types typescript --local > src/types/supabase.ts

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to generate TypeScript types.${NC}"
  echo -e "This doesn't affect your data, but you may need to manually update types."
  exit 1
fi

echo -e "${GREEN}TypeScript types generated successfully.${NC}"

echo -e "\n${BLUE}Migration completed successfully!${NC}"
echo -e "Your data has been preserved, migrations applied, and types updated."
echo -e "In case of issues, you can restore from: ${YELLOW}${backup_file}${NC}" 