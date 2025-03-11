import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, RepertoirePiece, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { defaultMasterRepertoire } from '@/data/defaultRepertoire';
import { students as initialStudents } from '@/data/mockStudents';
import { runMigrations } from '@/lib/migrations/run-migrations';
import { getPieceTitle, getPieceComposer, getPieceDifficulty } from '@/lib/utils/repertoire-utils';

interface RepertoireContextType {
  // Data
  students: Student[];
  masterRepertoire: RepertoireItemData[];
  
  // Utility functions
  getPieceTitle: (piece: RepertoirePiece | LegacyRepertoirePiece) => string;
  getPieceComposer: (piece: RepertoirePiece | LegacyRepertoirePiece) => string;
  getPieceDifficulty: (piece: RepertoirePiece | LegacyRepertoirePiece) => string | undefined;
  
  // Actions
  updateStudent: (updatedStudent: Student) => void;
  addMasterPiece: (newPiece: Omit<RepertoireItemData, 'id'>) => RepertoireItemData;
  refreshMasterRepertoire: (newRepertoire: RepertoireItemData[]) => void;
  updateStudentsList: (newStudents: Student[]) => void;
}

const RepertoireContext = createContext<RepertoireContextType | undefined>(undefined);

export const useRepertoire = () => {
  const context = useContext(RepertoireContext);
  if (!context) {
    throw new Error('useRepertoire must be used within a RepertoireProvider');
  }
  return context;
};

interface RepertoireProviderProps {
  children: ReactNode;
}

export const RepertoireProvider: React.FC<RepertoireProviderProps> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [masterRepertoire, setMasterRepertoire] = useState<RepertoireItemData[]>(defaultMasterRepertoire);
  const [isInitialized, setIsInitialized] = useState(false);

  // Run migrations on initial load
  useEffect(() => {
    if (!isInitialized) {
      console.log('Running data migrations...');
      
      try {
        // Run migrations
        const { migratedStudents, migratedRepertoire } = runMigrations(
          initialStudents,
          defaultMasterRepertoire
        );
        
        // Update state with migrated data
        setStudents(migratedStudents);
        setMasterRepertoire(migratedRepertoire);
        
        console.log('Migration complete!');
        console.log(`- Migrated ${migratedStudents.length} students`);
        console.log(`- Repertoire now has ${migratedRepertoire.length} master pieces`);
      } catch (error) {
        console.error('Error running migrations:', error);
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Wrapper functions for piece data access
  const getPieceTitleWrapper = (piece: RepertoirePiece | LegacyRepertoirePiece): string => {
    return getPieceTitle(piece as RepertoirePiece, masterRepertoire);
  };
  
  const getPieceComposerWrapper = (piece: RepertoirePiece | LegacyRepertoirePiece): string => {
    return getPieceComposer(piece as RepertoirePiece, masterRepertoire);
  };
  
  const getPieceDifficultyWrapper = (piece: RepertoirePiece | LegacyRepertoirePiece): string | undefined => {
    return getPieceDifficulty(piece as RepertoirePiece, masterRepertoire);
  };
  
  // Action to update a student
  const updateStudent = (updatedStudent: Student) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };
  
  // Action to add a new master piece
  const addMasterPiece = (newPiece: Omit<RepertoireItemData, 'id'>): RepertoireItemData => {
    // In a real app, you would generate a proper ID or call an API
    const pieceWithId: RepertoireItemData = {
      ...newPiece,
      id: `p-${Date.now()}`,
    };
    
    setMasterRepertoire(prev => [...prev, pieceWithId]);
    return pieceWithId;
  };

  const refreshMasterRepertoire = (newRepertoire: RepertoireItemData[]) => {
    setMasterRepertoire(newRepertoire);
  };

  const updateStudentsList = (newStudents: Student[]) => {
    setStudents(newStudents);
  };

  const value: RepertoireContextType = {
    students,
    masterRepertoire,
    getPieceTitle: getPieceTitleWrapper,
    getPieceComposer: getPieceComposerWrapper,
    getPieceDifficulty: getPieceDifficultyWrapper,
    updateStudent,
    addMasterPiece,
    refreshMasterRepertoire,
    updateStudentsList,
  };

  return (
    <RepertoireContext.Provider value={value}>
      {children}
    </RepertoireContext.Provider>
  );
}; 