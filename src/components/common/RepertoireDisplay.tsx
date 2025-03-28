import React from 'react';
import { RepertoirePiece, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { Badge } from '@/components/ui/badge';
import { Music } from 'lucide-react';
import { useRepertoire } from '@/contexts/RepertoireContext';
import PieceDisplay from './PieceDisplay';

/**
 * Props for the PieceInfo component
 * This component handles both legacy pieces (with direct title/composer)
 * and new-style pieces (with masterPieceId reference)
 */
interface PieceInfoProps {
  piece: RepertoirePiece | LegacyRepertoirePiece;
  repertoireList: RepertoireItemData[];
  layout?: 'inline' | 'card' | 'list' | 'detail';
  showDifficulty?: boolean;
  showStatus?: boolean;
  showDates?: boolean;
  className?: string;
}

/**
 * PieceInfo component
 * Displays information about a repertoire piece using the proper lookup mechanism
 * This abstracts away the implementation details of how piece info is stored/retrieved
 * 
 * @deprecated Use PieceDisplay component with RepertoireContext instead
 */
export const PieceInfo: React.FC<PieceInfoProps> = ({
  piece,
  repertoireList,
  layout = 'inline',
  showDifficulty = false,
  showStatus = false,
  showDates = false,
  className = ''
}) => {
  // Use context instead of direct utility functions
  const { getPieceTitle, getPieceComposer, getPieceDifficulty } = useRepertoire();
  
  // Get piece information using context utilities
  const title = getPieceTitle(piece);
  const composer = getPieceComposer(piece);
  const difficulty = showDifficulty ? getPieceDifficulty(piece) : undefined;
  
  // Render different layouts based on the layout prop
  if (layout === 'inline') {
    return (
      <span className={className}>
        <span className="font-medium">{title}</span>
        {composer && <span className="text-muted-foreground text-xs ml-1.5">- {composer}</span>}
        {showDifficulty && difficulty && (
          <Badge variant="outline" className="ml-2 text-xs">{difficulty}</Badge>
        )}
      </span>
    );
  }
  
  if (layout === 'list') {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="font-medium">{title}</div>
        {composer && <div className="text-muted-foreground text-xs">{composer}</div>}
        <div className="flex mt-1 gap-2">
          {showDifficulty && difficulty && (
            <Badge variant="outline" className="text-xs">{difficulty}</Badge>
          )}
          {showStatus && (
            <Badge 
              variant={piece.status === 'completed' ? 'secondary' : 'default'}
              className="text-xs"
            >
              {piece.status}
            </Badge>
          )}
        </div>
        {showDates && (
          <div className="text-xs text-muted-foreground mt-1">
            Started: {piece.startDate}
            {piece.endDate && ` • Completed: ${piece.endDate}`}
          </div>
        )}
      </div>
    );
  }
  
  if (layout === 'detail') {
    return (
      <div className={`space-y-2 ${className}`}>
        <h3 className="text-lg font-semibold">{title}</h3>
        <h4 className="text-base text-muted-foreground">{composer}</h4>
        
        <div className="flex flex-wrap gap-2">
          {showDifficulty && difficulty && (
            <Badge variant="outline">{difficulty}</Badge>
          )}
          {showStatus && (
            <Badge 
              variant={piece.status === 'completed' ? 'secondary' : 'default'}
            >
              {piece.status}
            </Badge>
          )}
        </div>
        
        {showDates && (
          <div className="text-sm text-muted-foreground">
            <div>Started: {piece.startDate}</div>
            {piece.endDate && <div>Completed: {piece.endDate}</div>}
          </div>
        )}
        
        {piece.notes && (
          <div className="mt-2">
            <h5 className="text-sm font-medium">Notes:</h5>
            <p className="text-sm">{piece.notes}</p>
          </div>
        )}
      </div>
    );
  }
  
  // Default card layout
  return (
    <div className={`p-4 border rounded-md ${className}`}>
      <h4 className="font-medium">{title}</h4>
      {composer && <p className="text-sm text-muted-foreground mt-1">{composer}</p>}
      
      <div className="flex flex-wrap gap-2 mt-2">
        {showDifficulty && difficulty && (
          <Badge variant="outline">{difficulty}</Badge>
        )}
        {showStatus && (
          <Badge 
            variant={piece.status === 'completed' ? 'secondary' : 'default'}
          >
            {piece.status}
          </Badge>
        )}
      </div>
      
      {showDates && (
        <div className="text-xs text-muted-foreground mt-2">
          Started: {piece.startDate}
          {piece.endDate && ` • Completed: ${piece.endDate}`}
        </div>
      )}
    </div>
  );
};

/**
 * Original RepertoireDisplay component updated to use PieceDisplay
 * This maintains backward compatibility with existing code
 */
interface RepertoireDisplayProps {
  piece: RepertoirePiece | LegacyRepertoirePiece;
  masterRepertoire?: RepertoireItemData[];
  className?: string;
}

const RepertoireDisplay: React.FC<RepertoireDisplayProps> = ({ 
  piece, 
  masterRepertoire,
  className 
}) => {
  return (
    <div className={`flex items-start gap-2 text-sm p-2 rounded-md border bg-gray-50 ${className || ''}`}>
      <Music className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <PieceDisplay
          piece={piece}
          layout="list"
          showStatus={true}
          className="p-0 border-0"
        />
        {piece.notes && <div className="text-muted-foreground text-xs mt-1">{piece.notes}</div>}
      </div>
    </div>
  );
};

export default RepertoireDisplay; 