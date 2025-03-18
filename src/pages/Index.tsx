import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  PlusCircle, 
  Calendar, 
  Users, 
  BookText, 
  MessageSquare,
  FileText, 
  Clock, 
  CheckCircle, 
  Sparkles,
  Music,
  Star,
  ChevronRight,
  Edit,
  ChevronDown,
  BarChart2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { Student, RepertoirePiece, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ID_PREFIXES, createPrefixedId } from '@/lib/id-utils';
import PieceDisplay from '@/components/common/PieceDisplay';
import { useRepertoire } from '@/contexts/RepertoireContext';
import StudentCard from '@/components/common/StudentCard';
import CalendarEvent, { CalendarEventData } from '@/components/common/CalendarEvent';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import InspirationOfTheDay from '@/components/common/InspirationOfTheDay';
import { useAllLessons } from '@/hooks/useLessons';
import { convertToSupabaseLesson } from '@/utils/dataConverters';
import TranscriptDialog from '@/components/dialogs/TranscriptDialog';
import AISummaryDialog from '@/components/dialogs/AISummaryDialog';

// Mock data for master repertoire (simplified version)
const masterRepertoire: RepertoireItemData[] = [
  {
    id: 'p-1',
    title: 'Partita No. 2 in D minor, BWV 1004',
    composer: 'J.S. Bach',
    startedDate: '2023-10-15',
    difficulty: 'advanced'
  },
  {
    id: 'p-9',
    title: 'Violin Concerto in E minor, Op. 64',
    composer: 'F. Mendelssohn',
    startedDate: '2023-04-20',
    difficulty: 'advanced'
  },
  // Add more pieces as needed
];

