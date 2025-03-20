-- SQL script to insert the data manually
-- Run this in the Supabase Studio SQL Editor after adding the transcript column and upsert functions

-- First, lessons data
SELECT upsert_lesson(
  '4afd4fa0-47b1-4817-bb64-fc18a0fd33ba',  -- id
  '1333665c-ec92-47f1-adb1-99bfaecf25c1',  -- student_id
  '2023-10-15',                           -- date
  'Worked on B Major scale with focus on intonation of thirds. Discussed fingering options.', -- summary
  '',                                     -- notes
  '2025-03-13 09:34:54.834421+00',        -- created_at
  '2025-03-13 09:34:54.834421+00',        -- updated_at
  NULL,                                   -- teacher_id
  NULL,                                   -- start_time
  NULL,                                   -- end_time
  NULL,                                   -- location
  'scheduled',                            -- status
  NULL,                                   -- ai_summary
  NULL                                    -- transcript
);

SELECT upsert_lesson(
  '168b9309-ce32-4591-9505-a47f2b9febaf',  -- id
  'c5d71b10-d95d-4476-b64f-4a1e71bb265d',  -- student_id
  '2023-10-16',                           -- date
  'Practiced bow distribution for even tone. Discussed proper left hand position.', -- summary
  '',                                     -- notes
  '2025-03-13 09:34:54.834421+00',        -- created_at
  '2025-03-13 09:34:54.834421+00',        -- updated_at
  NULL,                                   -- teacher_id
  NULL,                                   -- start_time
  NULL,                                   -- end_time
  NULL,                                   -- location
  'scheduled',                            -- status
  NULL,                                   -- ai_summary
  NULL                                    -- transcript
);

SELECT upsert_lesson(
  '1383975b-ee40-4f8c-8f64-6e0bbf0b800c',  -- id
  '1333665c-ec92-47f1-adb1-99bfaecf25c1',  -- student_id
  '2023-09-15',                           -- date
  'Worked on Mendelssohn Violin Concerto first movement.', -- summary
  'Emma is progressing well with the technical challenges. Need to focus on the cadenza next week.', -- notes
  '2025-03-14 02:15:49.441169+00',        -- created_at
  '2025-03-14 02:15:49.441169+00',        -- updated_at
  '771ab2f3-ffbd-4ced-a36a-46f07f7a2b59',  -- teacher_id
  '09:00:00',                            -- start_time
  '10:00:00',                            -- end_time
  'Studio A',                            -- location
  'scheduled',                            -- status
  'Student demonstrated good progress on the Mendelssohn concerto. Technical passages in the exposition are mostly secure, but the cadenza needs more work. Intonation in higher positions is improving. Next steps include refining the cadenza and working on dynamic contrast.', -- ai_summary
  NULL                                    -- transcript
);

-- Now journal_entries data
SELECT upsert_journal_entry(
  'cf2d04a3-cbcb-4524-a262-50e58b758091',  -- id
  'ae0efe59-52c9-46c3-979f-fb89c077a012',  -- user_id
  '2025-03-13',                           -- date
  'Work on the Tchaikovsky concerto, focusing on intonation in the development section', -- practice_goals
  'Practiced for 2 hours today. Started with scales and arpeggios for warm-up.', -- notes
  'My double stops are sounding much cleaner after focused practice.', -- went_well
  'The lyrical section in the second movement - worked on varied vibrato.', -- beautified
  'Still struggling with consistent intonation in the highest positions.', -- frustrations
  'Need to practice the difficult passages with drone tones tomorrow.', -- improvements
  '2025-03-13 07:36:08.269158+00',        -- created_at
  '2025-03-13 07:36:08.269158+00'         -- updated_at
);

SELECT upsert_journal_entry(
  'd012f319-8797-4ef1-8409-56e894de2fe4',  -- id
  'ae0efe59-52c9-46c3-979f-fb89c077a012',  -- user_id
  '2025-03-12',                           -- date
  'Bach Partita - memorize the first page', -- practice_goals
  'Focused solely on the Bach today for 90 minutes.', -- notes
  'Successfully memorized the first page and can play it reliably.', -- went_well
  'The dance-like quality in the opening section.', -- beautified
  'Having trouble with consistent tempo when playing from memory.', -- frustrations
  'Record myself tomorrow to check tempo consistency.', -- improvements
  '2025-03-13 07:36:08.269158+00',        -- created_at
  '2025-03-13 07:36:08.269158+00'         -- updated_at
); 