import React from 'react';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Sparkles, Star, CheckCircle } from 'lucide-react';
import { Lesson } from '@/types/schema_extensions';

interface AISummaryDialogProps {
  lesson: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AISummaryDialog: React.FC<AISummaryDialogProps> = ({ 
  lesson, 
  open, 
  onOpenChange 
}) => {
  if (!lesson) return null;

  const renderSummary = (summary: string | null) => {
    if (!summary) return <p className="text-muted-foreground">No AI summary available for this lesson.</p>;
    
    // Sanitize the HTML content
    const sanitizedHtml = DOMPurify.sanitize(summary, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'br'],
      ALLOWED_ATTR: []
    });

    return (
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              AI Summary
            </Badge>
            <Badge variant="outline" className="font-normal">
              {format(new Date(lesson.date), 'EEEE, MMMM d, yyyy')}
            </Badge>
          </div>
          <DialogTitle className="text-xl">
            Lesson Summary
          </DialogTitle>
          <DialogDescription>
            AI-generated summary of key points and practice recommendations
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] px-6 py-4">
          <div className="prose prose-sm max-w-none">
            <div className="flex items-start gap-2 mb-4">
              <div className="mt-1">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Generated summary</p>
              </div>
            </div>
            
            {renderSummary(lesson.ai_summary)}
            
            <div className="bg-gray-50 p-4 rounded-lg mt-8 border border-gray-200">
              <h4 className="font-medium flex items-center gap-2 my-0">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Practice Reminders
              </h4>
              <p className="text-sm text-muted-foreground mt-1 mb-0">
                Review this summary before your next practice session.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AISummaryDialog; 