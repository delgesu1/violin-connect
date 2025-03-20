#!/usr/bin/env node
/**
 * Script to generate a complete SQL migration file from JSON data
 * This takes the JSON data and generates upsert_lesson and upsert_journal_entry calls
 */

const fs = require('fs');
const path = require('path');

// The JSON data (copy-paste the data here)
const lessonsData = [
  {
    "id": "4afd4fa0-47b1-4817-bb64-fc18a0fd33ba",
    "student_id": "1333665c-ec92-47f1-adb1-99bfaecf25c1",
    "date": "2023-10-15",
    "summary": "Worked on B Major scale with focus on intonation of thirds. Discussed fingering options.",
    "notes": "",
    "created_at": "2025-03-13 09:34:54.834421+00",
    "updated_at": "2025-03-13 09:34:54.834421+00",
    "teacher_id": null,
    "start_time": null,
    "end_time": null,
    "location": null,
    "status": "scheduled",
    "ai_summary": null,
    "transcript": null
  },
  // Add more lessons here...
];

const journalEntriesData = [
  {
    "id": "cf2d04a3-cbcb-4524-a262-50e58b758091",
    "user_id": "ae0efe59-52c9-46c3-979f-fb89c077a012",
    "date": "2025-03-13",
    "practice_goals": "Work on the Tchaikovsky concerto, focusing on intonation in the development section",
    "notes": "Practiced for 2 hours today. Started with scales and arpeggios for warm-up.",
    "went_well": "My double stops are sounding much cleaner after focused practice.",
    "beautified": "The lyrical section in the second movement - worked on varied vibrato.",
    "frustrations": "Still struggling with consistent intonation in the highest positions.",
    "improvements": "Need to practice the difficult passages with drone tones tomorrow.",
    "created_at": "2025-03-13 07:36:08.269158+00",
    "updated_at": "2025-03-13 07:36:08.269158+00"
  },
  // Add more journal entries here...
];

// Function to escape single quotes in SQL strings
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.toString().replace(/'/g, "''")}'`;
}

// Generate SQL for lessons
function generateLessonsSql(lessons) {
  let sql = '-- Generated lessons data\n\n';
  
  lessons.forEach(lesson => {
    sql += `SELECT upsert_lesson(\n`;
    sql += `  ${escapeSql(lesson.id)},  -- id\n`;
    sql += `  ${escapeSql(lesson.student_id)},  -- student_id\n`;
    sql += `  ${escapeSql(lesson.date)},  -- date\n`;
    sql += `  ${escapeSql(lesson.summary)},  -- summary\n`;
    sql += `  ${escapeSql(lesson.notes)},  -- notes\n`;
    sql += `  ${escapeSql(lesson.created_at)},  -- created_at\n`;
    sql += `  ${escapeSql(lesson.updated_at)},  -- updated_at\n`;
    sql += `  ${escapeSql(lesson.teacher_id)},  -- teacher_id\n`;
    sql += `  ${escapeSql(lesson.start_time)},  -- start_time\n`;
    sql += `  ${escapeSql(lesson.end_time)},  -- end_time\n`;
    sql += `  ${escapeSql(lesson.location)},  -- location\n`;
    sql += `  ${escapeSql(lesson.status)},  -- status\n`;
    sql += `  ${escapeSql(lesson.ai_summary)},  -- ai_summary\n`;
    sql += `  ${escapeSql(lesson.transcript)}  -- transcript\n`;
    sql += `);\n\n`;
  });
  
  return sql;
}

// Generate SQL for journal entries
function generateJournalEntriesSql(entries) {
  let sql = '-- Generated journal entries data\n\n';
  
  entries.forEach(entry => {
    sql += `SELECT upsert_journal_entry(\n`;
    sql += `  ${escapeSql(entry.id)},  -- id\n`;
    sql += `  ${escapeSql(entry.user_id)},  -- user_id\n`;
    sql += `  ${escapeSql(entry.date)},  -- date\n`;
    sql += `  ${escapeSql(entry.practice_goals)},  -- practice_goals\n`;
    sql += `  ${escapeSql(entry.notes)},  -- notes\n`;
    sql += `  ${escapeSql(entry.went_well)},  -- went_well\n`;
    sql += `  ${escapeSql(entry.beautified)},  -- beautified\n`;
    sql += `  ${escapeSql(entry.frustrations)},  -- frustrations\n`;
    sql += `  ${escapeSql(entry.improvements)},  -- improvements\n`;
    sql += `  ${escapeSql(entry.created_at)},  -- created_at\n`;
    sql += `  ${escapeSql(entry.updated_at)}  -- updated_at\n`;
    sql += `);\n\n`;
  });
  
  return sql;
}

// Generate the complete SQL file
function generateCompleteSql() {
  let sql = `-- Complete data migration generated on ${new Date().toISOString()}\n`;
  sql += `-- This file contains SQL to populate all the lost data\n\n`;
  
  sql += generateLessonsSql(lessonsData);
  sql += generateJournalEntriesSql(journalEntriesData);
  
  return sql;
}

// Write the SQL to a file
const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', 'complete_data_migration.sql');
fs.writeFileSync(outputPath, generateCompleteSql());

console.log(`Complete data migration SQL has been written to: ${outputPath}`);
console.log('To use this file:');
console.log('1. Review the SQL file to ensure it contains all the data you want to restore');
console.log('2. Run: npx supabase migration up');
console.log('3. Or use the rebuild-data.sh script'); 