
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Music, MessageSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Student {
  id: string;
  name: string;
  avatarUrl?: string;
  currentPiece?: string;
  nextLesson?: string;
  unreadMessages?: number;
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
              {student.currentPiece && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Music className="h-3.5 w-3.5" />
                  <span>{student.currentPiece}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 border-t bg-muted/30 justify-between">
          {student.nextLesson && (
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>{student.nextLesson}</span>
            </div>
          )}
          
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
