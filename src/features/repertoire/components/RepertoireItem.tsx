import React from 'react';
import { Music, Calendar, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@core/components/ui/data-display';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@core/components/ui/overlays';
import { cn } from '@core/utils';
import { useRepertoire } from '@features/repertoire/contexts';

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
 * Displays a music piece from the repertoire with various layout options
 */
export function RepertoireItem({ 
  item, 
  className,
  layout = 'card',
  onClick,
  formatComposerName
}: RepertoireItemProps) {
  const { getPieceTitle, getPieceComposer } = useRepertoire();
  
  // Format composer name to display last name first if provided
  const formatComposer = (composer: string): string => {
    if (formatComposerName) {
      return formatComposerName(composer);
    }
    
    // Default formatting: if format function not provided
    if (composer.includes(',')) return composer; // Already formatted
    
    const parts = composer.split(' ');
    if (parts.length <= 1) return composer;
    
    const lastName = parts.pop();
    return `${lastName}, ${parts.join(' ')}`;
  };
  
  const getDifficultyColor = (): string => {
    if (!item.difficulty) return 'bg-gray-100 text-gray-600';
    
    switch (item.difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  const getStatusColor = (): string => {
    if (!item.status) return '';
    
    switch (item.status) {
      case 'current':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'planned':
        return 'bg-amber-50 border-amber-200';
      default:
        return '';
    }
  };
  
  // Format dates to be more readable
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };
  
  if (layout === 'grid') {
    return (
      <div 
        className={cn(
          "border rounded-md p-3 flex flex-col",
          "transition-all duration-150 hover:shadow-md cursor-pointer",
          getStatusColor(),
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
          
          {item.difficulty && (
            <Badge variant="outline" className={cn("ml-2 shrink-0", getDifficultyColor())}>
              {item.difficulty}
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground mb-2">
          {formatComposer(item.composer)}
        </div>
        
        <div className="mt-auto pt-2 flex items-center justify-between text-xs text-muted-foreground border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(item.startedDate)}</span>
          </div>
          
          {item.status === 'completed' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Completed</span>
            </Badge>
          )}
        </div>
      </div>
    );
  }
  
  if (layout === 'table') {
    return (
      <div 
        className={cn(
          "flex items-center p-2 hover:bg-muted/50 rounded-md cursor-pointer",
          className
        )}
        onClick={onClick}
      >
        <div className="flex-1 min-w-0 overflow-hidden text-ellipsis font-medium">
          {item.title}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden text-ellipsis text-muted-foreground">
          {formatComposer(item.composer)}
        </div>
        <div className="w-24 text-sm text-muted-foreground">
          {item.difficulty || 'N/A'}
        </div>
      </div>
    );
  }
  
  // Default card layout
  return (
    <div 
      className={cn(
        "border rounded-lg p-4 flex flex-col gap-2",
        "transition-all duration-150 hover:shadow-md cursor-pointer",
        getStatusColor(),
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
          <Music className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{formatComposer(item.composer)}</p>
        </div>
      </div>
    </div>
  );
} 