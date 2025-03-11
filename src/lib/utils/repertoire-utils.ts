import { RepertoirePiece } from '@/components/common/StudentCard';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { IdGenerator, idsMatch } from '@/lib/id-utils';

// Simple in-memory cache for piece lookups
const pieceCache = new Map<string, RepertoireItemData>();

/**
 * Get a master piece by ID from the master repertoire list
 * 
 * @param pieceId ID of the master piece to find
 * @param repertoireList The master repertoire list to search in
 * @returns The found master piece or undefined if not found
 */
export const getMasterPieceById = (pieceId: string, repertoireList: RepertoireItemData[]): RepertoireItemData | undefined => {
  if (!pieceId) return undefined;
  
  // Check cache first
  if (pieceCache.has(pieceId)) {
    return pieceCache.get(pieceId);
  }
  
  // Find by exact match first
  let masterPiece = repertoireList.find(p => p.id === pieceId);
  
  // If not found, try with ID matching (ignore prefixes)
  if (!masterPiece) {
    masterPiece = repertoireList.find(p => idsMatch(p.id, pieceId));
  }
  
  // Cache the result (even if undefined)
  if (masterPiece) {
    pieceCache.set(pieceId, masterPiece);
  }
  
  return masterPiece;
};

/**
 * Clear the master piece cache
 * Call this when repertoire data is updated
 */
export const clearPieceCache = (): void => {
  pieceCache.clear();
};

/**
 * Get details (title, composer, etc.) from a student repertoire piece
 * Works with both new-style pieces (with masterPieceId) and old-style pieces (with embedded title/composer)
 * 
 * @param studentPiece A student's repertoire piece
 * @param repertoireList The master repertoire list to search in
 * @returns An object with title, composer, and optionally difficulty
 */
export const getPieceDetails = (studentPiece: RepertoirePiece, repertoireList: RepertoireItemData[]): { title: string; composer: string; difficulty?: string } => {
  // If the piece has a masterPieceId, look up the details from the master repertoire
  if (studentPiece.masterPieceId) {
    const masterPiece = getMasterPieceById(studentPiece.masterPieceId, repertoireList);
    if (masterPiece) {
      return {
        title: masterPiece.title,
        composer: masterPiece.composer,
        difficulty: masterPiece.difficulty
      };
    }
  }
  
  // Fallback to using the deprecated fields for backward compatibility
  // This also handles cases where the master piece might not be found
  return {
    title: studentPiece.title || 'Unknown Piece',
    composer: studentPiece.composer || 'Unknown Composer'
  };
};

/**
 * Get the title of a piece safely, using masterPieceId if available
 * 
 * @param piece Student repertoire piece
 * @param repertoireList Master repertoire list
 * @returns The piece title
 */
export const getPieceTitle = (piece: RepertoirePiece, repertoireList: RepertoireItemData[]): string => {
  if (process.env.NODE_ENV === 'development' && piece.title && !piece.masterPieceId) {
    console.warn('Using deprecated direct title property instead of masterPieceId in', piece);
  }
  
  if (piece.masterPieceId) {
    const masterPiece = getMasterPieceById(piece.masterPieceId, repertoireList);
    if (masterPiece) {
      return masterPiece.title;
    }
  }
  
  return piece.title || 'Unknown Piece';
};

/**
 * Get the composer of a piece safely, using masterPieceId if available
 * 
 * @param piece Student repertoire piece
 * @param repertoireList Master repertoire list
 * @returns The piece composer
 */
export const getPieceComposer = (piece: RepertoirePiece, repertoireList: RepertoireItemData[]): string => {
  if (process.env.NODE_ENV === 'development' && piece.composer && !piece.masterPieceId) {
    console.warn('Using deprecated direct composer property instead of masterPieceId in', piece);
  }
  
  if (piece.masterPieceId) {
    const masterPiece = getMasterPieceById(piece.masterPieceId, repertoireList);
    if (masterPiece) {
      return masterPiece.composer;
    }
  }
  
  return piece.composer || 'Unknown Composer';
};

/**
 * Get the difficulty of a piece, using masterPieceId to look it up
 * 
 * @param piece Student repertoire piece
 * @param repertoireList Master repertoire list
 * @returns The difficulty level or undefined
 */
export const getPieceDifficulty = (piece: RepertoirePiece, repertoireList: RepertoireItemData[]): string | undefined => {
  if (piece.masterPieceId) {
    const masterPiece = getMasterPieceById(piece.masterPieceId, repertoireList);
    if (masterPiece) {
      return masterPiece.difficulty;
    }
  }
  
  return undefined;
};

/**
 * Migrate an old-style student repertoire piece to the new format with masterPieceId
 * This is useful for converting existing data to the new format
 * 
 * @param piece Old-style student repertoire piece with embedded title/composer
 * @param repertoireList The master repertoire list to search in
 * @returns A new student piece object with masterPieceId if a matching master piece is found
 */
export const migrateToMasterPieceReference = (piece: RepertoirePiece, repertoireList: RepertoireItemData[]): RepertoirePiece => {
  // Skip if it already has a masterPieceId
  if (piece.masterPieceId) {
    return piece;
  }
  
  // Try to find a matching master piece based on title and composer
  const matchingMasterPiece = repertoireList.find(masterPiece => 
    masterPiece.title === piece.title && 
    masterPiece.composer === piece.composer
  );
  
  if (matchingMasterPiece) {
    // Return a new object with the masterPieceId, but also keep the original title/composer for backward compatibility
    return {
      ...piece,
      masterPieceId: matchingMasterPiece.id
    };
  }
  
  // If no match is found, return the original piece
  return piece;
};

/**
 * Create a new master repertoire piece
 * 
 * @param title Piece title
 * @param composer Composer name
 * @param difficulty Difficulty level
 * @param notes Optional notes
 * @returns A new master repertoire piece with a unique ID
 */
export const createMasterPiece = (
  title: string, 
  composer: string, 
  difficulty?: 'beginner' | 'intermediate' | 'advanced',
  notes?: string
): RepertoireItemData => {
  return {
    id: IdGenerator.piece(Date.now().toString()),
    title,
    composer,
    difficulty,
    notes,
    startedDate: new Date().toISOString().split('T')[0]
  };
};

/**
 * Create a student repertoire piece linked to a master piece
 * 
 * @param masterPieceId ID of the master piece
 * @param studentId ID of the student
 * @param status Current status of the piece
 * @param notes Optional notes specific to this student's work on the piece
 * @returns A new student repertoire piece
 */
export const createStudentPiece = (
  masterPieceId: string,
  studentId: string,
  status: 'current' | 'completed' | 'planned' = 'current',
  notes?: string
): RepertoirePiece => {
  const startDate = new Date().toISOString().split('T')[0];
  
  return {
    // Create a unique ID for this student-piece association
    id: `${studentId}-${masterPieceId}-${Date.now()}`,
    masterPieceId,
    startDate,
    status,
    notes
  };
}; 