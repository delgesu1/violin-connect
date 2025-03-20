-- Template for function definitions
-- Use this pattern for creating functions

-- 1. Utility function (like handle_updated_at)
DROP FUNCTION IF EXISTS public.handle_updated_at();
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Safe upsert function pattern
DROP FUNCTION IF EXISTS public.upsert_record(UUID, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.upsert_record(
  p_id UUID,
  p_user_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  record_id UUID;
BEGIN
  -- Check if record exists
  SELECT id INTO record_id FROM public.new_table_name WHERE id = p_id;
  
  IF record_id IS NOT NULL THEN
    -- Update existing record
    UPDATE public.new_table_name SET
      user_id = p_user_id,
      name = p_name,
      description = p_description,
      updated_at = NOW()
    WHERE id = p_id;
  ELSE
    -- Insert new record
    INSERT INTO public.new_table_name (
      id, user_id, name, description
    ) VALUES (
      p_id, p_user_id, p_name, p_description
    )
    RETURNING id INTO record_id;
  END IF;
  
  RETURN record_id;
END;
$$ LANGUAGE plpgsql; 