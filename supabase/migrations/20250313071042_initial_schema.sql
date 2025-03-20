-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (linked to auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  level TEXT,
  email TEXT,
  phone TEXT, 
  academic_year TEXT,
  start_date DATE,
  last_lesson_date DATE,
  next_lesson TEXT,
  unread_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own students" ON students
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own students" ON students
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own students" ON students
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own students" ON students
  FOR DELETE USING (auth.uid() = user_id);

-- Create master repertoire table
CREATE TABLE master_repertoire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  composer TEXT,
  difficulty TEXT,
  notes TEXT,
  started_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for master_repertoire
ALTER TABLE master_repertoire ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own repertoire" ON master_repertoire
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own repertoire" ON master_repertoire
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own repertoire" ON master_repertoire
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own repertoire" ON master_repertoire
  FOR DELETE USING (auth.uid() = user_id);

-- Create student repertoire table (links students to pieces)
CREATE TABLE student_repertoire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students NOT NULL,
  master_piece_id UUID REFERENCES master_repertoire NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL CHECK (status IN ('current', 'completed', 'planned')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for student_repertoire
ALTER TABLE student_repertoire ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their students' repertoire" ON student_repertoire
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_repertoire.student_id
      AND students.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert their students' repertoire" ON student_repertoire
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_repertoire.student_id
      AND students.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update their students' repertoire" ON student_repertoire
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_repertoire.student_id
      AND students.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete their students' repertoire" ON student_repertoire
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_repertoire.student_id
      AND students.user_id = auth.uid()
    )
  );

-- Create lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students NOT NULL,
  date DATE NOT NULL,
  summary TEXT,
  transcript_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their students' lessons" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = lessons.student_id
      AND students.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert their students' lessons" ON lessons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = lessons.student_id
      AND students.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update their students' lessons" ON lessons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = lessons.student_id
      AND students.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete their students' lessons" ON lessons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = lessons.student_id
      AND students.user_id = auth.uid()
    )
  );

-- Create lesson_repertoire junction table to track pieces covered in a lesson
CREATE TABLE lesson_repertoire (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons NOT NULL,
  student_piece_id UUID REFERENCES student_repertoire NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for lesson_repertoire
ALTER TABLE lesson_repertoire ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their lesson repertoire" ON lesson_repertoire
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN students ON students.id = lessons.student_id
      WHERE lessons.id = lesson_repertoire.lesson_id
      AND students.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert their lesson repertoire" ON lesson_repertoire
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN students ON students.id = lessons.student_id
      WHERE lessons.id = lesson_repertoire.lesson_id
      AND students.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete their lesson repertoire" ON lesson_repertoire
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN students ON students.id = lessons.student_id
      WHERE lessons.id = lesson_repertoire.lesson_id
      AND students.user_id = auth.uid()
    )
  );

-- Create journal entries table
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  practice_goals TEXT,
  notes TEXT,
  went_well TEXT,
  beautified TEXT,
  frustrations TEXT,
  improvements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create functions to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_master_repertoire_updated_at
BEFORE UPDATE ON master_repertoire
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_student_repertoire_updated_at
BEFORE UPDATE ON student_repertoire
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON journal_entries
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

