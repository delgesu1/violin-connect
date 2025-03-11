import { RepertoirePiece, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { migrateToMasterPieceReference, createMasterPiece } from '@/lib/utils/repertoire-utils';
import { IdGenerator } from '@/lib/id-utils';

/**
 * Migrates all student pieces in a student's repertoire to use masterPieceId references
 * 
 * @param studentRepertoire Array of legacy repertoire pieces
 * @param masterRepertoire The master repertoire list to find matching pieces
 * @returns Migrated student repertoire with all pieces having masterPieceId
 */
export const migrateStudentRepertoire = (
  studentRepertoire: LegacyRepertoirePiece[], 
  masterRepertoire: RepertoireItemData[]
): RepertoirePiece[] => {
  const migratedPieces: RepertoirePiece[] = [];
  const newMasterPieces: RepertoireItemData[] = [];
  
  // Process each piece
  for (const piece of studentRepertoire) {
    // Skip if already has a masterPieceId
    if (piece.masterPieceId) {
      migratedPieces.push(piece as RepertoirePiece);
      continue;
    }
    
    // Skip if missing essential data
    if (!piece.title || !piece.composer) {
      console.warn('Skipping piece migration due to missing data:', piece);
      continue;
    }
    
    // Try to find a matching master piece
    const masterPiece = masterRepertoire.find(p => 
      p.title === piece.title && 
      p.composer === piece.composer
    );
    
    if (masterPiece) {
      // Match found, use it
      migratedPieces.push({
        ...piece,
        masterPieceId: masterPiece.id
      } as RepertoirePiece);
    } else {
      // No match found, create a new master piece
      const newMasterPiece = createMasterPiece(
        piece.title,
        piece.composer
      );
      
      // Add to our list of new master pieces
      newMasterPieces.push(newMasterPiece);
      
      // Create a migrated student piece with reference to the new master piece
      migratedPieces.push({
        ...piece,
        masterPieceId: newMasterPiece.id
      } as RepertoirePiece);
    }
  }
  
  return migratedPieces;
};

/**
 * Migrates all student pieces for all students
 * 
 * @param students Array of students with repertoire
 * @param masterRepertoire The master repertoire list
 * @returns { students, newMasterPieces } with migrated data
 */
export const migrateAllStudentPieces = (
  students: any[], 
  masterRepertoire: RepertoireItemData[]
) => {
  let updatedMasterRepertoire = [...masterRepertoire];
  const newMasterPieces: RepertoireItemData[] = [];
  
  // Process each student
  const migratedStudents = students.map(student => {
    const currentRepertoire = student.currentRepertoire || [];
    const pastRepertoire = student.pastRepertoire || [];
    
    // Process current and past repertoire
    const migratedCurrentRepertoire = migrateStudentRepertoire(currentRepertoire, updatedMasterRepertoire);
    const migratedPastRepertoire = migrateStudentRepertoire(pastRepertoire, updatedMasterRepertoire);
    
    // Update the master repertoire for the next student
    updatedMasterRepertoire = [...updatedMasterRepertoire, ...newMasterPieces];
    
    // Return the updated student
    return {
      ...student,
      currentRepertoire: migratedCurrentRepertoire,
      pastRepertoire: migratedPastRepertoire
    };
  });
  
  return { 
    students: migratedStudents, 
    newMasterPieces 
  };
};

/**
 * Updates lessons to reference repertoire pieces with masterPieceId
 * 
 * @param lessons Array of lessons with repertoire
 * @param masterRepertoire The master repertoire list
 * @returns Migrated lessons
 */
export const migrateLessonRepertoire = (lessons: any[], masterRepertoire: RepertoireItemData[]) => {
  return lessons.map(lesson => {
    if (!lesson.repertoire || !Array.isArray(lesson.repertoire)) {
      return lesson;
    }
    
    const migratedRepertoire = migrateStudentRepertoire(
      lesson.repertoire, 
      masterRepertoire
    );
    
    return {
      ...lesson,
      repertoire: migratedRepertoire
    };
  });
}; 