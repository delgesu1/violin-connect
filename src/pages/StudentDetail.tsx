import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Music,
  BookOpen,
  BarChart,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  RefreshCw
} from 'lucide-react';

import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LessonHistory from '@/components/common/LessonHistory';

// Import our hooks
import { 
  useStudent, 
  useDeleteStudent,
} from '@/hooks/useStudents';

// Import our enhanced hooks
import {
  useStudentProfile,
  useStudentNextLesson,
  useUpdateStudentProfile,
  useUpdateStudentDifficulty
} from '../../hooks/useStudentProfile';

// Import repertoire hooks to get student repertoire
import {
  useStudentRepertoire,
  useMasterRepertoire
} from '@/hooks/useRepertoire';
import { MasterRepertoire } from '@/types/schema_extensions';

// Import lessons hooks to get student lessons
import {
  useStudentLessons
} from '@/hooks/useLessons';

// Define a simplified master repertoire type for our purposes
interface SimpleMasterPiece {
  id: string;
  title: string;
  composer: string;
  difficulty?: string | null;
}

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch student data with enhanced profile
  const { 
    data: student, 
    isLoading, 
    error, 
    refetch 
  } = useStudentProfile(id || '');
  
  // Fetch student's next lesson
  const {
    data: nextLesson,
    isLoading: isLoadingNextLesson
  } = useStudentNextLesson(id || '');
  
  // Update student difficulty level mutation
  const updateDifficulty = useUpdateStudentDifficulty();
  
  // Fetch student repertoire
  const {
    data: studentRepertoire = [],
    isLoading: isLoadingRepertoire
  } = useStudentRepertoire(id || '');
  
  // Fetch master repertoire to get piece details
  const {
    data: masterRepertoire = [],
    isLoading: isLoadingMasterRepertoire
  } = useMasterRepertoire();
  
  // Create a mapping of master piece IDs to their full details for easy lookup
  const masterPieceMap = React.useMemo(() => {
    const map = new Map<string, SimpleMasterPiece>();
    masterRepertoire.forEach(piece => {
      map.set(piece.id, {
        id: piece.id,
        title: piece.title,
        composer: piece.composer,
        difficulty: piece.difficulty
      });
    });
    return map;
  }, [masterRepertoire]);
  
  // Fetch student lessons
  const {
    data: studentLessons = [],
    isLoading: isLoadingLessons
  } = useStudentLessons(id || '');
  
  // Map Supabase lesson data to UI lesson format
  const mappedLessons = React.useMemo(() => {
    return studentLessons.map(lesson => ({
      id: lesson.id,
      date: lesson.date,
      repertoire: [], // We'll fill this from lesson_repertoire if needed
      transcriptUrl: lesson.transcript_url || undefined,
      summary: lesson.summary || undefined,
      notes: lesson.notes || undefined,
      // The type doesn't have transcript field, so we'll create it from transcript_url if needed
      transcript: lesson.transcript_url ? `Transcript from ${lesson.date}` : undefined,
      aiSummary: lesson.ai_summary || undefined,
      // Preserve the _source property from our hybrid caching approach
      _source: lesson._source
    }));
  }, [studentLessons]);
  
  // Add debug logging
  React.useEffect(() => {
    console.log("STUDENT DETAIL - Current student data:", student);
    console.log("STUDENT DETAIL - Loading state:", isLoading);
    console.log("STUDENT DETAIL - Error state:", error);
    
    // Check if student data is an array and log a warning
    if (student && Array.isArray(student)) {
      console.warn("STUDENT DETAIL - Warning: student data is an array, expected an object", student);
    }
  }, [student, isLoading, error]);
  
  // Ensure student data is an object, not an array
  const studentData = student && Array.isArray(student) ? student[0] : student;
  
  // Delete student mutation
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();
  
  // Handle delete student
  const handleDeleteStudent = () => {
    if (!studentData) return;
    
    deleteStudent(studentData.id, {
      onSuccess: () => {
        toast({
          title: "Student deleted",
          description: `${studentData.name} has been removed.`
        });
        setShowDeleteDialog(false);
        navigate('/students');
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
  
  // Handle edit student
  const handleEditStudent = () => {
    // Navigate to the students page with a query param to open the edit dialog
    navigate(`/students?edit=${studentData?.id}`);
  };
  
  // Get skill badge variant
  const getSkillBadgeVariant = (level: string | null | undefined) => {
    if (!level) return "outline";
    
    const levelMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "beginner": "outline",
      "intermediate": "secondary",
      "advanced": "default",
      "professional": "destructive"
    };
    
    return levelMap[level] || "outline";
  };
  
  if (isLoading) {
    return (
      <div className="container">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Loading student information...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !studentData) {
    return (
      <div className="container">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Failed to load student</p>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {error instanceof Error ? error.message : 'Student not found or an error occurred'}
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/students')}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Students</span>
              </Button>
              <Button 
                variant="default" 
                onClick={() => refetch()}
                className="gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Extract first and last name from the name field
  const nameParts = studentData?.name ? studentData.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return (
    <div className="container">
      <PageHeader
        title={studentData?.name || 'Student'}
        description="Student Details"
      >
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/students')}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Students</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleEditStudent}
            className="gap-1"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Student Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle>Profile</CardTitle>
              {(studentData as any)?._source && (
                <Badge 
                  variant={
                    (studentData as any)._source === 'database' ? 'outline' : 
                    (studentData as any)._source === 'cached' ? 'secondary' : 
                    'destructive'
                  }
                  className="text-xs"
                >
                  {(studentData as any)._source}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-3">
                <AvatarImage src={studentData?.avatar_url || ""} alt={studentData?.name || "Student"} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {firstName ? firstName[0] : ''}{lastName ? lastName[0] : ''}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-bold">{studentData?.name || 'Student'}</h2>
              
              {/* Display both level and difficulty_level appropriately with fallbacks */}
              <div className="flex gap-2 mt-1 flex-wrap justify-center">
                {studentData?.level && (
                  <Badge variant="outline">
                    {studentData.level}
                  </Badge>
                )}
                
                {studentData?.difficulty_level && (
                  <Badge variant={getSkillBadgeVariant(studentData.difficulty_level)}>
                    {studentData.difficulty_level.charAt(0).toUpperCase() + studentData.difficulty_level.slice(1)}
                  </Badge>
                )}
                
                {!studentData?.level && !studentData?.difficulty_level && (
                  <Badge variant="outline">No level assigned</Badge>
                )}
              </div>
              
              {studentData?.academic_year && (
                <p className="text-gray-500 mt-1">Year: {studentData.academic_year}</p>
              )}
              
              {studentData?.start_date && (
                <p className="text-xs text-muted-foreground mt-1">Student since {new Date(studentData.start_date).toLocaleDateString()}</p>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Contact Information</h3>
              
              {studentData?.email ? (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{studentData.email}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No email provided</div>
              )}
              
              {studentData?.phone ? (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{studentData.phone}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No phone provided</div>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Lesson Information</h3>
              
              {studentData?.next_lesson ? (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Next: {studentData.next_lesson}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No upcoming lessons</div>
              )}
              
              {studentData?.last_lesson_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Last lesson: {new Date(studentData.last_lesson_date).toLocaleDateString()}</span>
                </div>
              )}
              
              {studentData?.unread_messages && studentData.unread_messages > 0 ? (
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <span>{studentData.unread_messages} unread messages</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>No unread messages</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs for Repertoire, Lessons, Progress */}
        <div className="md:col-span-2">
          <Tabs defaultValue="repertoire" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="repertoire" className="flex items-center gap-1">
                <Music className="h-4 w-4" />
                <span>Repertoire</span>
              </TabsTrigger>
              <TabsTrigger value="lessons" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>Lessons</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-1">
                <BarChart className="h-4 w-4" />
                <span>Progress</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Repertoire Tab */}
            <TabsContent value="repertoire">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Student Repertoire</CardTitle>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Music className="h-4 w-4" />
                      <span>Assign Piece</span>
                    </Button>
                  </div>
                  <CardDescription>
                    All pieces assigned to this student
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRepertoire || isLoadingMasterRepertoire ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading repertoire...</p>
                    </div>
                  ) : studentRepertoire.length === 0 ? (
                    <div className="text-center py-8 border rounded-md bg-gray-50">
                      <Music className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-600 mb-1">No repertoire assigned</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        This student doesn't have any pieces assigned yet.
                      </p>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Music className="h-4 w-4" />
                        <span>Assign First Piece</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Current Repertoire Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-1 bg-primary rounded-full"></div>
                          <h3 className="text-lg font-medium">Current Repertoire</h3>
                        </div>
                        
                        <div className="space-y-3 pl-2">
                          {studentRepertoire
                            .filter(piece => piece.status === 'current')
                            .map((piece) => (
                              <Card 
                                key={piece.id}
                                className="border border-gray-200 hover:border-primary/50 transition-colors"
                              >
                                <CardContent className="p-4 flex items-start gap-3">
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <Music className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium">
                                        {masterPieceMap.get(piece.master_piece_id)?.title || 
                                          piece.master_piece_id.split('-')[0]}
                                      </h4>
                                      <Badge 
                                        variant="default" 
                                        className="text-xs bg-blue-500 hover:bg-blue-600"
                                      >
                                        Current
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {masterPieceMap.get(piece.master_piece_id)?.composer || 'Unknown Composer'}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-1">
                                      Assigned: {new Date(piece.start_date || piece.created_at).toLocaleDateString()}
                                    </p>
                                    {piece.notes && (
                                      <p className="text-sm border-t border-gray-100 pt-2 mt-2">
                                        {piece.notes}
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            
                          {studentRepertoire.filter(piece => piece.status === 'current').length === 0 && (
                            <div className="text-center py-4 border border-dashed rounded-md">
                              <p className="text-sm text-gray-500">No current repertoire</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Completed Repertoire Section */}
                      <div className="space-y-3 mt-6">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-1 bg-green-500 rounded-full"></div>
                          <h3 className="text-lg font-medium">Completed Repertoire</h3>
                        </div>
                        
                        <div className="space-y-3 pl-2">
                          {studentRepertoire
                            .filter(piece => piece.status === 'completed')
                            .map((piece) => (
                              <Card 
                                key={piece.id}
                                className="border border-gray-200 hover:border-green-500/50 transition-colors"
                              >
                                <CardContent className="p-4 flex items-start gap-3">
                                  <div className="bg-green-500/10 p-2 rounded-full">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium">
                                        {masterPieceMap.get(piece.master_piece_id)?.title || 
                                          piece.master_piece_id.split('-')[0]}
                                      </h4>
                                      <Badge 
                                        variant="default" 
                                        className="text-xs bg-green-500 hover:bg-green-600"
                                      >
                                        Completed
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {masterPieceMap.get(piece.master_piece_id)?.composer || 'Unknown Composer'}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-1">
                                      {piece.end_date ? 
                                        `Completed: ${new Date(piece.end_date).toLocaleDateString()}` : 
                                        `Assigned: ${new Date(piece.start_date || piece.created_at).toLocaleDateString()}`
                                      }
                                    </p>
                                    {piece.notes && (
                                      <p className="text-sm border-t border-gray-100 pt-2 mt-2">
                                        {piece.notes}
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            
                          {studentRepertoire.filter(piece => piece.status === 'completed').length === 0 && (
                            <div className="text-center py-4 border border-dashed rounded-md">
                              <p className="text-sm text-gray-500">No completed repertoire</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Lessons Tab */}
            <TabsContent value="lessons">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Lesson History</CardTitle>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Schedule Lesson</span>
                    </Button>
                  </div>
                  <CardDescription>
                    Past and upcoming lessons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingLessons ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading lessons...</p>
                    </div>
                  ) : mappedLessons.length === 0 ? (
                    <div className="text-center py-8 border rounded-md bg-gray-50">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-600 mb-1">No lessons recorded</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        This student doesn't have any lessons recorded yet.
                      </p>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Schedule First Lesson</span>
                      </Button>
                    </div>
                  ) : (
                    <LessonHistory lessons={mappedLessons} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Progress Tab */}
            <TabsContent value="progress">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Tracking</CardTitle>
                  <CardDescription>
                    Track this student's progress over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 border rounded-md bg-gray-50">
                    <BarChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-1">Progress tracking coming soon</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      This feature is under development and will be available soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={studentData.avatar_url || ""} alt={studentData.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {firstName[0]}{lastName ? lastName[0] : ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{studentData.name}</h4>
              <p className="text-sm text-gray-500">
                {studentData.difficulty_level || 'No skill level set'}
              </p>
            </div>
          </div>
          
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
              onClick={handleDeleteStudent}
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

export default StudentDetail; 