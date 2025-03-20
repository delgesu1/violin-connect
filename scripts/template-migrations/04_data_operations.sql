-- Template for data operations
-- Use this pattern for inserting or updating data

-- 1. Insert sample data using upsert functions
SELECT upsert_record(
  'fd5c1faa-2e0f-4fee-b14f-c9e9a07b27c0',  -- p_id (use a fixed UUID for reproducibility)
  'auth-user-id-here',                      -- p_user_id (reference to auth.users)
  'Sample Record',                          -- p_name
  'This is a sample record'                 -- p_description
);

-- 2. If using bulk data, consider using a transaction
BEGIN;

SELECT upsert_record(
  'b8f4a0d2-9e7b-4d6c-8a53-57c741e47b9e',  -- p_id
  'auth-user-id-here',                      -- p_user_id
  'Another Record',                         -- p_name
  'This is another sample record'           -- p_description
);

SELECT upsert_record(
  '72a0f3d8-1c6e-4b5a-9d2f-3e8b47c9a6f1',  -- p_id
  'auth-user-id-here',                      -- p_user_id
  'Third Record',                           -- p_name
  'This is a third sample record'           -- p_description
);

COMMIT;

-- 3. Add a comment to mark this migration as data-only
COMMENT ON TABLE public.new_table_name IS 'Created with sample data';

-- 4. You can also use direct SQL for simple operations
-- INSERT INTO public.lookup_table (id, name) 
-- VALUES (1, 'Option 1'), (2, 'Option 2'), (3, 'Option 3')
-- ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name; 