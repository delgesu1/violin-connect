-- Template for triggers and RLS policies
-- Use this pattern for creating triggers and policies

-- 1. Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.new_table_name;
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.new_table_name
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Create RLS policies
-- Policy for users to see only their own records
DROP POLICY IF EXISTS "Users can view their own records" ON public.new_table_name;
CREATE POLICY "Users can view their own records"
ON public.new_table_name
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own records
DROP POLICY IF EXISTS "Users can insert their own records" ON public.new_table_name;
CREATE POLICY "Users can insert their own records"
ON public.new_table_name
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own records
DROP POLICY IF EXISTS "Users can update their own records" ON public.new_table_name;
CREATE POLICY "Users can update their own records"
ON public.new_table_name
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own records
DROP POLICY IF EXISTS "Users can delete their own records" ON public.new_table_name;
CREATE POLICY "Users can delete their own records"
ON public.new_table_name
FOR DELETE
USING (auth.uid() = user_id); 