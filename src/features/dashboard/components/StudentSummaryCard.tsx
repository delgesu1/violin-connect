import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export interface StudentRepertoirePiece {
  id: string;
  title: string;
  composer: string;
  startDate: string;
  status: string;
}

export interface StudentLesson {
  id: string;
  date: string;
  repertoire: StudentRepertoirePiece[];
  transcriptUrl?: string;
  summary?: string;
}

export interface StudentSummaryCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  currentRepertoire: StudentRepertoirePiece[];
  lessons: StudentLesson[];
  nextLesson?: string;
  unreadMessages?: number;
  onClick?: (studentId: string) => void;
}

const StudentSummaryCard = ({
  id,
  name,
  avatarUrl,
  currentRepertoire,
  lessons,
  nextLesson,
  unreadMessages,
  onClick
}: StudentSummaryCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    } else {
      navigate(`/students/${id}`);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{name}</CardTitle>
          </div>
          {unreadMessages && unreadMessages > 0 && (
            <Badge variant="destructive" className="rounded-full px-2 py-1">
              {unreadMessages}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {nextLesson && (
          <div>
            <div className="text-sm font-medium">Next Lesson</div>
            <div className="text-sm text-muted-foreground">{nextLesson}</div>
          </div>
        )}
        {currentRepertoire.length > 0 && (
          <div>
            <div className="text-sm font-medium">Current Repertoire</div>
            <ul className="mt-1 space-y-1">
              {currentRepertoire.slice(0, 2).map((piece) => (
                <li key={piece.id} className="text-sm flex items-center">
                  <span className="truncate">{piece.title}</span>
                  <span className="text-muted-foreground ml-1">({piece.composer})</span>
                </li>
              ))}
              {currentRepertoire.length > 2 && (
                <li className="text-xs text-muted-foreground">
                  +{currentRepertoire.length - 2} more pieces
                </li>
              )}
            </ul>
          </div>
        )}
        {lessons.length > 0 && (
          <div>
            <div className="text-sm font-medium">Recent Lesson</div>
            <div className="text-sm text-muted-foreground">
              {new Date(lessons[0].date).toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleClick}
          variant="ghost" 
          className="w-full justify-between"
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudentSummaryCard; 