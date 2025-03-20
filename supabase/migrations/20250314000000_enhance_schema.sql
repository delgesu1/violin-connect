-- Enhanced Schema Migration for Violin Connect

-- 1. Enhance the lessons table (only adding ai_summary since other columns already exist)
ALTER TABLE IF EXISTS lessons
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- 2. Create repertoire_files table
CREATE TABLE IF NOT EXISTS repertoire_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_piece_id UUID REFERENCES master_repertoire NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Create repertoire_links table
CREATE TABLE IF NOT EXISTS repertoire_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_piece_id UUID REFERENCES master_repertoire NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  link_type TEXT CHECK (link_type IN ('youtube', 'article', 'score', 'recording', 'other')),
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. Add RLS policies for repertoire_files
ALTER TABLE repertoire_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own repertoire files" ON repertoire_files
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own repertoire files" ON repertoire_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own repertoire files" ON repertoire_files
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own repertoire files" ON repertoire_files
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Add RLS policies for repertoire_links
ALTER TABLE repertoire_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own repertoire links" ON repertoire_links
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own repertoire links" ON repertoire_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own repertoire links" ON repertoire_links
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own repertoire links" ON repertoire_links
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create triggers for updating timestamps
CREATE TRIGGER update_repertoire_files_updated_at
BEFORE UPDATE ON repertoire_files
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_repertoire_links_updated_at
BEFORE UPDATE ON repertoire_links
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column(); 