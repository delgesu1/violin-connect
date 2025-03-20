import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@core/components/ui/data-display';
import { Avatar, AvatarFallback, AvatarImage, Badge } from '@core/components/ui/data-display';
import { Music, MessageSquare, Calendar, BookText, ChevronRight } from 'lucide-react';
import { cn } from '@core/utils';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { getPieceDetails, getPieceTitle, getPieceComposer } from '@/lib/utils/repertoire-utils';
import { PieceInfo } from '@/components/common/RepertoireDisplay';
import { Student, RepertoirePiece, LegacyRepertoirePiece } from '@features/students/types';

interface StudentCardProps {
  student: Student;
  className?: string;
  masterRepertoire?: RepertoireItemData[];
}

export function StudentCard({ student, className, masterRepertoire = [] }: StudentCardProps) {
  const navigate = useNavigate();
  
  const handleMessageBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/messages/${student.id}`);
  };
  
  const getDisplayText = (piece: RepertoirePiece | LegacyRepertoirePiece): string => {
    if (piece.masterPieceId && masterRepertoire.length > 0) {
      const masterPiece = masterRepertoire.find(mp => mp.id === piece.masterPieceId);
      if (masterPiece) {
        return `${masterPiece.title} - ${masterPiece.composer}`;
      }
    }
    
    // Fallback to direct properties (deprecated)
    return `${piece.title || 'Untitled'} - ${piece.composer || 'Unknown'}`;
  };
  
  // Calculate days until next lesson
  const daysUntilNextLesson = student.nextLesson 
    ? Math.ceil((new Date(student.nextLesson).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
    
  // Format next lesson text
  const nextLessonText = student.nextLesson
    ? daysUntilNextLesson === 0
      ? 'Today'
      : daysUntilNextLesson === 1
        ? 'Tomorrow'
        : `In ${daysUntilNextLesson} days`
    : 'Not scheduled';
    
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              {student.avatarUrl ? (
                <AvatarImage src={student.avatarUrl} alt={student.name} />
              ) : (
                <AvatarFallback>
                  {student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-base font-semibold">{student.name}</CardTitle>
              <CardDescription className="text-xs">
                {student.level || 'Beginner'}
              </CardDescription>
            </div>
          </div>
          
          {/* Badge indicators */}
          <div className="flex gap-1.5">
            {student.unreadMessages && student.unreadMessages > 0 && (
              <Badge 
                variant="destructive" 
                className="cursor-pointer" 
                onClick={handleMessageBadgeClick}
              >
                {student.unreadMessages}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 pb-3 space-y-3 text-sm">
        {/* Next lesson */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Next lesson</span>
          </div>
          <span className="font-medium">{nextLessonText}</span>
        </div>
        
        {/* Current repertoire count */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Music className="h-3.5 w-3.5" />
            <span>Current pieces</span>
          </div>
          <span className="font-medium">
            {student.currentRepertoire?.length || 0}
          </span>
        </div>
        
        {/* Latest piece */}
        {student.currentRepertoire && student.currentRepertoire.length > 0 && (
          <div className="pt-1 border-t">
            <div className="text-xs text-muted-foreground mb-1.5">Current piece</div>
            <div className="text-sm font-medium truncate">
              {getDisplayText(student.currentRepertoire[0])}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-0">
        <div className="w-full flex items-center justify-between p-3 pt-0 text-xs text-muted-foreground">
          <div>
            {student.startDate && (
              <span>Student since {new Date(student.startDate).toLocaleDateString()}</span>
            )}
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
} 