// Students with lesson data
const studentsWithLessons: Student[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    avatarUrl: '/images/girl1.jpg',
    currentRepertoire: [
      { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' },
      { id: '102', title: 'Violin Concerto', startDate: '2023-09-15', status: 'current', composer: 'Korngold, 1st movement' }
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '101'),
        date: '2023-10-15',
        repertoire: [
          { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' },
          { id: '102', title: 'Violin Concerto', startDate: '2023-09-15', status: 'current', composer: 'Korngold, 1st movement' }
        ],
        transcriptUrl: 'https://example.com/transcripts/emma-oct15',
        summary: 'Worked on B Major scale with focus on intonation of thirds. Discussed fingering options for difficult passages in Korngold concerto. Assigned metronome practice at quarter note = 72 for the development section.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '102'),
        date: '2023-10-08',
        repertoire: [
          { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' },
          { id: '103', title: 'Caprice No. 23', startDate: '2023-10-10', status: 'current', composer: 'Paganini' }
        ],
        transcriptUrl: 'https://example.com/transcripts/emma-oct08',
        summary: 'Introduced Paganini Caprice No. 23. Discussed right-hand articulation and left-hand flexibility required. Continued work on B Major scale, focusing on consistent tone across string crossings.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '103'),
        date: '2023-10-01',
        repertoire: [
          { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' },
          { id: '104', title: 'A Minor Scale', startDate: '2023-08-01', status: 'completed', composer: 'With emphasis on arpeggios' }
        ],
        transcriptUrl: 'https://example.com/transcripts/emma-oct01',
        summary: 'Completed work on A Minor scale arpeggios. Introduced B Major scale with thirds. Discussed preparation for upcoming recital.'
      }
    ],
    nextLesson: 'Today, 4:00 PM'
  },
  {
    id: '2',
    name: 'James Wilson',
    avatarUrl: '/images/boy1.jpg',
    currentRepertoire: [
      { id: '201', title: 'Paganini Caprice No. 24', composer: 'N. Paganini', startDate: '2023-09-10', status: 'current' },
      { id: '202', title: 'Bruch Violin Concerto', composer: 'M. Bruch', startDate: '2023-08-15', status: 'current' }
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '201'),
        date: '2023-10-17',
        repertoire: [
          { id: '201', title: 'Paganini Caprice No. 24', composer: 'N. Paganini', startDate: '2023-09-10', status: 'current' },
          { id: '202', title: 'Bruch Violin Concerto', composer: 'M. Bruch', startDate: '2023-08-15', status: 'current' }
        ],
        transcriptUrl: 'https://example.com/transcripts/james-oct17',
        summary: 'Worked on Theme and Variations 3 and 5 of the Paganini Caprice. Addressed issues with string crossings in the Bruch concerto. Assigned specific bowing exercises for smoother transitions.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '202'),
        date: '2023-10-10',
        repertoire: [
          { id: '201', title: 'Paganini Caprice No. 24', composer: 'N. Paganini', startDate: '2023-09-10', status: 'current' }
        ],
        transcriptUrl: 'https://example.com/transcripts/james-oct10',
        summary: 'Focused on the technical challenges in variations 3 and 7 of Paganini Caprice No. 24. Practiced left-hand flexibility and right-hand articulation techniques.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '203'),
        date: '2023-10-03',
        repertoire: [
          { id: '202', title: 'Bruch Violin Concerto', composer: 'M. Bruch', startDate: '2023-08-15', status: 'current' }
        ],
        transcriptUrl: 'https://example.com/transcripts/james-oct03',
        summary: 'Reviewed the entire first movement of the Bruch concerto. Discussed expressive elements and romantic style. Worked on vibrato control in the lyrical passages.'
      }
    ],
    nextLesson: 'Tomorrow, 3:30 PM'
  },
  {
    id: '3',
    name: 'Sophia Chen',
    avatarUrl: '/images/girl2.jpg',
    currentRepertoire: [
      { id: '301', title: 'Tchaikovsky Violin Concerto', composer: 'P.I. Tchaikovsky', startDate: '2023-09-05', status: 'current' },
      { id: '302', title: 'Bach Sonata No. 1', composer: 'J.S. Bach', startDate: '2023-09-20', status: 'current' }
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '301'),
        date: '2023-10-16',
        repertoire: [
          { id: '301', title: 'Tchaikovsky Violin Concerto', composer: 'P.I. Tchaikovsky', startDate: '2023-09-05', status: 'current' },
          { id: '302', title: 'Bach Sonata No. 1', composer: 'J.S. Bach', startDate: '2023-09-20', status: 'current' }
        ],
        transcriptUrl: 'https://example.com/transcripts/sophia-oct16',
        summary: 'Made excellent progress on the cadenza of the Tchaikovsky concerto. Discussed baroque ornamentation in the Bach Sonata. Assigned listening examples for stylistic reference.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '302'),
        date: '2023-10-09',
        repertoire: [
          { id: '301', title: 'Tchaikovsky Violin Concerto', composer: 'P.I. Tchaikovsky', startDate: '2023-09-05', status: 'current' }
        ],
        transcriptUrl: 'https://example.com/transcripts/sophia-oct09',
        summary: 'Reviewed the exposition of the Tchaikovsky concerto. Worked on phrasing and expressive vibrato in the lyrical sections. Discussed interpretation and historical context of the piece.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '303'),
        date: '2023-10-02',
        repertoire: [
          { id: '302', title: 'Bach Sonata No. 1', composer: 'J.S. Bach', startDate: '2023-09-20', status: 'current' }
        ],
        transcriptUrl: 'https://example.com/transcripts/sophia-oct02',
        summary: 'Introduced the Adagio from Bach Sonata No. 1. Discussed baroque interpretation and bow distribution. Worked on clean double stops and intonation in chordal passages.'
      }
    ],
    nextLesson: 'Friday, 5:00 PM',
    unreadMessages: 1
  },
  {
    id: '4',
    name: 'Michael Brown',
    avatarUrl: '/images/boy2.jpg',
    currentRepertoire: [
      { id: '401', title: 'Mozart Violin Sonata K.304', composer: 'W.A. Mozart', startDate: '2023-09-20', status: 'current' },
      { id: '402', title: 'Kreisler Pieces', composer: 'F. Kreisler', startDate: '2023-09-01', status: 'current' }
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '401'),
        date: '2023-10-14',
        repertoire: [
          { id: '401', title: 'Mozart Violin Sonata K.304', composer: 'W.A. Mozart', startDate: '2023-09-20', status: 'current' },
          { id: '402', title: 'Kreisler Pieces', composer: 'F. Kreisler', startDate: '2023-09-01', status: 'current' }
        ],
        transcriptUrl: 'https://example.com/transcripts/michael-oct14',
        summary: 'Worked on the second movement of the Mozart sonata. Fine-tuned articulation in Kreisler\'s Liebesleid. Discussed classical and romantic style contrasts between the pieces.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '402'),
        date: '2023-10-07',
        repertoire: [
          { id: '402', title: 'Kreisler Pieces', composer: 'F. Kreisler', startDate: '2023-09-01', status: 'current' }
        ],
        transcriptUrl: 'https://example.com/transcripts/michael-oct07',
        summary: 'Focused on Kreisler\'s Liebesleid and Schön Rosmarin. Worked on characteristic rhythm and bow strokes for Viennese style pieces. Improved vibrato control for expressive passages.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '403'),
        date: '2023-09-30',
        repertoire: [
          { id: '401', title: 'Mozart Violin Sonata K.304', composer: 'W.A. Mozart', startDate: '2023-09-20', status: 'current' }
        ],
        transcriptUrl: 'https://example.com/transcripts/michael-sep30',
        summary: 'Worked on the articulation and classical style in the Mozart sonata. Focused on clean string crossings and even tone production. Discussed chamber music balance with the piano part.'
      }
    ],
    nextLesson: 'Next Monday, 4:30 PM'
  },
  {
    id: '5',
    name: 'Olivia Martinez',
    avatarUrl: '/images/girl3.jpg',
    currentRepertoire: [
      { id: '501', title: 'Violin Concerto in E minor, Op. 64', composer: 'F. Mendelssohn', startDate: '2023-10-15', status: 'current' },
      { id: '502', title: 'Partita No. 2 in D minor, BWV 1004', composer: 'J.S. Bach', startDate: '2023-12-01', status: 'current' }
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '501'),
        date: '2023-10-18',
        repertoire: [
          { id: '501', title: 'Violin Concerto in E minor, Op. 64', composer: 'F. Mendelssohn', startDate: '2023-10-15', status: 'current' },
          { id: '502', title: 'Partita No. 2 in D minor, BWV 1004', composer: 'J.S. Bach', startDate: '2023-12-01', status: 'current' }
        ],
        transcriptUrl: 'https://example.com/transcripts/olivia-oct18',
        summary: 'Started work on the first movement of the Mendelssohn concerto. Focused on clean string crossings and smooth position changes. Introduced initial concepts for the Bach Partita.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '502'),
        date: '2023-10-11',
        repertoire: [
          { id: '501', title: 'Violin Concerto in E minor, Op. 64', composer: 'F. Mendelssohn', startDate: '2023-10-15', status: 'current' }
        ],
        transcriptUrl: 'https://example.com/transcripts/olivia-oct11',
        summary: 'Sight-read through the Mendelssohn concerto exposition. Discussed technical challenges and musical interpretation. Created a practice plan for efficient learning.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '503'),
        date: '2023-10-04',
        repertoire: [
          { id: '503', title: 'Violin Concerto No. 1 in G minor, Op. 26', composer: 'M. Bruch', startDate: '2023-05-20', status: 'completed' }
        ],
        transcriptUrl: 'https://example.com/transcripts/olivia-oct04',
        summary: 'Final review of the Bruch concerto before transitioning to new repertoire. Polished performance details and discussed successful elements to apply to future pieces.'
      }
    ],
    nextLesson: 'Thursday, 5:30 PM'
  },
  {
    id: '6',
    name: 'William Taylor',
    avatarUrl: '/images/boy3.jpg',
    currentRepertoire: [
      { id: '601', title: 'D Major Scale', startDate: '2023-10-08', status: 'current', composer: 'One octave' },
      { id: '602', title: 'Spring', startDate: '2023-09-25', status: 'current', composer: 'Vivaldi, from Four Seasons' },
      { id: '603', title: 'Etude No. 3', startDate: '2023-10-05', status: 'current', composer: 'Wohlfahrt' }
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '601'),
        date: '2023-10-16',
        repertoire: [
          { id: '601', title: 'D Major Scale', startDate: '2023-10-08', status: 'current', composer: 'One octave' },
          { id: '603', title: 'Etude No. 3', startDate: '2023-10-05', status: 'current', composer: 'Wohlfahrt' }
        ],
        transcriptUrl: 'https://example.com/transcripts/william-oct16',
        summary: 'Worked on establishing proper left-hand position for D Major scale. Focused on even spacing between fingers and consistent intonation. Introduced the first line of Wohlfahrt Etude No. 3 with emphasis on bow distribution.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '602'),
        date: '2023-10-09',
        repertoire: [
          { id: '601', title: 'D Major Scale', startDate: '2023-10-08', status: 'current', composer: 'One octave' },
          { id: '602', title: 'Spring', startDate: '2023-09-25', status: 'current', composer: 'Vivaldi, from Four Seasons' }
        ],
        transcriptUrl: 'https://example.com/transcripts/william-oct09',
        summary: 'Continued work on D Major scale with added emphasis on clear articulation. Began learning the opening melody of "Spring" from Vivaldi\'s Four Seasons. Discussed bow control for different dynamics and expressive playing.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '603'),
        date: '2023-10-02',
        repertoire: [
          { id: '602', title: 'Spring', startDate: '2023-09-25', status: 'current', composer: 'Vivaldi, from Four Seasons' },
          { id: '604', title: 'A Minor Scale', startDate: '2023-08-12', status: 'completed', composer: 'One octave' }
        ],
        transcriptUrl: 'https://example.com/transcripts/william-oct02',
        summary: 'Final review of A Minor scale before transitioning to D Major. Introduced the simplified arrangement of Vivaldi\'s "Spring". Focused on basic string crossings and rhythmic accuracy. Worked on maintaining consistent contact point with the bow.'
      }
    ],
    nextLesson: 'Saturday, 10:00 AM'
  }
];

