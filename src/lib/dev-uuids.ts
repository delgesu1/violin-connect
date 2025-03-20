/**
 * Development UUID Constants
 * 
 * This file provides consistent UUIDs across development mode to ensure
 * predictable behavior when working with mock data and database queries.
 * 
 * Using these constants helps maintain database compatibility and
 * ensures consistent testing environments.
 */

// Main development teacher UUID (used in RLS policies)
export const DEV_TEACHER_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Development student UUIDs (for consistent testing)
export const DEV_STUDENT_UUIDS = {
  // Regular students
  EMMA: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  JAMES: '8c9e6679-7425-40de-944b-e07fc1f90ae8',
  SOPHIA: '9c9e6679-7425-40de-944b-e07fc1f90ae9',
  MICHAEL: 'ac9e6679-7425-40de-944b-e07fc1f90ae0',
  OLIVIA: 'bc9e6679-7425-40de-944b-e07fc1f90ae1',
  WILLIAM: 'cc9e6679-7425-40de-944b-e07fc1f90ae2',
  
  // Testing special cases
  NEW_STUDENT: 'dc9e6679-7425-40de-944b-e07fc1f90ae3',
  INACTIVE: 'ec9e6679-7425-40de-944b-e07fc1f90ae4',
  NO_LESSONS: 'fc9e6679-7425-40de-944b-e07fc1f90ae5',
};

// Development lesson UUIDs
export const DEV_LESSON_UUIDS = {
  // Emma's lessons
  EMMA_LESSON_1: '1d9e6679-7425-40de-944b-e07fc1f90ae1',
  EMMA_LESSON_2: '2d9e6679-7425-40de-944b-e07fc1f90ae2',
  EMMA_LESSON_3: '3d9e6679-7425-40de-944b-e07fc1f90ae3',
  
  // James's lessons
  JAMES_LESSON_1: '4d9e6679-7425-40de-944b-e07fc1f90ae4',
  JAMES_LESSON_2: '5d9e6679-7425-40de-944b-e07fc1f90ae5',
  JAMES_LESSON_3: '6d9e6679-7425-40de-944b-e07fc1f90ae6',
  
  // Sophia's lessons
  SOPHIA_LESSON_1: '7d9e6679-7425-40de-944b-e07fc1f90ae7',
  SOPHIA_LESSON_2: '8d9e6679-7425-40de-944b-e07fc1f90ae8',
  SOPHIA_LESSON_3: '9d9e6679-7425-40de-944b-e07fc1f90ae9'
};

// Development calendar event UUIDs
export const DEV_CALENDAR_UUIDS = {
  // Regular lessons
  EMMA_CALENDAR_1: 'ad9e6679-7425-40de-944b-e07fc1f90a1a',
  JAMES_CALENDAR_1: 'bd9e6679-7425-40de-944b-e07fc1f90a1b',
  SOPHIA_CALENDAR_1: 'cd9e6679-7425-40de-944b-e07fc1f90a1c',
  
  // Special events
  RECITAL: 'dd9e6679-7425-40de-944b-e07fc1f90a1d',
  WORKSHOP: 'ed9e6679-7425-40de-944b-e07fc1f90a1e',
  MASTERCLASS: 'fd9e6679-7425-40de-944b-e07fc1f90a1f'
};

// Development repertoire UUIDs
export const DEV_REPERTOIRE_UUIDS = {
  // Piece master records
  BACH_SONATA: '1e9e6679-7425-40de-944b-e07fc1f90b01',
  PAGANINI_CAPRICE: '2e9e6679-7425-40de-944b-e07fc1f90b02',
  MOZART_CONCERTO: '3e9e6679-7425-40de-944b-e07fc1f90b03',
  KREISLER_PIECES: '4e9e6679-7425-40de-944b-e07fc1f90b04',
  BRUCH_CONCERTO: '5e9e6679-7425-40de-944b-e07fc1f90b05',
  TCHAIKOVSKY_CONCERTO: '6e9e6679-7425-40de-944b-e07fc1f90b06',
  
  // Student-specific repertoire assignments
  EMMA_BACH: '7e9e6679-7425-40de-944b-e07fc1f90b07',
  JAMES_PAGANINI: '8e9e6679-7425-40de-944b-e07fc1f90b08',
  SOPHIA_TCHAIKOVSKY: '9e9e6679-7425-40de-944b-e07fc1f90b09'
};

// Special case UUIDs for testing
export const DEV_SPECIAL_UUIDS = {
  INVALID_FORMAT: 'not-a-uuid',
  NULL_VALUE: null,
  EMPTY_STRING: '',
  UNDEFINED_VALUE: undefined
}; 