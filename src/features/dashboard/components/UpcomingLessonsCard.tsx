import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export interface UpcomingLesson {
  id: string;
  date: string;
  time?: string;
  duration?: number;
  studentId?: string;
  studentName?: string;
  isOnline?: boolean;
  topics?: string;
}

export interface UpcomingLessonsCardProps {
  lessons: UpcomingLesson[];
  title?: string;
  maxItems?: number;
  onViewAll?: () => void;
  onViewLesson?: (lessonId: string) => void;
  showStudentName?: boolean;
}

const UpcomingLessonsCard = ({
  lessons,
  title = 'Upcoming Lessons',
  maxItems = 3,
  onViewAll,
  onViewLesson,
  showStudentName = false
}: UpcomingLessonsCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMMM d');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lessons.length > 0 ? (
          <div className="space-y-3">
            {lessons.slice(0, maxItems).map((lesson) => (
              <div 
                key={lesson.id} 
                className="border-l-2 border-primary pl-3 py-1"
                onClick={() => onViewLesson && onViewLesson(lesson.id)}
              >
                <p className="font-medium">
                  {formatDate(lesson.date)}
                </p>
                
                {showStudentName && lesson.studentName && (
                  <p className="text-sm">
                    {lesson.studentName}
                  </p>
                )}
                
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>
                    {lesson.time}
                    {lesson.duration && ` (${lesson.duration} min)`}
                  </span>
                </div>
                
                {lesson.isOnline !== undefined && (
                  <Badge 
                    variant={lesson.isOnline ? "outline" : "default"}
                    className="mt-1"
                  >
                    {lesson.isOnline ? 'Online' : 'In Person'}
                  </Badge>
                )}
                
                {lesson.topics && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {lesson.topics}
                  </p>
                )}
              </div>
            ))}
            
            {lessons.length > maxItems && (
              <p className="text-xs text-muted-foreground">
                +{lessons.length - maxItems} more upcoming lessons
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming lessons scheduled</p>
        )}
      </CardContent>
      
      {onViewAll && (
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" onClick={onViewAll}>
            View All Lessons
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default UpcomingLessonsCard; 