import { Student, RepertoirePiece, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { migrateToMasterPieceReference, createMasterPiece } from '@/lib/utils/repertoire-utils';
import { ID_PREFIXES, createPrefixedId } from '@/lib/id-utils';

/**
 * Migration statistics object
 */
export type MigrationStats = {
  totalPieces: number;
  migratedPieces: number;
  newMasterPiecesCreated: number;
  unmatchedPieces: number;
  errors: string[];
};

/**
 * Migrate all repertoire pieces in the application to use masterPieceId references
 * 
 * This function:
 * 1. Finds all pieces without masterPieceId across all students
 * 2. Attempts to match them with existing master pieces
 * 3. Creates new master pieces for unmatched pieces
 * 4. Updates all references to use the masterPieceId
 * 
 * @param students The array of students with their repertoire and lessons
 * @param masterRepertoire The master repertoire list
 * @param options Configuration options for the migration
 * @returns Migration statistics
 */
export const migrateAllPieces = (
  students: Student[],
  masterRepertoire: RepertoireItemData[],
  options: {
    createMissingMasterPieces?: boolean;
    dryRun?: boolean;
  } = { createMissingMasterPieces: true, dryRun: false }
): MigrationStats => {
  const stats: MigrationStats = {
    totalPieces: 0,
    migratedPieces: 0,
    newMasterPiecesCreated: 0,
    unmatchedPieces: 0,
    errors: []
  };
  
  // Create a working copy of the master repertoire that we can modify
  const workingMasterRepertoire = [...masterRepertoire];
  
  // Track unique title+composer combinations that need new master pieces
  const uniqueUnmatchedPieces = new Map<string, { title: string, composer: string, count: number }>();
  
  // First pass: identify all pieces and count them
  students.forEach(student => {
    // Process current repertoire
    if (student.currentRepertoire) {
      student.currentRepertoire.forEach(piece => {
        stats.totalPieces++;
        
        // Skip pieces that already have a masterPieceId
        if (piece.masterPieceId) {
          stats.migratedPieces++;
          return;
        }
        
        // Skip pieces without title or composer
        if (!piece.title || !piece.composer) {
          stats.errors.push(`Piece ${piece.id} is missing title or composer`);
          return;
        }
        
        // Try to find a matching master piece
        const matchingMasterPiece = workingMasterRepertoire.find(masterPiece => 
          masterPiece.title === piece.title && 
          masterPiece.composer === piece.composer
        );
        
        if (!matchingMasterPiece && options.createMissingMasterPieces) {
          // Track unique title+composer combinations for later creation
          const key = `${piece.title}|${piece.composer}`;
          if (uniqueUnmatchedPieces.has(key)) {
            uniqueUnmatchedPieces.get(key)!.count++;
          } else {
            uniqueUnmatchedPieces.set(key, { 
              title: piece.title, 
              composer: piece.composer,
              count: 1
            });
          }
        }
      });
    }
    
    // Process past repertoire
    if (student.pastRepertoire) {
      student.pastRepertoire.forEach(piece => {
        stats.totalPieces++;
        
        // Skip pieces that already have a masterPieceId
        if (piece.masterPieceId) {
          stats.migratedPieces++;
          return;
        }
        
        // Skip pieces without title or composer
        if (!piece.title || !piece.composer) {
          stats.errors.push(`Piece ${piece.id} is missing title or composer`);
          return;
        }
        
        // Try to find a matching master piece
        const matchingMasterPiece = workingMasterRepertoire.find(masterPiece => 
          masterPiece.title === piece.title && 
          masterPiece.composer === piece.composer
        );
        
        if (!matchingMasterPiece && options.createMissingMasterPieces) {
          // Track unique title+composer combinations for later creation
          const key = `${piece.title}|${piece.composer}`;
          if (uniqueUnmatchedPieces.has(key)) {
            uniqueUnmatchedPieces.get(key)!.count++;
          } else {
            uniqueUnmatchedPieces.set(key, { 
              title: piece.title, 
              composer: piece.composer,
              count: 1
            });
          }
        }
      });
    }
    
    // Process lesson repertoire
    if (student.lessons) {
      student.lessons.forEach(lesson => {
        if (lesson.repertoire) {
          lesson.repertoire.forEach(piece => {
            stats.totalPieces++;
            
            // Skip pieces that already have a masterPieceId
            if (piece.masterPieceId) {
              stats.migratedPieces++;
              return;
            }
            
            // Skip pieces without title or composer
            if (!piece.title || !piece.composer) {
              stats.errors.push(`Piece ${piece.id} in lesson ${lesson.id} is missing title or composer`);
              return;
            }
            
            // Try to find a matching master piece
            const matchingMasterPiece = workingMasterRepertoire.find(masterPiece => 
              masterPiece.title === piece.title && 
              masterPiece.composer === piece.composer
            );
            
            if (!matchingMasterPiece && options.createMissingMasterPieces) {
              // Track unique title+composer combinations for later creation
              const key = `${piece.title}|${piece.composer}`;
              if (uniqueUnmatchedPieces.has(key)) {
                uniqueUnmatchedPieces.get(key)!.count++;
              } else {
                uniqueUnmatchedPieces.set(key, { 
                  title: piece.title, 
                  composer: piece.composer,
                  count: 1
                });
              }
            }
          });
        }
      });
    }
  });
  
  // Create missing master pieces if needed
  if (options.createMissingMasterPieces && !options.dryRun) {
    uniqueUnmatchedPieces.forEach((pieceInfo) => {
      const newMasterPiece = createMasterPiece(
        pieceInfo.title,
        pieceInfo.composer,
        undefined // No difficulty information available
      );
      
      workingMasterRepertoire.push(newMasterPiece);
      stats.newMasterPiecesCreated++;
    });
  }
  
  // Second pass: actually perform the migration if not a dry run
  if (!options.dryRun) {
    students.forEach(student => {
      // Migrate current repertoire
      if (student.currentRepertoire) {
        student.currentRepertoire = student.currentRepertoire.map(piece => {
          if (piece.masterPieceId) return piece; // Already migrated
          return migrateToMasterPieceReference(piece as RepertoirePiece, workingMasterRepertoire);
        });
      }
      
      // Migrate past repertoire
      if (student.pastRepertoire) {
        student.pastRepertoire = student.pastRepertoire.map(piece => {
          if (piece.masterPieceId) return piece; // Already migrated
          return migrateToMasterPieceReference(piece as RepertoirePiece, workingMasterRepertoire);
        });
      }
      
      // Migrate lesson repertoire
      if (student.lessons) {
        student.lessons.forEach(lesson => {
          if (lesson.repertoire) {
            lesson.repertoire = lesson.repertoire.map(piece => {
              if (piece.masterPieceId) return piece; // Already migrated
              return migrateToMasterPieceReference(piece as RepertoirePiece, workingMasterRepertoire);
            });
          }
        });
      }
    });
  }
  
  // Calculate final stats
  stats.unmatchedPieces = stats.totalPieces - stats.migratedPieces - stats.newMasterPiecesCreated;
  
  return stats;
};

/**
 * Get a summary of the migration status for all pieces in the application
 * 
 * @param students The array of students with their repertoire and lessons
 * @returns Migration statistics in dry-run mode
 */
export const getMigrationStatus = (
  students: Student[],
  masterRepertoire: RepertoireItemData[]
): MigrationStats => {
  return migrateAllPieces(students, masterRepertoire, { 
    createMissingMasterPieces: false, 
    dryRun: true 
  });
}; 