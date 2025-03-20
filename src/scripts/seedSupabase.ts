import 'dotenv/config';
import { supabase } from '@/lib/supabase';
import { students as mockStudents } from '@/data/mockStudents';
import { defaultMasterRepertoire } from '@/data/defaultRepertoire';
import { ID_PREFIXES, createPrefixedId } from '@/lib/id-utils';

/**
 * This script seeds the Supabase database with initial data from our mock data files.
 * Run this script using `npx tsx src/scripts/seedSupabase.ts`
 */
async function seedDatabase() {
  console.log('Starting database seeding...');
  console.log('Using Supabase URL:', process.env.SUPABASE_URL || 'default URL');

  try {
    // Check if Supabase is running
    const { error: pingError } = await supabase.from('students').select('count');
    if (pingError) {
      console.error('Error connecting to Supabase:', pingError.message);
      console.log('Make sure your local Supabase instance is running (`npx supabase start`)');
      console.log('And check that your .env file has the correct SUPABASE_URL and SUPABASE_ANON_KEY');
      return;
    }

    // Sign up a test user for development
    const email = `test_${Math.random().toString(36).substring(2, 10)}@example.com`;
    const password = 'Password123!';
    
    console.log(`Creating test user: ${email} (password: ${password})`);
    
    let authData: any = null;
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      console.error('Error creating test user:', authError.message);
      // Try signing in with a default test user
      console.log('Trying to sign in with default test user...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'Password123!',
      });
      
      if (signInError) {
        console.error('Error signing in with default user:', signInError.message);
        console.log('Attempting to continue without authentication...');
      } else {
        console.log('Signed in as default test user');
        authData = signInData;
      }
    } else {
      console.log('Test user created successfully!');
      authData = data;
    }

    // Get the authenticated user to use as reference
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No authenticated user found. Please log in first.');
      return;
    }

    console.log(`Using authenticated user: ${user.email} (${user.id})`);

    // 1. Insert master repertoire
    console.log('Seeding master repertoire...');

    const masterRepertoireData = defaultMasterRepertoire.map(piece => ({
      user_id: user.id,
      title: piece.title,
      composer: piece.composer,
      difficulty: piece.difficulty,
      notes: piece.notes,
      started_date: piece.startedDate || new Date().toISOString().split('T')[0]
    }));

    const { data: masterRepertoire, error: masterRepertoireError } = await supabase
      .from('master_repertoire')
      .insert(masterRepertoireData)
      .select();

    if (masterRepertoireError) {
      console.error('Error inserting master repertoire:', masterRepertoireError.message);
      // Continue with other seeding operations
    } else {
      console.log(`✅ Inserted ${masterRepertoire.length} master repertoire pieces`);
      
      // Create an ID mapping to use in subsequent inserts
      const masterPieceIdMap = new Map();
      defaultMasterRepertoire.forEach((oldPiece, index) => {
        // Handle both prefixed and non-prefixed IDs
        const oldId = oldPiece.id.startsWith(ID_PREFIXES.PIECE) 
          ? oldPiece.id 
          : createPrefixedId(ID_PREFIXES.PIECE, oldPiece.id);
        masterPieceIdMap.set(oldId, masterRepertoire[index].id);
        masterPieceIdMap.set(oldPiece.id, masterRepertoire[index].id); // Also store without prefix for compatibility
      });

      // 2. Insert students
      console.log('Seeding students...');

      const studentsData = mockStudents.map(student => ({
        user_id: user.id,
        name: student.name,
        avatar_url: student.avatarUrl,
        level: student.level,
        email: student.email || '',
        phone: student.phone || '',
        academic_year: student.academicYear || '',
        start_date: student.startDate ? new Date(student.startDate).toISOString().split('T')[0] : null,
        last_lesson_date: student.lastLesson ? new Date().toISOString().split('T')[0] : null,
        next_lesson: student.nextLesson || '',
        unread_messages: student.unreadMessages || 0
      }));

      const { data: students, error: studentsError } = await supabase
        .from('students')
        .insert(studentsData)
        .select();

      if (studentsError) {
        console.error('Error inserting students:', studentsError.message);
      } else {
        console.log(`✅ Inserted ${students.length} students`);
        
        // Create an ID mapping for students
        const studentIdMap = new Map();
        mockStudents.forEach((oldStudent, index) => {
          // Handle both prefixed and non-prefixed IDs
          const oldId = oldStudent.id.startsWith(ID_PREFIXES.STUDENT) 
            ? oldStudent.id 
            : createPrefixedId(ID_PREFIXES.STUDENT, oldStudent.id);
          studentIdMap.set(oldId, students[index].id);
          studentIdMap.set(oldStudent.id, students[index].id); // Also store without prefix for compatibility
        });

        // 3. Insert student repertoire
        console.log('Seeding student repertoire...');

        const studentRepertoireData = [];
        let mappingIssues = 0;
        
        // Process current repertoire for all students
        for (const oldStudent of mockStudents) {
          const newStudentId = studentIdMap.get(oldStudent.id);
          
          if (!newStudentId) {
            console.warn(`Could not find mapping for student ID: ${oldStudent.id}`);
            continue;
          }
          
          // Current repertoire
          if (oldStudent.currentRepertoire) {
            for (const piece of oldStudent.currentRepertoire) {
              let masterPieceId;
              
              // Try to find the master piece ID through various methods
              if (piece.masterPieceId) {
                masterPieceId = masterPieceIdMap.get(piece.masterPieceId);
              } else if (masterPieceIdMap.get(piece.id)) {
                masterPieceId = masterPieceIdMap.get(piece.id);
              } else {
                // Try to find by title
                const matchingPiece = defaultMasterRepertoire.find(
                  mp => mp.title.toLowerCase() === piece.title.toLowerCase()
                );
                
                if (matchingPiece) {
                  masterPieceId = masterPieceIdMap.get(matchingPiece.id);
                } else {
                  console.warn(`Could not find mapping for piece: ${piece.title}`);
                  mappingIssues++;
                  continue;
                }
              }
              
              if (!masterPieceId) {
                console.warn(`Could not find master piece ID for: ${piece.title}`);
                mappingIssues++;
                continue;
              }
              
              studentRepertoireData.push({
                student_id: newStudentId,
                master_piece_id: masterPieceId,
                start_date: piece.startDate ? new Date(piece.startDate).toISOString().split('T')[0] : null,
                end_date: null,
                status: 'current',
                notes: piece.notes || null
              });
            }
          }
          
          // Past repertoire
          if (oldStudent.pastRepertoire) {
            for (const piece of oldStudent.pastRepertoire) {
              let masterPieceId;
              
              // Try to find the master piece ID through various methods
              if (piece.masterPieceId) {
                masterPieceId = masterPieceIdMap.get(piece.masterPieceId);
              } else if (masterPieceIdMap.get(piece.id)) {
                masterPieceId = masterPieceIdMap.get(piece.id);
              } else {
                // Try to find by title
                const matchingPiece = defaultMasterRepertoire.find(
                  mp => mp.title.toLowerCase() === piece.title.toLowerCase()
                );
                
                if (matchingPiece) {
                  masterPieceId = masterPieceIdMap.get(matchingPiece.id);
                } else {
                  console.warn(`Could not find mapping for piece: ${piece.title}`);
                  mappingIssues++;
                  continue;
                }
              }
              
              if (!masterPieceId) {
                console.warn(`Could not find master piece ID for: ${piece.title}`);
                mappingIssues++;
                continue;
              }
              
              studentRepertoireData.push({
                student_id: newStudentId,
                master_piece_id: masterPieceId,
                start_date: piece.startDate ? new Date(piece.startDate).toISOString().split('T')[0] : null,
                end_date: piece.endDate ? new Date(piece.endDate).toISOString().split('T')[0] : null,
                status: 'completed',
                notes: piece.notes || null
              });
            }
          }
        }

        // Insert student repertoire if we have any data
        if (studentRepertoireData.length > 0) {
          const { data: studentRepertoire, error: studentRepertoireError } = await supabase
            .from('student_repertoire')
            .insert(studentRepertoireData)
            .select();

          if (studentRepertoireError) {
            console.error('Error inserting student repertoire:', studentRepertoireError.message);
          } else {
            console.log(`✅ Inserted ${studentRepertoire.length} student repertoire pieces`);
            if (mappingIssues > 0) {
              console.warn(`⚠️ Could not map ${mappingIssues} pieces due to missing or ambiguous references`);
            }
          }
        } else {
          console.log('No student repertoire data to insert');
        }

        // 4. Insert lessons
        console.log('Seeding lessons...');

        const lessonsData = [];
        
        // Collect all lessons from all students
        for (const oldStudent of mockStudents) {
          const newStudentId = studentIdMap.get(oldStudent.id);
          
          if (!newStudentId || !oldStudent.lessons) continue;
          
          for (const lesson of oldStudent.lessons) {
            lessonsData.push({
              student_id: newStudentId,
              date: lesson.date ? new Date(lesson.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              summary: lesson.summary || '',
              transcript_url: lesson.transcriptUrl || '',
              notes: lesson.notes || ''
            });
          }
        }

        // Insert lessons if we have any data
        if (lessonsData.length > 0) {
          const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .insert(lessonsData)
            .select();

          if (lessonsError) {
            console.error('Error inserting lessons:', lessonsError.message);
          } else {
            console.log(`✅ Inserted ${lessons.length} lessons`);
          }
        } else {
          console.log('No lesson data to insert');
        }
      }
    }

    // 5. Insert sample journal entries
    console.log('Seeding journal entries...');

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const journalData = [
      {
        user_id: user.id,
        date: today.toISOString().split('T')[0],
        practice_goals: 'Work on the Tchaikovsky concerto, focusing on intonation in the development section',
        notes: 'Practiced for 2 hours today. Started with scales and arpeggios for warm-up.',
        went_well: 'My double stops are sounding much cleaner after focused practice.',
        beautified: 'The lyrical section in the second movement - worked on varied vibrato.',
        frustrations: 'Still struggling with consistent intonation in the highest positions.',
        improvements: 'Need to practice the difficult passages with drone tones tomorrow.'
      },
      {
        user_id: user.id,
        date: yesterday.toISOString().split('T')[0],
        practice_goals: 'Bach Partita - memorize the first page',
        notes: 'Focused solely on the Bach today for 90 minutes.',
        went_well: 'Successfully memorized the first page and can play it reliably.',
        beautified: 'The dance-like quality in the opening section.',
        frustrations: 'Having trouble with consistent tempo when playing from memory.',
        improvements: 'Record myself tomorrow to check tempo consistency.'
      }
    ];

    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .insert(journalData)
      .select();

    if (journalError) {
      console.error('Error inserting journal entries:', journalError.message);
    } else {
      console.log(`✅ Inserted ${journalEntries.length} journal entries`);
    }

    console.log('Database seeding completed successfully!');
    console.log('You can now log in to the application with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Execute the seeding function
seedDatabase(); 