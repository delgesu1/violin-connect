import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Music,
  MapPin,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { CalendarEventData } from '@/components/common/CalendarEvent';
import CalendarEventModal from '@/components/common/CalendarEventModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock event data
const events: CalendarEventData[] = [
  {
    id: '1',
    title: 'Lesson: Emma Thompson',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    type: 'lesson',
    student: {
      id: '1',
      name: 'Emma Thompson',
    },
    location: 'Studio A',
    repertoire: 'Bach Partita No. 2'
  },
  {
    id: '2',
    title: 'Lesson: James Wilson',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    type: 'lesson',
    student: {
      id: '2',
      name: 'James Wilson',
    },
    location: 'Studio A',
    repertoire: 'Paganini Caprice No. 24'
  },
  {
    id: '3',
    title: 'Chamber Music Rehearsal',
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    type: 'rehearsal',
    location: 'Rehearsal Hall',
  },
  {
    id: '4',
    title: 'Lesson: Sophia Chen',
    startTime: '04:30 PM',
    endTime: '05:30 PM',
    type: 'lesson',
    student: {
      id: '3',
      name: 'Sophia Chen',
    },
    location: 'Studio A',
    repertoire: 'Tchaikovsky Violin Concerto'
  },
  {
    id: '5',
    title: 'Faculty Recital',
    startTime: '07:00 PM',
    endTime: '09:00 PM',
    type: 'performance',
    location: 'Concert Hall',
  },
];

// Helper to get time based color for events
const getEventColors = (type: string) => {
  switch (type) {
    case 'lesson':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800/50',
        accent: 'bg-blue-500',
        text: 'text-blue-700 dark:text-blue-300',
        icon: 'text-blue-500 dark:text-blue-400',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
      };
    case 'performance':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/30',
        border: 'border-purple-200 dark:border-purple-800/50',
        accent: 'bg-purple-500',
        text: 'text-purple-700 dark:text-purple-300',
        icon: 'text-purple-500 dark:text-purple-400',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
      };
    case 'rehearsal':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-800/50',
        accent: 'bg-amber-500',
        text: 'text-amber-700 dark:text-amber-300',
        icon: 'text-amber-500 dark:text-amber-400',
        hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-800/30',
        border: 'border-gray-200 dark:border-gray-700',
        accent: 'bg-gray-500',
        text: 'text-gray-700 dark:text-gray-300',
        icon: 'text-gray-500 dark:text-gray-400',
        hover: 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
      };
  }
};

// Helper to group events by time (for day view)
const groupEventsByTime = (events: CalendarEventData[], selectedDate: Date) => {
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', 
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];
  
  // In a real app, we'd filter events by date
  // For this mock, we'll just show all events on the selected date
  return timeSlots.map(time => {
    // In a real app, we'd do proper time comparison
    const matchingEvents = events.filter(event => 
      event.startTime === time || 
      (time === '9:00 AM' && event.id === '1') ||
      (time === '11:00 AM' && event.id === '2') ||
      (time === '2:00 PM' && event.id === '3') ||
      (time === '4:00 PM' && event.id === '4') ||
      (time === '7:00 PM' && event.id === '5')
    );
    
    return {
      time,
      events: matchingEvents
    };
  });
};

