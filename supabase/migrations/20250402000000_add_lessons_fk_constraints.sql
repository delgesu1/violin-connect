-- Safely add foreign key constraint between lessons and students
-- First, check for any violations 
DO $$
DECLARE
   violation_count INTEGER;
BEGIN
   SELECT COUNT(*) INTO violation_count
   FROM lessons 
   WHERE student_id IS NOT NULL AND 
         student_id NOT IN (SELECT id FROM students);
   
   IF violation_count = 0 THEN
      -- No violations, safe to add constraint
      BEGIN
         ALTER TABLE lessons 
            ADD CONSTRAINT fk_lessons_student
            FOREIGN KEY (student_id) 
            REFERENCES students(id)
            DEFERRABLE INITIALLY DEFERRED;
         RAISE NOTICE 'Successfully added foreign key constraint fk_lessons_student';
      EXCEPTION WHEN duplicate_object THEN
         RAISE NOTICE 'Constraint fk_lessons_student already exists, skipping';
      END;
   ELSE
      RAISE NOTICE 'Cannot add constraint: % rows have invalid student_id values', violation_count;
   END IF;
END $$;

-- Now make sure the teacher_id foreign key exists too
DO $$
DECLARE
   violation_count INTEGER;
BEGIN
   SELECT COUNT(*) INTO violation_count
   FROM lessons 
   WHERE teacher_id IS NOT NULL AND 
         teacher_id NOT IN (SELECT id FROM auth.users);
   
   IF violation_count = 0 THEN
      -- No violations, safe to add constraint
      BEGIN
         ALTER TABLE lessons 
            ADD CONSTRAINT fk_lessons_teacher
            FOREIGN KEY (teacher_id) 
            REFERENCES auth.users(id)
            DEFERRABLE INITIALLY DEFERRED;
         RAISE NOTICE 'Successfully added foreign key constraint fk_lessons_teacher';
      EXCEPTION WHEN duplicate_object THEN
         RAISE NOTICE 'Constraint fk_lessons_teacher already exists, skipping';
      END;
   ELSE
      RAISE NOTICE 'Cannot add constraint: % rows have invalid teacher_id values', violation_count;
   END IF;
END $$; 