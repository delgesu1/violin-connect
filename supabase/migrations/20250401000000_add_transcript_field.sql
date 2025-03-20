-- Migration to update the lessons table:
-- 1. Drop transcript_url since we'll store the full transcript directly
-- 2. Add transcript column to store full text

-- Drop the existing transcript_url column
ALTER TABLE lessons
DROP COLUMN IF EXISTS transcript_url;

-- Add a new transcript column to store the full lesson transcript
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS transcript TEXT; 