const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<'lesson' | 'performance' | 'rehearsal' | 'other'>('lesson');
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEventData> | undefined>(undefined);
  
  // Group events by time for day view
  const timeSlots = groupEventsByTime(events, date);
  
  const navigateToday = () => setDate(new Date());
  const navigatePrevious = () => setDate(prev => view === 'day' ? subDays(prev, 1) : prev);
  const navigateNext = () => setDate(prev => view === 'day' ? addDays(prev, 1) : prev);
  
  const openNewEventModal = (type: 'lesson' | 'performance' | 'rehearsal' | 'other') => {
    setSelectedEventType(type);
    setSelectedEvent(undefined);
    setIsEventModalOpen(true);
  };
  
  const openEditEventModal = (event: CalendarEventData) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };
  
  const handleSaveEvent = (event: Partial<CalendarEventData>) => {
    console.log('Saving event:', event);
    // In a real app, you would save the event to the database here
    setIsEventModalOpen(false);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader 
        title="Calendar" 
        description={`Schedule for ${format(date, 'MMMM d, yyyy')}`}
      >
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-sm shadow-sm"
          onClick={() => openNewEventModal('lesson')}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Event
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-5 sticky top-6 animate-slide-up animate-stagger-1">
            <Card className="overflow-hidden shadow-sm border-gray-200/70 dark:border-gray-700/70">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md p-3"
                classNames={{
                  day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white",
                  day_today: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                }}
              />
            </Card>
            
            <Card className="shadow-sm border-gray-200/70 dark:border-gray-700/70">
              <CardContent className="p-4">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">View</h3>
                    <Select
                      value={view}
                      onValueChange={(value) => setView(value as any)}
                    >
                      <SelectTrigger className="w-32 text-sm h-8 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="View" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Quick Add</h3>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-sm h-9 border-gray-200 dark:border-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 hover:border-blue-200"
                        onClick={() => openNewEventModal('lesson')}
                      >
                        <User className="mr-2 h-4 w-4 text-blue-500" />
                        Lesson
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-sm h-9 border-gray-200 dark:border-gray-700 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 hover:border-purple-200"
                        onClick={() => openNewEventModal('performance')}
                      >
                        <Music className="mr-2 h-4 w-4 text-purple-500" />
                        Performance
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-sm h-9 border-gray-200 dark:border-gray-700 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 hover:border-amber-200"
                        onClick={() => openNewEventModal('other')}
                      >
                        <Clock className="mr-2 h-4 w-4 text-amber-500" />
                        Other Event
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="lg:col-span-3 animate-slide-up animate-stagger-2">
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 shadow-sm border border-gray-200/70 dark:border-gray-700/70">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={navigatePrevious}
                className="h-8 w-8 text-gray-500 hover:text-gray-800 hover:bg-gray-200/70 dark:hover:bg-gray-700/50 dark:hover:text-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-medium text-lg text-gray-800 dark:text-gray-200">
                {format(date, view === 'day' ? 'EEEE, MMMM d' : view === 'week' ? 'MMMM d - 7' : 'MMMM yyyy')}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={navigateNext}
                className="h-8 w-8 text-gray-500 hover:text-gray-800 hover:bg-gray-200/70 dark:hover:bg-gray-700/50 dark:hover:text-gray-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={navigateToday}
              className="text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 mt-2 md:mt-0"
            >
              Today
            </Button>
          </div>
          
          {view === 'day' && (
            <div className="space-y-0 border border-gray-200/70 dark:border-gray-700/70 rounded-xl overflow-hidden shadow-sm">
              {timeSlots.map((slot, index) => {
                // Determine if it's a current timeslot based on time
                const isCurrentTime = false; // In real app, would compare with current time
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "flex border-t border-gray-100 dark:border-gray-800",
                      isCurrentTime ? "bg-blue-50/50 dark:bg-blue-900/10" : 
                      slot.events.length > 0 ? "bg-gray-50/80 dark:bg-gray-800/30" : 
                      "hover:bg-gray-50/50 dark:hover:bg-gray-800/20 group"
                    )}
                  >
                    <div className="w-20 text-gray-500 dark:text-gray-400 text-xs pr-4 pt-3 text-right">
                      {slot.time}
                    </div>
                    <div className="flex-1 min-h-[70px] py-1 relative">
                      {!slot.events.length && (
                        <Button 
                          variant="ghost" 
                          className="absolute inset-0 w-full h-full justify-start rounded-none p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openNewEventModal('lesson')}
                        >
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-3 flex items-center">
                            <Plus className="h-3 w-3 mr-1 text-blue-500" />
                            Add event
                          </span>
                        </Button>
                      )}
                      
                      {slot.events.map(event => {
                        const colors = getEventColors(event.type);
                        
                        return (
                          <div 
                            key={event.id}
                            className={cn(
                              "px-3 py-2.5 my-1 rounded-lg transition-all duration-150 cursor-pointer",
                              colors.bg,
                              colors.hover,
                              "border-l-[3px]",
                              colors.border,
                              "shadow-sm hover:shadow"
                            )}
                            onClick={() => openEditEventModal(event)}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">{event.title}</h4>
                              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                {event.startTime} - {event.endTime}
                              </div>
                            </div>
                            
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                              {event.location && (
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                  <MapPin className={cn("h-3 w-3 mr-1", colors.icon)} />
                                  {event.location}
                                </div>
                              )}
                              {event.repertoire && (
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                  <Music className={cn("h-3 w-3 mr-1", colors.icon)} />
                                  {event.repertoire}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {view === 'week' && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/70 dark:border-gray-700/70">
              <CalendarIcon className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Week View</p>
              <p className="text-sm mb-5">Coming soon in the next update!</p>
              <Button 
                variant="outline" 
                className="text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setView('day')}
              >
                Switch to Day View
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          
          {view === 'month' && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/70 dark:border-gray-700/70">
              <CalendarIcon className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Month View</p>
              <p className="text-sm mb-5">Coming soon in the next update!</p>
              <Button 
                variant="outline" 
                className="text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setView('day')}
              >
                Switch to Day View
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Event Creation/Editing Modal */}
      <CalendarEventModal 
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
        type={selectedEventType}
      />
    </div>
  );
};

export default CalendarPage;
