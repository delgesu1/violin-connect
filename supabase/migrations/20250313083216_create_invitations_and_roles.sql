-- Create the invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS invitations_teacher_id_idx ON public.invitations(teacher_id);
CREATE INDEX IF NOT EXISTS invitations_token_idx ON public.invitations(token);
CREATE INDEX IF NOT EXISTS invitations_email_idx ON public.invitations(email);

-- Set up RLS for invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Teachers can see their own invitations
DROP POLICY IF EXISTS "Teachers can view their own invitations" ON public.invitations;
CREATE POLICY "Teachers can view their own invitations" 
ON public.invitations FOR SELECT USING (auth.uid() = teacher_id);

-- Teachers can create invitations
DROP POLICY IF EXISTS "Teachers can create invitations" ON public.invitations;
CREATE POLICY "Teachers can create invitations" 
ON public.invitations FOR INSERT WITH CHECK (auth.uid() = teacher_id);

-- Teachers can update their own invitations
DROP POLICY IF EXISTS "Teachers can update their own invitations" ON public.invitations;
CREATE POLICY "Teachers can update their own invitations" 
ON public.invitations FOR UPDATE USING (auth.uid() = teacher_id);

-- Teachers can delete their own invitations
DROP POLICY IF EXISTS "Teachers can delete their own invitations" ON public.invitations;
CREATE POLICY "Teachers can delete their own invitations" 
ON public.invitations FOR DELETE USING (auth.uid() = teacher_id);

-- Anyone can read an invitation by token (for validation)
DROP POLICY IF EXISTS "Anyone can verify an invitation by token" ON public.invitations;
CREATE POLICY "Anyone can verify an invitation by token" 
ON public.invitations FOR SELECT USING (true);

-- Create the user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    UNIQUE(user_id, role)
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles(user_id);

-- Set up RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see their own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- System can manage roles
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;
CREATE POLICY "Service role can manage all roles" 
ON public.user_roles FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
);

-- Create the student_teacher_relationships table
CREATE TABLE IF NOT EXISTS public.student_teacher_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    UNIQUE(student_id, teacher_id)
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS student_teacher_rel_student_id_idx ON public.student_teacher_relationships(student_id);
CREATE INDEX IF NOT EXISTS student_teacher_rel_teacher_id_idx ON public.student_teacher_relationships(teacher_id);

-- Set up RLS for student_teacher_relationships
ALTER TABLE public.student_teacher_relationships ENABLE ROW LEVEL SECURITY;

-- Teachers can see their own students
DROP POLICY IF EXISTS "Teachers can view their own students" ON public.student_teacher_relationships;
CREATE POLICY "Teachers can view their own students" 
ON public.student_teacher_relationships FOR SELECT USING (auth.uid() = teacher_id);

-- Students can see their own teachers
DROP POLICY IF EXISTS "Students can view their own teachers" ON public.student_teacher_relationships;
CREATE POLICY "Students can view their own teachers" 
ON public.student_teacher_relationships FOR SELECT USING (auth.uid() = student_id);

-- System can manage relationships
DROP POLICY IF EXISTS "Service role can manage all relationships" ON public.student_teacher_relationships;
CREATE POLICY "Service role can manage all relationships" 
ON public.student_teacher_relationships FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
);

-- Create function to check if an invitation is valid
CREATE OR REPLACE FUNCTION public.is_invitation_valid(token_param TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.invitations 
        WHERE token = token_param 
        AND status = 'pending' 
        AND expires_at > now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if a user is a teacher
CREATE OR REPLACE FUNCTION public.is_user_teacher(user_id_param UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = user_id_param 
        AND role = 'teacher'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if a user is a student
CREATE OR REPLACE FUNCTION public.is_user_student(user_id_param UUID) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = user_id_param 
        AND role = 'student'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