// Use the local students data with lessons
const students = studentsWithLessons;

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

// Function to collect and sort recent lessons from all students
const collectRecentLessons = () => {
  const allLessons: {
    id: string;
    date: string;
    student: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
    repertoire: (RepertoirePiece | LegacyRepertoirePiece)[];
    transcriptUrl?: string;
    summary?: string;
    duration?: string;
  }[] = [];

  // Collect lessons from all students
  students.forEach(student => {
    if (student.lessons && student.lessons.length > 0) {
      student.lessons.forEach(lesson => {
        allLessons.push({
          ...lesson,
          student: {
            id: student.id,
            name: student.name,
            avatarUrl: student.avatarUrl
          },
          // Add a default duration if not present
          duration: '45 minutes'
        });
      });
    }
  });

  // Sort by date (newest first)
  return allLessons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const Dashboard = () => {
  const [activeDialog, setActiveDialog] = useState<{lessonId: string, type: 'transcript' | 'summary'} | null>(null);
  const navigate = useNavigate();
  
  // Fetch lessons data from Supabase using the hybrid caching approach
  const { data: lessonsData, isLoading, error } = useAllLessons();
  
  // Get the 4 most recent lessons from the fetched data
  const recentLessonsData = lessonsData?.slice(0, 4) || [];
  
  const getActiveLesson = () => {
    if (!activeDialog) return null;
    return recentLessonsData.find(lesson => lesson.id === activeDialog.lessonId);
  };
  
  const handleOpenDialog = (lessonId: string, type: 'transcript' | 'summary') => {
    setActiveDialog({ lessonId, type });
  };
  
  const handleCloseDialog = () => {
    setActiveDialog(null);
  };
  
  // Function to navigate to student's page with lessons tab
  const navigateToStudentLessons = (studentId: string, lessonId: string, event: React.MouseEvent) => {
    // Only navigate if not clicking on the action buttons
    if (
      !(event.target as HTMLElement).closest('button') || 
      (event.target as HTMLElement).closest('[data-action="view-student"]')
    ) {
      // Navigate to student page with lessons tab active and specific lesson highlighted
      navigate(`/students/${studentId}?tab=lessons&lessonId=${lessonId}`);
    }
  };
  
  // Calculate lesson duration in a readable format
  const getLessonDuration = (lesson: any) => {
    if (lesson.duration) return lesson.duration;
    if (lesson.start_time && lesson.end_time) {
      try {
        const start = parseISO(`2000-01-01T${lesson.start_time}`);
        const end = parseISO(`2000-01-01T${lesson.end_time}`);
        const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
        return `${minutes} minutes`;
      } catch (e) {
        return '45 minutes';
      }
    }
    return '45 minutes';
  };
  
  // Format repertoire for display from lesson data
  const getRepertoire = (lesson: any) => {
    if (lesson.repertoire && Array.isArray(lesson.repertoire)) {
      return lesson.repertoire;
    }
    return [];
  };
  
  return (
    <div>
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
            <div className="text-3xl font-bold text-gray-800">{lessonsData?.length || 0}</div>
            <CardDescription className="mt-1 text-gray-500">Total lessons</CardDescription>
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
      
      {/* Middle Content Area - More balanced layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Schedule Section - Slightly narrower */}
        <div className="lg:col-span-3 bg-white border border-gray-100 shadow-sm rounded-lg">
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
        
        {/* Inspiration of the Day - Wider column */}
        <div className="lg:col-span-2">
          <InspirationOfTheDay />
        </div>
      </div>
      
      {/* Recent Lessons Section - Full width */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-lg animate-slide-up animate-stagger-4">
        <div className="p-5 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center text-gray-800">
              <BookText className="h-5 w-5 mr-2 text-primary" />
              Recent Lessons
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary font-medium hover:bg-gray-50"
              onClick={() => navigate('/students?tab=lessons')}
            >
              View All Lessons
            </Button>
          </div>
        </div>
        
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {isLoading ? (
            <div className="col-span-2 text-center py-12">
              <div className="animate-pulse h-4 w-24 bg-gray-200 rounded mx-auto mb-3"></div>
              <p className="text-muted-foreground">Loading lessons...</p>
            </div>
          ) : error ? (
            <div className="col-span-2 text-center py-12 border rounded-lg bg-red-50">
              <p className="text-red-500">Failed to load lessons</p>
            </div>
          ) : recentLessonsData.length > 0 ? (
            recentLessonsData.map((lesson) => (
              <Card 
                key={lesson.id}
                className="overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-primary/20 cursor-pointer"
                onClick={(e) => navigateToStudentLessons(lesson.student_id, lesson.id, e)}
              >
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="bg-gray-50 font-normal">
                      {format(new Date(lesson.date), 'MMM d, yyyy')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={lesson.student?.avatar_url} alt={lesson.student?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {lesson.student?.name ? lesson.student.name.substring(0, 2) : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">{lesson.student?.name || "Unknown Student"}</h3>
                      <p className="text-xs text-gray-500">
                        {getRepertoire(lesson).map((piece: any, i: number) => (
                          <React.Fragment key={piece.id || i}>
                            <PieceDisplay piece={piece} layout="inline" />
                            {i < getRepertoire(lesson).length - 1 ? ', ' : ''}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="line-clamp-3 text-sm text-gray-600 mb-4">
                    {lesson.summary || lesson.notes || "No summary available"}
                  </div>
                </div>
                
                <div className="flex border-t border-gray-100">
                  <Button 
                    variant="ghost" 
                    className="flex-1 rounded-none h-11 text-sm font-medium text-primary hover:bg-primary/5 hover:text-primary/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(lesson.id, 'transcript');
                    }}
                    disabled={!lesson.transcript_url}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Transcript
                  </Button>
                  <div className="w-px bg-gray-100" />
                  <Button 
                    variant="ghost" 
                    className="flex-1 rounded-none h-11 text-sm font-medium text-primary hover:bg-primary/5 hover:text-primary/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(lesson.id, 'summary');
                    }}
                    disabled={!lesson.ai_summary}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI Summary
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 border rounded-lg bg-gray-50">
              <BookText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No lesson history available yet.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog components */}
      <TranscriptDialog
        lesson={convertToSupabaseLesson(getActiveLesson())}
        open={activeDialog?.type === 'transcript'}
        onOpenChange={(open) => !open && handleCloseDialog()}
      />
      
      <AISummaryDialog
        lesson={convertToSupabaseLesson(getActiveLesson())}
        open={activeDialog?.type === 'summary'}
        onOpenChange={(open) => !open && handleCloseDialog()}
      />
    </div>
  );
};

export default Dashboard;
