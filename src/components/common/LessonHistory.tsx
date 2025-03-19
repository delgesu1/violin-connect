import React, { useState, useEffect } from 'react';
import { format, formatDistance } from 'date-fns';
import { 
  BookText, 
  FileText, 
  MessageSquare,
  ChevronRight,
  Music,
  Calendar,
  Clock,
  Star,
  Sparkles,
  FileEdit
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lesson } from './StudentCard';
import { PieceInfo } from './RepertoireDisplay';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import PieceDisplay from './PieceDisplay';
import TranscriptDialog from '@/components/dialogs/TranscriptDialog';
import AISummaryDialog from '@/components/dialogs/AISummaryDialog';
import { Lesson as SupabaseLesson } from '@/types/schema_extensions';

interface LessonHistoryProps {
  lessons: Lesson[];
  className?: string;
  initialExpandedLesson?: string | null;
}

const LessonHistory: React.FC<LessonHistoryProps> = ({ 
  lessons,
  className,
  initialExpandedLesson = null
}) => {
  const [activeDialog, setActiveDialog] = useState<{lessonId: string, type: 'transcript' | 'summary' | 'notes'} | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(initialExpandedLesson);
  
  // Sort lessons by date (newest first)
  const sortedLessons = [...lessons].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Update expandedLesson if initialExpandedLesson changes
  useEffect(() => {
    if (initialExpandedLesson) {
      setExpandedLesson(initialExpandedLesson);
    }
  }, [initialExpandedLesson]);
  
  const handleOpenDialog = (lessonId: string, type: 'transcript' | 'summary' | 'notes') => {
    setActiveDialog({ lessonId, type });
  };

  const handleCloseDialog = () => {
    setActiveDialog(null);
  };

  const toggleExpandLesson = (lessonId: string) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  // Get active lesson based on the active dialog
  const getActiveLesson = () => {
    if (!activeDialog) return null;
    return sortedLessons.find(lesson => lesson.id === activeDialog.lessonId) || null;
  };

  // Convert our UI Lesson type to the Supabase Lesson type for the dialogs
  const convertToSupabaseLesson = (lesson: Lesson | null): SupabaseLesson | null => {
    if (!lesson) return null;
    
    return {
      id: lesson.id,
      student_id: '', // Not needed for display purposes
      teacher_id: null,
      date: lesson.date,
      start_time: null,
      end_time: null,
      location: null,
      summary: lesson.summary || null,
      notes: lesson.notes || null,
      status: null,
      transcript_url: lesson.transcriptUrl || null,
      transcript: lesson.transcript || null, // New property
      ai_summary: lesson.aiSummary || null, // New property
      created_at: '',
      updated_at: ''
    };
  };

  return (
    <div className={`space-y-6 ${className || ""}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium flex items-center gap-2">
          <BookText className="h-5 w-5" />
          Lesson History
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-4 w-4" />
            Filter by Date
          </Button>
        </div>
      </div>
      
      {sortedLessons.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <BookText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No lesson history available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLessons.map((lesson) => (
            <Card 
              key={lesson.id}
              className={`overflow-hidden border ${expandedLesson === lesson.id ? 'border-primary/30 shadow-md' : 'border-gray-100 hover:shadow-sm'} transition-all duration-200`}
            >
              <div 
                className="p-4 md:px-6 cursor-pointer flex justify-between items-center"
                onClick={() => toggleExpandLesson(lesson.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <BookText className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {format(new Date(lesson.date), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-1">
                      {lesson.repertoire.map((piece, i) => (
                        <span key={piece.id} className="flex items-center">
                          <PieceDisplay piece={piece} layout="inline" />
                          {i < lesson.repertoire.length - 1 && <span className="mx-1">•</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expandedLesson === lesson.id ? 'rotate-90' : ''}`} />
                </div>
              </div>
              
              {expandedLesson === lesson.id && (
                <div className="border-t border-gray-100 p-4 md:p-6 bg-gray-50/50">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Lesson Summary</h3>
                    <p className="text-sm text-gray-600">
                      {lesson.summary || "No summary available for this lesson."}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5"
                      onClick={() => handleOpenDialog(lesson.id, 'transcript')}
                      disabled={!lesson.transcript && !lesson.transcriptUrl}
                    >
                      <FileText className="h-4 w-4" />
                      View Transcript
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5"
                      onClick={() => handleOpenDialog(lesson.id, 'summary')}
                      disabled={!lesson.aiSummary && !lesson.summary}
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Summary
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5"
                      onClick={() => handleOpenDialog(lesson.id, 'notes')}
                    >
                      <FileEdit className="h-4 w-4" />
                      Teacher Notes
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Use our specialized dialog components instead of inline content */}
      <TranscriptDialog 
        lesson={convertToSupabaseLesson(getActiveLesson())}
        open={activeDialog?.type === 'transcript'}
        onOpenChange={(open) => !open && handleCloseDialog()}
      />
      
      <AISummaryDialog
        lesson={convertToSupabaseLesson(getActiveLesson())}
        open={activeDialog?.type === 'summary'}
        onOpenChange={(open) => !open && handleCloseDialog()}
      />
      
      {/* Notes Dialog (using existing implementation) */}
      {activeDialog?.type === 'notes' && getActiveLesson() && (
        <Dialog open={true} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <Badge variant="outline" className="w-fit mb-2">
                {format(new Date(getActiveLesson()!.date), 'MMMM d, yyyy')}
              </Badge>
              <DialogTitle>Teacher Notes</DialogTitle>
              <DialogDescription>
                View notes for this lesson
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Notes</h3>
                <div className="w-full min-h-32 p-3 text-sm border rounded-md bg-gray-50">
                  {getActiveLesson()!.notes || "No notes available for this lesson."}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LessonHistory;
