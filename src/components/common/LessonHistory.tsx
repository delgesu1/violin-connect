
import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  BookText, 
  FileText, 
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Music
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Lesson } from './StudentCard';

interface LessonHistoryProps {
  lessons: Lesson[];
}

const LessonHistory: React.FC<LessonHistoryProps> = ({ lessons }) => {
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<{lessonId: string, type: 'transcript' | 'summary'} | null>(null);
  
  // Sort lessons by date (newest first)
  const sortedLessons = [...lessons].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleOpenDialog = (lessonId: string, type: 'transcript' | 'summary') => {
    setActiveDialog({ lessonId, type });
  };

  const handleCloseDialog = () => {
    setActiveDialog(null);
  };

  const getLessonContent = (lesson: Lesson) => {
    if (activeDialog?.lessonId !== lesson.id) return null;
    
    if (activeDialog.type === 'transcript') {
      return (
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lesson Transcript - {format(new Date(lesson.date), 'MMM d, yyyy')}</DialogTitle>
            <DialogDescription>
              Full transcript of the lesson with {lesson.repertoire.map(p => p.title).join(", ")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {lesson.transcriptUrl ? (
              <div className="prose prose-sm max-w-none">
                <p>{lesson.transcriptUrl}</p>
                <p>This would display the full lesson transcript text.</p>
                <p>The transcript would include a complete record of the entire lesson, including:</p>
                <ul>
                  <li>Demonstrations</li>
                  <li>Conversations</li>
                  <li>Specific instructions</li>
                  <li>Technical feedback</li>
                  <li>Interpretive suggestions</li>
                </ul>
              </div>
            ) : (
              <p className="text-muted-foreground">No transcript available for this lesson.</p>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button variant="outline" onClick={handleCloseDialog}>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      );
    } else if (activeDialog.type === 'summary') {
      return (
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lesson Summary - {format(new Date(lesson.date), 'MMM d, yyyy')}</DialogTitle>
            <DialogDescription>
              AI-generated summary of key points from the lesson
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {lesson.summary ? (
              <div className="prose prose-sm max-w-none">
                <p>{lesson.summary}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No AI summary available for this lesson.</p>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button variant="outline" onClick={handleCloseDialog}>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-2 mb-6">
      <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
        <BookText className="h-5 w-5" />
        Lesson History
      </h3>
      
      {sortedLessons.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {sortedLessons.map((lesson) => (
            <React.Fragment key={lesson.id}>
              <AccordionItem value={lesson.id} className="border rounded-md mb-2 overflow-hidden">
                <AccordionTrigger className="px-4 py-2 hover:no-underline">
                  <div className="flex justify-between items-center w-full text-left">
                    <div className="font-medium">{format(new Date(lesson.date), 'MMMM d, yyyy')}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {lesson.repertoire.length} {lesson.repertoire.length === 1 ? 'piece' : 'pieces'}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Repertoire Covered:</h4>
                      <div className="space-y-1">
                        {lesson.repertoire.map((piece, index) => (
                          <div key={piece.id} className="flex items-start gap-2 text-sm">
                            {index === 0 ? <Music className="h-4 w-4 text-muted-foreground mt-0.5" /> : <div className="w-4" />}
                            <div>
                              <span className="font-medium">{piece.title}</span>
                              {piece.composer && <span className="text-muted-foreground"> - {piece.composer}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => handleOpenDialog(lesson.id, 'transcript')}
                          >
                            <FileText className="h-4 w-4" />
                            View Transcript
                          </Button>
                        </DialogTrigger>
                        {activeDialog?.lessonId === lesson.id && activeDialog.type === 'transcript' && 
                          getLessonContent(lesson)}
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => handleOpenDialog(lesson.id, 'summary')}
                          >
                            <MessageSquare className="h-4 w-4" />
                            AI Summary
                          </Button>
                        </DialogTrigger>
                        {activeDialog?.lessonId === lesson.id && activeDialog.type === 'summary' && 
                          getLessonContent(lesson)}
                      </Dialog>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </React.Fragment>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No lesson history available.
        </div>
      )}
    </div>
  );
};

export default LessonHistory;
