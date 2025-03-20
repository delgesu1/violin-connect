#!/bin/bash

# Script to create a migration with proven patterns
# Usage: ./scripts/create-migration.sh feature_name [--table] [--function] [--policy] [--data]

# Color codes for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if feature name is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Migration name is required.${NC}"
  echo -e "Usage: ./scripts/create-migration.sh feature_name [--table] [--function] [--policy] [--data]"
  echo -e "Options:"
  echo -e "  --table     Include table structure template"
  echo -e "  --function  Include function template"
  echo -e "  --policy    Include policies and triggers template"
  echo -e "  --data      Include data operations template"
  echo -e "  --all       Include all templates (default)"
  exit 1
fi

FEATURE_NAME=$1
shift

# Default to including all templates
INCLUDE_TABLE=false
INCLUDE_FUNCTION=false
INCLUDE_POLICY=false
INCLUDE_DATA=false

# Parse options
if [ $# -eq 0 ]; then
  # No options, include all
  INCLUDE_TABLE=true
  INCLUDE_FUNCTION=true
  INCLUDE_POLICY=true
  INCLUDE_DATA=true
else
  while [ $# -gt 0 ]; do
    case "$1" in
      --table)
        INCLUDE_TABLE=true
        ;;
      --function)
        INCLUDE_FUNCTION=true
        ;;
      --policy)
        INCLUDE_POLICY=true
        ;;
      --data)
        INCLUDE_DATA=true
        ;;
      --all)
        INCLUDE_TABLE=true
        INCLUDE_FUNCTION=true
        INCLUDE_POLICY=true
        INCLUDE_DATA=true
        ;;
      *)
        echo -e "${RED}Unknown option: $1${NC}"
        exit 1
        ;;
    esac
    shift
  done
fi

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}   Creating Migration: ${FEATURE_NAME}   ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Create the migration
echo -e "${YELLOW}Creating base migration file...${NC}"
npx supabase migration new "$FEATURE_NAME"

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to create migration.${NC}"
  exit 1
fi

# Find the newly created migration file
MIGRATION_FILE=$(find supabase/migrations -type f -name "*_${FEATURE_NAME}.sql" | sort -r | head -n 1)

if [ -z "$MIGRATION_FILE" ]; then
  echo -e "${RED}Error: Could not find the created migration file.${NC}"
  exit 1
fi

echo -e "${GREEN}Migration file created: ${MIGRATION_FILE}${NC}"

# Add a header to the migration file
echo -e "${YELLOW}Adding templates to migration file...${NC}"

# Start with an empty file
echo "-- Migration: ${FEATURE_NAME}" > "$MIGRATION_FILE"
echo "-- Created: $(date)" >> "$MIGRATION_FILE"
echo "" >> "$MIGRATION_FILE"

# Add table structure template if requested
if [ "$INCLUDE_TABLE" = true ]; then
  echo -e "${BLUE}Adding table structure template...${NC}"
  echo "-- =====================" >> "$MIGRATION_FILE"
  echo "-- TABLE STRUCTURE" >> "$MIGRATION_FILE"
  echo "-- =====================" >> "$MIGRATION_FILE"
  echo "" >> "$MIGRATION_FILE"
  cat scripts/template-migrations/01_table_structure.sql >> "$MIGRATION_FILE"
  echo "" >> "$MIGRATION_FILE"
  echo "" >> "$MIGRATION_FILE"
fi

# Add function template if requested
if [ "$INCLUDE_FUNCTION" = true ]; then
  echo -e "${BLUE}Adding function template...${NC}"
  echo "-- =====================" >> "$MIGRATION_FILE"
  echo "-- FUNCTIONS" >> "$MIGRATION_FILE"
  echo "-- =====================" >> "$MIGRATION_FILE"
  echo "" >> "$MIGRATION_FILE"
  cat scripts/template-migrations/02_functions.sql >> "$MIGRATION_FILE"
  echo "" >> "$MIGRATION_FILE"
  echo "" >> "$MIGRATION_FILE"
fi

# Add policy template if requested
if [ "$INCLUDE_POLICY" = true ]; then
  echo -e "${BLUE}Adding policy and trigger template...${NC}"
  echo "-- =====================" >> "$MIGRATION_FILE"
  echo "-- TRIGGERS AND POLICIES" >> "$MIGRATION_FILE"
  echo "-- =====================" >> "$MIGRATION_FILE"
  echo "" >> "$MIGRATION_FILE"
  cat scripts/template-migrations/03_triggers_and_policies.sql >> "$MIGRATION_FILE"
  echo "" >> "$MIGRATION_FILE"
  echo "" >> "$MIGRATION_FILE"
fi

# Add data operations template if requested
if [ "$INCLUDE_DATA" = true ]; then
  echo -e "${BLUE}Adding data operations template...${NC}"
  echo "-- =====================" >> "$MIGRATION_FILE"
  echo "-- DATA OPERATIONS" >> "$MIGRATION_FILE"
  echo "-- =====================" >> "$MIGRATION_FILE"
  echo "" >> "$MIGRATION_FILE"
  cat scripts/template-migrations/04_data_operations.sql >> "$MIGRATION_FILE"
  echo "" >> "$MIGRATION_FILE"
fi

echo -e "${GREEN}Migration template created successfully!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Edit ${MIGRATION_FILE} to replace placeholders with your actual table and column names"
echo -e "2. Apply the migration with: ${BLUE}./scripts/db-tools.sh apply-safe${NC}"
echo -e "3. Generate TypeScript types with: ${BLUE}./scripts/db-tools.sh types${NC}"
echo ""
echo -e "${BLUE}Opening the migration file for editing...${NC}"

# Try to open the file in the default editor
if [ -n "$EDITOR" ]; then
  $EDITOR "$MIGRATION_FILE"
elif command -v code > /dev/null; then
  code "$MIGRATION_FILE"
elif command -v nano > /dev/null; then
  nano "$MIGRATION_FILE"
elif command -v vim > /dev/null; then
  vim "$MIGRATION_FILE"
else
  echo -e "${YELLOW}Please open and edit the migration file:${NC} $MIGRATION_FILE"
fi

exit 0 