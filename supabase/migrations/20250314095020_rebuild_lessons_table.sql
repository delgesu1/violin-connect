-- Migration to update the lessons table structure based on the JSON data
-- This adds any missing columns from the lessons data

-- Ensure all fields exist in the lessons table
ALTER TABLE IF EXISTS lessons
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES auth.users,
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS transcript TEXT;

-- Create a safe insertion function for lessons
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
) RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql;
