import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import {
  FileText,
  Star,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  PenTool,
  Printer,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@core/components/ui/data-display';
import { Badge } from '@core/components/ui/data-display';
import { Button } from '@core/components/ui/inputs';
import { Separator } from '@core/components/ui/layout';
import type { JournalEntry as JournalEntryType } from '@/features/journal/types';

interface JournalEntryProps {
  entry: JournalEntryType;
  showHeader?: boolean;
  showControls?: boolean;
  onBack?: () => void;
  onExport?: () => void;
  isDevelopmentMode?: boolean;
  className?: string;
}

/**
 * A component to display a single journal entry with all its fields
 */
export default function JournalEntry({
  entry,
  showHeader = true,
  showControls = true,
  onBack,
  onExport,
  isDevelopmentMode = false,
  className = ''
}: JournalEntryProps) {
  // Helper function for safe date formatting
  const formatSafeDate = (dateString: string | undefined, formatStr: string = 'MMMM d, yyyy') => {
    if (!dateString) return 'Loading...';
    
    // Try to parse as ISO date first
    try {
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        return format(parsedDate, formatStr);
      }
    } catch (e) {
      console.warn('Failed to parse date as ISO:', dateString);
    }
    
    // Add time component and try again
    try {
      const dateWithTime = dateString + 'T00:00:00';
      const date = new Date(dateWithTime);
      if (isValid(date)) {
        return format(date, formatStr);
      }
    } catch (e) {
      console.warn('Failed to parse date with added time component:', dateString);
    }
    
    // Last resort: try direct parsing
    try {
      const date = new Date(dateString);
      if (isValid(date)) {
        return format(date, formatStr);
      }
    } catch (e) {
      console.error('Failed to parse date by any method:', dateString);
    }
    
    return dateString; // Return original string if all parsing fails
  };

  if (!entry) {
    return (
      <div className="text-center py-10">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading journal entry...</p>
      </div>
    );
  }

  const hasValue = (field: string) => {
    return entry && entry[field as keyof typeof entry] && String(entry[field as keyof typeof entry]).trim() !== '';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className="flex justify-between items-center">
          {onBack && (
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center gap-1"
            >
              Back to entries
            </Button>
          )}
          
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Entry from {entry.date ? formatSafeDate(entry.date, 'EEEE, MMMM d, yyyy') : 'Loading...'}
            {isDevelopmentMode && entry._source && (
              <Badge variant={
                entry._source === 'database' ? 'default' :
                entry._source.includes('cached') ? 'secondary' :
                'outline'
              } className="text-xs">
                {entry._source}
              </Badge>
            )}
          </h3>
          
          {showControls && onExport && (
            <Button variant="outline" onClick={onExport}>
              <Printer className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {hasValue('practice_goals') && (
          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-600" />
                Practice Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{entry.practice_goals}</p>
            </CardContent>
          </Card>
        )}

        {hasValue('notes') && (
          <Card className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                Practice Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{entry.notes}</p>
            </CardContent>
          </Card>
        )}

        {hasValue('went_well') && (
          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                What Went Well
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{entry.went_well}</p>
            </CardContent>
          </Card>
        )}

        {hasValue('beautified') && (
          <Card className="border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <PenTool className="w-4 h-4 text-purple-600" />
                What I Beautified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{entry.beautified}</p>
            </CardContent>
          </Card>
        )}

        {hasValue('frustrations') && (
          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-amber-600" />
                Frustrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{entry.frustrations}</p>
            </CardContent>
          </Card>
        )}

        {hasValue('improvements') && (
          <Card className="border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600" />
                What To Improve Tomorrow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{entry.improvements}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {showControls && entry.created_at && entry.created_at !== entry.updated_at && (
        <div className="text-sm text-muted-foreground flex items-center justify-end">
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          Last updated: {formatSafeDate(entry.updated_at, 'MMM d, yyyy h:mm a')}
        </div>
      )}
    </div>
  );
} 