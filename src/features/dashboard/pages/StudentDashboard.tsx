import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useDevFallbackUser } from '@/hooks/useDevFallbackUser';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Calendar, Book, Music, Mail, Phone, Clock } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

// Fallback mock data for when real data doesn't exist yet
const fallbackData = {
  upcomingLessons: [
    {
      id: '1',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days from now
      time: '15:30',
      duration: 45,
      topics: 'Bach Minuet, Scale practice, Vibrato technique',
      isOnline: false,
    }
  ],
  currentRepertoire: [
    {
      id: '1',
      title: 'Concerto in A minor',
      composer: 'Vivaldi',
      level: 'Intermediate',
      status: 'In Progress',
      startedDate: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
    }
  ],
  recentJournalEntries: [
    {
      id: '1',
      date: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
      title: 'Practice Session',
      content: 'Worked on the difficult passage in Vivaldi. Made progress with the string crossings.',
    }
  ]
};

export default function StudentDashboard() {
  const { isLoaded, userId } = useAuth();
  const { user } = useDevFallbackUser();
  const { data, isLoading, isError } = useStudentDashboard();
  
  // Simple name extraction from user data
  const firstName = user?.firstName || 'Student';
  
  // Use real data when available, fallback to mock data when needed
  const upcomingLessons = data?.upcomingLessons?.length ? data.upcomingLessons : fallbackData.upcomingLessons;
  const currentRepertoire = data?.currentRepertoire?.length ? data.currentRepertoire : fallbackData.currentRepertoire;
  const recentJournalEntries = data?.recentJournalEntries?.length ? data.recentJournalEntries : fallbackData.recentJournalEntries;
  const teacher = data?.teacher || null;
  
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {firstName}! Here's your progress overview.
          </p>
        </div>
        
        {teacher && (
          <Card className="md:w-auto w-full">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex-shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={teacher.avatar_url || ''} alt={teacher.name || 'Teacher'} />
                  <AvatarFallback>
                    {teacher.name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h3 className="font-medium">Your Teacher</h3>
                <p className="text-sm text-muted-foreground">{teacher.name || 'Not assigned'}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </header>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="repertoire">Repertoire</TabsTrigger>
          <TabsTrigger value="journal">Practice Journal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Next Lesson Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Next Lesson
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingLessons.length > 0 ? (
                  <div className="space-y-1">
                    <p className="font-medium">
                      {new Date(upcomingLessons[0].date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{upcomingLessons[0].time} ({upcomingLessons[0].duration} min)</span>
                    </div>
                    <Badge variant={upcomingLessons[0].isOnline ? "outline" : "default"}>
                      {upcomingLessons[0].isOnline ? 'Online' : 'In Person'}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming lessons scheduled</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View All Lessons
                </Button>
              </CardFooter>
            </Card>
            
            {/* Current Repertoire Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Music className="mr-2 h-5 w-5 text-primary" />
                  Current Repertoire
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentRepertoire.length > 0 ? (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="font-medium">{currentRepertoire[0].title}</p>
                      <p className="text-sm text-muted-foreground">{currentRepertoire[0].composer}</p>
                      <Badge variant="outline">{currentRepertoire[0].status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentRepertoire.length - 1} more piece(s) in progress
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No repertoire assigned</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View All Pieces
                </Button>
              </CardFooter>
            </Card>
            
            {/* Recent Practice Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Book className="mr-2 h-5 w-5 text-primary" />
                  Recent Practice
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentJournalEntries.length > 0 ? (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="font-medium">{recentJournalEntries[0].title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {recentJournalEntries[0].content.substring(0, 60)}...
                      </p>
                      <p className="text-xs">
                        {new Date(recentJournalEntries[0].date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent practice journal entries</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Add Practice Entry
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Teacher information */}
          {teacher && (
            <Card>
              <CardHeader>
                <CardTitle>Your Teacher</CardTitle>
                <CardDescription>Contact information and upcoming lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={teacher.avatar_url || ''} alt={teacher.name || 'Teacher'} />
                      <AvatarFallback className="text-lg">
                        {teacher.name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">{teacher.name || 'Not assigned'}</h3>
                      
                      {teacher.email && (
                        <div className="flex items-center text-sm mt-1">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{teacher.email}</span>
                        </div>
                      )}
                      
                      {teacher.phone && (
                        <div className="flex items-center text-sm mt-1">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{teacher.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="md:hidden" />
                  
                  <div className="md:ml-auto">
                    <h4 className="font-medium mb-2">Upcoming Lessons</h4>
                    {upcomingLessons.length > 0 ? (
                      <ul className="space-y-2">
                        {upcomingLessons.map(lesson => (
                          <li key={lesson.id} className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(lesson.date).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                              {' '} at {lesson.time}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No upcoming lessons</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Lesson tab */}
        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Your Lessons</CardTitle>
              <CardDescription>Upcoming and past lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Upcoming Lessons</h3>
                  {upcomingLessons.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingLessons.map(lesson => (
                        <Card key={lesson.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div>
                                <p className="font-medium">
                                  {new Date(lesson.date).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="mr-1 h-4 w-4" />
                                  <span>{lesson.time} ({lesson.duration} min)</span>
                                </div>
                              </div>
                              <div>
                                <Badge variant={lesson.isOnline ? "outline" : "default"}>
                                  {lesson.isOnline ? 'Online' : 'In Person'}
                                </Badge>
                                <p className="text-sm mt-1 max-w-md">{lesson.topics}</p>
                              </div>
                              <Button size="sm" variant="outline" className="md:ml-auto mt-2 md:mt-0">
                                Prepare
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No Upcoming Lessons"
                      description="You don't have any lessons scheduled. Contact your teacher to schedule a lesson."
                      icon={<Calendar className="h-6 w-6" />}
                    />
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Past Lessons</h3>
                  <EmptyState
                    title="No Past Lessons"
                    description="Once you've had lessons, they'll appear here with notes and recordings."
                    icon={<Book className="h-6 w-6" />}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Repertoire tab */}
        <TabsContent value="repertoire">
          <Card>
            <CardHeader>
              <CardTitle>Your Repertoire</CardTitle>
              <CardDescription>Music you're currently working on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentRepertoire.map(piece => (
                  <Card key={piece.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="font-medium">{piece.title}</h3>
                          <p className="text-sm text-muted-foreground">{piece.composer}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{piece.level}</Badge>
                            <Badge 
                              variant={
                                piece.status === 'In Progress' ? 'default' :
                                piece.status === 'Polishing' ? 'secondary' : 'outline'
                              }
                            >
                              {piece.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0 md:text-right">
                          <p className="text-xs text-muted-foreground">
                            Started on {new Date(piece.startedDate).toLocaleDateString()}
                          </p>
                          <Button size="sm" variant="outline" className="mt-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Journal tab */}
        <TabsContent value="journal">
          <Card>
            <CardHeader>
              <CardTitle>Practice Journal</CardTitle>
              <CardDescription>Track your practice sessions and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button>New Journal Entry</Button>
              </div>
              {recentJournalEntries.length > 0 ? (
                <div className="space-y-4">
                  {recentJournalEntries.map(entry => (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <h3 className="font-medium">{entry.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(entry.date).toLocaleDateString()}
                            </p>
                            <p className="mt-2">{entry.content}</p>
                          </div>
                          <Button size="sm" variant="outline" className="mt-3 md:mt-0 md:ml-4">
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Journal Entries"
                  description="Start tracking your practice by creating your first journal entry."
                  icon={<Book className="h-6 w-6" />}
                  action={{
                    label: "Create Entry",
                    onClick: () => {}
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 