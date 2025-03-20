#!/bin/bash
# Database workflow helper script for Violin Connect

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Display header
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}   Violin Connect Database Tools     ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to confirm destructive operations
confirm_destructive_operation() {
  local operation=$1
  echo -e "${RED}WARNING: This operation will DELETE ALL DATA in your local database!${NC}"
  echo -e "${YELLOW}It is recommended to create a backup before proceeding.${NC}"
  echo -e "Would you like to create a backup first? (y/n)"
  read -r create_backup
  
  if [[ $create_backup =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Creating database backup...${NC}"
    backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    npx supabase db dump > "$backup_file"
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Backup created successfully: $backup_file${NC}"
    else
      echo -e "${RED}Failed to create backup. Operation aborted.${NC}"
      return 1
    fi
  fi
  
  echo -e "${RED}Are you ABSOLUTELY SURE you want to $operation? This cannot be undone!${NC}"
  echo -e "Type 'YES' (all caps) to confirm:"
  read -r confirmation
  
  if [ "$confirmation" != "YES" ]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    return 1
  fi
  
  return 0
}

case "$1" in
  start)
    echo -e "${GREEN}Starting Supabase with CORS enabled...${NC}"
    chmod +x start-supabase.sh && ./start-supabase.sh
    ;;
  
  migration)
    if [ -z "$2" ]; then
      echo -e "${RED}Error: Migration name required${NC}"
      echo -e "Usage: ./db-tools.sh migration <migration_name>"
      exit 1
    fi
    echo -e "${GREEN}Creating new migration: $2${NC}"
    npx supabase migration new "$2"
    echo -e "${YELLOW}Migration created. Edit the SQL file in supabase/migrations/ folder${NC}"
    echo -e "${BLUE}TIP: Run './db-inspect.sh' to understand existing schema before writing SQL${NC}"
    echo -e "${BLUE}TIP: Use './db-migrate-safe.sh' to apply migrations without data loss${NC}"
    ;;
  
  apply)
    echo -e "${YELLOW}You are about to apply migrations using 'db reset' which will erase all data.${NC}"
    confirm_destructive_operation "apply"
    echo -e "${GREEN}Applying migrations to local database...${NC}"
    npx supabase db reset
    echo -e "${GREEN}Migrations applied successfully!${NC}"
    ;;
  
  apply-safe)
    echo -e "${GREEN}Safely applying migrations without data loss...${NC}"
    chmod +x ./scripts/db-migrate-safe.sh && ./scripts/db-migrate-safe.sh
    ;;
  
  types)
    echo -e "${GREEN}Generating TypeScript types from database schema...${NC}"
    npx supabase gen types typescript --local > src/types/supabase.ts
    echo -e "${GREEN}Types generated in src/types/supabase.ts${NC}"
    ;;
  
  reset)
    echo -e "${RED}⚠️ CAUTION: You are about to RESET your database!${NC}"
    confirm_destructive_operation "reset"
    echo -e "${YELLOW}Resetting local database and regenerating types...${NC}"
    npx supabase db reset
    npx supabase gen types typescript --local > src/types/supabase.ts
    echo -e "${GREEN}Database reset and types regenerated!${NC}"
    ;;
  
  inspect)
    echo -e "${GREEN}Inspecting database schema...${NC}"
    chmod +x ./scripts/db-inspect.sh && ./scripts/db-inspect.sh
    ;;
  
  dev)
    echo -e "${GREEN}Starting development server...${NC}"
    npm run dev
    ;;
  
  backup)
    echo -e "${BLUE}Creating database backup...${NC}"
    backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    npx supabase db dump > "$backup_file"
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Backup created successfully: $backup_file${NC}"
    else
      echo -e "${RED}Failed to create backup.${NC}"
    fi
    ;;
  
  restore)
    if [ -z "$2" ]; then
      echo -e "${RED}Error: Backup file is required.${NC}"
      echo -e "Usage: ./db-tools.sh restore <backup_file>"
      exit 1
    fi
    
    if [ ! -f "$2" ]; then
      echo -e "${RED}Error: Backup file '$2' not found.${NC}"
      exit 1
    fi
    
    echo -e "${YELLOW}WARNING: This will overwrite your current database with the backup.${NC}"
    echo -e "Are you sure you want to proceed? (y/n)"
    read -r confirmation
    
    if [[ $confirmation =~ ^[Yy]$ ]]; then
      echo -e "${BLUE}Restoring database from backup: $2${NC}"
      npx supabase db restore "$2"
      
      if [ $? -eq 0 ]; then
        echo -e "${GREEN}Database restored successfully.${NC}"
      else
        echo -e "${RED}Failed to restore database.${NC}"
      fi
    else
      echo -e "${YELLOW}Restore operation cancelled.${NC}"
    fi
    ;;
  
  *)
    echo -e "${BLUE}Violin Connect Database Tools${NC}"
    echo ""
    echo -e "Usage: ./db-tools.sh <command>"
    echo ""
    echo "Commands:"
    echo -e "  ${YELLOW}start${NC}       Start Supabase with CORS enabled"
    echo -e "  ${YELLOW}migration${NC}   Create a new migration (./db-tools.sh migration <name>)"
    echo -e "  ${YELLOW}apply-safe${NC}  Apply migrations WITHOUT resetting the database (SAFE)"
    echo -e "  ${YELLOW}apply${NC}       Apply migrations by resetting the database (DELETES DATA)"
    echo -e "  ${YELLOW}types${NC}       Generate TypeScript types from database schema"
    echo -e "  ${YELLOW}reset${NC}       Reset database and regenerate types (DELETES DATA)"
    echo -e "  ${YELLOW}inspect${NC}     Inspect database schema before making changes"
    echo -e "  ${YELLOW}dev${NC}         Start development server"
    echo -e "  ${YELLOW}backup${NC}      Create a backup of the current database"
    echo -e "  ${YELLOW}restore${NC}     Restore database from a backup file"
    echo ""
    echo -e "Safe Development Workflow:"
    echo -e "  1. Start Supabase:   ${BLUE}./db-tools.sh start${NC}"
    echo -e "  2. Backup database:  ${BLUE}./db-tools.sh backup${NC}"
    echo -e "  3. Inspect schema:   ${BLUE}./db-tools.sh inspect${NC}"
    echo -e "  4. Create migration: ${BLUE}./db-tools.sh migration add_new_feature${NC}"
    echo -e "  5. Edit migration in supabase/migrations/ folder"
    echo -e "  6. Apply safely:     ${BLUE}./db-tools.sh apply-safe${NC}"
    echo -e "  7. Generate types:   ${BLUE}./db-tools.sh types${NC}"
    echo -e "  8. Start dev server: ${BLUE}./db-tools.sh dev${NC}"
    echo ""
    echo -e "See src/docs/DEVELOPMENT_WORKFLOW.md for more details"
    ;;
esac 