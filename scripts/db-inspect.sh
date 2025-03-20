#!/bin/bash
# Database inspection toolkit for Supabase
# Use this before migrations to understand your schema

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}   Supabase Database Inspector      ${NC}"
echo -e "${BLUE}=====================================${NC}"

# We'll skip the check since Supabase appears to be running
echo -e "${YELLOW}Attempting to connect to Supabase database...${NC}"

# Check if we're running in piped mode (for saving output)
if [ -t 1 ]; then
  # Interactive terminal - show full output
  INTERACTIVE=true
else
  # Being piped - provide minimal output
  INTERACTIVE=false
fi

echo -e "\n${GREEN}Listing tables...${NC}"
npx supabase db execute "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

echo -e "\n${GREEN}Listing functions...${NC}"
npx supabase db execute "SELECT routine_schema, routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;"

echo -e "\n${GREEN}Listing triggers...${NC}"
npx supabase db execute "SELECT event_object_table AS table_name, trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY event_object_table, trigger_name;"

echo -e "\n${GREEN}Listing RLS policies...${NC}"
npx supabase db execute "SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;"

# Check for a specific table structure
if [ "$1" != "" ]; then
  echo -e "\n${GREEN}Inspecting table: $1${NC}"
  npx supabase db execute "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '$1' ORDER BY ordinal_position;"
fi

echo -e "\n${BLUE}===================${NC}"
echo -e "${BLUE}   Tips for usage   ${NC}"
echo -e "${BLUE}===================${NC}"
echo -e " * Run with table name to inspect: ${YELLOW}./scripts/db-inspect.sh table_name${NC}"
echo -e " * Save output to file: ${YELLOW}./scripts/db-inspect.sh > schema_info.txt${NC}"
echo -e " * Run before creating migrations to avoid conflicts" 