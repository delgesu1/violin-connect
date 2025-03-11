import React from 'react';
import { RepertoirePiece, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { Badge } from '@/components/ui/badge';
import { useRepertoire } from '@/contexts/RepertoireContext';
import { Music } from 'lucide-react';

interface PieceDisplayProps {
  piece: RepertoirePiece | LegacyRepertoirePiece;
  layout?: 'inline' | 'card' | 'list' | 'detail';
  showDifficulty?: boolean;
  showStatus?: boolean;
  showDates?: boolean;
  className?: string;
}

/**
 * PieceDisplay component
 * 
 * A reusable component for displaying piece information that uses the RepertoireContext
 * to access piece details. This component handles both legacy pieces with direct title/composer
 * properties and new pieces with masterPieceId references.
 */
const PieceDisplay: React.FC<PieceDisplayProps> = ({
  piece,
  layout = 'inline',
  showDifficulty = false,
  showStatus = false,
  showDates = false,
  className = ''
}) => {
  // Get piece information from context
  const { getPieceTitle, getPieceComposer, getPieceDifficulty } = useRepertoire();
  
  // Get piece details
  const title = getPieceTitle(piece);
  const composer = getPieceComposer(piece);
  const difficulty = showDifficulty ? getPieceDifficulty(piece) : undefined;
  
  // Render different layouts based on the layout prop
  if (layout === 'inline') {
    return (
      <span className={`flex items-center ${className}`}>
        <span className="font-medium truncate">{title}</span>
        {composer && <span className="text-muted-foreground text-xs ml-1.5 truncate hidden md:inline">- {composer}</span>}
        {showDifficulty && difficulty && (
          <Badge variant="outline" className="ml-2 text-xs truncate hidden md:inline">{difficulty}</Badge>
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
    <div className={`flex items-start gap-2 text-sm p-2 rounded-md border bg-gray-50 ${className || ''}`}>
      <Music className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <div className="font-medium">{title}</div>
        {composer && <div className="text-muted-foreground text-xs">{composer}</div>}
        {piece.notes && <div className="text-muted-foreground text-xs mt-1">{piece.notes}</div>}
      </div>
    </div>
  );
};

export default PieceDisplay; 