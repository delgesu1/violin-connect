import React from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Star,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  PenTool,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@core/components/ui/data-display';
import { Button } from '@core/components/ui/inputs';
import { Textarea } from '@core/components/ui/inputs';
import type { JournalEntry } from '@/features/journal/types';

// Define an initial entry template
export const initialEntry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  date: format(new Date(), 'yyyy-MM-dd'),
  practice_goals: '',
  notes: '',
  went_well: '',
  beautified: '',
  frustrations: '',
  improvements: ''
};

interface JournalEntryFormProps {
  entry: Partial<JournalEntry>;
  onChange: (field: keyof typeof initialEntry, value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  className?: string;
}

/**
 * A form component for creating and editing journal entries
 */
export default function JournalEntryForm({ 
  entry, 
  onChange, 
  onSubmit, 
  isSubmitting = false,
  className = '' 
}: JournalEntryFormProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Today's Practice Session</h2>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            onClick={onSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : entry.id ? "Update Entry" : "Save Entry"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Practice Goals */}
        <Card className="border-blue-200 transition-all duration-300 hover:border-blue-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-600" />
              Today's Practice Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              className="min-h-24 transition-all duration-300 focus:border-blue-400"
              value={entry.practice_goals || ''}
              onChange={(e) => onChange('practice_goals', e.target.value)}
              placeholder="What do you want to achieve in today's practice?"
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border-gray-200 transition-all duration-300 hover:border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              Practice Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              className="min-h-24 transition-all duration-300 focus:border-gray-400"
              value={entry.notes || ''}
              onChange={(e) => onChange('notes', e.target.value)}
              placeholder="Notes about today's practice session"
            />
          </CardContent>
        </Card>

        {/* What Went Well */}
        <Card className="border-green-200 transition-all duration-300 hover:border-green-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-green-600" />
              What went well today?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              className="min-h-24 transition-all duration-300 focus:border-green-400"
              value={entry.went_well || ''}
              onChange={(e) => onChange('went_well', e.target.value)}
              placeholder="What aspects of your practice were successful?"
            />
          </CardContent>
        </Card>
        
        {/* What I Beautified */}
        <Card className="border-purple-200 transition-all duration-300 hover:border-purple-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <PenTool className="w-4 h-4 text-purple-600" />
              What did I worked hard to beautify today?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              className="min-h-24 transition-all duration-300 focus:border-purple-400"
              value={entry.beautified || ''}
              onChange={(e) => onChange('beautified', e.target.value)}
              placeholder="What did you focus on making more beautiful in your playing?"
            />
          </CardContent>
        </Card>

        {/* Frustrations */}
        <Card className="border-amber-200 transition-all duration-300 hover:border-amber-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <ThumbsDown className="w-4 h-4 text-amber-600" />
              What frustrates me and why?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              className="min-h-24 transition-all duration-300 focus:border-amber-400"
              value={entry.frustrations || ''}
              onChange={(e) => onChange('frustrations', e.target.value)}
              placeholder="What challenges did you face today?"
            />
          </CardContent>
        </Card>

        {/* Improvements for Tomorrow */}
        <Card className="border-blue-200 transition-all duration-300 hover:border-blue-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              What can I improve tomorrow?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              className="min-h-24 transition-all duration-300 focus:border-blue-400"
              value={entry.improvements || ''}
              onChange={(e) => onChange('improvements', e.target.value)}
              placeholder="What will you focus on improving next time?"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 