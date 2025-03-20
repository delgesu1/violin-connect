#!/bin/bash

# Color codes for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking Supabase server status...${NC}"

# Check if Supabase is running
if ! npx supabase status | grep -q "Started"; then
  echo -e "${YELLOW}Supabase is not running. Starting Supabase...${NC}"
  npx supabase start
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start Supabase. Please check your Supabase installation.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}Supabase is already running.${NC}"
fi

echo -e "${BLUE}Adding transcript column to lessons table...${NC}"

# Try different methods to add the column
echo -e "${YELLOW}Method 1: Using supabase db execute...${NC}"
npx supabase db execute "ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS transcript TEXT;"

if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Method 1 failed. Trying Method 2: Using direct SQL connection...${NC}"
  
  # Get database connection details
  DB_URL=$(npx supabase status | grep -o "DB URL: .*" | sed 's/DB URL: //')
  
  if [ -z "$DB_URL" ]; then
    echo -e "${RED}Could not determine database URL. Please add the column manually using Supabase Studio.${NC}"
    echo -e "${YELLOW}Instructions:${NC}"
    echo -e "1. Open Supabase Studio at http://127.0.0.1:54323"
    echo -e "2. Go to the SQL Editor"
    echo -e "3. Run the following SQL command:"
    echo -e "   ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS transcript TEXT;"
  else
    # Extract connection details from URL
    DB_HOST=$(echo $DB_URL | grep -o "postgres://[^:]*:[^@]*@[^:]*" | sed 's/postgres:\/\/[^:]*:[^@]*@//')
    DB_PORT=$(echo $DB_URL | grep -o ":[0-9]*/" | sed 's/[:/]//g')
    DB_USER=$(echo $DB_URL | grep -o "postgres://[^:]*" | sed 's/postgres:\/\///')
    DB_PASS=$(echo $DB_URL | grep -o ":[^@]*@" | sed 's/[:@]//g')
    DB_NAME=$(echo $DB_URL | grep -o "/[^?]*" | sed 's/\///')
    
    echo -e "${YELLOW}Attempting to connect to database and add column...${NC}"
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS transcript TEXT;"
    
    if [ $? -ne 0 ]; then
      echo -e "${RED}Method 2 failed. Please add the column manually using Supabase Studio.${NC}"
    else
      echo -e "${GREEN}Successfully added transcript column to lessons table.${NC}"
    fi
  fi
else
  echo -e "${GREEN}Successfully added transcript column to lessons table.${NC}"
fi

echo -e "${BLUE}Column addition process completed.${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Open Supabase Studio at http://127.0.0.1:54323"
echo -e "2. Go to the SQL Editor"
echo -e "3. Run the SQL commands from scripts/insert-data.sql to insert sample data"
echo -e "4. Verify the data was inserted correctly by checking the tables in the Table Editor"

exit 0 