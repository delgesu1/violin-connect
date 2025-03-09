import React from 'react';
import { Music } from 'lucide-react';
import { RepertoirePiece } from '@/components/common/StudentCard';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { getMasterPieceById, getPieceDetails } from '@/lib/utils/repertoire-utils';

interface RepertoireDisplayProps {
  piece: RepertoirePiece;
  masterRepertoire: RepertoireItemData[];
  className?: string;
}

/**
 * A component to display a repertoire piece, handling both old-style pieces 
 * (with embedded title/composer) and new-style pieces (with masterPieceId reference)
 */
const RepertoireDisplay: React.FC<RepertoireDisplayProps> = ({ 
  piece, 
  masterRepertoire,
  className 
}) => {
  // Get the title and composer, either from the piece itself or by looking up the master piece
  const details = getPieceDetails(piece, masterRepertoire);
  
  return (
    <div className={`flex items-start gap-2 text-sm p-2 rounded-md border bg-gray-50 ${className || ''}`}>
      <Music className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <div className="font-medium">{details.title}</div>
        {details.composer && <div className="text-muted-foreground text-xs">{details.composer}</div>}
        {piece.notes && <div className="text-muted-foreground text-xs mt-1">{piece.notes}</div>}
      </div>
    </div>
  );
};

export default RepertoireDisplay; 