
import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, User, Music, MapPin } from 'lucide-react';

export interface CalendarEventData {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'lesson' | 'performance' | 'rehearsal' | 'other';
  student?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  location?: string;
  repertoire?: string;
}

interface CalendarEventProps {
  event: CalendarEventData;
  className?: string;
}

const CalendarEvent: React.FC<CalendarEventProps> = ({ event, className }) => {
  return (
    <div 
      className={cn(
        "p-4 border rounded-lg transition-all duration-300 card-hover",
        event.type === 'lesson' ? 'border-blue-200 bg-blue-50' : 
        event.type === 'performance' ? 'border-purple-200 bg-purple-50' : 
        event.type === 'rehearsal' ? 'border-amber-200 bg-amber-50' : 
        'border-gray-200 bg-gray-50',
        className
      )}
    >
      <h3 className="font-medium mb-2">{event.title}</h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {event.startTime} - {event.endTime}
          </span>
        </div>
        
        {event.student && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{event.student.name}</span>
          </div>
        )}
        
        {event.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
        )}
        
        {event.repertoire && (
          <div className="flex items-center gap-2 text-sm">
            <Music className="h-4 w-4 text-muted-foreground" />
            <span>{event.repertoire}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarEvent;
