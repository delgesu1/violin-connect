
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Music, MessageSquare, Calendar, BookText } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface RepertoirePiece {
  id: string;
  title: string;
  composer?: string;
  startDate: string;
  status: 'current' | 'completed' | 'planned';
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
}

const StudentCard: React.FC<StudentCardProps> = ({ student, className }) => {
  return (
    <Link to={`/students/${student.id}`}>
      <Card className={cn("card-hover overflow-hidden", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={student.avatarUrl || "/placeholder.svg"} alt={student.name} />
              <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{student.name}</h3>
              <div className="space-y-1 mt-1">
                {student.currentRepertoire && student.currentRepertoire.length > 0 ? (
                  student.currentRepertoire.map((piece, index) => (
                    <div key={piece.id} className="flex items-center gap-1 text-sm text-muted-foreground">
                      {index === 0 && <Music className="h-3.5 w-3.5 shrink-0" />}
                      {index !== 0 && <div className="w-3.5 h-3.5" />}
                      <span className="truncate">
                        {piece.composer ? `${piece.title} - ${piece.composer}` : piece.title}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Music className="h-3.5 w-3.5" />
                    <span>No current pieces</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 border-t bg-muted/30 justify-between">
          <div className="flex items-center gap-3">
            {student.nextLesson && (
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                <span>{student.nextLesson}</span>
              </div>
            )}
            
            {student.lessons && student.lessons.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <BookText className="h-3.5 w-3.5" />
                <span>{student.lessons.length} lessons</span>
              </div>
            )}
          </div>
          
          {student.unreadMessages && student.unreadMessages > 0 && (
            <Badge className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {student.unreadMessages}
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default StudentCard;
