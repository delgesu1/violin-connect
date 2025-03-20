// Re-export repertoire components from their original locations
// This allows us to start using feature-based imports

// Components that have been moved to the feature directory
export { RepertoireItem } from './RepertoireItem';
export type { RepertoireItemData } from './RepertoireItem';
export { default as PieceCard } from './PieceCard';

// Re-export components from original locations
export { default as RepertoireDisplay } from '@/components/common/RepertoireDisplay';
export { default as PieceDisplay } from '@/components/common/PieceDisplay';

// Repertoire-specific components
export { default as RepertoireFileUploader } from '@/components/repertoire/RepertoireFileUploader';
export { default as RepertoireLinkAdder } from '@/components/repertoire/RepertoireLinkAdder'; 