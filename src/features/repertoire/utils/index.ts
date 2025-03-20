// Re-export repertoire utility functions
// This allows us to start using feature-based imports

export {
  getMasterPieceById,
  clearPieceCache,
  getPieceDetails,
  getPieceTitle,
  getPieceComposer,
  getPieceDifficulty,
  migrateToMasterPieceReference,
  createMasterPiece,
  createStudentPiece
} from '@/lib/utils/repertoire-utils'; 