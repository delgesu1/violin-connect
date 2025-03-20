import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Search,
  ChevronDown,
  Clock,
  User,
  FileText,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';

// Import hooks and utils
// import { useAllLessons, Lesson } from '@/features/calendar/hooks';
import { loadAllLessons } from './AllLessonsLoader';
import { useAuth } from '@/lib/auth-wrapper';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { useQuery } from '@tanstack/react-query';

// Define additional student properties that may be included in some lesson records
type LessonWithStudent = {
  id: string;
  teacher_id: string;
  student_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  notes: string | null;
  summary: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    name: string;
    avatar_url: string | null;
  }
};

// Define column sort types
type SortField = 'date' | 'student' | 'status';
type SortDirection = 'asc' | 'desc';

const AllLessonsTable: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Use auth to get user ID
  const { userId } = useAuth();
  const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
  
  // Fetch all lessons with student details
  const { data: lessons = [], isLoading, error } = useQuery({
    queryKey: ['allLessons'],
    queryFn: async () => {
      if (!userId && !isDevelopmentMode) return [];
      
      // Get teacher ID (using DEV_UUID if in development mode)
      const teacherId = isDevelopmentMode 
        ? 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' 
        : await clerkIdToUuid(userId!);
      
      // Load all lessons with student info
      return loadAllLessons(teacherId);
    },
    enabled: !!userId || isDevelopmentMode,
  });
  
  // Debug logging in development mode
  React.useEffect(() => {
    if (isDevelopmentMode && lessons.length > 0) {
      console.log(`Rendering ${lessons.length} lessons in AllLessonsTable`);
      console.log('First few lessons:', lessons.slice(0, 3));
    }
  }, [lessons, isDevelopmentMode]);
  
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get student name safely, handling any potential data issues
  const getStudentName = (lesson: any) => {
    // If the lesson has a student object with name, use it
    if (lesson.student && lesson.student.name) {
      return lesson.student.name;
    }
    
    // Fallback for old data structure (pre-join)
    if (lesson.students && lesson.students.name) {
      return lesson.students.name;
    }
    
    // Worst case, show a placeholder
    return 'Unknown Student';
  };
  
  // Get student avatar safely
  const getStudentAvatar = (lesson: any) => {
    if (lesson.student && lesson.student.avatar_url) {
      return lesson.student.avatar_url;
    }
    
    if (lesson.students && lesson.students.avatar_url) {
      return lesson.students.avatar_url;
    }
    
    return '';
  };
  
  // Get student ID safely
  const getStudentId = (lesson: any) => {
    if (lesson.student && lesson.student.id) {
      return lesson.student.id;
    }
    
    if (lesson.students && lesson.students.id) {
      return lesson.students.id;
    }
    
    return lesson.student_id || 'unknown';
  };
  
  // Get status badge variant
  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return <Badge variant="outline">Scheduled</Badge>;
    
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'rescheduled':
        return <Badge variant="default">Rescheduled</Badge>;
      case 'scheduled':
      default:
        return <Badge variant="outline">Scheduled</Badge>;
    }
  };
  
  // In the existing component, update the getSourceBadge function to show more info
  const getSourceBadge = (lesson: any) => {
    if (!isDevelopmentMode) return null;
    
    // Return a badge with different styles based on the source
    const sourceType = lesson._source || 'unknown';
    const badgeProps = {
      database: { variant: "default", label: "API" },
      cached: { variant: "secondary", label: "Cached" },
      mock: { variant: "outline", label: "Mock" },
      unknown: { variant: "outline", label: "Unknown" }
    }[sourceType];
    
    // Add lesson ID as title for debugging
    return (
      <Badge 
        variant={badgeProps.variant as any} 
        className="ml-2 text-xs cursor-help"
        title={`ID: ${lesson.id} | Source: ${sourceType}`}
      >
        {badgeProps.label}
      </Badge>
    );
  };
  
  // Handle sort column click
  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort the lessons
  const filteredAndSortedLessons = React.useMemo(() => {
    // Filter by search query and status
    let filtered = lessons.filter(lesson => {
      const studentName = getStudentName(lesson);
      
      const matchesSearch = !searchQuery || 
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.summary && lesson.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lesson.notes && lesson.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
        (lesson.status && lesson.status === statusFilter);
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort the filtered results
    filtered.sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'student') {
        const nameA = getStudentName(a);
        const nameB = getStudentName(b);
        return sortDirection === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else if (sortField === 'status') {
        const statusA = a.status || '';
        const statusB = b.status || '';
        return sortDirection === 'asc'
          ? statusA.localeCompare(statusB)
          : statusB.localeCompare(statusA);
      }
      return 0;
    });
    
    return filtered;
  }, [lessons, searchQuery, sortField, sortDirection, statusFilter]);
  
  // Handle row click to navigate to lesson detail
  const handleRowClick = (lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">
            Failed to load lessons: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (filteredAndSortedLessons.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        title="No lessons found"
        description={
          searchQuery || statusFilter !== 'all'
            ? "Try adjusting your filters or search term"
            : "You haven't recorded any lessons yet"
        }
        action={{
          label: "Schedule a Lesson",
          onClick: () => navigate('/lessons/new')
        }}
      />
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>All Lessons</span>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/lessons/new')}>
            <Calendar className="mr-2 h-4 w-4" />
            New Lesson
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters and search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lessons or students..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredAndSortedLessons.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
              title="No lessons found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? "Try adjusting your filters or search term"
                  : "You haven't recorded any lessons yet"
              }
              action={{
                label: "Schedule a Lesson",
                onClick: () => navigate('/lessons/new')
              }}
            />
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table className="min-w-[750px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] min-w-[100px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSortClick('date')}
                        className="flex items-center gap-1 font-medium"
                      >
                        Date
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[140px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSortClick('student')}
                        className="flex items-center gap-1 font-medium"
                      >
                        Student
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[140px] min-w-[140px]">Time</TableHead>
                    <TableHead className="hidden md:table-cell w-[100px] min-w-[100px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSortClick('status')}
                        className="flex items-center gap-1 font-medium"
                      >
                        Status
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell min-w-[180px] w-full">Summary</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedLessons.map((lesson) => (
                    <TableRow
                      key={lesson.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(lesson.id)}
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(lesson.date)}
                        {getSourceBadge(lesson)}
                      </TableCell>
                      <TableCell className="min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={getStudentAvatar(lesson) || ''} alt={getStudentName(lesson)} />
                            <AvatarFallback>
                              {getInitials(getStudentName(lesson))}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">{getStudentName(lesson)}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              Student ID: {getStudentId(lesson).substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>
                            {lesson.start_time ? format(new Date(`2000-01-01T${lesson.start_time}`), 'h:mm a') : 'N/A'}
                            {lesson.end_time ? ` - ${format(new Date(`2000-01-01T${lesson.end_time}`), 'h:mm a')}` : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getStatusBadge(lesson.status)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap" title={lesson.summary || 'No summary available'}>
                          {lesson.summary || 'No summary available'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/lessons/${lesson.id}`)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/lessons/${lesson.id}/edit`)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit Lesson</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/students/${lesson.student_id}`)}
                            >
                              <User className="mr-2 h-4 w-4" />
                              <span>View Student</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Lesson</span>
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
      </CardContent>
    </Card>
  );
};

export default AllLessonsTable; 