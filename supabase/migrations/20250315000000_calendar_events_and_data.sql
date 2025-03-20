-- Migration for calendar_events table and data insertion
-- This migration creates the calendar_events table if it doesn't exist
-- and prepares for inserting the mock data

-- 1. Create the calendar_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('lesson', 'performance', 'rehearsal', 'other')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  description TEXT,
  student_id UUID REFERENCES students,
  lesson_id UUID REFERENCES lessons,
  recurrence_rule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Add RLS policies for calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own calendar events" ON calendar_events
  FOR SELECT USING (auth.uid() = teacher_id);
  
CREATE POLICY "Teachers can insert their own calendar events" ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);
  
CREATE POLICY "Teachers can update their own calendar events" ON calendar_events
  FOR UPDATE USING (auth.uid() = teacher_id);
  
CREATE POLICY "Teachers can delete their own calendar events" ON calendar_events
  FOR DELETE USING (auth.uid() = teacher_id);

-- 3. Create triggers for updating timestamps
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. Create lesson_events view if it doesn't exist
CREATE OR REPLACE VIEW lesson_events AS
SELECT 
  l.id AS lesson_id,
  ce.id AS calendar_event_id,
  l.student_id,
  s.name AS student_name,
  s.avatar_url AS student_avatar,
  ce.start_time,
  ce.end_time,
  ce.location,
  l.summary,
  l.notes,
  s.user_id
FROM lessons l
LEFT JOIN calendar_events ce ON l.id = ce.lesson_id
LEFT JOIN students s ON l.student_id = s.id;

-- 5. Enhance the students table if needed
ALTER TABLE students
ADD COLUMN IF NOT EXISTS difficulty_level TEXT,
ADD COLUMN IF NOT EXISTS academic_year TEXT,
ADD COLUMN IF NOT EXISTS next_lesson_id UUID REFERENCES lessons;

-- 6. Enhance the student_repertoire table if needed
ALTER TABLE student_repertoire
ADD COLUMN IF NOT EXISTS performance_date DATE,
ADD COLUMN IF NOT EXISTS performance_location TEXT;

-- 7. Create functions to insert mock data (these will be called directly from the app)
CREATE OR REPLACE FUNCTION insert_master_repertoire(
  p_user_id UUID,
  p_title TEXT,
  p_composer TEXT,
  p_level TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_genre TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  piece_id UUID;
BEGIN
  -- Check if the piece already exists
  SELECT id INTO piece_id
  FROM master_repertoire
  WHERE title = p_title AND composer = p_composer AND user_id = p_user_id;
  
  IF piece_id IS NULL THEN
    -- Insert the piece if it doesn't exist
    INSERT INTO master_repertoire (
      user_id, title, composer, difficulty, notes
    ) VALUES (
      p_user_id, p_title, p_composer, p_level, p_description
    )
    RETURNING id INTO piece_id;
  END IF;
  
  RETURN piece_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_repertoire_file(
  p_master_piece_id UUID,
  p_user_id UUID,
  p_file_name TEXT,
  p_file_url TEXT,
  p_file_type TEXT DEFAULT NULL,
  p_file_size INTEGER DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  file_id UUID;
BEGIN
  -- Insert the file
  INSERT INTO repertoire_files (
    master_piece_id, user_id, file_name, file_url, file_type, file_size, description
  ) VALUES (
    p_master_piece_id, p_user_id, p_file_name, p_file_url, p_file_type, p_file_size, p_description
  )
  RETURNING id INTO file_id;
  
  RETURN file_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_repertoire_link(
  p_master_piece_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_url TEXT,
  p_link_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_thumbnail_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  link_id UUID;
BEGIN
  -- Insert the link
  INSERT INTO repertoire_links (
    master_piece_id, user_id, title, url, link_type, description, thumbnail_url
  ) VALUES (
    p_master_piece_id, p_user_id, p_title, p_url, p_link_type, p_description, p_thumbnail_url
  )
  RETURNING id INTO link_id;
  
  RETURN link_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_lesson_with_calendar_event(
  p_teacher_id UUID,
  p_student_id UUID,
  p_date DATE,
  p_start_time TIME DEFAULT NULL,
  p_end_time TIME DEFAULT NULL,
  p_summary TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_ai_summary TEXT DEFAULT NULL
) RETURNS RECORD AS $$
DECLARE
  lesson_id UUID;
  event_id UUID;
  start_timestamp TIMESTAMP WITH TIME ZONE;
  end_timestamp TIMESTAMP WITH TIME ZONE;
  result RECORD;
BEGIN
  -- Create the lesson
  INSERT INTO lessons (
    student_id, date, summary, notes, location, ai_summary
  ) VALUES (
    p_student_id, p_date, p_summary, p_notes, p_location, p_ai_summary
  )
  RETURNING id INTO lesson_id;
  
  -- Create timestamps for calendar event
  IF p_start_time IS NOT NULL THEN
    start_timestamp := (p_date || ' ' || p_start_time)::TIMESTAMP WITH TIME ZONE;
    
    IF p_end_time IS NOT NULL THEN
      end_timestamp := (p_date || ' ' || p_end_time)::TIMESTAMP WITH TIME ZONE;
    ELSE
      -- Default to 1 hour if only start time is provided
      end_timestamp := start_timestamp + INTERVAL '1 hour';
    END IF;
    
    -- Create the calendar event
    INSERT INTO calendar_events (
      teacher_id, title, event_type, start_time, end_time, all_day, location, description, student_id, lesson_id
    ) VALUES (
      p_teacher_id, 
      'Lesson: ' || (SELECT name FROM students WHERE id = p_student_id), 
      'lesson', 
      start_timestamp, 
      end_timestamp, 
      FALSE, 
      p_location, 
      p_summary, 
      p_student_id, 
      lesson_id
    )
    RETURNING id INTO event_id;
  ELSE
    -- Create an all-day event
    start_timestamp := p_date::TIMESTAMP WITH TIME ZONE;
    
    INSERT INTO calendar_events (
      teacher_id, title, event_type, start_time, end_time, all_day, location, description, student_id, lesson_id
    ) VALUES (
      p_teacher_id, 
      'Lesson: ' || (SELECT name FROM students WHERE id = p_student_id), 
      'lesson', 
      start_timestamp, 
      start_timestamp + INTERVAL '1 day', 
      TRUE, 
      p_location, 
      p_summary, 
      p_student_id, 
      lesson_id
    )
    RETURNING id INTO event_id;
  END IF;
  
  SELECT lesson_id, event_id INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql; 