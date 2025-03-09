import { RepertoirePiece } from '@/components/common/StudentCard';
import { RepertoireItemData } from '@/components/common/RepertoireItem';

/**
 * Get a master piece by ID from the master repertoire list
 * 
 * @param pieceId ID of the master piece to find
 * @param repertoireList The master repertoire list to search in
 * @returns The found master piece or undefined if not found
 */
export const getMasterPieceById = (pieceId: string, repertoireList: RepertoireItemData[]): RepertoireItemData | undefined => {
  return repertoireList.find(p => p.id === pieceId);
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