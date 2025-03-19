import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  UserPlus,
  ChevronRight,
  Search,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  Plus,
  Filter,
  SortAsc,
  UserX,
  X,
  CheckCircle2,
  Users,
  Mail,
  Calendar,
  LayoutGrid,
  ListFilter
} from 'lucide-react';

import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { InviteStudentDialog } from '@/components/students/InviteStudentDialog';
import { InvitationsList } from '@/components/students/InvitationsList';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@clerk/clerk-react';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { students as mockStudents } from '@/data/mockStudents';

// Import our new hooks
import { 
  useStudents, 
  useCreateStudent, 
  useUpdateStudent, 
  useDeleteStudent,
  Student,
  NewStudent
} from '@/hooks/useStudents';
import { StudentDebugInfo } from './StudentDebug';
import AllLessonsTable from '@/components/lessons/AllLessonsTable';
import StudentTable from '@/components/students/StudentTable';

// Define development mode and UUID constants
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
const DEV_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Custom hook that provides a fallback for useAuth in development mode
const useDevelopmentAuth = () => {
  // In development mode, return mock auth data
  if (isDevelopmentMode) {
    return { 
      userId: DEV_UUID, 
      isLoaded: true, 
      isSignedIn: true, 
      getToken: async () => "mock-token-for-development" 
    };
  }
  
  // In production, use the real Clerk useAuth
  return useAuth();
};

// Student form schema
const studentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  level: z.string().optional().or(z.literal('')),
  academic_year: z.string().optional().or(z.literal('')),
  next_lesson: z.string().optional().or(z.literal('')),
  avatar_url: z.string().optional().or(z.literal('')),
  start_date: z.string().optional().or(z.literal('')),
  difficulty_level: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal(''))
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

