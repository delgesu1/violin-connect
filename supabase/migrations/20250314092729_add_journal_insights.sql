-- Create table for AI-generated insights from journal entries
CREATE TABLE IF NOT EXISTS public.journal_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  strengths JSONB DEFAULT '[]'::jsonb,
  challenges JSONB DEFAULT '[]'::jsonb,
  last_generated_at TIMESTAMPTZ,
  generation_method TEXT
);

-- Enable RLS on journal insights
ALTER TABLE public.journal_insights ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to access their own journal insights
CREATE POLICY "Users can only access their own journal insights" 
ON public.journal_insights FOR ALL 
USING (auth.uid()::text = user_id);