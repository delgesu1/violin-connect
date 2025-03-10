import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Music, MessageSquare, Calendar, BookText, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { getPieceDetails } from '@/lib/utils/repertoire-utils';

export interface RepertoirePiece {
  id: string;           // Unique ID for this student-piece assignment 
  masterPieceId?: string; // Reference to the master repertoire piece
  startDate: string;    // When student started learning this piece
  endDate?: string;     // When student completed this piece (if applicable)
  status: 'current' | 'completed' | 'planned';
  notes?: string;       // Student-specific notes about the piece
  
  // These fields will be kept for backward compatibility but marked as deprecated
  // They should be retrieved from the master piece using the masterPieceId
  title?: string;       // @deprecated - Use masterPieceId to lookup title
  composer?: string;    // @deprecated - Use masterPieceId to lookup composer
}

export interface Lesson {
  id: string;
  date: string;
  repertoire: RepertoirePiece[];
  transcriptUrl?: string;
  summary?: string;
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  avatarUrl?: string;
  currentRepertoire: RepertoirePiece[];
  pastRepertoire?: RepertoirePiece[];
  nextLesson?: string;
  unreadMessages?: number;
  lessons?: Lesson[];
}

interface StudentCardProps {
  student: Student;
  className?: string;
  masterRepertoire?: RepertoireItemData[];
}

const StudentCard: React.FC<StudentCardProps> = ({ student, className, masterRepertoire = [] }) => {
  const navigate = useNavigate();

  const handleMessageBadgeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/messages/${student.id}`);
  };

  // Helper function to get piece details, handling both old and new formats
  const getDisplayText = (piece: RepertoirePiece): string => {
    if (masterRepertoire.length > 0 && piece.masterPieceId) {
      // Use the utility function if we have the master repertoire list
      const details = getPieceDetails(piece, masterRepertoire);
      return details.composer ? `${details.title} - ${details.composer}` : details.title;
    }
    
    // Fallback to using the piece's own title/composer
    return piece.composer ? `${piece.title} - ${piece.composer}` : (piece.title || 'Unknown Piece');
  };

  return (
    <Link to={`/students/${student.id}`} className="block transition-all duration-200">
      <Card className={cn(
        "overflow-hidden transition-all duration-200 group bg-white border border-gray-200 hover:border-primary/30",
        "shadow-sm hover:shadow",
        className
      )}>
        <CardContent className="p-0">
          <div className="flex items-start p-4">
            {/* Avatar Column */}
            <div className="mr-4 relative">
              <Avatar className="h-16 w-16 border-2 border-white shadow-sm group-hover:shadow transition-all duration-300">
                <AvatarImage src={student.avatarUrl || "/placeholder.svg"} alt={student.name} />
                <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                  {student.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {student.unreadMessages && student.unreadMessages > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 flex items-center gap-1 bg-red-500 rounded-full px-1.5 py-0.5 border-2 border-white cursor-pointer hover:bg-red-600"
                  onClick={handleMessageBadgeClick}
                >
                  {student.unreadMessages}
                </Badge>
              )}
            </div>
            
            {/* Content Column */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-base mb-1 text-gray-800 group-hover:text-primary transition-colors duration-200">
                  {student.name}
                </h3>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0" />
              </div>
              
              <div className="space-y-1 mt-1.5">
                {student.currentRepertoire && student.currentRepertoire.length > 0 ? (
                  student.currentRepertoire.map((piece, index) => (
                    <div key={piece.id} className="flex items-center gap-2 text-sm text-gray-500">
                      {index === 0 && <Music className="h-3.5 w-3.5 shrink-0 text-primary/60" />}
                      {index !== 0 && <div className="w-3.5 h-3.5" />}
                      <span className="truncate">
                        {getDisplayText(piece)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Music className="h-3.5 w-3.5 text-primary/60" />
                    <span>No current pieces</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Bottom Info Bar */}
          {(student.nextLesson || (student.lessons && student.lessons.length > 0)) && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-start gap-6 text-xs font-medium text-gray-600">
              {student.nextLesson && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span>{student.nextLesson}</span>
                </div>
              )}
              
              {student.lessons && student.lessons.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <BookText className="h-3.5 w-3.5 text-gray-400" />
                  <span>{student.lessons.length} lessons</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default StudentCard;
