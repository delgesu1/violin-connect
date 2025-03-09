import React from 'react';
import { Link } from 'react-router-dom';
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
    avatarUrl: '/images/girl1.jpg',
    currentRepertoire: [
      { id: '101', title: 'Bach Partita No. 2', composer: 'J.S. Bach', startDate: '2023-10-01', status: 'current' }
    ],
    nextLesson: 'Today, 4:00 PM',
    unreadMessages: 2,
  },
  {
    id: '2',
    name: 'James Wilson',
    avatarUrl: '/images/boy1.jpg',
    currentRepertoire: [
      { id: '201', title: 'Paganini Caprice No. 24', composer: 'N. Paganini', startDate: '2023-09-10', status: 'current' }
    ],
    nextLesson: 'Tomorrow, 3:30 PM',
  },
  {
    id: '3',
    name: 'Sophia Chen',
    avatarUrl: '/images/girl2.jpg',
    currentRepertoire: [
      { id: '301', title: 'Tchaikovsky Violin Concerto', composer: 'P.I. Tchaikovsky', startDate: '2023-09-05', status: 'current' }
    ],
    nextLesson: 'Friday, 5:00 PM',
    unreadMessages: 1,
  },
  {
    id: '4',
    name: 'Michael Brown',
    avatarUrl: '/images/boy2.jpg',
    currentRepertoire: [
      { id: '401', title: 'Mozart Violin Sonata K.304', composer: 'W.A. Mozart', startDate: '2023-09-20', status: 'current' }
    ],
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
      name: 'Emma Thompson',
      avatarUrl: '/images/girl1.jpg'
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
      name: 'James Wilson',
      avatarUrl: '/images/boy1.jpg'
    },
    repertoire: 'Paganini Caprice No. 24'
  }
];

const Dashboard = () => {
  return (
    <div className="max-w-[1600px] mx-auto px-1">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back, Teacher."
      >
        <Button size="default" className="shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Lesson
        </Button>
      </PageHeader>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card className="animate-slide-up animate-stagger-1 bg-white border border-gray-100 shadow-sm hover:shadow transition-all duration-200">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-medium flex items-center text-gray-500">
              <Users className="mr-2 h-4 w-4 text-primary" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-bold text-gray-800">{students.length}</div>
            <CardDescription className="mt-1 text-gray-500">Total active students</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up animate-stagger-2 bg-white border border-gray-100 shadow-sm hover:shadow transition-all duration-200">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-medium flex items-center text-gray-500">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              Lessons
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-bold text-gray-800">12</div>
            <CardDescription className="mt-1 text-gray-500">Scheduled this week</CardDescription>
          </CardContent>
        </Card>
        
        <Link to="/messages" className="block">
          <Card className="animate-slide-up animate-stagger-3 bg-white border border-gray-100 shadow-sm hover:shadow transition-all duration-200 hover:border-primary/30">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium flex items-center text-gray-500">
                <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold text-gray-800">3</div>
              <CardDescription className="mt-1 text-gray-500">Unread messages</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Section */}
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-lg">
          <Tabs defaultValue="today" className="animate-slide-up animate-stagger-2">
            <div className="flex justify-between items-center p-5 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold flex items-center text-gray-800">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Upcoming Schedule
              </h2>
              <TabsList className="bg-gray-50">
                <TabsTrigger value="today" className="rounded-md text-sm">Today</TabsTrigger>
                <TabsTrigger value="week" className="rounded-md text-sm">This Week</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="today" className="space-y-4 p-5 pt-4">
              {upcomingEvents.map((event, index) => (
                <CalendarEvent 
                  key={event.id} 
                  event={event} 
                  className="transform transition-transform hover:scale-[1.01]"
                />
              ))}
              
              <Button variant="outline" className="w-full mt-2 rounded-lg h-12 border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200">
                <Calendar className="mr-2 h-4 w-4 text-primary" />
                View Full Calendar
              </Button>
            </TabsContent>
            
            <TabsContent value="week" className="p-5">
              <p className="text-gray-500">Displaying events for the entire week...</p>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Students Section */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg">
          <div className="p-5 pb-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center text-gray-800">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Your Students
              </h2>
              <Link to="/students">
                <Button variant="ghost" size="sm" className="text-primary font-medium hover:bg-gray-50">
                  View All
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="space-y-4 p-5 pt-4 animate-slide-up animate-stagger-3">
            {students.slice(0, 3).map(student => (
              <StudentCard 
                key={student.id} 
                student={student} 
                className=""
              />
            ))}
            
            <Link to="/students">
              <Button variant="outline" className="w-full mt-3 rounded-lg h-12 border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200">
                <Users className="mr-2 h-4 w-4 text-primary" />
                Manage Students
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
