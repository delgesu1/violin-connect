/**
 * Repertoire Hooks
 * 
 * This file exports all repertoire-related hooks for easier imports.
 */

// Master repertoire hooks
export {
  useMasterRepertoire,
  useMasterRepertoirePiece,
  useCreateMasterRepertoire,
  useUpdateMasterRepertoire,
  useDeleteMasterRepertoire,
  type MasterRepertoire,
  type NewMasterRepertoire,
  type UpdateMasterRepertoire
} from './useMasterRepertoire';

// Student repertoire hooks
export { 
  useStudentRepertoire,
  useAssignRepertoire,
  useUpdateStudentRepertoire,
  useDeleteStudentRepertoire,
  type StudentRepertoire,
  type NewStudentRepertoire,
  type UpdateStudentRepertoire
} from './useStudentRepertoire';

// Student history hooks
export {
  usePieceStudentHistory,
  type StudentHistoryEntry,
  type HistorySourceType
} from './usePieceStudentHistory';

// File hooks
export { 
  useRepertoireFiles,
  useCreateRepertoireFile,
  useDeleteRepertoireFile,
  type RepertoireFile,
  type NewRepertoireFile,
  type FileSourceType
} from './useRepertoireFiles';

// Link hooks
export { 
  useRepertoireLinks,
  useCreateRepertoireLink,
  useDeleteRepertoireLink,
  type RepertoireLink,
  type NewRepertoireLink,
  type LinkSourceType
} from './useRepertoireLinks';

// Re-export legacy attachment hooks for backward compatibility
export { 
  useAddRepertoireFile,
  useAddRepertoireLink 
} from '@/hooks/useRepertoireAttachments';

// Re-export context hook for backward compatibility
export { useRepertoire as useRepertoireContext } from '@/contexts/RepertoireContext'; 