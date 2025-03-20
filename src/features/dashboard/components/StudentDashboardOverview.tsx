import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Book, Music, Mail, Phone, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export interface UpcomingLessonInfo {
  id: string;
  date: string;
  time: string;
  duration: number;
  topics?: string;
  isOnline: boolean;
}

export interface RepertoirePieceInfo {
  id: string;
  title: string;
  composer: string;
  level?: string;
  status: string;
  startedDate: string;
}

export interface JournalEntryInfo {
  id: string;
  date: string;
  title: string;
  content: string;
}

export interface TeacherInfo {
  id: string;
  name: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
}

export interface StudentDashboardOverviewProps {
  upcomingLessons: UpcomingLessonInfo[];
  currentRepertoire: RepertoirePieceInfo[];
  recentJournalEntries: JournalEntryInfo[];
  teacher?: TeacherInfo;
  onViewAllLessons?: () => void;
  onViewAllPieces?: () => void;
  onAddPracticeEntry?: () => void;
}

const StudentDashboardOverview = ({
  upcomingLessons,
  currentRepertoire,
  recentJournalEntries,
  teacher,
  onViewAllLessons,
  onViewAllPieces,
  onAddPracticeEntry
}: StudentDashboardOverviewProps) => {
  const formatDateFromISO = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Next Lesson Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Next Lesson
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingLessons.length > 0 ? (
              <div className="space-y-1">
                <p className="font-medium">
                  {format(new Date(upcomingLessons[0].date), 'PPPP')}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{upcomingLessons[0].time} ({upcomingLessons[0].duration} min)</span>
                </div>
                <Badge variant={upcomingLessons[0].isOnline ? "outline" : "default"}>
                  {upcomingLessons[0].isOnline ? 'Online' : 'In Person'}
                </Badge>
                {upcomingLessons[0].topics && (
                  <p className="mt-2 text-sm">{upcomingLessons[0].topics}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming lessons scheduled</p>
            )}
          </CardContent>
          {upcomingLessons.length > 0 && onViewAllLessons && (
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" onClick={onViewAllLessons}>
                View All Lessons
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Current Repertoire Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Music className="mr-2 h-5 w-5 text-primary" />
              Current Repertoire
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentRepertoire.length > 0 ? (
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="font-medium">{currentRepertoire[0].title}</p>
                  <p className="text-sm text-muted-foreground">{currentRepertoire[0].composer}</p>
                  <Badge variant="outline">{currentRepertoire[0].status}</Badge>
                </div>
                {currentRepertoire.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    {currentRepertoire.length - 1} more piece(s) in progress
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No repertoire assigned</p>
            )}
          </CardContent>
          {currentRepertoire.length > 0 && onViewAllPieces && (
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" onClick={onViewAllPieces}>
                View All Pieces
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Recent Practice Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Book className="mr-2 h-5 w-5 text-primary" />
              Recent Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentJournalEntries.length > 0 ? (
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="font-medium">{recentJournalEntries[0].title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {recentJournalEntries[0].content.substring(0, 60)}...
                  </p>
                  <p className="text-xs">
                    {formatDateFromISO(recentJournalEntries[0].date)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent practice journal entries</p>
            )}
          </CardContent>
          {onAddPracticeEntry && (
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" onClick={onAddPracticeEntry}>
                Add Practice Entry
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Teacher information */}
      {teacher && (
        <Card>
          <CardHeader>
            <CardTitle>Your Teacher</CardTitle>
            <CardDescription>Contact information and upcoming lessons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={teacher.avatar_url} alt={teacher.name} />
                  <AvatarFallback className="text-lg">
                    {teacher.name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{teacher.name}</h3>
                  
                  {teacher.email && (
                    <div className="flex items-center text-sm mt-1">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{teacher.email}</span>
                    </div>
                  )}
                  
                  {teacher.phone && (
                    <div className="flex items-center text-sm mt-1">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{teacher.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:ml-auto">
                <h4 className="font-medium mb-2">Upcoming Lessons</h4>
                {upcomingLessons.length > 0 ? (
                  <ul className="space-y-2">
                    {upcomingLessons.slice(0, 3).map(lesson => (
                      <li key={lesson.id} className="text-sm">
                        {format(new Date(lesson.date), 'EEE, MMM d')} • {lesson.time}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming lessons</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboardOverview; 