import { migrateAllStudentPieces, migrateLessonRepertoire } from './migrate-repertoire-pieces';
import { Student } from '@/components/common/StudentCard';
import { RepertoireItemData } from '@/components/common/RepertoireItem';

/**
 * Run all data migrations for the application
 * This should be called when the application starts to ensure
 * all data is in the correct format
 * 
 * In a real application, these migrations would be managed by a database
 * or a proper migration system, but for this mock data app, we'll
 * just run them in memory.
 */
export const runMigrations = (
  studentsData: Student[],
  repertoireData: RepertoireItemData[]
): { 
  migratedStudents: Student[], 
  migratedRepertoire: RepertoireItemData[] 
} => {
  console.log('Running data migrations...');
  
  // First, migrate all student repertoire pieces
  const { students: studentsWithRepertoire, newMasterPieces } = migrateAllStudentPieces(
    studentsData,
    repertoireData
  );
  
  // Add any new master pieces to the repertoire
  const updatedRepertoire = [...repertoireData, ...newMasterPieces];
  
  // Return the updated data
  return {
    migratedStudents: studentsWithRepertoire,
    migratedRepertoire: updatedRepertoire
  };
};

/**
 * Run a specific migration to update lessons
 */
export const migrateLessons = (
  lessonsData: any[],
  repertoireData: RepertoireItemData[]
): any[] => {
  console.log('Migrating lessons data...');
  return migrateLessonRepertoire(lessonsData, repertoireData);
}; 