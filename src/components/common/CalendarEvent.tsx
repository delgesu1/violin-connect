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
  // Get type-specific colors and styles
  const getTypeStyles = () => {
    switch (event.type) {
      case 'lesson':
        return {
          background: 'bg-blue-50/40',
          border: 'border-blue-100',
          accentColor: 'bg-blue-500',
          hoverBg: 'hover:bg-blue-50/60'
        };
      case 'performance':
        return {
          background: 'bg-indigo-50/40',
          border: 'border-indigo-100',
          accentColor: 'bg-indigo-500',
          hoverBg: 'hover:bg-indigo-50/60'
        };
      case 'rehearsal':
        return {
          background: 'bg-amber-50/40',
          border: 'border-amber-100',
          accentColor: 'bg-amber-500',
          hoverBg: 'hover:bg-amber-50/60'
        };
      default:
        return {
          background: 'bg-gray-50/70',
          border: 'border-gray-100',
          accentColor: 'bg-gray-400',
          hoverBg: 'hover:bg-gray-50/80'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className={cn(
        "p-4 rounded-lg transition-all duration-200 flex items-stretch",
        styles.background,
        styles.hoverBg,
        "border",
        styles.border,
        "shadow-sm hover:shadow",
        className
      )}
    >
      {/* Left accent bar */}
      <div className={cn("w-1 rounded-full mr-4 self-stretch", styles.accentColor)} />
      
      <div className="flex-1">
        <h3 className="font-medium text-base mb-2.5 text-gray-800">{event.title}</h3>
        
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>
              {event.startTime} - {event.endTime}
            </span>
          </div>
          
          {event.student && (
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <User className="h-4 w-4 text-gray-400" />
              <span>{event.student.name}</span>
            </div>
          )}
          
          {event.location && (
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{event.location}</span>
            </div>
          )}
          
          {event.repertoire && (
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <Music className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{event.repertoire}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarEvent;
