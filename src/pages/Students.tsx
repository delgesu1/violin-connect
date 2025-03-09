
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
import { Student } from '@/components/common/StudentCard';
import { Badge } from '@/components/ui/badge';

// Mock student data
const students: (Student & { level?: string; email?: string; phone?: string; startDate?: string; lastLesson?: string; })[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    currentPiece: 'Bach Partita No. 2',
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
    currentPiece: 'Paganini Caprice No. 24',
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
    currentPiece: 'Tchaikovsky Violin Concerto',
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
    currentPiece: 'Mozart Violin Sonata K.304',
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
    currentPiece: 'Bruch Violin Concerto No. 1',
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
    currentPiece: 'Vivaldi Four Seasons - Spring',
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
  
  // Filter students based on search query
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (student.level && student.level.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
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
        </TabsList>
        
        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map(student => (
              <Card key={student.id} className="card-hover overflow-hidden">
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
                      <div className="flex items-center gap-2 text-sm">
                        <Music className="h-4 w-4 text-muted-foreground" />
                        <span>{student.currentPiece}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Next: {student.nextLesson}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>Last contact: {student.lastLesson}</span>
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
                  <th className="text-left p-3 font-medium hidden md:table-cell">Current Piece</th>
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
                      "hover:bg-muted/50 transition-colors",
                      index % 2 === 0 ? "bg-card" : "bg-muted/20"
                    )}
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
                    <td className="p-3 hidden md:table-cell">{student.currentPiece}</td>
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
      </Tabs>
    </>
  );
};

export default StudentPage;
