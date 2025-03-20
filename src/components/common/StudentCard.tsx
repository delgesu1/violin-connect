import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Music, MessageSquare, Calendar, BookText, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { getPieceDetails, getPieceTitle, getPieceComposer } from '@/lib/utils/repertoire-utils';
import { PieceInfo } from './RepertoireDisplay';

export interface RepertoirePiece {
  id: string;           // Unique ID for this student-piece assignment 
  /** 
   * Reference to the master repertoire item - this is the preferred way to access piece details
   * All new code should use this instead of accessing title/composer directly
   */
  masterPieceId: string; // Making this required to enforce proper usage
  startDate: string;    // When student started learning this piece
  endDate?: string;     // When student completed this piece (if applicable)
  status: 'current' | 'completed' | 'planned';
  notes?: string;       // Student-specific notes about the piece
  
  /**
   * @deprecated Use masterPieceId with the getPieceTitle() function instead
   * Direct title access will be removed in a future version
   */
  title?: string;
  
  /**
   * @deprecated Use masterPieceId with the getPieceComposer() function instead
   * Direct composer access will be removed in a future version
   */
  composer?: string;

  /**
   * Tracks where the data came from (API, cache, or mock)
   * Used for debugging purposes
   */
  _source?: 'api' | 'cache' | 'mock';
}

/**
 * Legacy interface for backward compatibility during the transition period
 * This allows existing code to work without TypeScript errors while we migrate
 * All new code should use RepertoirePiece with mandatory masterPieceId
 * 
 * @deprecated Use RepertoirePiece with masterPieceId instead
 */
export interface LegacyRepertoirePiece {
  id: string;
  masterPieceId?: string;
  startDate: string;
  endDate?: string;
  status: 'current' | 'completed' | 'planned';
  notes?: string;
  title?: string;
  composer?: string;
}

export interface Lesson {
  id: string;
  date: string;
  repertoire: (RepertoirePiece | LegacyRepertoirePiece)[];
  transcriptUrl?: string;
  summary?: string;
  notes?: string;
  transcript?: string;  // Added property for the full lesson transcript
  aiSummary?: string;   // Added property for the AI-generated summary
}

export interface Student {
  id: string;
  name: string;
  avatarUrl?: string;
  currentRepertoire: (RepertoirePiece | LegacyRepertoirePiece)[];
  pastRepertoire?: (RepertoirePiece | LegacyRepertoirePiece)[];
  nextLesson?: string;
  unreadMessages?: number;
  lessons?: Lesson[];
  level?: string;
  email?: string;
  phone?: string;
  startDate?: string;
  lastLesson?: string;
  academicYear?: string; // e.g., "1st year Bachelor", "2nd year Masters", "1st year DMA"
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

  // This function is now updated to use our utility functions
  const getDisplayText = (piece: RepertoirePiece | LegacyRepertoirePiece): string => {
    const title = getPieceTitle(piece as RepertoirePiece, masterRepertoire);
    const composer = getPieceComposer(piece as RepertoirePiece, masterRepertoire);
    return composer ? `${title} - ${composer}` : (title || 'Unknown Piece');
  };

  return (
    <Link to={`/students/${student.id}`} className="block transition-all duration-200">
      <Card className={cn(
        "overflow-hidden transition-all duration-200 group bg-white border border-gray-200 hover:border-primary/30",
        "shadow-sm hover:shadow",
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarImage src={student.avatarUrl || "/placeholder.svg"} alt={student.name} />
                <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                  {student.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {student.unreadMessages && student.unreadMessages > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 flex items-center gap-1 bg-red-500 rounded-full px-1.5 py-0.5 border-2 border-white cursor-pointer hover:bg-red-600 z-10"
                  onClick={handleMessageBadgeClick}
                >
                  {student.unreadMessages}
                </Badge>
              )}
            </div>
          </div>
          <div>
            <CardTitle className="text-base">{student.name}</CardTitle>
            <div className="flex flex-col items-end gap-1">
              {student.academicYear && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-normal bg-amber-50 text-amber-700 border-amber-200"
                >
                  {student.academicYear}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {student.currentRepertoire.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Current Repertoire</div>
              <ul className="text-sm space-y-2">
                {student.currentRepertoire.map((piece, i) => (
                  <li key={piece.id}>
                    <PieceInfo 
                      piece={piece} 
                      repertoireList={masterRepertoire}
                      layout="inline"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {student.nextLesson && (
            <div className="mt-4">
              <div className="text-sm font-medium">Next Lesson</div>
              <p className="text-sm text-muted-foreground">{student.nextLesson}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default StudentCard;
