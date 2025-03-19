import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, User, Music, MapPin, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

const CalendarEvent: React.FC<CalendarEventProps> = ({ 
  event, 
  className,
  compact = false
}) => {
  // Get type-specific colors and styles
  const getTypeStyles = () => {
    switch (event.type) {
      case 'lesson':
        return {
          background: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-800/50',
          accentColor: 'bg-blue-500',
          textColor: 'text-blue-700 dark:text-blue-300',
          iconColor: 'text-blue-500 dark:text-blue-400',
          hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
        };
      case 'performance':
        return {
          background: 'bg-purple-50 dark:bg-purple-950/30',
          border: 'border-purple-200 dark:border-purple-800/50',
          accentColor: 'bg-purple-500',
          textColor: 'text-purple-700 dark:text-purple-300',
          iconColor: 'text-purple-500 dark:text-purple-400',
          hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
        };
      case 'rehearsal':
        return {
          background: 'bg-amber-50 dark:bg-amber-950/30',
          border: 'border-amber-200 dark:border-amber-800/50',
          accentColor: 'bg-amber-500',
          textColor: 'text-amber-700 dark:text-amber-300',
          iconColor: 'text-amber-500 dark:text-amber-400',
          hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
        };
      default:
        return {
          background: 'bg-gray-50 dark:bg-gray-800/30',
          border: 'border-gray-200 dark:border-gray-700',
          accentColor: 'bg-gray-400',
          textColor: 'text-gray-700 dark:text-gray-300',
          iconColor: 'text-gray-500 dark:text-gray-400',
          hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
        };
    }
  };

  const styles = getTypeStyles();

  if (compact) {
    return (
      <div 
        className={cn(
          "py-2 px-3 rounded-lg transition-all duration-150 cursor-pointer",
          styles.background, 
          styles.hoverBg,
          "border-l-[3px]",
          styles.border,
          "shadow-sm hover:shadow",
          className
        )}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm text-gray-800 dark:text-gray-200">
            {event.title}
          </h3>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {event.startTime}
          </span>
        </div>
        
        {(event.location || event.repertoire) && (
          <div className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-3">
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className={cn("h-3 w-3", styles.iconColor)} />
                {event.location}
              </span>
            )}
            {event.repertoire && (
              <span className="flex items-center gap-1">
                <Music className={cn("h-3 w-3", styles.iconColor)} />
                {event.repertoire}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "p-4 rounded-lg transition-all duration-200 border",
        styles.background,
        styles.hoverBg,
        styles.border,
        "shadow-sm hover:shadow",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Left accent/avatar area */}
        {event.student ? (
          <Avatar className="h-9 w-9 border-2 border-white dark:border-gray-800 shadow-sm mt-0.5">
            <AvatarImage src={event.student.avatarUrl || "/placeholder.svg"} alt={event.student.name} />
            <AvatarFallback className={cn("text-sm", styles.background, styles.textColor)}>
              {event.student.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className={cn("h-9 w-9 rounded-lg", styles.accentColor, "flex items-center justify-center")}>
            {event.type === 'performance' && <Music className="h-5 w-5 text-white" />}
            {event.type === 'rehearsal' && <User className="h-5 w-5 text-white" />}
            {event.type !== 'performance' && event.type !== 'rehearsal' && <Clock className="h-5 w-5 text-white" />}
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-base text-gray-800 dark:text-gray-200 mb-2">
              {event.title}
            </h3>
            <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className={cn("h-3.5 w-3.5", styles.iconColor)} />
              <span>
                {event.startTime} - {event.endTime}
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className={cn("h-3.5 w-3.5", styles.iconColor)} />
                <span>{event.location}</span>
              </div>
            )}
            
            {event.repertoire && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Music className={cn("h-3.5 w-3.5", styles.iconColor)} />
                <span>{event.repertoire}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarEvent;
