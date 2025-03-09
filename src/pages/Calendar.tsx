
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
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { CalendarEventData } from '@/components/common/CalendarEvent';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

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

// Helper to group events by time (for day view)
const groupEventsByTime = (events: CalendarEventData[]) => {
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', 
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];
  
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
  
  // Group events by time for day view
  const timeSlots = groupEventsByTime(events);
  
  return (
    <>
      <PageHeader 
        title="Calendar" 
        description={`Schedule for ${format(date, 'MMMM d, yyyy')}`}
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-4 sticky top-6 animate-slide-up animate-stagger-1">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border shadow-sm p-3 pointer-events-auto"
            />
            
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">View</h3>
                  <Select
                    value={view}
                    onValueChange={(value) => setView(value as any)}
                  >
                    <SelectTrigger className="w-32">
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
                  <h3 className="font-medium mb-2">Quick Add</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Lesson
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Music className="mr-2 h-4 w-4" />
                      Performance
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      Other Event
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="lg:col-span-3 animate-slide-up animate-stagger-2">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-medium">
                {format(date, view === 'day' ? 'EEEE, MMMM d' : view === 'week' ? 'MMMM d - 7' : 'MMMM yyyy')}
              </div>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
              Today
            </Button>
          </div>
          
          {view === 'day' && (
            <div className="space-y-2">
              {timeSlots.map((slot, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex border-t py-2",
                    slot.events.length > 0 ? "bg-muted/20" : ""
                  )}
                >
                  <div className="w-20 text-muted-foreground text-sm pr-4 pt-2 text-right">
                    {slot.time}
                  </div>
                  <div className="flex-1">
                    {slot.events.map(event => (
                      <div 
                        key={event.id}
                        className={cn(
                          "p-3 rounded-md mb-2 border",
                          event.type === 'lesson' ? 'bg-blue-50 border-blue-200' : 
                          event.type === 'performance' ? 'bg-purple-50 border-purple-200' : 
                          event.type === 'rehearsal' ? 'bg-amber-50 border-amber-200' : 
                          'bg-gray-50 border-gray-200'
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="text-sm">{event.startTime} - {event.endTime}</div>
                        </div>
                        
                        <div className="mt-1 text-sm text-muted-foreground">
                          {event.location && (
                            <div>{event.location}</div>
                          )}
                          {event.repertoire && (
                            <div className="flex items-center gap-1">
                              <Music className="h-3 w-3" />
                              {event.repertoire}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {view === 'week' && (
            <div className="text-center py-12 text-muted-foreground">
              Week view coming soon.
            </div>
          )}
          
          {view === 'month' && (
            <div className="text-center py-12 text-muted-foreground">
              Month view coming soon.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CalendarPage;
