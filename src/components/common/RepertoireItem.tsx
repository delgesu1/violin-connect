
import React from 'react';
import { cn } from '@/lib/utils';
import { Music, Calendar, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface RepertoireItemData {
  id: string;
  title: string;
  composer: string;
  startedDate: string;
  status: 'current' | 'completed' | 'planned';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  studentId?: string; // Added to track student association
  notes?: string;
}

interface RepertoireItemProps {
  item: RepertoireItemData;
  className?: string;
}

const RepertoireItem: React.FC<RepertoireItemProps> = ({ item, className }) => {
  return (
    <div 
      className={cn(
        "p-4 border rounded-lg transition-all duration-300 card-hover",
        item.status === 'current' ? 'bg-primary/5 border-primary/20' : 'bg-card',
        className
      )}
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
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.composer}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {item.difficulty && (
            <Badge variant="outline" className="text-xs">
              {item.difficulty}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{item.startedDate}</span>
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
