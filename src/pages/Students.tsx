
import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Student, RepertoirePiece } from '@/components/common/StudentCard';
import { Badge } from '@/components/ui/badge';

// Mock student data
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

const StudentPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  
  // Filter students based on search query
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (student.level && student.level.toLowerCase().includes(searchQuery.toLowerCase())) ||
    student.currentRepertoire.some(piece => 
      piece.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (piece.composer && piece.composer.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const currentStudent = selectedStudent ? students.find(s => s.id === selectedStudent) : null;
  
  return (
    <>
      <PageHeader 
        title="Students" 
        description="Manage your students and their progress"
      >
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </PageHeader>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="relative flex-1 animate-slide-up animate-stagger-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="grid" className="animate-slide-up animate-stagger-2">
        <TabsList className="mb-6">
          <TabsTrigger value="grid">
            <Users className="h-4 w-4 mr-2" />
            Grid View
          </TabsTrigger>
          <TabsTrigger value="list">
            <User className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          {selectedStudent && (
            <TabsTrigger value="detail">
              <User className="h-4 w-4 mr-2" />
              Student Detail
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map(student => (
              <Card 
                key={student.id} 
                className="card-hover overflow-hidden cursor-pointer"
                onClick={() => setSelectedStudent(student.id)}
              >
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.avatarUrl || "/placeholder.svg"} alt={student.name} />
                        <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {student.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Since {student.startDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <h4 className="text-xs uppercase text-muted-foreground font-medium tracking-wider mb-1">Current Repertoire</h4>
                      {student.currentRepertoire.map((piece, index) => (
                        <div key={piece.id} className="flex items-start gap-2 text-sm">
                          {index === 0 ? (
                            <Music className="h-4 w-4 text-muted-foreground mt-0.5" />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                          <div>
                            <span className="font-medium">{piece.title}</span>
                            {piece.composer && <span className="text-muted-foreground"> - {piece.composer}</span>}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Next: {student.nextLesson}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border-t bg-muted/30 grid grid-cols-4 gap-1">
                    <Button variant="ghost" size="sm" className="h-8">
                      <Music className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No students match your search criteria.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <div className="rounded-md border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Current Repertoire</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Level</th>
                  <th className="text-left p-3 font-medium hidden lg:table-cell">Contact</th>
                  <th className="text-left p-3 font-medium">Next Lesson</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr 
                    key={student.id}
                    className={cn(
                      "hover:bg-muted/50 transition-colors cursor-pointer",
                      index % 2 === 0 ? "bg-card" : "bg-muted/20"
                    )}
                    onClick={() => setSelectedStudent(student.id)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatarUrl || "/placeholder.svg"} alt={student.name} />
                          <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{student.name}</span>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="space-y-1">
                        {student.currentRepertoire.slice(0, 2).map((piece, index) => (
                          <div key={piece.id} className="text-sm">
                            {piece.title}
                            {index < student.currentRepertoire.length - 1 && index < 1 && ", ..."}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <Badge variant="outline">{student.level}</Badge>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <div className="text-sm">
                        <div>{student.email}</div>
                        <div className="text-muted-foreground">{student.phone}</div>
                      </div>
                    </td>
                    <td className="p-3">{student.nextLesson}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No students match your search criteria.</p>
            </div>
          )}
        </TabsContent>
        
        {selectedStudent && (
          <TabsContent value="detail" className="mt-0">
            {currentStudent && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={currentStudent.avatarUrl || "/placeholder.svg"} alt={currentStudent.name} />
                        <AvatarFallback>{currentStudent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-semibold">{currentStudent.name}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge>{currentStudent.level}</Badge>
                          <span className="text-sm text-muted-foreground">Student since {currentStudent.startDate}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="text-sm">
                            <div className="font-medium">Contact</div>
                            <div>{currentStudent.email}</div>
                            <div className="text-muted-foreground">{currentStudent.phone}</div>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">Next Lesson</div>
                            <div>{currentStudent.nextLesson}</div>
                            <div className="text-muted-foreground">Last lesson: {currentStudent.lastLesson}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Music className="h-5 w-5" />
                          Current Repertoire
                        </h3>
                        <div className="space-y-3">
                          {currentStudent.currentRepertoire.map(piece => (
                            <div key={piece.id} className="p-3 border rounded-md bg-card">
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">{piece.title}</h4>
                                  {piece.composer && <p className="text-sm text-muted-foreground">{piece.composer}</p>}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  Started {piece.startDate}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Past Repertoire
                        </h3>
                        <div className="space-y-3">
                          {currentStudent.pastRepertoire && currentStudent.pastRepertoire.length > 0 ? (
                            currentStudent.pastRepertoire.map(piece => (
                              <div key={piece.id} className="p-3 border rounded-md bg-card">
                                <div className="flex justify-between">
                                  <div>
                                    <h4 className="font-medium">{piece.title}</h4>
                                    {piece.composer && <p className="text-sm text-muted-foreground">{piece.composer}</p>}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    Completed
                                  </Badge>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              No past repertoire available.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                    Back to Students
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </>
  );
};

export default StudentPage;
