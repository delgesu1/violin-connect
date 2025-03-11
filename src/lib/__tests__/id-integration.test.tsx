/**
 * Integration tests for ID utilities
 * 
 * This file tests how ID utilities work in the context of
 * entity lookups and relationships.
 */

import { 
  ID_PREFIXES, 
  createPrefixedId, 
  getIdWithoutPrefix, 
  idsMatch,
  IdGenerator
} from '../id-utils';

// Mock entity data for testing
const mockStudents = [
  { id: 's-1', name: 'Emma Thompson' },
  { id: 's-2', name: 'William Taylor' },
  { id: '3', name: 'Sophia Robinson' }, // Note: Unprefixed ID (legacy)
];

const mockLessons = [
  { id: 'l-101', studentId: 's-1', date: '2023-10-10' },
  { id: 'l-102', studentId: '1', date: '2023-10-17' }, // Note: Unprefixed studentId
  { id: 'l-201', studentId: 's-2', date: '2023-10-12' },
  { id: 'l-301', studentId: '3', date: '2023-10-14' }, // Both unprefixed
];

const mockPieces = [
  { id: 'p-1', title: 'Bach Partita No. 2' },
  { id: '2', title: 'Paganini Caprice No. 24' }, // Unprefixed ID
];

// Test a typical entity lookup (student by ID)
test('finds student with both prefixed and unprefixed IDs', () => {
  // Function that mimics application's entity lookup
  const findStudentById = (id: string) => {
    // First try exact match
    let student = mockStudents.find(s => s.id === id);
    
    // If not found, try with ID utility
    if (!student) {
      student = mockStudents.find(s => idsMatch(s.id, id));
    }
    
    return student;
  };
  
  // Test with a prefixed ID (direct format)
  expect(findStudentById('s-1')).toEqual({ id: 's-1', name: 'Emma Thompson' });
  
  // Test with an unprefixed ID (should still find the student)
  expect(findStudentById('1')).toEqual({ id: 's-1', name: 'Emma Thompson' });
  
  // Test with a mixed case (student exists but has unprefixed ID)
  expect(findStudentById('s-3')).toEqual({ id: '3', name: 'Sophia Robinson' });
  expect(findStudentById('3')).toEqual({ id: '3', name: 'Sophia Robinson' });
});

// Test finding lessons for a student
test('finds all lessons for a student regardless of ID format', () => {
  // Function that mimics lessons-by-student lookup
  const findLessonsForStudent = (studentId: string) => {
    return mockLessons.filter(lesson => {
      // Check if the student IDs match, ignoring prefix differences
      return idsMatch(lesson.studentId, studentId);
    });
  };
  
  // Test with a prefixed student ID
  const emmaPrefixedLessons = findLessonsForStudent('s-1');
  expect(emmaPrefixedLessons).toHaveLength(2);
  expect(emmaPrefixedLessons.map(l => l.id)).toContain('l-101');
  expect(emmaPrefixedLessons.map(l => l.id)).toContain('l-102');
  
  // Test with an unprefixed student ID 
  const emmaUnprefixedLessons = findLessonsForStudent('1');
  expect(emmaUnprefixedLessons).toHaveLength(2);
  expect(emmaUnprefixedLessons.map(l => l.id)).toContain('l-101');
  expect(emmaUnprefixedLessons.map(l => l.id)).toContain('l-102');
});

// Test ID generation and matching with the IdGenerator
test('IdGenerator creates IDs that can be matched with existing data', () => {
  // Create a new student ID
  const newStudentId = IdGenerator.student('4');
  expect(newStudentId).toBe('s-4');
  
  // Create a new prefixed lesson ID linked to this student
  const newLessonId = IdGenerator.lesson('401');
  expect(newLessonId).toBe('l-401');
  
  // Add a new lesson with the generated IDs
  const newLesson = {
    id: newLessonId,
    studentId: newStudentId,
    date: '2023-11-01'
  };
  const updatedLessons = [...mockLessons, newLesson];
  
  // Now try to look up lessons for the student using different ID formats
  const studentLessons = updatedLessons.filter(lesson => 
    idsMatch(lesson.studentId, '4')
  );
  
  expect(studentLessons).toHaveLength(1);
  expect(studentLessons[0].id).toBe('l-401');
}); 