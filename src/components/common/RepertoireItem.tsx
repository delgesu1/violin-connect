import React from 'react';
import { cn } from '@/lib/utils';
import { Music, Calendar, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRepertoire } from '@/contexts/RepertoireContext';

export interface RepertoireItemData {
  id: string;
  title: string;
  composer: string;
  startedDate: string;
  endDate?: string; // Added to track when a piece was completed
  status?: 'current' | 'completed' | 'planned'; // Optional for Master Repertoire
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  studentId?: string; // Added to track student association
  notes?: string;
}

interface RepertoireItemProps {
  item: RepertoireItemData;
  className?: string;
  layout?: 'card' | 'grid' | 'table';
  onClick?: () => void;
  formatComposerName?: (name: string) => string;
}

/**
 * RepertoireItem component
 * 
 * Displays a single repertoire piece. Uses the RepertoireContext
 * for compatibility with the new data model while maintaining the
 * old interface for backwards compatibility.
 */
const RepertoireItem: React.FC<RepertoireItemProps> = ({ 
  item, 
  className,
  layout = 'card',
  onClick,
  formatComposerName
}) => {
  // Use the repertoire context for consistent display
  const { getPieceTitle, getPieceComposer } = useRepertoire();
  
  // Adapt the item for use with context utilities - converting from RepertoireItemData to a format
  // that works with getPieceTitle and getPieceComposer
  const adaptedPiece = {
    ...item,
    // Ensure required properties exist for the legacy piece format if they don't already
    startDate: item.startedDate || '2000-01-01',
    status: item.status || 'current',
    // Use masterPieceId if available, otherwise this will be a direct access
  };
  
  // Get piece info using context utilities
  const title = getPieceTitle(adaptedPiece as any);
  const composer = getPieceComposer(adaptedPiece as any);
  
  // Apply composer formatting if provided
  const displayComposer = formatComposerName ? formatComposerName(composer) : composer;
  
  if (layout === 'grid') {
    return (
      <div 
        className={cn(
          "p-3 border rounded-lg transition-all duration-200 hover:bg-muted/50 cursor-pointer",
          item.status === 'current' ? 'bg-primary/5 border-primary/20' : 
          item.status === 'completed' ? 'bg-green-500/5 border-green-500/20' : 
          'bg-card',
          className
        )}
        onClick={onClick}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className={cn(
                "rounded-full p-1.5",
                item.status === 'current' ? 'bg-primary/10 text-primary' : 
                item.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                'bg-muted text-muted-foreground'
              )}
            >
              {item.status === 'completed' ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : (
                <Music className="h-3.5 w-3.5" />
              )}
            </div>
            {item.difficulty && (
              <Badge variant="outline" className="text-xs ml-auto">
                {item.difficulty}
              </Badge>
            )}
          </div>
          
          <h3 className="font-medium text-sm truncate">{title}</h3>
          <p className="text-xs text-muted-foreground truncate">{displayComposer}</p>
          
          <div className="mt-auto pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span className="truncate">{item.startedDate}</span>
            </div>
            
            {item.notes && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{item.notes}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (layout === 'table') {
    // Table row layout is managed by parent component
    return null;
  }
  
  // Default card layout
  return (
    <div 
      className={cn(
        "p-4 border rounded-lg transition-all duration-300 card-hover",
        item.status === 'current' ? 'bg-primary/5 border-primary/20' : 
        item.status === 'completed' ? 'bg-green-500/5 border-green-500/20' : 
        'bg-card',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "rounded-full p-2",
              item.status === 'current' ? 'bg-primary/10 text-primary' : 
              item.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
              'bg-muted text-muted-foreground'
            )}
          >
            {item.status === 'completed' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Music className="h-4 w-4" />
            )}
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{displayComposer}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          {item.difficulty && (
            <Badge variant="outline" className="text-xs">
              {item.difficulty}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{item.startedDate}</span>
            {item.endDate && item.status === 'completed' && (
              <>
                <span>→</span>
                <span>{item.endDate}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {item.notes && (
        <div className="mt-2 text-sm text-muted-foreground pl-9">
          <p>{item.notes}</p>
        </div>
      )}
    </div>
  );
};

export default RepertoireItem;
