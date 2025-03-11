import React, { useState, useRef, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  UserPlus,
  Users,
  User,
  Calendar,
  Music,
  MessageSquare,
  FileText,
  CheckCircle,
  BookText,
  History,
  Clock,
  ChevronLeft,
  Star,
  Filter,
  X,
  Mail,
  Phone,
  ArrowUpDown,
  FileText as FileIcon,
  ExternalLink,
  BookOpen,
  Sparkles,
  Hammer
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Student, RepertoirePiece, LegacyRepertoirePiece, Lesson } from '@/components/common/StudentCard';
import { Badge } from '@/components/ui/badge';
import LessonHistory from '@/components/common/LessonHistory';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useParams, useLocation } from 'react-router-dom';
import { ID_PREFIXES, createPrefixedId, createStudentPieceId } from '@/lib/id-utils';
import { format, formatDistance } from 'date-fns';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { defaultMasterRepertoire } from '@/data/defaultRepertoire';
import MigrationTester from '@/components/debug/MigrationTester';
import MigrationReport from '@/components/debug/MigrationReport';
import PieceDisplay from '@/components/common/PieceDisplay';
import { useRepertoire } from '@/contexts/RepertoireContext';

// Mock student data with lessons
const students: (Student & { level?: string; email?: string; phone?: string; startDate?: string; lastLesson?: string; avatarUrl?: string; })[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    avatarUrl: '/images/girl1.jpg',
    currentRepertoire: [
      { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' } as LegacyRepertoirePiece,
      { id: '102', title: 'Violin Concerto', startDate: '2023-09-15', status: 'current', composer: 'Korngold, 1st movement' } as LegacyRepertoirePiece
    ],
    pastRepertoire: [
      { id: '104', title: 'A Minor Scale', startDate: '2023-08-01', status: 'completed', composer: 'With emphasis on arpeggios' } as LegacyRepertoirePiece,
      { id: '105', title: 'Sonata No. 2', startDate: '2023-07-15', status: 'completed', composer: 'Bach' } as LegacyRepertoirePiece
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '101'),
        date: '2023-10-15',
        repertoire: [
          { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' } as LegacyRepertoirePiece,
          { id: '102', title: 'Violin Concerto', startDate: '2023-09-15', status: 'current', composer: 'Korngold, 1st movement' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/emma-oct15',
        summary: 'Worked on B Major scale with focus on intonation of thirds. Discussed fingering options for difficult passages in Korngold concerto. Assigned metronome practice at quarter note = 72 for the development section.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '102'),
        date: '2023-10-08',
        repertoire: [
          { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' } as LegacyRepertoirePiece,
          { id: '103', title: 'Caprice No. 23', startDate: '2023-10-10', status: 'current', composer: 'Paganini' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/emma-oct08',
        summary: 'Introduced Paganini Caprice No. 23. Discussed right-hand articulation and left-hand flexibility required. Continued work on B Major scale, focusing on consistent tone across string crossings.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '103'),
        date: '2023-10-01',
        repertoire: [
          { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' } as LegacyRepertoirePiece,
          { id: '104', title: 'A Minor Scale', startDate: '2023-08-01', status: 'completed', composer: 'With emphasis on arpeggios' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/emma-oct01',
        summary: 'Completed work on A Minor scale arpeggios. Introduced B Major scale with thirds. Discussed preparation for upcoming recital.'
      }
    ],
    level: 'Advanced',
    email: 'emma.t@example.com',
    phone: '(555) 123-4567',
    startDate: 'Sep 2022',
    lastLesson: '2 days ago',
    nextLesson: 'Today, 4:00 PM',
  },
  {
    id: '2',
    name: 'James Wilson',
    avatarUrl: '/images/boy1.jpg',
    currentRepertoire: [
      { id: '201', title: 'Paganini Caprice No. 24', startDate: '2023-09-10', status: 'current', composer: 'N. Paganini' } as LegacyRepertoirePiece,
      { id: '202', title: 'Bruch Violin Concerto', startDate: '2023-08-15', status: 'current', composer: 'M. Bruch' } as LegacyRepertoirePiece
    ],
    pastRepertoire: [
      { id: '204', title: 'D Major Scale', startDate: '2023-08-12', status: 'completed', composer: 'With double stops' } as LegacyRepertoirePiece,
      { id: '205', title: 'Concerto in A Minor', startDate: '2023-07-20', status: 'completed', composer: 'Vivaldi' } as LegacyRepertoirePiece
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '201'),
        date: '2023-10-17',
        repertoire: [
          { id: '201', title: 'Paganini Caprice No. 24', composer: 'N. Paganini', startDate: '2023-09-10', status: 'current' } as LegacyRepertoirePiece,
          { id: '202', title: 'Bruch Violin Concerto', composer: 'M. Bruch', startDate: '2023-08-15', status: 'current' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/james-oct17',
        summary: 'Worked on Theme and Variations 3 and 5 of the Paganini Caprice. Addressed issues with string crossings in the Bruch concerto. Assigned specific bowing exercises for smoother transitions.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '202'),
        date: '2023-10-10',
        repertoire: [
          { id: '201', title: 'Paganini Caprice No. 24', composer: 'N. Paganini', startDate: '2023-09-10', status: 'current' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/james-oct10',
        summary: 'Focused on the technical challenges in variations 3 and 7 of Paganini Caprice No. 24. Practiced left-hand flexibility and right-hand articulation techniques.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '203'),
        date: '2023-10-03',
        repertoire: [
          { id: '202', title: 'Bruch Violin Concerto', composer: 'M. Bruch', startDate: '2023-08-15', status: 'current' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/james-oct03',
        summary: 'Reviewed the entire first movement of the Bruch concerto. Discussed expressive elements and romantic style. Worked on vibrato control in the lyrical passages.'
      }
    ],
    level: 'Advanced',
    email: 'james.w@example.com',
    phone: '(555) 234-5678',
    startDate: 'Jan 2023',
    lastLesson: '1 week ago',
    nextLesson: 'Tomorrow, 3:30 PM',
  },
  {
    id: '3',
    name: 'Sophia Chen',
    avatarUrl: '/images/girl2.jpg',
    currentRepertoire: [
      { id: '301', title: 'Tchaikovsky Violin Concerto', startDate: '2023-09-05', status: 'current', composer: 'P.I. Tchaikovsky' } as LegacyRepertoirePiece,
      { id: '302', title: 'Bach Sonata No. 1', startDate: '2023-09-20', status: 'current', composer: 'J.S. Bach' } as LegacyRepertoirePiece
    ],
    pastRepertoire: [
      { id: '304', title: 'E Major Scale', startDate: '2023-08-05', status: 'completed', composer: 'With emphasis on tone production' } as LegacyRepertoirePiece,
      { id: '305', title: 'Meditation from Thais', startDate: '2023-07-01', status: 'completed', composer: 'Massenet' } as LegacyRepertoirePiece
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '301'),
        date: '2023-10-16',
        repertoire: [
          { id: '301', title: 'Tchaikovsky Violin Concerto', composer: 'P.I. Tchaikovsky', startDate: '2023-09-05', status: 'current' } as LegacyRepertoirePiece,
          { id: '302', title: 'Bach Sonata No. 1', composer: 'J.S. Bach', startDate: '2023-09-20', status: 'current' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/sophia-oct16',
        summary: 'Made excellent progress on the cadenza of the Tchaikovsky concerto. Discussed baroque ornamentation in the Bach Sonata. Assigned listening examples for stylistic reference.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '302'),
        date: '2023-10-09',
        repertoire: [
          { id: '301', title: 'Tchaikovsky Violin Concerto', composer: 'P.I. Tchaikovsky', startDate: '2023-09-05', status: 'current' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/sophia-oct09',
        summary: 'Reviewed the exposition of the Tchaikovsky concerto. Worked on phrasing and expressive vibrato in the lyrical sections. Discussed interpretation and historical context of the piece.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '303'),
        date: '2023-10-02',
        repertoire: [
          { id: '302', title: 'Bach Sonata No. 1', composer: 'J.S. Bach', startDate: '2023-09-20', status: 'current' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/sophia-oct02',
        summary: 'Introduced the Adagio from Bach Sonata No. 1. Discussed baroque interpretation and bow distribution. Worked on clean double stops and intonation in chordal passages.'
      }
    ],
    level: 'Advanced',
    email: 'sophia.c@example.com',
    phone: '(555) 345-6789',
    startDate: 'Mar 2023',
    lastLesson: '3 days ago',
    nextLesson: 'Friday, 5:00 PM',
  },
  {
    id: '4',
    name: 'Michael Brown',
    avatarUrl: '/images/boy2.jpg',
    currentRepertoire: [
      { id: '401', title: 'Mozart Violin Sonata K.304', startDate: '2023-09-20', status: 'current', composer: 'W.A. Mozart' } as LegacyRepertoirePiece,
      { id: '402', title: 'Kreisler Pieces', startDate: '2023-09-01', status: 'current', composer: 'F. Kreisler' } as LegacyRepertoirePiece
    ],
    pastRepertoire: [
      { id: '403', title: 'Violin Concerto No. 3 in B minor, Op. 61', startDate: '2023-06-15', endDate: '2023-09-10', status: 'completed', composer: 'C. Saint-Saëns' } as LegacyRepertoirePiece,
      { id: '404', title: 'The Four Seasons - Autumn', startDate: '2023-03-10', endDate: '2023-06-05', status: 'completed', composer: 'A. Vivaldi' } as LegacyRepertoirePiece
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '401'),
        date: '2023-10-14',
        repertoire: [
          { id: '401', title: 'Mozart Violin Sonata K.304', composer: 'W.A. Mozart', startDate: '2023-09-20', status: 'current' } as LegacyRepertoirePiece,
          { id: '402', title: 'Kreisler Pieces', composer: 'F. Kreisler', startDate: '2023-09-01', status: 'current' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/michael-oct14',
        summary: 'Worked on the second movement of the Mozart sonata. Fine-tuned articulation in Kreisler\'s Liebesleid. Discussed classical and romantic style contrasts between the pieces.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '402'),
        date: '2023-10-07',
        repertoire: [
          { id: '402', title: 'Kreisler Pieces', composer: 'F. Kreisler', startDate: '2023-09-01', status: 'current' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/michael-oct07',
        summary: 'Focused on Kreisler\'s Liebesleid and Schön Rosmarin. Worked on characteristic rhythm and bow strokes for Viennese style pieces. Improved vibrato control for expressive passages.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '403'),
        date: '2023-09-30',
        repertoire: [
          { id: '401', title: 'Mozart Violin Sonata K.304', composer: 'W.A. Mozart', startDate: '2023-09-20', status: 'current' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/michael-sep30',
        summary: 'Worked on the articulation and classical style in the Mozart sonata. Focused on clean string crossings and even tone production. Discussed chamber music balance with the piano part.'
      }
    ],
    level: 'Intermediate',
    email: 'michael.b@example.com',
    phone: '(555) 456-7890',
    startDate: 'May 2023',
    lastLesson: '5 days ago',
    nextLesson: 'Next Monday, 4:30 PM',
  },
  {
    id: '5',
    name: 'Olivia Martinez',
    avatarUrl: '/images/girl3.jpg',
    currentRepertoire: [
      { id: '501', title: 'Violin Concerto in E minor, Op. 64', composer: 'F. Mendelssohn', startDate: '2023-10-15', status: 'current', notes: 'Preparing for conservatory audition' } as LegacyRepertoirePiece,
      { id: '502', title: 'Partita No. 2 in D minor, BWV 1004', composer: 'J.S. Bach', startDate: '2023-12-01', status: 'current' } as LegacyRepertoirePiece
    ],
    pastRepertoire: [
      { id: '503', title: 'Violin Concerto No. 1 in G minor, Op. 26', composer: 'M. Bruch', startDate: '2023-05-20', endDate: '2023-09-25', status: 'completed', notes: 'Regional competition winner' } as LegacyRepertoirePiece,
      { id: '504', title: 'Introduction and Rondo Capriccioso', composer: 'C. Saint-Saëns', startDate: '2023-01-10', endDate: '2023-05-15', status: 'completed' } as LegacyRepertoirePiece
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '501'),
        date: '2023-10-18',
        repertoire: [
          { id: '501', title: 'Violin Concerto in E minor, Op. 64', composer: 'F. Mendelssohn', startDate: '2023-10-15', status: 'current' } as LegacyRepertoirePiece,
          { id: '502', title: 'Partita No. 2 in D minor, BWV 1004', composer: 'J.S. Bach', startDate: '2023-12-01', status: 'current' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/olivia-oct18',
        summary: 'Started work on the first movement of the Mendelssohn concerto. Focused on clean string crossings and smooth position changes. Introduced initial concepts for the Bach Partita.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '502'),
        date: '2023-10-11',
        repertoire: [
          { id: '501', title: 'Violin Concerto in E minor, Op. 64', composer: 'F. Mendelssohn', startDate: '2023-10-15', status: 'current' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/olivia-oct11',
        summary: 'Sight-read through the Mendelssohn concerto exposition. Discussed technical challenges and musical interpretation. Created a practice plan for efficient learning.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '503'),
        date: '2023-10-04',
        repertoire: [
          { id: '503', title: 'Violin Concerto No. 1 in G minor, Op. 26', composer: 'M. Bruch', startDate: '2023-05-20', status: 'completed' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/olivia-oct04',
        summary: 'Final review of the Bruch concerto before transitioning to new repertoire. Polished performance details and discussed successful elements to apply to future pieces.'
      }
    ],
    level: 'Advanced',
    email: 'olivia.m@example.com',
    phone: '(555) 567-8901',
    startDate: 'Feb 2023',
    lastLesson: '1 day ago',
    nextLesson: 'Thursday, 5:30 PM',
  },
  {
    id: '6',
    name: 'William Taylor',
    avatarUrl: '/images/boy3.jpg',
    currentRepertoire: [
      { id: '601', title: 'D Major Scale', startDate: '2023-10-08', status: 'current', composer: 'One octave' } as LegacyRepertoirePiece,
      { id: '602', title: 'Spring', startDate: '2023-09-25', status: 'current', composer: 'Vivaldi, from Four Seasons' } as LegacyRepertoirePiece,
      { id: '603', title: 'Etude No. 3', startDate: '2023-10-05', status: 'current', composer: 'Wohlfahrt' } as LegacyRepertoirePiece
    ],
    pastRepertoire: [
      { id: '604', title: 'A Minor Scale', startDate: '2023-08-12', status: 'completed', composer: 'One octave' } as LegacyRepertoirePiece,
      { id: '605', title: 'Allegro', startDate: '2023-07-20', status: 'completed', composer: 'Fiocco' } as LegacyRepertoirePiece
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '601'),
        date: '2023-10-16',
        repertoire: [
          { id: '601', title: 'D Major Scale', startDate: '2023-10-08', status: 'current', composer: 'One octave' } as LegacyRepertoirePiece,
          { id: '603', title: 'Etude No. 3', startDate: '2023-10-05', status: 'current', composer: 'Wohlfahrt' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/william-oct16',
        summary: 'Worked on establishing proper left-hand position for D Major scale. Focused on even spacing between fingers and consistent intonation. Introduced the first line of Wohlfahrt Etude No. 3 with emphasis on bow distribution.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '602'),
        date: '2023-10-09',
        repertoire: [
          { id: '601', title: 'D Major Scale', startDate: '2023-10-08', status: 'current', composer: 'One octave' } as LegacyRepertoirePiece,
          { id: '602', title: 'Spring', startDate: '2023-09-25', status: 'current', composer: 'Vivaldi, from Four Seasons' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/william-oct09',
        summary: 'Continued work on D Major scale with added emphasis on clear articulation. Began learning the opening melody of "Spring" from Vivaldi\'s Four Seasons. Discussed bow control for different dynamics and expressive playing.'
      },
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '603'),
        date: '2023-10-02',
        repertoire: [
          { id: '602', title: 'Spring', startDate: '2023-09-25', status: 'current', composer: 'Vivaldi, from Four Seasons' } as LegacyRepertoirePiece,
          { id: '604', title: 'A Minor Scale', startDate: '2023-08-12', status: 'completed', composer: 'One octave' } as LegacyRepertoirePiece
        ],
        transcriptUrl: 'https://example.com/transcripts/william-oct02',
        summary: 'Final review of A Minor scale before transitioning to D Major. Introduced the simplified arrangement of Vivaldi\'s "Spring". Focused on basic string crossings and rhythmic accuracy. Worked on maintaining consistent contact point with the bow.'
      }
    ],
    level: 'Beginner',
    email: 'william.t@example.com',
    phone: '(555) 678-9012',
    startDate: 'Sep 2023',
    lastLesson: '2 days ago',
    nextLesson: 'Saturday, 10:00 AM',
  }
];

// Helper function to get level color
const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'advanced':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Filter options
type FilterOption = 'all' | 'level' | 'repertoire' | 'Beginner' | 'Intermediate' | 'Advanced';

type TabValue = 'grid' | 'list' | 'detail' | 'lessons' | 'migration-test';

// Helper function to parse query parameters
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

// Function to collect all lessons from all students
const getAllLessons = (studentsList: (Student & { 
  level?: string;
  email?: string;
  phone?: string;
  startDate?: string;
  lastLesson?: string;
  avatarUrl?: string;
})[]): {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  repertoire: (RepertoirePiece | LegacyRepertoirePiece)[];
  transcriptUrl?: string;
  summary?: string;
}[] => {
  const allLessons: {
    id: string;
    date: string;
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    repertoire: (RepertoirePiece | LegacyRepertoirePiece)[];
    transcriptUrl?: string;
    summary?: string;
  }[] = [];

  studentsList.forEach(student => {
    if (student.lessons && student.lessons.length > 0) {
      student.lessons.forEach(lesson => {
        // Create a new lesson object that preserves all properties
        // We're not modifying repertoire here since LessonHistory knows how to handle both types
        allLessons.push({
          ...lesson,
          studentId: student.id,
          studentName: student.name,
          studentAvatar: student.avatarUrl
        });
      });
    }
  });

  // Sort by date (newest first)
  return allLessons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const StudentPage = () => {
  // Use query parameters
  const query = useQuery();
  const studentId = query.get('student');
  const tabParam = query.get('tab');
  const lessonIdParam = query.get('lesson');
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // State variables
  const [activeTab, setActiveTab] = useState<TabValue>('grid');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [lessonSortField, setLessonSortField] = useState<'date' | 'student'>('date');
  const [lessonSortDirection, setLessonSortDirection] = useState<'asc' | 'desc'>('desc');
  const [lessonSearchTerm, setLessonSearchTerm] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [allStudents] = useState<Student[]>(students); // Use the mock data
  const [masterRepertoire] = useState<RepertoireItemData[]>(defaultMasterRepertoire);
  
  // Access repertoire context utilities
  const { getPieceTitle, getPieceComposer } = useRepertoire();
  
  // Mock upcoming lessons - today's lessons
  const upcomingLessons = students.slice(0, 3); // Just use the first 3 students as example
  
  // Get URL parameters
  const { studentId: urlStudentId } = useParams();
  
  // Set the selected student and tab when the component mounts or the URL parameter changes
  useEffect(() => {
    if (studentId) {
      setCurrentStudent(students.find(s => s.id === studentId) || null);
      setActiveTab('detail');
      
      // Set default lesson tab if specified in URL
      if (tabParam === 'lessons') {
        setActiveTab('lessons');
      }
      
      // Set highlighted lesson if specified
      if (lessonIdParam) {
        setCurrentStudent(students.find(s => s.id === lessonIdParam) || null);
      }
    }
  }, [studentId, tabParam, lessonIdParam, students]);
  
  useEffect(() => {
    if (showSearchInput && searchInputRef) {
      searchInputRef.current?.focus();
    }
  }, [showSearchInput, searchInputRef]);
  
  // Handle student selection
  const handleStudentClick = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setCurrentStudent(student || null);
    setActiveTab('detail');
  };
  
  // Filter students based on search query and filters
  const getFilteredStudents = () => {
    return students.filter(student => {
      // Apply search query filter
      const matchesSearch = lessonSearchTerm === '' || 
        student.name.toLowerCase().includes(lessonSearchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(lessonSearchTerm.toLowerCase())) ||
        (student.level && student.level.toLowerCase().includes(lessonSearchTerm.toLowerCase())) ||
        student.currentRepertoire.some(piece => 
          getPieceTitle(piece).toLowerCase().includes(lessonSearchTerm.toLowerCase()) ||
          getPieceComposer(piece).toLowerCase().includes(lessonSearchTerm.toLowerCase())
        );
      
      // Apply level filter
      const matchesLevel = filterOption === 'all' || (student.level === filterOption);
      
      return matchesSearch && matchesLevel;
    });
  };
  
  // Handle lesson table sorting
  const handleLessonSort = (field: 'date' | 'student') => {
    if (lessonSortField === field) {
      setLessonSortDirection(lessonSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setLessonSortField(field);
      setLessonSortDirection('desc');
    }
  };
  
  // Filter and sort lessons
  const getSortedAndFilteredLessons = () => {
    // First, get all lessons from all students
    const allLessons = getAllLessons(students);
    
    // Filter by search term if any
    const filteredLessons = allLessons.filter(lesson => {
      if (!lessonSearchTerm) return true;
      
      const searchTermLower = lessonSearchTerm.toLowerCase();
      
      // Check if student name matches
      if (lesson.studentName.toLowerCase().includes(searchTermLower)) {
        return true;
      }
      
      // Check if any piece title or composer matches
      if (lesson.repertoire.some(piece => 
        getPieceTitle(piece).toLowerCase().includes(searchTermLower) || 
        getPieceComposer(piece).toLowerCase().includes(searchTermLower)
      )) {
        return true;
      }
      
      return false;
    });
    
    // Sort the filtered lessons
    const sortedLessons = [...filteredLessons].sort((a, b) => {
      if (lessonSortField === 'date') {
        // Convert date strings to Date objects for comparison
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return lessonSortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      } else {
        // Sort by student name
        const nameA = a.studentName.toLowerCase();
        const nameB = b.studentName.toLowerCase();
        return lessonSortDirection === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
    });
    
    return sortedLessons;
  };
  
  return (
    <div>
      {!currentStudent || activeTab !== 'detail' ? (
        /* Students list view - shown when no student is selected or not in detail tab */
        <>
          <PageHeader 
            title="Students" 
            description="Manage your students and their progress"
          >
            <Button className="shadow-sm transition-all hover:shadow-md">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </PageHeader>
          
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className={cn(
              "relative transition-all duration-300 ease-in-out flex items-center",
              showSearchInput ? "flex-1 w-full" : "w-auto"
            )}>
              {showSearchInput ? (
                <>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search by name, repertoire, or level..."
                    className="pl-10 pr-10 h-10 border-gray-200 focus:border-primary/50 transition-all"
                    value={lessonSearchTerm}
                    onChange={(e) => setLessonSearchTerm(e.target.value)}
                  />
                  {lessonSearchTerm && (
                    <button 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setLessonSearchTerm('')}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  )}
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="px-3 border-gray-200 text-muted-foreground"
                  onClick={() => setShowSearchInput(true)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              )}
            </div>
            
            {showSearchInput && (
              <Button 
                variant="ghost" 
                size="sm"
                className="shrink-0 h-10 px-3"
                onClick={() => {
                  setShowSearchInput(false);
                  setLessonSearchTerm('');
                }}
              >
                Cancel
              </Button>
            )}
            
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 border-gray-200">
                    <Filter className="h-4 w-4 mr-2" />
                    {filterOption ? `Level: ${filterOption}` : "Filter"}
                    {(filterOption) && (
                      <Badge variant="secondary" className="ml-2 px-1 text-xs font-normal">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      className={cn("cursor-pointer", filterOption === null && "bg-muted font-medium")}
                      onClick={() => setFilterOption(null)}
                    >
                      All Levels
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={cn("cursor-pointer", filterOption === "Beginner" && "bg-muted font-medium")}
                      onClick={() => setFilterOption("Beginner")}
                    >
                      Beginner
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={cn("cursor-pointer", filterOption === "Intermediate" && "bg-muted font-medium")}
                      onClick={() => setFilterOption("Intermediate")}
                    >
                      Intermediate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={cn("cursor-pointer", filterOption === "Advanced" && "bg-muted font-medium")}
                      onClick={() => setFilterOption("Advanced")}
                    >
                      Advanced
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Tabs 
                value={activeTab} 
                onValueChange={(value: TabValue) => setActiveTab(value)}
                className="hidden sm:block"
              >
                <TabsList>
                  <TabsTrigger value="grid" className="h-10">
                    <Users className="h-4 w-4 mr-2" />
                    Grid
                  </TabsTrigger>
                  <TabsTrigger value="list" className="h-10">
                    <User className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {(filterOption) && (
            <div className="flex items-center mb-6">
              <div className="text-sm text-muted-foreground mr-2">Active filters:</div>
              {filterOption && (
                <Badge 
                  variant="outline" 
                  className="flex items-center gap-1 mr-2 border-gray-200"
                >
                  Level: {filterOption}
                  <button onClick={() => setFilterOption(null)}>
                    <X className="h-3 w-3 ml-1" />
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => setFilterOption(null)}
              >
                Clear all
              </Button>
            </div>
          )}
          
          {upcomingLessons.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-3">
                <Clock className="h-4 w-4 mr-2 text-orange-500" />
                <h3 className="font-medium text-sm">Today's Lessons</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {upcomingLessons.map(student => (
                  <Card 
                    key={`today-${student.id}`} 
                    className="overflow-hidden border-orange-100 hover:border-orange-200 transition-all shadow-sm hover:shadow cursor-pointer"
                    onClick={() => {
                      setCurrentStudent(student);
                      setActiveTab('detail');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-orange-100">
                          <AvatarFallback className="bg-orange-50 text-orange-700">{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-sm">{student.name}</h3>
                          <div className="text-orange-600 text-xs font-medium">
                            {student.nextLesson}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={(value: TabValue) => setActiveTab(value)} className="animate-fade-in">
            <TabsList className="sm:hidden mb-6">
              <TabsTrigger value="grid">
                <Users className="h-4 w-4 mr-2" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <User className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid" className="mt-0">
              {getFilteredStudents().length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {getFilteredStudents().map(student => (
                    <Card 
                      key={student.id} 
                      className="overflow-hidden border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow cursor-pointer"
                      onClick={() => handleStudentClick(student.id)}
                    >
                      <CardContent className="p-0">
                        <div className="p-5">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 border">
                              <AvatarImage src={student.avatarUrl || "/placeholder.svg"} alt={student.name} />
                              <AvatarFallback className="bg-gray-50">{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{student.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs font-normal rounded-full", getLevelColor(student.level || ''))}
                                >
                                  {student.level}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Since {student.startDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-3">
                            <h4 className="text-xs text-muted-foreground font-medium mb-2">Current Repertoire</h4>
                            <div className="space-y-2">
                              {student.currentRepertoire.map((piece, index) => (
                                <div key={piece.id} className="p-2 border rounded-md bg-gray-50 text-sm space-y-1">
                                  <PieceDisplay piece={piece} layout="list" showStatus />
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 mt-2 border-t">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{student.nextLesson}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Music className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg bg-gray-50">
                  <p className="text-muted-foreground">No students match your search criteria.</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setFilterOption(null)}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </TabsContent>
            
            
            <TabsContent value="list" className="mt-0">
              {getFilteredStudents().length > 0 ? (
                <div className="rounded-xl border overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left p-4 font-medium text-gray-600">Student</th>
                          <th className="text-left p-4 font-medium text-gray-600 hidden md:table-cell">Current Repertoire</th>
                          <th className="text-left p-4 font-medium text-gray-600 hidden lg:table-cell">Contact</th>
                          <th className="text-left p-4 font-medium text-gray-600">Next Lesson</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredStudents().map((student, index) => (
                          <tr 
                            key={student.id}
                            className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors"
                            onClick={() => handleStudentClick(student.id)}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                  <AvatarImage src={student.avatarUrl || "/placeholder.svg"} alt={student.name} />
                                  <AvatarFallback className="bg-gray-50">{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{student.name}</div>
                                  <div className="flex items-center mt-0.5">
                                    <Badge 
                                      variant="outline" 
                                      className={cn("text-xs font-normal rounded-full", getLevelColor(student.level || ''))}
                                    >
                                      {student.level}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <div className="space-y-1 max-w-xs">
                                {student.currentRepertoire.slice(0, 2).map((piece, index) => (
                                  <div key={piece.id} className="text-sm truncate">
                                    <PieceDisplay 
                                      piece={piece}
                                      layout="list"
                                      showStatus={false}
                                      showDates={false}
                                      className="inline-block"
                                    />
                                  </div>
                                ))}
                                {student.currentRepertoire.length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{student.currentRepertoire.length - 2} more...
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                              <div className="space-y-0.5">
                                <div className="flex items-center text-sm">
                                  <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  <span>{student.email}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                                  <span>{student.phone}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{student.nextLesson}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg bg-gray-50">
                  <p className="text-muted-foreground">No students match your search criteria.</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setFilterOption(null)}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* All Lessons Section */}
          <div className="mt-12 space-y-6 animate-fade-in animate-delay-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                All Lessons
              </h2>
              
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search lessons..."
                    className="pl-10 pr-4 h-10 w-[250px] border-gray-200 focus:border-primary/50 transition-all"
                    value={lessonSearchTerm}
                    onChange={(e) => setLessonSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <Card className="border-gray-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 w-40 md:w-48">
                        <button 
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                          onClick={() => handleLessonSort('date')}
                        >
                          Date
                          <ArrowUpDown className={cn(
                            "h-3.5 w-3.5 transition-colors",
                            lessonSortField === 'date' ? "text-primary" : "text-gray-400"
                          )} />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 w-40 md:w-48">
                        <button 
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                          onClick={() => handleLessonSort('student')}
                        >
                          Student
                          <ArrowUpDown className={cn(
                            "h-3.5 w-3.5 transition-colors",
                            lessonSortField === 'student' ? "text-primary" : "text-gray-400"
                          )} />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 min-w-[180px]">Repertoire Covered</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-center w-40">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedAndFilteredLessons().map((lesson) => (
                      <tr 
                        key={lesson.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">{format(new Date(lesson.date), 'MMMM d, yyyy')}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistance(new Date(lesson.date), new Date(), { addSuffix: true })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src={lesson.studentAvatar} alt={lesson.studentName} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {lesson.studentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{lesson.studentName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[300px] lg:max-w-full">
                            {lesson.repertoire.map((piece, index) => (
                              <Badge 
                                key={`${lesson.id}-${piece.id || index}`}
                                variant="outline" 
                                className="bg-gray-50 text-gray-700 border-gray-200 truncate max-w-full"
                              >
                                <Music className="h-3 w-3 mr-1 text-primary flex-shrink-0" />
                                <span className="truncate">
                                  <PieceDisplay piece={piece} />
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2 text-xs"
                              onClick={() => {
                                const student = students.find(s => s.id === lesson.studentId);
                                if (student) {
                                  setCurrentStudent(student);
                                  setActiveTab('detail');
                                }
                              }}
                            >
                              <FileIcon className="h-3.5 w-3.5 mr-1 text-blue-600" />
                              Transcript
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2 text-xs"
                              onClick={() => {
                                const student = students.find(s => s.id === lesson.studentId);
                                if (student) {
                                  setCurrentStudent(student);
                                  setActiveTab('detail');
                                }
                              }}
                            >
                              <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-600" />
                              Summary
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {getSortedAndFilteredLessons().length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No lessons found matching your search criteria.</p>
                    {lessonSearchTerm && (
                      <Button 
                        variant="link" 
                        className="mt-2"
                        onClick={() => setLessonSearchTerm('')}
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        /* Student detail view - shown when a student is selected and in detail tab */
        currentStudent ? (
          /* Full detail view when data is available */
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                className="mr-2 text-muted-foreground"
                onClick={() => {
                  setActiveTab('grid');
                  setCurrentStudent(null);
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-200 mx-2" />
              <div className="text-sm text-muted-foreground">Student Details</div>
            </div>
            
            <Card className="border-gray-200 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-r from-blue-50 to-violet-50 px-6 pt-6 pb-12">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                      <AvatarImage src={currentStudent.avatarUrl || "/placeholder.svg"} alt={currentStudent.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700">
                        {currentStudent.name?.slice(0, 2).toUpperCase() || 'ST'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{currentStudent.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={cn("font-normal rounded-full", getLevelColor(currentStudent.level || ''))}
                          >
                            {currentStudent.level}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            Since {currentStudent.startDate}
                          </span>
                        </div>
                    </div>
                    
                    <div className="sm:ml-auto mt-4 sm:mt-0 flex gap-2">
                      <Button size="sm" variant="outline" className="bg-white/80 shadow-sm">
                        <MessageSquare className="h-4 w-4 mr-1.5" />
                        Message
                      </Button>
                      <Button size="sm" className="shadow-sm">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        Schedule Lesson
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 mt-0 border-b">
                  <div className="p-6 border-r border-gray-100">
                    <div className="text-sm text-muted-foreground mb-1.5">Contact Information</div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{currentStudent.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{currentStudent.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 border-r border-gray-100">
                    <div className="text-sm text-muted-foreground mb-1.5">Next Lesson</div>
                    <div className="font-semibold">{currentStudent.nextLesson || 'Not scheduled'}</div>
                    <div className="text-sm text-muted-foreground mt-1">Last lesson: {currentStudent.lastLesson || 'None'}</div>
                  </div>
                  
                  <div className="p-6">
                    <div className="text-sm text-muted-foreground mb-1.5">Student Progress</div>
                    <div className="text-sm">
                      <span className="font-medium">{currentStudent.currentRepertoire?.length || 0}</span> Current pieces
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{currentStudent.pastRepertoire?.length || 0}</span> Completed pieces
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <Tabs defaultValue="repertoire" className="w-full">
                    <TabsList className="w-full justify-start mb-6 bg-transparent p-0 border-b">
                      <TabsTrigger 
                        value="repertoire"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 pt-0 px-4"
                      >
                        <Music className="h-4 w-4 mr-2" />
                        Repertoire
                      </TabsTrigger>
                      <TabsTrigger 
                        value="lessons"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 pt-0 px-4"
                      >
                        <History className="h-4 w-4 mr-2" />
                        Lesson History
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="repertoire" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <h3 className="flex items-center text-base font-medium mb-4">
                            <Music className="h-5 w-5 mr-2 text-primary" />
                            Current Repertoire
                          </h3>
                          
                          <div className="space-y-4">
                            {currentStudent.currentRepertoire.map(piece => (
                              <div key={piece.id} className="bg-blue-50 border border-blue-100 rounded-md p-4">
                                <PieceDisplay 
                                  piece={piece} 
                                  layout="detail" 
                                  showStatus 
                                  showDifficulty 
                                  showDates 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="flex items-center text-base font-medium mb-4">
                            <BookText className="h-5 w-5 mr-2 text-primary" />
                            Past Repertoire
                          </h3>
                          
                          <div className="space-y-4">
                            {currentStudent.pastRepertoire && currentStudent.pastRepertoire.length > 0 ? (
                              currentStudent.pastRepertoire.map(piece => (
                                <div key={piece.id} className="bg-gray-50 border border-gray-100 rounded-md p-4">
                                  <PieceDisplay 
                                    piece={piece} 
                                    layout="detail" 
                                    showStatus 
                                    showDifficulty 
                                    showDates 
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="text-center p-6 text-muted-foreground italic">
                                No past repertoire recorded
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="lessons">
                      {currentStudent.lessons && currentStudent.lessons.length > 0 ? (
                        <LessonHistory 
                          lessons={currentStudent.lessons} 
                        />
                      ) : (
                        <div className="text-center py-12 border border-dashed rounded-lg bg-gray-50">
                          <p className="text-muted-foreground">No lesson history available for this student.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Loading state when data is not available */
          <div className="p-8 text-center">
            <p className="text-lg text-muted-foreground">Loading student data...</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setCurrentStudent(null)}
            >
              Back to students list
            </Button>
          </div>
        )
      )}
    </div>
  );
};

export default StudentPage;
