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
  Phone
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Student, RepertoirePiece, Lesson } from '@/components/common/StudentCard';
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
import { useParams } from 'react-router-dom';

// Mock student data with lessons
const students: (Student & { level?: string; email?: string; phone?: string; startDate?: string; lastLesson?: string; })[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    currentRepertoire: [
      { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' },
      { id: '102', title: 'Violin Concerto', startDate: '2023-09-15', status: 'current', composer: 'Korngold, 1st movement' },
      { id: '103', title: 'Caprice No. 23', startDate: '2023-10-10', status: 'current', composer: 'Paganini' }
    ],
    pastRepertoire: [
      { id: '104', title: 'A Minor Scale', startDate: '2023-08-01', status: 'completed', composer: 'With emphasis on arpeggios' },
      { id: '105', title: 'Sonata No. 2', startDate: '2023-07-15', status: 'completed', composer: 'Bach' }
    ],
    lessons: [
      {
        id: 'l101',
        date: '2023-10-15',
        repertoire: [
          { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' },
          { id: '102', title: 'Violin Concerto', startDate: '2023-09-15', status: 'current', composer: 'Korngold, 1st movement' }
        ],
        transcriptUrl: 'https://example.com/transcripts/emma-oct15',
        summary: 'Worked on B Major scale with focus on intonation of thirds. Discussed fingering options for difficult passages in Korngold concerto. Assigned metronome practice at quarter note = 72 for the development section.'
      },
      {
        id: 'l102',
        date: '2023-10-08',
        repertoire: [
          { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' },
          { id: '103', title: 'Caprice No. 23', startDate: '2023-10-10', status: 'current', composer: 'Paganini' }
        ],
        transcriptUrl: 'https://example.com/transcripts/emma-oct08',
        summary: 'Introduced Paganini Caprice No. 23. Discussed right-hand articulation and left-hand flexibility required. Continued work on B Major scale, focusing on consistent tone across string crossings.'
      },
      {
        id: 'l103',
        date: '2023-10-01',
        repertoire: [
          { id: '101', title: 'B Major Scale', startDate: '2023-10-01', status: 'current', composer: 'With emphasis on thirds' },
          { id: '104', title: 'A Minor Scale', startDate: '2023-08-01', status: 'completed', composer: 'With emphasis on arpeggios' }
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
    currentRepertoire: [
      { id: '201', title: 'C Minor Scale', startDate: '2023-10-05', status: 'current', composer: 'Focus on intonation' },
      { id: '202', title: 'Caprice No. 24', startDate: '2023-09-10', status: 'current', composer: 'Paganini' },
      { id: '203', title: 'Violin Concerto No. 5', startDate: '2023-10-12', status: 'current', composer: 'Mozart, 1st movement' }
    ],
    pastRepertoire: [
      { id: '204', title: 'D Major Scale', startDate: '2023-08-12', status: 'completed', composer: 'With double stops' },
      { id: '205', title: 'Concerto in A Minor', startDate: '2023-07-20', status: 'completed', composer: 'Vivaldi' }
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
    currentRepertoire: [
      { id: '301', title: 'G Minor Scale', startDate: '2023-09-28', status: 'current', composer: 'With rhythmic variations' },
      { id: '302', title: 'Violin Concerto', startDate: '2023-09-05', status: 'current', composer: 'Tchaikovsky, 2nd movement' },
      { id: '303', title: 'G Minor Adagio', startDate: '2023-10-08', status: 'current', composer: 'Bach' }
    ],
    pastRepertoire: [
      { id: '304', title: 'E Minor Scale', startDate: '2023-08-15', status: 'completed', composer: 'With dynamics' },
      { id: '305', title: 'Winter', startDate: '2023-07-10', status: 'completed', composer: 'Vivaldi, from Four Seasons' }
    ],
    level: 'Advanced',
    email: 'sophia.c@example.com',
    phone: '(555) 345-6789',
    startDate: 'Mar 2022',
    lastLesson: '3 days ago',
    nextLesson: 'Friday, 5:00 PM',
  },
  {
    id: '4',
    name: 'Michael Brown',
    currentRepertoire: [
      { id: '401', title: 'D Minor Scale', startDate: '2023-10-03', status: 'current', composer: 'With varied bowing' },
      { id: '402', title: 'Violin Sonata K.304', startDate: '2023-09-20', status: 'current', composer: 'Mozart' },
      { id: '403', title: 'Etude No. 12', startDate: '2023-10-15', status: 'current', composer: 'Kreutzer' }
    ],
    pastRepertoire: [
      { id: '404', title: 'F Major Scale', startDate: '2023-08-05', status: 'completed', composer: 'Three octaves' },
      { id: '405', title: 'Concerto in G Major', startDate: '2023-07-25', status: 'completed', composer: 'Haydn' }
    ],
    level: 'Intermediate',
    email: 'michael.b@example.com',
    phone: '(555) 456-7890',
    startDate: 'May 2023',
    lastLesson: '2 weeks ago',
    nextLesson: 'Next Monday, 4:30 PM',
  },
  {
    id: '5',
    name: 'Olivia Garcia',
    currentRepertoire: [
      { id: '501', title: 'A Major Scale', startDate: '2023-10-06', status: 'current', composer: 'Two octaves' },
      { id: '502', title: 'Violin Concerto No. 1', startDate: '2023-09-18', status: 'current', composer: 'Bruch' },
      { id: '503', title: 'Minuet', startDate: '2023-10-01', status: 'current', composer: 'Bach' }
    ],
    pastRepertoire: [
      { id: '504', title: 'G Major Scale', startDate: '2023-08-10', status: 'completed', composer: 'One octave' },
      { id: '505', title: 'Concertino', startDate: '2023-07-15', status: 'completed', composer: 'Rieding' }
    ],
    level: 'Intermediate',
    email: 'olivia.g@example.com',
    phone: '(555) 567-8901',
    startDate: 'Jun 2023',
    lastLesson: '1 week ago',
    nextLesson: 'Next Wednesday, 2:00 PM',
  },
  {
    id: '6',
    name: 'William Taylor',
    currentRepertoire: [
      { id: '601', title: 'D Major Scale', startDate: '2023-10-08', status: 'current', composer: 'One octave' },
      { id: '602', title: 'Spring', startDate: '2023-09-25', status: 'current', composer: 'Vivaldi, from Four Seasons' },
      { id: '603', title: 'Etude No. 3', startDate: '2023-10-05', status: 'current', composer: 'Wohlfahrt' }
    ],
    pastRepertoire: [
      { id: '604', title: 'A Minor Scale', startDate: '2023-08-12', status: 'completed', composer: 'One octave' },
      { id: '605', title: 'Allegro', startDate: '2023-07-20', status: 'completed', composer: 'Fiocco' }
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
  switch (level?.toLowerCase()) {
    case 'advanced':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'intermediate':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'beginner':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// Filter options
type FilterOption = 'all' | 'level' | 'repertoire';

type TabValue = 'grid' | 'list' | 'detail';

const StudentPage = () => {
  const [selectedTab, setSelectedTab] = useState<TabValue>('grid');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [filterValue, setFilterValue] = useState('');
  
  // Get the studentId from the URL parameter
  const { studentId } = useParams();
  
  // Set the selected student and tab when the component mounts or the URL parameter changes
  useEffect(() => {
    if (studentId) {
      setSelectedStudent(studentId);
      setSelectedTab('detail');
    }
  }, [studentId]);
  
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (showSearchInput && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchInput]);
  
  // Filter students based on search query and filters
  const filteredStudents = students.filter(student => {
    // Apply search query filter
    const matchesSearch = searchTerm === '' || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.level && student.level.toLowerCase().includes(searchTerm.toLowerCase())) ||
      student.currentRepertoire.some(piece => 
        piece.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (piece.composer && piece.composer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    
    // Apply level filter
    const matchesLevel = filterValue === null || student.level === filterValue;
    
    return matchesSearch && matchesLevel;
  });
  
  const currentStudent = selectedStudent ? students.find(s => s.id === selectedStudent) : null;
  
  const clearFilters = () => {
    setFilterValue(null);
    setActiveFilter('all');
    setSearchTerm('');
  };
  
  // Group students by their next lesson date
  const upcomingLessons = filteredStudents
    .filter(student => student.nextLesson && student.nextLesson.includes('Today'))
    .sort((a, b) => {
      // Extract time from "Today, 4:00 PM" format
      const timeA = a.nextLesson?.split(', ')[1] || '';
      const timeB = b.nextLesson?.split(', ')[1] || '';
      return timeA.localeCompare(timeB);
    });
  
  return (
    <div className="space-y-8 animate-fade-in">
      {!selectedStudent || selectedTab !== 'detail' ? (
        /* Students list view - shown when no student is selected or not in detail tab */
        <>
          <PageHeader 
            title="Students" 
            description="Manage your students and their progress"
            className="mb-6"
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setSearchTerm('')}
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
                  setSearchTerm('');
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
                    {filterValue ? `Level: ${filterValue}` : "Filter"}
                    {(filterValue) && (
                      <Badge variant="secondary" className="ml-2 px-1 text-xs font-normal">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      className={cn("cursor-pointer", !filterValue && "bg-muted")}
                      onClick={() => setFilterValue(null)}
                    >
                      All Levels
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={cn("cursor-pointer", filterValue === "Beginner" && "bg-muted")}
                      onClick={() => setFilterValue("Beginner")}
                    >
                      Beginner
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={cn("cursor-pointer", filterValue === "Intermediate" && "bg-muted")}
                      onClick={() => setFilterValue("Intermediate")}
                    >
                      Intermediate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className={cn("cursor-pointer", filterValue === "Advanced" && "bg-muted")}
                      onClick={() => setFilterValue("Advanced")}
                    >
                      Advanced
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Tabs 
                value={selectedTab} 
                onValueChange={(value: TabValue) => setSelectedTab(value)}
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
          
          {(filterValue) && (
            <div className="flex items-center mb-6">
              <div className="text-sm text-muted-foreground mr-2">Active filters:</div>
              {filterValue && (
                <Badge 
                  variant="outline" 
                  className="flex items-center gap-1 mr-2 border-gray-200"
                >
                  Level: {filterValue}
                  <button onClick={() => setFilterValue(null)}>
                    <X className="h-3 w-3 ml-1" />
                  </button>
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
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
                      setSelectedStudent(student.id);
                      setSelectedTab('detail');
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
          
          <Tabs value={selectedTab} onValueChange={(value: TabValue) => setSelectedTab(value)} className="animate-fade-in">
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
              {filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredStudents.map(student => (
                    <Card 
                      key={student.id} 
                      className="overflow-hidden border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow cursor-pointer"
                      onClick={() => {
                        setSelectedStudent(student.id);
                        setSelectedTab('detail');
                      }}
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
                                <div key={piece.id} className={cn(
                                  "flex items-start text-sm py-1 px-2 rounded-md",
                                  index === 0 && "bg-gray-50"
                                )}>
                                  <div>
                                    <div className="font-medium">{piece.title}</div>
                                    {piece.composer && <div className="text-muted-foreground text-xs">{piece.composer}</div>}
                                  </div>
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
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </TabsContent>
            
            
            <TabsContent value="list" className="mt-0">
              {filteredStudents.length > 0 ? (
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
                        {filteredStudents.map((student, index) => (
                          <tr 
                            key={student.id}
                            className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedStudent(student.id);
                              setSelectedTab('detail');
                            }}
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
                                    <span className="font-medium">{piece.title}</span>
                                    {piece.composer && <span className="text-muted-foreground text-xs ml-1.5">- {piece.composer}</span>}
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
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        /* Student detail view - shown when a student is selected and in detail tab */
        currentStudent && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                className="mr-2 text-muted-foreground"
                onClick={() => {
                  setSelectedStudent(null);
                  setSelectedTab('grid');
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
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700">{currentStudent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
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
                    <div className="font-semibold">{currentStudent.nextLesson}</div>
                    <div className="text-sm text-muted-foreground mt-1">Last lesson: {currentStudent.lastLesson}</div>
                  </div>
                  
                  <div className="p-6">
                    <div className="text-sm text-muted-foreground mb-1.5">Student Progress</div>
                    <div className="text-sm">
                      <span className="font-medium">{currentStudent.currentRepertoire.length}</span> Current pieces
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{currentStudent.pastRepertoire ? currentStudent.pastRepertoire.length : 0}</span> Completed pieces
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
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                            <Music className="h-5 w-5 text-blue-600" />
                            Current Repertoire
                          </h3>
                          
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                              {currentStudent.currentRepertoire.map((piece, index) => (
                                <Card key={piece.id} className="overflow-hidden border-gray-200">
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium">{piece.title}</h4>
                                          {index === 0 && (
                                            <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                                              Focus
                                            </Badge>
                                          )}
                                        </div>
                                        {piece.composer && <p className="text-sm text-muted-foreground mt-1">{piece.composer}</p>}
                                      </div>
                                      <Badge variant="outline" className="text-xs font-normal">
                                        Since {piece.startDate}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                                      <div className="text-xs text-muted-foreground">
                                        Started {new Date(piece.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </div>
                                      <Button variant="ghost" size="sm" className="h-7 px-2">
                                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                        Mark Complete
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Past Repertoire
                          </h3>
                          
                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                              {currentStudent.pastRepertoire && currentStudent.pastRepertoire.length > 0 ? (
                                currentStudent.pastRepertoire.map((piece) => (
                                  <Card key={piece.id} className="overflow-hidden border-gray-200 bg-gray-50">
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h4 className="font-medium">{piece.title}</h4>
                                          {piece.composer && <p className="text-sm text-muted-foreground mt-1">{piece.composer}</p>}
                                        </div>
                                        <Badge variant="outline" className="text-xs font-normal bg-green-50 text-green-700 border-green-200">
                                          Completed
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))
                              ) : (
                                <div className="text-center py-12 border border-dashed rounded-lg bg-gray-50">
                                  <p className="text-muted-foreground">No past repertoire available.</p>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="lessons" className="mt-0">
                      {currentStudent.lessons && currentStudent.lessons.length > 0 ? (
                        <LessonHistory lessons={currentStudent.lessons} />
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
        )
      )}
    </div>
  );
};

export default StudentPage;
