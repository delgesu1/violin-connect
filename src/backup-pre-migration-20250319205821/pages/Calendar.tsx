import React, { useState, useMemo } from 'react';
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
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Mock event data
const events: CalendarEventData[] = [
  // Private Lessons
  {
    id: '1',
    title: 'Lesson: Emma Thompson',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    type: 'lesson',
    student: {
      id: '1',
      name: 'Emma Thompson',
      avatarUrl: '/images/girl1.jpg'
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
      avatarUrl: '/images/boy1.jpg'
    },
    location: 'Studio A',
    repertoire: 'Paganini Caprice No. 24'
  },
  {
    id: '3',
    title: 'Chamber Coaching: Brahms Quartet',
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    type: 'rehearsal',
    location: 'Chamber Studio',
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
      avatarUrl: '/images/girl2.jpg'
    },
    location: 'Studio A',
    repertoire: 'Tchaikovsky Violin Concerto'
  },
  {
    id: '5',
    title: 'Student Recital',
    startTime: '07:00 PM',
    endTime: '09:00 PM',
    type: 'performance',
    location: 'Recital Hall',
  },
  
  // All-day events
  {
    id: '6',
    title: 'Strings Competition',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    type: 'performance',
    location: 'Concert Hall',
    isAllDay: true
  },
  {
    id: '7',
    title: 'Chamber Music Festival',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    type: 'performance',
    location: 'Music Building',
    isAllDay: true
  },
  {
    id: '8',
    title: 'Masterclass Day',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    type: 'performance',
    location: 'Main Hall',
    isAllDay: true
  },
  
  // More lessons and music events
  {
    id: '9',
    title: 'Lesson: Michael Johnson',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    type: 'lesson',
    student: {
      id: '4',
      name: 'Michael Johnson',
      avatarUrl: '/images/boy2.jpg'
    },
    location: 'Studio B',
    repertoire: 'Brahms Violin Concerto'
  },
  {
    id: '10',
    title: 'Lesson: Olivia Parker',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    type: 'lesson',
    student: {
      id: '5',
      name: 'Olivia Parker',
      avatarUrl: '/images/girl3.jpg'
    },
    location: 'Studio A',
    repertoire: 'Mozart Violin Concerto No. 4'
  },
  {
    id: '11',
    title: 'Studio Class',
    startTime: '01:00 PM',
    endTime: '03:00 PM',
    type: 'rehearsal',
    location: 'Recital Hall',
  },
  {
    id: '12',
    title: 'Lesson: Benjamin Lee',
    startTime: '03:30 PM',
    endTime: '04:30 PM',
    type: 'lesson',
    student: {
      id: '6',
      name: 'Benjamin Lee',
      avatarUrl: '/images/boy3.jpg'
    },
    location: 'Studio A',
    repertoire: 'Sibelius Violin Concerto'
  },
  {
    id: '13',
    title: 'Chamber Coaching: Mozart Trio',
    startTime: '11:30 AM',
    endTime: '01:00 PM',
    type: 'rehearsal',
    location: 'Chamber Studio',
  },
  {
    id: '14',
    title: 'Faculty Recital',
    startTime: '07:00 PM',
    endTime: '09:00 PM',
    type: 'performance',
    location: 'Concert Hall',
  },
  {
    id: '15',
    title: 'Lesson: Eliza Rodriguez',
    startTime: '09:30 AM',
    endTime: '10:30 AM',
    type: 'lesson',
    student: {
      id: '7',
      name: 'Eliza Rodriguez',
      avatarUrl: '/images/girl4.jpg'
    },
    location: 'Studio B',
    repertoire: 'Lalo Symphonie Espagnole'
  },
  {
    id: '16',
    title: 'Chamber Coaching: Beethoven Quartet',
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    type: 'rehearsal',
    location: 'Chamber Studio',
  },
  {
    id: '17',
    title: 'Lesson: Thomas Wright',
    startTime: '04:30 PM',
    endTime: '05:30 PM',
    type: 'lesson',
    student: {
      id: '8',
      name: 'Thomas Wright',
      avatarUrl: '/images/boy4.jpg'
    },
    location: 'Studio A',
    repertoire: 'Mendelssohn Violin Concerto'
  },
  {
    id: '18',
    title: 'String Quartet Coaching',
    startTime: '01:00 PM',
    endTime: '03:00 PM',
    type: 'rehearsal',
    location: 'Chamber Room',
  },
  {
    id: '19',
    title: 'Masterclass with Guest Artist',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    type: 'performance',
    location: 'Main Recital Hall',
  },
  {
    id: '20',
    title: 'Student Showcase',
    startTime: '06:00 PM',
    endTime: '08:00 PM',
    type: 'performance',
    location: 'Concert Hall',
  },
  {
    id: '21',
    title: 'Violin Showcase',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    type: 'performance',
    location: 'Music Building',
    isAllDay: true
  },
  {
    id: '22',
    title: 'Studio Class',
    startTime: '11:00 AM',
    endTime: '01:00 PM',
    type: 'rehearsal',
    location: 'Studio A',
  },
  {
    id: '23',
    title: 'Chamber Coaching: Ravel Trio',
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    type: 'rehearsal',
    location: 'Chamber Studio',
  },
  {
    id: '24',
    title: 'Junior Recital',
    startTime: '04:00 PM',
    endTime: '06:00 PM',
    type: 'performance',
    location: 'Small Recital Hall',
  },
  {
    id: '25',
    title: 'Lesson: Noah Kim',
    startTime: '01:00 PM',
    endTime: '02:00 PM',
    type: 'lesson',
    student: {
      id: '9',
      name: 'Noah Kim',
      avatarUrl: '/images/boy5.jpg'
    },
    location: 'Studio B',
    repertoire: 'Bruch Violin Concerto'
  },
  {
    id: '26',
    title: 'Technique Masterclass',
    startTime: '09:30 AM',
    endTime: '11:00 AM',
    type: 'performance',
    location: 'Recital Hall',
  },
  {
    id: '27',
    title: 'Viola Masterclass',
    startTime: '03:00 PM',
    endTime: '05:00 PM',
    type: 'performance',
    location: 'Main Hall',
  },
  {
    id: '28',
    title: 'Lesson: Maya Singh',
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    type: 'lesson',
    student: {
      id: '10',
      name: 'Maya Singh',
      avatarUrl: '/images/girl5.jpg'
    },
    location: 'Studio A',
    repertoire: 'Mozart Violin Concerto No. 5'
  },
  {
    id: '29',
    title: 'Studio Class',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    type: 'rehearsal',
    location: 'Recital Hall',
  },
  {
    id: '30',
    title: 'Lesson: Ian Walker',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    type: 'lesson',
    student: {
      id: '11',
      name: 'Ian Walker',
      avatarUrl: '/images/boy6.jpg'
    },
    location: 'Studio A',
    repertoire: 'Vivaldi Four Seasons'
  },
  {
    id: '31',
    title: 'Chamber Orchestra Rehearsal',
    startTime: '06:00 PM',
    endTime: '08:30 PM',
    type: 'rehearsal',
    location: 'Orchestra Hall',
  },
  {
    id: '32',
    title: 'Studio Class: Technique Focus',
    startTime: '12:00 PM',
    endTime: '01:30 PM',
    type: 'rehearsal',
    location: 'Studio B',
  },
  {
    id: '33',
    title: 'Masterclass with Visiting Faculty',
    startTime: '03:00 PM',
    endTime: '05:00 PM',
    type: 'performance',
    location: 'Main Hall',
  },
  {
    id: '34',
    title: 'International Violin Competition',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    type: 'performance',
    location: 'Concert Hall',
    isAllDay: true
  },
  {
    id: '35',
    title: 'Bach Festival',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    type: 'performance',
    location: 'University Auditorium',
    isAllDay: true
  },
  {
    id: '36',
    title: 'String Festival',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    type: 'performance',
    location: 'Downtown Arts Center',
    isAllDay: true
  },
  {
    id: '37',
    title: 'Morning Practice Session',
    startTime: '8:00 AM',
    endTime: '9:00 AM',
    type: 'rehearsal',
    location: 'Practice Room 2',
  },
  {
    id: '38',
    title: 'Lesson: Sophia Miller',
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    type: 'lesson',
    student: {
      id: '12',
      name: 'Sophia Miller',
      avatarUrl: '/images/girl6.jpg'
    },
    location: 'Studio B',
    repertoire: 'Bach Sonata No. 1'
  },
  {
    id: '39',
    title: 'Chamber Music Forum',
    startTime: '12:00 PM',
    endTime: '1:30 PM',
    type: 'rehearsal',
    location: 'Chamber Hall',
  },
  {
    id: '40',
    title: 'Lesson: Luke Garcia',
    startTime: '2:30 PM',
    endTime: '3:30 PM',
    type: 'lesson',
    student: {
      id: '13',
      name: 'Luke Garcia',
      avatarUrl: '/images/boy7.jpg'
    },
    location: 'Studio A',
    repertoire: 'Beethoven Sonata No. 5'
  },
  {
    id: '41',
    title: 'Student Recording Session',
    startTime: '5:30 PM',
    endTime: '7:00 PM',
    type: 'performance',
    location: 'Recording Studio',
  },
  {
    id: '42',
    title: 'Chamber Coaching: Dvořák Quintet',
    startTime: '1:30 PM',
    endTime: '3:00 PM',
    type: 'rehearsal',
    location: 'Chamber Studio',
  }
];

