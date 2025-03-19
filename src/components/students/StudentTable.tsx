import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
  User,
  Pencil,
  ExternalLink,
  Calendar,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';

// Import UI components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/EmptyState';

// Import hooks
import { useStudents, Student } from '@/hooks/useStudents';
import { useStudentColor, StudentColorDot } from '@/hooks/useStudentColor';

// Define column types for sorting
type SortField = 'name' | 'level' | 'email' | 'nextLesson';
type SortDirection = 'asc' | 'desc';

const StudentTable: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Fetch students data
  const { data: students = [], isLoading, error } = useStudents();
  
  // Handle sort column click
  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort the students
  const filteredAndSortedStudents = React.useMemo(() => {
    // Filter by search query
    const filtered = students.filter(student => {
      if (!searchQuery) return true;
      
      const lowercaseQuery = searchQuery.toLowerCase();
      return (
        student.name?.toLowerCase().includes(lowercaseQuery) ||
        student.email?.toLowerCase().includes(lowercaseQuery) ||
        student.level?.toLowerCase().includes(lowercaseQuery)
      );
    });
    
    // Sort the filtered results
    return filtered.sort((a, b) => {
      let valueA: string | null | undefined = '';
      let valueB: string | null | undefined = '';
      
      if (sortField === 'name') {
        valueA = a.name;
        valueB = b.name;
      } else if (sortField === 'level') {
        valueA = a.level;
        valueB = b.level;
      } else if (sortField === 'email') {
        valueA = a.email;
        valueB = b.email;
      } else if (sortField === 'nextLesson') {
        valueA = a.next_lesson;
        valueB = b.next_lesson;
      }
      
      // Handle undefined or null values
      valueA = valueA || '';
      valueB = valueB || '';
      
      // Sort based on direction
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
  }, [students, searchQuery, sortField, sortDirection]);
  
  // Handle row click to navigate to student detail
  const handleRowClick = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };
  
  // Get level badge variant
  const getLevelBadge = (level: string | null | undefined) => {
    if (!level) return <Badge variant="outline">Not Set</Badge>;
    
    const levelMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Beginner": "outline",
      "Intermediate": "secondary",
      "Advanced": "default",
      "Pre-professional": "destructive"
    };
    
    const variant = levelMap[level] || "outline";
    return <Badge variant={variant}>{level}</Badge>;
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredAndSortedStudents.length === 0 ? (
        <EmptyState 
          title="No students found"
          description="No students match your search criteria"
          icon={<User className="h-12 w-12" />}
        />
      ) : (
        <div className="rounded-md border overflow-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSortClick('name')}
                    className="flex items-center gap-1 font-medium"
                  >
                    Name
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSortClick('level')}
                    className="flex items-center gap-1 font-medium"
                  >
                    Level
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSortClick('email')}
                    className="flex items-center gap-1 font-medium"
                  >
                    Email
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="min-w-[150px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSortClick('nextLesson')}
                    className="flex items-center gap-1 font-medium"
                  >
                    Next Lesson
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedStudents.map((student) => (
                <TableRow 
                  key={student.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(student.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StudentColorDot userId={student.user_id} size="md" className="mr-1" />
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={student.avatar_url || ''} alt={student.name || ''} />
                        <AvatarFallback>
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{student.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getLevelBadge(student.level)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{student.email || 'Not set'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{student.next_lesson || 'Not scheduled'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/students/${student.id}`);
                        }}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/students?edit=${student.id}`);
                        }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Student
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/messages/${student.id}`);
                        }}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default StudentTable; 