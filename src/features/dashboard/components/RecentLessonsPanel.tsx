import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { Clock, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface RepertoirePieceBasic {
  id: string;
  title: string;
  composer?: string;
}

export interface RecentLesson {
  id: string;
  date: string;
  duration?: number;
  studentId?: string;
  studentName?: string;
  studentAvatarUrl?: string;
  repertoire?: RepertoirePieceBasic[];
  summary?: string;
  transcriptUrl?: string;
  recordingUrl?: string;
}

export interface RecentLessonsPanelProps {
  lessons: RecentLesson[];
  title?: string;
  description?: string;
  maxItems?: number;
  onViewLesson?: (lessonId: string) => void;
  onViewTranscript?: (lessonId: string) => void;
  onViewSummary?: (lessonId: string) => void;
  onViewAll?: () => void;
}

const RecentLessonsPanel = ({
  lessons,
  title = 'Recent Lessons',
  description = 'Your teaching activity from the past week',
  maxItems = 5,
  onViewLesson,
  onViewTranscript,
  onViewSummary,
  onViewAll
}: RecentLessonsPanelProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMMM d');
    } catch (e) {
      return dateString;
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
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.slice(0, maxItems).map((lesson) => (
              <div 
                key={lesson.id} 
                className="border rounded-md p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {lesson.studentAvatarUrl && (
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={lesson.studentAvatarUrl} 
                          alt={lesson.studentName || 'Student'} 
                        />
                        <AvatarFallback>
                          {lesson.studentName ? getInitials(lesson.studentName) : 'S'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h3 className="font-medium">
                        {lesson.studentName || 'Unnamed Student'}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-2">{formatDate(lesson.date)}</span>
                        {lesson.duration && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {lesson.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onViewLesson && onViewLesson(lesson.id)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {lesson.repertoire && lesson.repertoire.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Repertoire:</h4>
                    <div className="flex flex-wrap gap-2">
                      {lesson.repertoire.map((piece) => (
                        <Badge key={piece.id} variant="outline">
                          {piece.title}
                          {piece.composer && ` (${piece.composer})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {lesson.summary && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Summary:</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {lesson.summary}
                    </p>
                  </div>
                )}

                {(lesson.transcriptUrl || lesson.recordingUrl) && (
                  <div className="mt-3 flex items-center gap-2">
                    {lesson.transcriptUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewTranscript && onViewTranscript(lesson.id)}
                      >
                        View Transcript
                      </Button>
                    )}
                    {lesson.recordingUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewSummary && onViewSummary(lesson.id)}
                      >
                        View Summary
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent lessons found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentLessonsPanel; 