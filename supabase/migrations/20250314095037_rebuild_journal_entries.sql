-- Migration to ensure the journal_entries table has all needed fields
-- This migration also adds a function to safely upsert journal entries

-- Ensure the journal_entries table exists with all required fields
-- (We know it should exist from the initial schema migration)
ALTER TABLE IF EXISTS journal_entries
  ADD COLUMN IF NOT EXISTS practice_goals TEXT,
  ADD COLUMN IF NOT EXISTS went_well TEXT,
  ADD COLUMN IF NOT EXISTS beautified TEXT,
  ADD COLUMN IF NOT EXISTS frustrations TEXT,
  ADD COLUMN IF NOT EXISTS improvements TEXT;

-- Create a safe insertion function for journal entries
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
) RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql;
