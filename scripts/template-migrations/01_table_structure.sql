-- Template for table structure changes
-- Use this pattern for creating or modifying tables

-- 1. Creating a new table (if needed)
CREATE TABLE IF NOT EXISTS public.new_table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Modifying an existing table (if needed)
ALTER TABLE IF EXISTS public.existing_table
  ADD COLUMN IF NOT EXISTS new_column1 TEXT,
  ADD COLUMN IF NOT EXISTS new_column2 JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS new_column3 INTEGER DEFAULT 0;

-- 3. Adding constraints (if needed)
ALTER TABLE IF EXISTS public.existing_table
  ADD CONSTRAINT IF NOT EXISTS unique_constraint_name UNIQUE (column_name);

-- 4. Adding indexes (if needed)
CREATE INDEX IF NOT EXISTS index_name ON public.table_name (column_name);

-- 5. Enabling Row Level Security
ALTER TABLE public.new_table_name ENABLE ROW LEVEL SECURITY; 