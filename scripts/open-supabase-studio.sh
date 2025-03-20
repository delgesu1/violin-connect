#!/bin/bash
# Script to open the Supabase Studio UI

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}   Opening Supabase Studio          ${NC}"
echo -e "${BLUE}=====================================${NC}"

# Check if the supabase server is running
if ! npx supabase status | grep -q "is running"; then
  echo -e "${YELLOW}Starting Supabase...${NC}"
  npx supabase start
fi

# Get the Studio URL
STUDIO_URL=$(npx supabase status | grep "Studio URL" | awk '{print $3}')

if [ -z "$STUDIO_URL" ]; then
  echo -e "${RED}Error: Could not determine Supabase Studio URL.${NC}"
  echo -e "Please start Supabase manually with: ${YELLOW}npx supabase start${NC}"
  exit 1
fi

echo -e "${GREEN}Opening Supabase Studio at: ${STUDIO_URL}${NC}"
echo -e "${YELLOW}Instructions for manual data recovery:${NC}"
echo -e "1. Click on 'Table Editor' in the left sidebar"
echo -e "2. Find and select the 'lessons' table"
echo -e "3. Click on 'Edit' to modify the table structure"
echo -e "4. Add the 'transcript' column with type 'text'"
echo -e "5. Click 'Save' to apply the changes"
echo -e "6. Use the SQL Editor to run the following commands to add the upsert functions:"
echo -e "${GREEN}
CREATE OR REPLACE FUNCTION upsert_lesson(
  p_id UUID,
  p_student_id UUID,
  p_date DATE,
  p_summary TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_created_at TIMESTAMPTZ DEFAULT now(),
  p_updated_at TIMESTAMPTZ DEFAULT now(),
  p_teacher_id UUID DEFAULT NULL,
  p_start_time TIME DEFAULT NULL,
  p_end_time TIME DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'scheduled',
  p_ai_summary TEXT DEFAULT NULL,
  p_transcript TEXT DEFAULT NULL
) RETURNS UUID AS \$\$
DECLARE
  lesson_id UUID;
BEGIN
  -- Check if the lesson already exists
  SELECT id INTO lesson_id FROM lessons WHERE id = p_id;
  
  IF lesson_id IS NOT NULL THEN
    -- Update existing lesson
    UPDATE lessons SET
      student_id = p_student_id,
      date = p_date,
      summary = p_summary,
      notes = p_notes,
      teacher_id = p_teacher_id,
      start_time = p_start_time,
      end_time = p_end_time,
      location = p_location,
      status = p_status,
      ai_summary = p_ai_summary,
      transcript = p_transcript,
      updated_at = p_updated_at
    WHERE id = p_id;
  ELSE
    -- Insert new lesson
    INSERT INTO lessons (
      id, student_id, date, summary, notes, created_at, updated_at,
      teacher_id, start_time, end_time, location, status, ai_summary, transcript
    ) VALUES (
      p_id, p_student_id, p_date, p_summary, p_notes, p_created_at, p_updated_at,
      p_teacher_id, p_start_time, p_end_time, p_location, p_status, p_ai_summary, p_transcript
    )
    RETURNING id INTO lesson_id;
  END IF;
  
  RETURN lesson_id;
END;
\$\$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION upsert_journal_entry(
  p_id UUID,
  p_user_id UUID,
  p_date DATE,
  p_practice_goals TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_went_well TEXT DEFAULT NULL,
  p_beautified TEXT DEFAULT NULL,
  p_frustrations TEXT DEFAULT NULL,
  p_improvements TEXT DEFAULT NULL,
  p_created_at TIMESTAMPTZ DEFAULT now(),
  p_updated_at TIMESTAMPTZ DEFAULT now()
) RETURNS UUID AS \$\$
DECLARE
  entry_id UUID;
BEGIN
  -- Check if the entry already exists
  SELECT id INTO entry_id FROM journal_entries WHERE id = p_id;
  
  IF entry_id IS NOT NULL THEN
    -- Update existing entry
    UPDATE journal_entries SET
      user_id = p_user_id,
      date = p_date,
      practice_goals = p_practice_goals,
      notes = p_notes,
      went_well = p_went_well,
      beautified = p_beautified,
      frustrations = p_frustrations,
      improvements = p_improvements,
      updated_at = p_updated_at
    WHERE id = p_id;
  ELSE
    -- Insert new entry
    INSERT INTO journal_entries (
      id, user_id, date, practice_goals, notes, went_well, beautified, 
      frustrations, improvements, created_at, updated_at
    ) VALUES (
      p_id, p_user_id, p_date, p_practice_goals, p_notes, p_went_well, p_beautified,
      p_frustrations, p_improvements, p_created_at, p_updated_at
    )
    RETURNING id INTO entry_id;
  END IF;
  
  RETURN entry_id;
END;
\$\$ LANGUAGE plpgsql;
${NC}"

# Open the Studio URL in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$STUDIO_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open "$STUDIO_URL"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  start "$STUDIO_URL"
else
  echo -e "${YELLOW}Could not automatically open the browser.${NC}"
  echo -e "Please manually open: ${STUDIO_URL}"
fi 