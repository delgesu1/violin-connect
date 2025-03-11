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

/**
 * Determine the entity type from a prefixed ID
 * @param prefixedId The full prefixed ID
 * @returns Entity type key or null if no match
 */
export const getEntityTypeFromId = (prefixedId: string): keyof typeof ID_PREFIXES | null => {
  for (const [key, prefix] of Object.entries(ID_PREFIXES)) {
    if (prefixedId.startsWith(prefix)) {
      return key as keyof typeof ID_PREFIXES;
    }
  }
  return null;
};

/**
 * Ensure an ID has the correct prefix
 * @param id ID with or without prefix
 * @param expectedPrefix The expected prefix
 * @returns Correctly prefixed ID
 */
export const ensureIdHasPrefix = (id: string, expectedPrefix: string): string => {
  // If already has the correct prefix, return as is
  if (id.startsWith(expectedPrefix)) {
    return id;
  }
  
  // Check if it has a different prefix
  for (const prefix of Object.values(ID_PREFIXES)) {
    if (id.startsWith(prefix)) {
      // Has wrong prefix, strip it and add correct one
      return expectedPrefix + id.substring(prefix.length);
    }
  }
  
  // No prefix, add it
  return expectedPrefix + id;
};

/**
 * Compare IDs, ignoring prefix differences
 * @param id1 First ID
 * @param id2 Second ID
 * @returns True if IDs match (ignoring prefixes)
 */
export const idsMatch = (id1: string, id2: string): boolean => {
  return getIdWithoutPrefix(id1) === getIdWithoutPrefix(id2);
};

/**
 * Log ID inconsistencies in development mode
 * @param context Description of where the ID is being used
 * @param id The ID to check
 * @param expectedPrefix The expected prefix
 */
export const logIdInconsistency = (context: string, id: string, expectedPrefix: string): void => {
  if (process.env.NODE_ENV === 'development' && !id.startsWith(expectedPrefix)) {
    console.warn(`ID Inconsistency in ${context}: ID ${id} should use prefix ${expectedPrefix}`);
  }
};

/**
 * ID Generator factory class for centralized ID creation
 */
export class IdGenerator {
  /**
   * Create a student ID
   * @param id The numeric or string ID
   * @returns Prefixed student ID
   */
  static student(id: string | number): string {
    return createPrefixedId(ID_PREFIXES.STUDENT, id);
  }
  
  /**
   * Create a lesson ID
   * @param id The numeric or string ID
   * @returns Prefixed lesson ID
   */
  static lesson(id: string | number): string {
    return createPrefixedId(ID_PREFIXES.LESSON, id);
  }
  
  /**
   * Create a piece ID
   * @param id The numeric or string ID
   * @returns Prefixed piece ID
   */
  static piece(id: string | number): string {
    return createPrefixedId(ID_PREFIXES.PIECE, id);
  }
  
  /**
   * Create a file attachment ID
   * @param id The numeric or string ID
   * @returns Prefixed file ID
   */
  static file(id: string | number): string {
    return createPrefixedId(ID_PREFIXES.FILE, id);
  }
  
  /**
   * Create a message ID
   * @param id The numeric or string ID
   * @returns Prefixed message ID
   */
  static message(id: string | number): string {
    return createPrefixedId(ID_PREFIXES.MESSAGE, id);
  }
  
  /**
   * Create a link ID
   * @param id The numeric or string ID
   * @returns Prefixed link ID
   */
  static link(id: string | number): string {
    return createPrefixedId(ID_PREFIXES.LINK, id);
  }
  
  /**
   * Create a student piece ID
   * @param studentId Student ID (with or without prefix)
   * @param pieceId Piece ID (with or without prefix)
   * @returns Prefixed student-piece ID
   */
  static studentPiece(studentId: string | number, pieceId: string | number): string {
    return createStudentPieceId(studentId.toString(), pieceId.toString());
  }
} 