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

  const getLessonContent = (lesson: Lesson) => {
    if (activeDialog?.lessonId !== lesson.id) return null;
    
    if (activeDialog.type === 'transcript') {
      return (
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Transcript</Badge>
              <Badge variant="outline" className="font-normal">{format(new Date(lesson.date), 'EEEE, MMMM d, yyyy')}</Badge>
            </div>
            <DialogTitle className="text-xl">Lesson Transcript</DialogTitle>
            <DialogDescription>
              Full transcript of the lesson covering {lesson.repertoire.map(p => p.title).join(", ")}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] px-6 py-4">
            {lesson.transcriptUrl ? (
              <div className="prose prose-sm max-w-none">
                <h3>Transcript Content</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  <Clock className="inline-block h-3.5 w-3.5 mr-1" /> 
                  Duration: 45 minutes
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="font-medium mb-2">Topics Covered:</div>
                  <ul className="list-disc pl-4 text-sm space-y-1">
                    <li>Bowing technique for Korngold concerto</li>
                    <li>B Major scale with emphasis on thirds</li>
                    <li>Vibrato control in slow passages</li>
                    <li>Planning for upcoming recital</li>
                  </ul>
                </div>
                <p>{lesson.transcriptUrl}</p>
                <p>This would display the full lesson transcript text in a conversational format.</p>
                <div className="py-2 px-4 rounded-lg bg-blue-50 my-4 border-l-4 border-blue-400">
                  <p className="font-medium">Teacher:</p> 
                  <p className="text-sm mb-3">Let's focus on your bow distribution in the opening of the Korngold. Try using more bow on the downbeat.</p>
                  <p className="font-medium">Student:</p>
                  <p className="text-sm">Like this? [Plays passage]</p>
                </div>
                <div className="py-2 px-4 rounded-lg bg-gray-50 my-4 border-l-4 border-gray-200">
                  <p className="font-medium">Teacher:</p> 
                  <p className="text-sm mb-3">Yes, that's better. Now let's work on the vibrato in measure 24. Try to make it slightly wider.</p>
                  <p className="font-medium">Student:</p>
                  <p className="text-sm">I'll try. [Plays measure with adjusted vibrato]</p>
                </div>
                <p>The transcript would continue with the complete record of the entire lesson.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transcript available for this lesson.</p>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <div className="flex justify-between w-full items-center">
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-4 w-4" />
                Download Transcript
              </Button>
              <DialogClose asChild>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      );
    } else if (activeDialog.type === 'summary') {
      return (
        <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">AI Summary</Badge>
              <Badge variant="outline" className="font-normal">{format(new Date(lesson.date), 'EEEE, MMMM d, yyyy')}</Badge>
            </div>
            <DialogTitle className="text-xl">Lesson Summary</DialogTitle>
            <DialogDescription>
              AI-generated summary of key points and insights from the lesson
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[50vh] px-6 py-4">
            {lesson.summary ? (
              <div className="prose prose-sm max-w-none">
                <div className="flex items-start gap-2 mb-6">
                  <div className="mt-1">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Generated summary</p>
                    <h3 className="mt-0">Key Lesson Points</h3>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <h4 className="text-purple-900 mb-2 mt-0">Areas of Focus</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-0">
                    <li className="flex items-center gap-2 bg-white p-2 rounded">
                      <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                      Bowing technique
                    </li>
                    <li className="flex items-center gap-2 bg-white p-2 rounded">
                      <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                      B Major scale intonation
                    </li>
                    <li className="flex items-center gap-2 bg-white p-2 rounded">
                      <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                      Vibrato control
                    </li>
                    <li className="flex items-center gap-2 bg-white p-2 rounded">
                      <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                      Recital preparation
                    </li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-amber-500" />
                    Accomplishments
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 mb-0">
                    <li>Improved bow distribution in the opening section of Korngold</li>
                    <li>More consistent intonation in B Major scale thirds</li>
                    <li>Better vibrato control in slow passages</li>
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Practice Assignments
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 mb-0">
                    <li>Practice B Major scale with metronome, quarter note = 60, focusing on intonation of thirds</li>
                    <li>Work on Korngold development section with metronome at quarter note = 72</li>
                    <li>Record yourself playing the slow section and evaluate vibrato consistency</li>
                  </ul>
                </div>
                
                <div className="border-t pt-4 mt-6">
                  <p className="font-medium mb-2">Summary:</p>
                  <p>{lesson.summary}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No AI summary available for this lesson.</p>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <div className="flex justify-between w-full items-center">
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-4 w-4" />
                Export Summary
              </Button>
              <DialogClose asChild>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      );
    } else if (activeDialog.type === 'notes') {
      return (
        <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Teacher Notes</Badge>
              <Badge variant="outline" className="font-normal">{format(new Date(lesson.date), 'EEEE, MMMM d, yyyy')}</Badge>
            </div>
            <DialogTitle className="text-xl">Teacher Notes</DialogTitle>
            <DialogDescription>
              Notes from your teacher about this lesson
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[50vh] px-6 py-4">
            {lesson.notes ? (
              <div className="prose prose-sm max-w-none">
                <div className="flex items-start gap-2 mb-6">
                  <div className="mt-1">
                    <FileEdit className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Teacher notes</p>
                    <h3 className="mt-0">Lesson Notes</h3>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p>{lesson.notes}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No teacher notes available for this lesson.</p>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <DialogClose asChild>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-4 mb-6">
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
      
      {sortedLessons.length > 0 ? (
        <div className="space-y-4">
          {sortedLessons.map((lesson) => (
            <Card 
              key={lesson.id}
              className={`overflow-hidden transition-all ${expandedLesson === lesson.id ? 'ring-1 ring-primary' : 'hover:border-gray-300'}`}
            >
              <div 
                className={`px-4 py-3 flex justify-between items-center cursor-pointer ${expandedLesson === lesson.id ? 'border-b' : ''}`}
                onClick={() => toggleExpandLesson(lesson.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">{format(new Date(lesson.date), 'MMMM d, yyyy')}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistance(new Date(lesson.date), new Date(), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-gray-50">
                    {lesson.repertoire.length} {lesson.repertoire.length === 1 ? 'piece' : 'pieces'}
                  </Badge>
                  <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${expandedLesson === lesson.id ? 'rotate-90' : ''}`} />
                </div>
              </div>
              
              {expandedLesson === lesson.id && (
                <div className="p-4 space-y-4">
                  <div className="space-y-2 mt-3">
                    <h4 className="text-sm font-medium">Repertoire Covered:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {lesson.repertoire.map((piece) => (
                        <div key={piece.id} className="relative bg-gray-50 rounded-md p-3 border">
                          <PieceDisplay 
                            piece={piece} 
                            layout="list"
                            showStatus={true}
                            showDifficulty={true}
                            className="bg-transparent border-0 p-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {lesson.summary && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Lesson Summary:</h4>
                      <div className="text-sm bg-gray-50 p-3 rounded-md border">
                        {lesson.summary}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-2">
                    {lesson.transcriptUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleOpenDialog(lesson.id, 'transcript')}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        View Full Transcript
                      </Button>
                    )}
                    
                    {lesson.summary && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleOpenDialog(lesson.id, 'summary')}
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        AI Summary
                      </Button>
                    )}
                    
                    {lesson.notes && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleOpenDialog(lesson.id, 'notes')}
                      >
                        <FileEdit className="h-3.5 w-3.5 mr-1" />
                        View Teacher Notes
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <BookText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No lesson history available.</p>
        </div>
      )}
      
      {/* Render dialogs */}
      {sortedLessons.map(lesson => (
        <Dialog
          key={`dialog-${lesson.id}`}
          open={activeDialog?.lessonId === lesson.id}
          onOpenChange={(open) => !open && handleCloseDialog()}
        >
          {getLessonContent(lesson)}
        </Dialog>
      ))}
    </div>
  );
};

export default LessonHistory;