function StudentCard({ student }: { student: Student }) {
  const navigate = useNavigate();
  
  // Extract first and last name from the full name
  const nameParts = student.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  
  return (
    <Card className="overflow-hidden group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{student.name}</CardTitle>
            <CardDescription>{student.level}</CardDescription>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={student.avatar_url} alt={student.name} />
            <AvatarFallback>{firstName.charAt(0)}{lastName ? lastName.charAt(0) : ''}</AvatarFallback>
          </Avatar>
        </div>
        {(student as any)._source && (
          <Badge 
            variant={
              (student as any)._source === 'database' ? 'outline' : 
              (student as any)._source === 'cached' ? 'secondary' : 
              'destructive'
            }
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs absolute top-2 right-2"
          >
            {(student as any)._source}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-1 text-sm">
          {student.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{student.email}</span>
            </div>
          )}
          {student.next_lesson && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Next lesson: {student.next_lesson}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate(`/students/${student.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

const Students: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useDevelopmentAuth();
  const [searchText, setSearchText] = useState('');
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');
  const [sortField, setSortField] = useState<'name' | 'level' | 'nextLesson'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'invitations' | 'lessons'>('students');
  
  // Get query params from URL
  const [searchParams, setSearchParams] = useSearchParams();
  const editStudentId = searchParams.get('edit');
  
  // Fetch students data using our custom hook
  const { data: students = [], isLoading, error, refetch } = useStudents();
  
  // Get student roles
  const { data: userRoles } = useUserRoles();
  
  // Student state management with the new hooks
  const { mutate: createStudent, isPending: isCreating } = useCreateStudent();
  const { mutate: updateStudent, isPending: isUpdating } = useUpdateStudent();
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const { isTeacher, isLoading: isRoleLoading } = useUserRoles();

  // Setup form with react-hook-form
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      level: '',
      academic_year: '',
      next_lesson: '',
      avatar_url: '',
      notes: ''
    }
  });
  
  // Reset form when dialog closes
  const handleDialogClose = () => {
    form.reset();
    setEditingStudent(null);
    setShowStudentForm(false);
  };
  
  // Open edit dialog with student data
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    
    // Populate form with student data
    form.reset({
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      level: student.level || '',
      academic_year: student.academic_year || '',
      next_lesson: student.next_lesson || '',
      avatar_url: student.avatar_url || '',
      start_date: student.start_date || '',
      difficulty_level: student.difficulty_level || '',
      notes: ''
    });
    setShowStudentForm(true);
  };
  
  // Confirm delete dialog
  const handleConfirmDelete = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteDialog(true);
  };
  
  // Execute delete
  const confirmDeleteStudent = () => {
    if (!studentToDelete) return;
    
    deleteStudent(studentToDelete.id, {
      onSuccess: () => {
        toast({
          title: "Student deleted",
          description: `${studentToDelete.name} has been removed.`
        });
        setShowDeleteDialog(false);
        setStudentToDelete(null);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to delete student: ${error.message}`,
          variant: "destructive"
        });
      }
    });
  };
  
  // Form submission for create/update
  const onSubmit = (data: StudentFormValues) => {
    if (editingStudent) {
      // Update existing student
      updateStudent(
        { id: editingStudent.id, student: data },
        {
          onSuccess: () => {
            toast({
              title: "Student updated",
              description: `${data.name}'s information has been updated.`
            });
            handleDialogClose();
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: `Failed to update student: ${error.message}`,
              variant: "destructive"
            });
          }
        }
      );
    } else {
      // Create new student with user_id
      // Use the development auth or Clerk auth based on environment
      let supabaseUserId = isDevelopmentMode ? DEV_UUID : clerkIdToUuid(userId);
      
      // Create new student with required user_id field
      createStudent(
        {
          ...data,
          user_id: supabaseUserId
        } as NewStudent,
        {
          onSuccess: () => {
            toast({
              title: "Student added",
              description: `${data.name} has been added to your students.`
            });
            handleDialogClose();
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: `Failed to add student: ${error.message}`,
              variant: "destructive"
            });
          }
        }
      );
    }
  };
  
  // Filter students based on search query, active status, and skill level
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery === '' || 
      `${student.name}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Remove active filter since it doesn't exist in the database
    const matchesSkillFilter = skillFilter === null || student.level === skillFilter;
    
    return matchesSearch && matchesSkillFilter;
  });
  
  // Get unique skill levels for filter dropdown
  const skillLevels = Array.from(new Set(students.map(s => s.level).filter(Boolean)));
  
  // Navigate to student detail page
  const viewStudentDetails = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };
  
  // Colors for skill level badges
  const getSkillBadgeVariant = (level: string | null | undefined) => {
    if (!level) return "outline";
    
    const levelMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Beginner": "outline",
      "Intermediate": "secondary",
      "Advanced": "default",
      "Pre-professional": "destructive"
    };
    
    return levelMap[level] || "outline";
  };
  
  return (
    <div className="container max-w-7xl">
      <PageHeader
        title="Students"
        description="Manage your violin students"
      >
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowStudentForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowInviteDialog(true)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Invite
          </Button>
        </div>
      </PageHeader>
      
      {import.meta.env.DEV && !isTeacher && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-700">Development Mode</h4>
              <p className="text-sm text-amber-600">
                You're seeing this page because you're in development mode. In production,
                this page would only be visible to users with the teacher role.
              </p>
            </div>
          </div>
        </div>
      )}

      {isRoleLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (import.meta.env.DEV || isTeacher) ? (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'students' | 'invitations' | 'lessons')}>
          <TabsList className="mb-4">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="lessons">All Lessons</TabsTrigger>
          </TabsList>
          <TabsContent value="students" className="mt-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={skillFilter}
                    onValueChange={setSkillFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <Button
                      variant={displayMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-9 rounded-none px-3"
                      onClick={() => setDisplayMode('grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={displayMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-9 rounded-none px-3"
                      onClick={() => setDisplayMode('table')}
                    >
                      <ListFilter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredStudents.length > 0 ? (
                displayMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => (
                      <StudentCard key={student.id} student={student} />
                    ))}
                  </div>
                ) : (
                  <StudentTable students={filteredStudents} />
                )
              ) : (
                <EmptyState
                  icon={<Users className="h-10 w-10" />}
                  title="No students found"
                  description="Try adjusting your search or filters"
                  action={
                    isTeacher
                      ? {
                          label: 'Invite student',
                          onClick: () => setShowStudentForm(true),
                        }
                      : undefined
                  }
                />
              )}
              
              {students.length === 0 && (
                <div className="mt-4">
                  <StudentDebugInfo />
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="invitations" className="mt-6">
            <InvitationsList />
          </TabsContent>
          <TabsContent value="lessons" className="mt-6">
            <AllLessonsTable />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="rounded-md bg-muted p-8 text-center">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-muted-foreground/60" />
                          </div>
          <h3 className="text-lg font-medium">Teacher Access Required</h3>
          <p className="text-muted-foreground mt-2">
            This page is only accessible to accounts with teacher permissions.
            Please log in with a teacher account to manage students.
          </p>
            </div>
          )}
          
      {/* Add/Edit Student Dialog */}
      <Dialog open={showStudentForm} onOpenChange={(open) => {
        if (!open) handleDialogClose();
        setShowStudentForm(open);
      }}>
        <DialogContent className="max-w-xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            <DialogDescription>
              {editingStudent 
                ? "Update your student's information below."
                : "Fill in the details to add a new student to your roster."
              }
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="student@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                            </div>
                            
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                        </div>
                        
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="Pre-professional">Pre-professional</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="difficulty_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter avatar URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h3 className="font-medium text-sm mb-4">Lesson Details</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="academic_year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Academic Year</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2023-2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="next_lesson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Lesson</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Tuesday, 3:30 PM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Additional notes about this student" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                            <Button 
                    type="button" 
                              variant="outline" 
                    onClick={handleDialogClose}
                  >
                    Cancel
                            </Button>
                            <Button 
                    type="submit" 
                    disabled={isCreating || isUpdating}
                  >
                    {(isCreating || isUpdating) ? (
                      <>
                        <span className="mr-2 animate-spin">⏳</span>
                        {editingStudent ? 'Updating...' : 'Creating...'}
        </>
      ) : (
                      <>
                        {editingStudent ? (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Student
                          </>
                        )}
                      </>
                    )}
              </Button>
                </DialogFooter>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {studentToDelete && (
            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={`${studentToDelete.name}`} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {studentToDelete.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                <h4 className="font-medium">{studentToDelete.name}</h4>
                <p className="text-sm text-gray-500">
                  {studentToDelete.level || 'No skill level set'}
                </p>
                        </div>
                        </div>
                      )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteStudent}
              className="flex-1 sm:flex-initial"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 animate-spin">⏳</div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Student
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
