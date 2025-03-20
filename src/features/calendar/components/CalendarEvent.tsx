import React from 'react';
import { Clock, User, Music, MapPin, ChevronRight, Users, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@core/components/ui/data-display';
import { cn } from '@core/utils';

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
  isAllDay?: boolean;
  description?: string;
}

interface CalendarEventProps {
  event: CalendarEventData;
  className?: string;
  compact?: boolean;
}

export function CalendarEvent({ 
  event, 
  className,
  compact = false
}: CalendarEventProps) {
  
  const getTypeStyles = () => {
    switch (event.type) {
      case 'lesson':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'performance':
        return 'bg-purple-100 border-purple-200 text-purple-800';
      case 'rehearsal':
        return 'bg-amber-100 border-amber-200 text-amber-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };
  
  // Format time to be more readable
  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (error) {
      return timeString;
    }
  };
  
  // Calculate event duration in minutes
  const getDuration = (): number => {
    try {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    } catch (error) {
      return 0;
    }
  };
  
  // Format duration as readable text
  const formatDuration = (): string => {
    const minutes = getDuration();
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };
  
  if (compact) {
    return (
      <div 
        className={cn(
          "border rounded-md p-2 flex items-center justify-between",
          getTypeStyles(),
          className
        )}
      >
        <div className="truncate">
          <div className="font-medium text-sm truncate">{event.title}</div>
          {event.student && (
            <div className="text-xs truncate">
              {event.student.name}
            </div>
          )}
        </div>
        <div className="text-xs whitespace-nowrap ml-2">{formatTime(event.startTime)}</div>
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "border rounded-lg flex overflow-hidden",
        getTypeStyles(),
        className
      )}
    >
      {/* Left accent/avatar area */}
      <div className="w-14 p-3 flex flex-col items-center justify-center shrink-0 border-r">
        {event.student ? (
          <Avatar className="h-8 w-8">
            {event.student.avatarUrl ? (
              <AvatarImage src={event.student.avatarUrl} alt={event.student.name} />
            ) : (
              <AvatarFallback>
                {event.student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            )}
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
            {event.type === 'lesson' && <User className="h-4 w-4" />}
            {event.type === 'performance' && <Music className="h-4 w-4" />}
            {event.type === 'rehearsal' && <Users className="h-4 w-4" />}
            {event.type === 'other' && <Calendar className="h-4 w-4" />}
          </div>
        )}
      </div>
      
      <div className="flex-1 p-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{event.title}</h3>
            {event.student && (
              <p className="text-sm text-muted-foreground">{event.student.name}</p>
            )}
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDuration()}
          </div>
        </div>
        
        <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{event.location}</span>
            </div>
          )}
          
          {event.repertoire && (
            <div className="flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5" />
              <span className="truncate">{event.repertoire}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="w-8 flex items-center justify-center border-l">
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
} 