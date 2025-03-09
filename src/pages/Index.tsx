
import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Calendar, Music, MessageSquare, Users } from 'lucide-react';
import StudentCard, { Student } from '@/components/common/StudentCard';
import CalendarEvent, { CalendarEventData } from '@/components/common/CalendarEvent';

// Mock data
const students: Student[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    currentPiece: 'Bach Partita No. 2',
    nextLesson: 'Today, 4:00 PM',
    unreadMessages: 2,
  },
  {
    id: '2',
    name: 'James Wilson',
    currentPiece: 'Paganini Caprice No. 24',
    nextLesson: 'Tomorrow, 3:30 PM',
  },
  {
    id: '3',
    name: 'Sophia Chen',
    currentPiece: 'Tchaikovsky Violin Concerto',
    nextLesson: 'Friday, 5:00 PM',
    unreadMessages: 1,
  },
  {
    id: '4',
    name: 'Michael Brown',
    currentPiece: 'Mozart Violin Sonata K.304',
    nextLesson: 'Next Monday, 4:30 PM',
  }
];

const upcomingEvents: CalendarEventData[] = [
  {
    id: '1',
    title: 'Lesson with Emma',
    startTime: '4:00 PM',
    endTime: '5:00 PM',
    type: 'lesson',
    student: {
      id: '1',
      name: 'Emma Thompson'
    },
    repertoire: 'Bach Partita No. 2'
  },
  {
    id: '2',
    title: 'Chamber Music Rehearsal',
    startTime: '6:30 PM',
    endTime: '8:00 PM',
    type: 'rehearsal',
    location: 'Main Studio'
  },
  {
    id: '3',
    title: 'Lesson with James',
    startTime: '3:30 PM',
    endTime: '4:30 PM',
    type: 'lesson',
    student: {
      id: '2',
      name: 'James Wilson'
    },
    repertoire: 'Paganini Caprice No. 24'
  }
];

const Dashboard = () => {
  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Welcome back, Teacher."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Lesson
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="animate-slide-up animate-stagger-1 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <CardDescription>Total active students</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up animate-stagger-2 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <CardDescription>Scheduled this week</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up animate-stagger-3 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <CardDescription>Unread messages</CardDescription>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="today" className="animate-slide-up animate-stagger-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upcoming Schedule</h2>
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="today" className="space-y-4 mt-0">
              {upcomingEvents.map(event => (
                <CalendarEvent key={event.id} event={event} />
              ))}
              
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                View Full Calendar
              </Button>
            </TabsContent>
            
            <TabsContent value="week" className="space-y-4 mt-0">
              <p className="text-muted-foreground">Displaying events for the entire week...</p>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4 animate-slide-up animate-stagger-3">
            <h2 className="text-xl font-semibold">Your Students</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-4 animate-slide-up animate-stagger-3">
            {students.slice(0, 3).map(student => (
              <StudentCard key={student.id} student={student} />
            ))}
            
            <Button variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Manage Students
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