// Helper to get event colors based on type
const getEventColors = (type: string) => {
  switch (type) {
    case 'lesson':
      return { 
        bg: 'bg-blue-50 dark:bg-blue-900/20', 
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
        border: 'border-blue-500 dark:border-blue-400' 
      };
    case 'performance':
      return { 
        bg: 'bg-purple-50 dark:bg-purple-900/20', 
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
        border: 'border-purple-500 dark:border-purple-400' 
      };
    case 'rehearsal':
      return { 
        bg: 'bg-amber-50 dark:bg-amber-900/20', 
        hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
        border: 'border-amber-500 dark:border-amber-400' 
      };
    default:
      return { 
        bg: 'bg-gray-50 dark:bg-gray-800/50', 
        hover: 'hover:bg-gray-100 dark:hover:bg-gray-800/70',
        border: 'border-gray-400 dark:border-gray-500' 
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

// Helper to get events for a specific day in the week view
const getEventsForDay = (events: CalendarEventData[], day: Date) => {
  // In a real app, you would filter events by day
  // For this mock, we'll distribute events across the week
  
  const dayOfWeek = day.getDay();
  
  if (dayOfWeek === 0) { // Sunday
    return events.filter(e => ['37', '31', '33'].includes(e.id)); 
  } else if (dayOfWeek === 1) { // Monday
    return events.filter(e => ['1', '9', '13', '17', '26', '30', '38'].includes(e.id));
  } else if (dayOfWeek === 2) { // Tuesday
    return events.filter(e => ['2', '10', '11', '22', '25', '29', '32', '37', '39'].includes(e.id));
  } else if (dayOfWeek === 3) { // Wednesday
    return events.filter(e => ['3', '12', '23', '28', '33', '38', '41'].includes(e.id));
  } else if (dayOfWeek === 4) { // Thursday
    return events.filter(e => ['4', '15', '16', '19', '24', '27', '40', '42'].includes(e.id));
  } else if (dayOfWeek === 5) { // Friday
    return events.filter(e => ['5', '14', '20', '26', '30', '39', '40'].includes(e.id));
  } else { // Saturday
    return events.filter(e => ['18', '25', '31', '37', '41'].includes(e.id));
  }
};

// Helper to get all-day events for a specific day
const getAllDayEventsForDay = (events: CalendarEventData[], day: Date) => {
  // In a real app, you would filter events by day and all-day flag
  // For this mock, we'll distribute all-day events across the week
  
  const dayOfWeek = day.getDay();
  
  if (dayOfWeek === 0) { // Sunday
    return events.filter(e => e.id === '6' && e.isAllDay); 
  } else if (dayOfWeek === 1) { // Monday
    return events.filter(e => e.id === '34' && e.isAllDay);
  } else if (dayOfWeek === 2) { // Tuesday
    return events.filter(e => e.id === '35' && e.isAllDay);
  } else if (dayOfWeek === 3) { // Wednesday
    return events.filter(e => e.id === '7' && e.isAllDay);
  } else if (dayOfWeek === 4) { // Thursday
    return events.filter(e => e.id === '36' && e.isAllDay);
  } else if (dayOfWeek === 5) { // Friday
    return events.filter(e => e.id === '8' && e.isAllDay);
  } else if (dayOfWeek === 6) { // Saturday
    return events.filter(e => e.id === '21' && e.isAllDay);
  } else {
    return [];
  }
};

// Helper to group events by time for the week view
const groupEventsByTimeForWeek = (events: CalendarEventData[], startDate: Date) => {
  const timeSlots = [
    '8:00 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', 
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', 
    '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '8:00 PM'
  ];
  
  const daysOfWeek = eachDayOfInterval({
    start: startDate,
    end: endOfWeek(startDate)
  });
  
  // Create a time-based grid for the week
  return timeSlots.map(time => {
    return {
      time,
      days: daysOfWeek.map(day => {
        const dayEvents = getEventsForDay(events, day);
        return {
          date: day,
          events: dayEvents.filter(event => event.startTime === time)
        };
      })
    };
  });
};

const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week'); // Default to week view
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<'lesson' | 'performance' | 'rehearsal' | 'other'>('lesson');
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEventData> | undefined>(undefined);
  
  // Group events by time for day view
  const timeSlots = groupEventsByTime(events, date);
  
  // Week view: Get the start and end of the current week
  const weekStart = useMemo(() => startOfWeek(date, { weekStartsOn: 0 }), [date]);
  const weekEnd = useMemo(() => endOfWeek(date, { weekStartsOn: 0 }), [date]);
  const daysOfWeek = useMemo(() => 
    eachDayOfInterval({ start: weekStart, end: weekEnd }), 
    [weekStart, weekEnd]
  );
  
  // Generate time-based grid for week view
  const weekTimeSlots = useMemo(() => 
    groupEventsByTimeForWeek(events, weekStart), 
    [events, weekStart]
  );

  // Get all-day events for the week
  const allDayEvents = useMemo(() => 
    daysOfWeek.map(day => ({
      date: day,
      events: getAllDayEventsForDay(events, day)
    })),
    [daysOfWeek]
  );
  
  const navigateToday = () => setDate(new Date());
  
  const navigatePrevious = () => {
    if (view === 'day') {
      setDate(prev => subDays(prev, 1));
    } else if (view === 'week') {
      setDate(prev => subWeeks(prev, 1));
    }
  };
  
  const navigateNext = () => {
    if (view === 'day') {
      setDate(prev => addDays(prev, 1));
    } else if (view === 'week') {
      setDate(prev => addWeeks(prev, 1));
    }
  };
  
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
  
  // Format the date range for week view
  const formatDateRange = () => {
    if (view === 'day') {
      return format(date, 'EEEE, MMMM d');
    } else {
      const start = format(weekStart, 'MMM d');
      const end = format(weekEnd, 'MMM d, yyyy');
      return `${start} - ${end}`;
    }
  };
  
  return (
    <div>
      <PageHeader 
        title="Calendar" 
        description={`Schedule for ${formatDateRange()}`}
      >
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-sm shadow-sm"
          onClick={() => openNewEventModal('lesson')}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Event
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 relative">
        <div className="w-full">
          <div className="space-y-5 md:sticky md:top-6 animate-slide-up animate-stagger-1 max-h-[calc(100vh-120px)] md:overflow-auto pb-4">
            <Card className="overflow-hidden shadow-sm border-gray-200/70 dark:border-gray-700/70 min-h-fit">
              <div className="w-full overflow-x-auto">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  className="rounded-md p-3 w-full"
                  classNames={{
                    months: "flex flex-col",
                    month: "space-y-2 w-full",
                    day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white",
                    day_today: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
                    table: "w-full",
                    head_row: "flex w-full justify-between",
                    row: "flex w-full justify-between mt-2",
                    cell: "flex-1 h-9 max-w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"
                  }}
                />
              </div>
            </Card>
            
            <Card className="shadow-sm border-gray-200/70 dark:border-gray-700/70 min-h-fit">
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
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal border-gray-200 dark:border-gray-700 h-9"
                      size="sm"
                    >
                      <Filter className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Filter Events</span>
                    </Button>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-500" />
                      <Input 
                        placeholder="Search events" 
                        className="pl-9 h-9 text-sm border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <h4 className="font-medium mb-2">Quick Add:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs justify-start border-gray-200 dark:border-gray-700"
                        onClick={() => openNewEventModal('lesson')}
                      >
                        <User className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                        Lesson
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs justify-start border-gray-200 dark:border-gray-700"
                        onClick={() => openNewEventModal('performance')}
                      >
                        <Music className="mr-1.5 h-3.5 w-3.5 text-purple-500" />
                        Performance
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs justify-start border-gray-200 dark:border-gray-700"
                        onClick={() => openNewEventModal('rehearsal')}
                      >
                        <User className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                        Rehearsal
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs justify-start border-gray-200 dark:border-gray-700"
                        onClick={() => openNewEventModal('other')}
                      >
                        <Clock className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
                        Other
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="w-full">
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
              <div className="font-medium text-lg text-gray-800 dark:text-gray-200 truncate">
                {formatDateRange()}
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
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <div className="flex rounded-lg border border-gray-200/70 dark:border-gray-700/70 overflow-hidden">
                <Button 
                  variant={view === 'week' ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setView('week')}
                  className={cn(
                    "rounded-none h-8",
                    view === 'week' ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  Week
                </Button>
                <Button 
                  variant={view === 'day' ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setView('day')}
                  className={cn(
                    "rounded-none h-8",
                    view === 'day' ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  Day
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToday}
                className="text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 h-8"
              >
                Today
              </Button>
            </div>
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
                    <div className="w-16 sm:w-20 text-gray-500 dark:text-gray-400 text-xs pr-2 sm:pr-4 pt-3 text-right">
                      {slot.time}
                    </div>
                    
                    <div className="flex-1 min-w-0 py-2 pl-2 pr-3 relative">
                      {slot.events.length === 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hidden group-hover:flex items-center h-6 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 absolute right-3 top-2"
                          onClick={() => openNewEventModal('other')}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          <span>Add</span>
                        </Button>
                      )}
                      
                      <div className="space-y-2 min-h-[3rem]">
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
                                "shadow-sm hover:shadow",
                                "min-w-[280px] md:min-w-0"
                              )}
                              onClick={() => openEditEventModal(event)}
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">{event.title}</h4>
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                                  {event.startTime} - {event.endTime}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 mt-2">
                                {event.student && (
                                  <div className="flex items-center gap-1.5">
                                    <Avatar className="h-5 w-5">
                                      <AvatarImage src={event.student.avatarUrl} alt={event.student.name} />
                                      <AvatarFallback className="text-[10px]">
                                        {event.student.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{event.student.name}</span>
                                  </div>
                                )}
                                
                                {event.location && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{event.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {view === 'week' && (
            <div className="space-y-0 border border-gray-200/70 dark:border-gray-700/70 rounded-xl overflow-hidden shadow-sm">
              {/* Week header */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="w-16 sm:w-20"></div>
                {daysOfWeek.map((day, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex-1 text-center py-3 px-1",
                      isToday(day) ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    )}
                  >
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {format(day, 'EEE')}
                    </div>
                    <div className={cn(
                      "text-sm mt-1 font-medium",
                      isToday(day) ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* All-day events */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <div className="w-16 sm:w-20 py-2 px-2 text-xs text-gray-500 dark:text-gray-400 text-right">
                  All-day
                </div>
                {allDayEvents.map((day, dayIndex) => (
                  <div 
                    key={dayIndex} 
                    className={cn(
                      "flex-1 min-h-[3rem] p-1 border-l border-gray-100 dark:border-gray-800",
                      isToday(day.date) ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                    )}
                  >
                    {day.events.map(event => {
                      const colors = getEventColors(event.type);
                      
                      return (
                        <div 
                          key={event.id}
                          className={cn(
                            "px-2 py-1 my-1 rounded text-xs font-medium",
                            colors.bg,
                            colors.hover,
                            "border-l-[3px]",
                            colors.border,
                            "shadow-sm cursor-pointer"
                          )}
                          onClick={() => openEditEventModal(event)}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              {/* Time slots */}
              {weekTimeSlots.map((timeSlot, timeIndex) => (
                <div 
                  key={timeIndex}
                  className="flex border-t border-gray-100 dark:border-gray-800"
                >
                  <div className="w-16 sm:w-20 text-gray-500 dark:text-gray-400 text-xs pr-2 sm:pr-4 pt-3 text-right">
                    {timeSlot.time}
                  </div>
                  
                  {timeSlot.days.map((day, dayIndex) => (
                    <div 
                      key={dayIndex} 
                      className={cn(
                        "flex-1 min-h-[5rem] p-1 relative border-l border-gray-100 dark:border-gray-800",
                        isToday(day.date) ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                      )}
                    >
                      {day.events.map(event => {
                        const colors = getEventColors(event.type);
                        
                        return (
                          <div 
                            key={event.id}
                            className={cn(
                              "px-2 py-2 my-1 rounded-lg",
                              colors.bg,
                              colors.hover,
                              "border-l-[3px]",
                              colors.border,
                              "shadow-sm cursor-pointer"
                            )}
                            onClick={() => openEditEventModal(event)}
                          >
                            <h4 className="font-medium text-xs text-gray-800 dark:text-gray-200 mb-1 truncate">
                              {event.title}
                            </h4>
                            
                            <div className="flex flex-col gap-1">
                              <div className="text-[10px] text-gray-600 dark:text-gray-400">
                                {event.startTime} - {event.endTime}
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-2.5 w-2.5 text-gray-500 dark:text-gray-400" />
                                  <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                                    {event.location}
                                  </span>
                                </div>
                              )}
                              
                              {event.student && (
                                <div className="flex items-center gap-1">
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={event.student.avatarUrl} alt={event.student.name} />
                                    <AvatarFallback className="text-[8px]">
                                      {event.student.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                                    {event.student.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
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
