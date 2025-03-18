import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, FileText } from 'lucide-react';
import { Lesson } from '@/types/schema_extensions';

interface TranscriptDialogProps {
  lesson: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TranscriptDialog: React.FC<TranscriptDialogProps> = ({ 
  lesson, 
  open, 
  onOpenChange 
}) => {
  if (!lesson) return null;

  // Convert raw transcript text to formatted JSX
  const formatTranscript = (transcript: string | null) => {
    if (!transcript) return <p className="text-muted-foreground">No transcript available for this lesson.</p>;
    
    // Split by new lines and process each line
    return transcript.split('\n').map((line, index) => {
      // Skip empty lines
      if (!line.trim()) return null;
      
      // Format speaker parts (Teacher: or Student:)
      if (line.startsWith('Teacher:')) {
        return (
          <div key={index} className="py-2 px-4 rounded-lg bg-blue-50 my-3 border-l-4 border-blue-400">
            <p className="font-medium">Teacher:</p>
            <p className="text-sm">{line.substring(8).trim()}</p>
          </div>
        );
      }
      
      if (line.startsWith('Student:')) {
        return (
          <div key={index} className="py-2 px-4 rounded-lg bg-gray-50 my-3 border-l-4 border-gray-200">
            <p className="font-medium">Student:</p>
            <p className="text-sm">{line.substring(8).trim()}</p>
          </div>
        );
      }
      
      // Format stage directions [like this]
      if (line.startsWith('[') && line.endsWith(']')) {
        return (
          <div key={index} className="text-sm italic text-gray-500 my-2">
            {line}
          </div>
        );
      }
      
      // Default formatting for other lines
      return <p key={index} className="my-2">{line}</p>;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Transcript
            </Badge>
            <Badge variant="outline" className="font-normal">
              {format(new Date(lesson.date), 'EEEE, MMMM d, yyyy')}
            </Badge>
          </div>
          <DialogTitle className="text-xl">
            Lesson Transcript
          </DialogTitle>
          <DialogDescription>
            Complete conversation from the lesson
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] px-6 py-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground text-sm mb-4">
              <Clock className="inline-block h-3.5 w-3.5 mr-1" /> 
              {lesson.start_time && lesson.end_time ? 
                `${lesson.start_time} - ${lesson.end_time}` : 
                "Duration not recorded"}
            </p>
            
            {formatTranscript(lesson.transcript)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TranscriptDialog; 