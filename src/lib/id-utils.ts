// ID utility functions
// This file provides consistent ID generation and validation for the application

// Prefix constants
export const ID_PREFIXES = {
  STUDENT: 's-',   // Student: s-1, s-2, etc.
  PIECE: 'p-',     // Master repertoire piece: p-1, p-2, etc.
  STUDENT_PIECE: 'sp-', // Student's repertoire piece: sp-1, sp-2, etc.
  LESSON: 'l-',    // Lesson: l-1, l-2, etc.
  FILE: 'f-',      // File attachment: f-1, f-2, etc.
  MESSAGE: 'm-',   // Message: m-1, m-2, etc.
  LINK: 'link-',   // Link resource: link-1, link-2, etc.
};

/**
 * Creates a new ID with the appropriate prefix
 * @param type The entity type (use ID_PREFIXES constant)
 * @param id The numeric ID or string ID
 * @returns A properly formatted ID string
 */
export const createPrefixedId = (type: string, id: string | number): string => {
  // If the ID already has this prefix, return it as is
  if (typeof id === 'string' && id.startsWith(type)) {
    return id;
  }
  
  // Otherwise, add the prefix
  return `${type}${id}`;
};

/**
 * Extracts the numeric part of a prefixed ID
 * @param prefixedId The full prefixed ID (e.g., "s-1")
 * @returns The numeric part as a string (e.g., "1")
 */
export const getIdWithoutPrefix = (prefixedId: string): string => {
  for (const prefix of Object.values(ID_PREFIXES)) {
    if (prefixedId.startsWith(prefix)) {
      return prefixedId.substring(prefix.length);
    }
  }
  // If no prefix was found, return the original ID
  return prefixedId;
};

/**
 * Creates a student repertoire piece ID by combining student ID and master piece ID
 * @param studentId The student ID (can be with or without prefix)
 * @param pieceId The master piece ID (can be with or without prefix)
 * @returns A formatted student-piece ID (e.g., "sp-s1-p2")
 */
export const createStudentPieceId = (studentId: string, pieceId: string): string => {
  // Remove prefixes if they exist
  const studentIdClean = getIdWithoutPrefix(studentId);
  const pieceIdClean = getIdWithoutPrefix(pieceId);
  
  // Create the new composite ID
  return `${ID_PREFIXES.STUDENT_PIECE}${studentIdClean}-${pieceIdClean}`;
};

/**
 * Checks if an ID belongs to a specific type by its prefix
 * @param id The ID to check
 * @param type The type prefix to check against (use ID_PREFIXES constant)
 * @returns True if the ID matches the type
 */
export const isIdOfType = (id: string, type: string): boolean => {
  return id.startsWith(type);
}; 