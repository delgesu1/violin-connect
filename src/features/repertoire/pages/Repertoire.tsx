import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, CheckCircle, Clock, Filter, LucideIcon, Menu, Music, PlusCircle, 
         ListFilter, Grid, User, Search, ChevronRight, ChevronLeft, Download, 
         ExternalLink, Trash, Trash2, Upload, BookMarked, Bookmark, File as FileIcon, 
         Paperclip, X, Youtube, LinkIcon, Plus, Eye, Share, RotateCw, FileArchive, 
         FileText, ChevronDown, ChevronUp, Users, Info, BookText, List, Check as CircleCheck, Star, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, 
  DropdownMenuGroup, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuSub, 
  DropdownMenuSubContent, 
  DropdownMenuSubTrigger, 
  DropdownMenuPortal, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Student, RepertoirePiece, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import RepertoireItem, { RepertoireItemData } from '@/components/common/RepertoireItem';
import PieceDisplay from '@/components/common/PieceDisplay';
import { ID_PREFIXES, createPrefixedId, createStudentPieceId, getIdWithoutPrefix, ensureIdHasPrefix, isIdOfType, logIdInconsistency } from '@/lib/id-utils';
import { getMasterPieceById } from '@/lib/utils/repertoire-utils';
import { useRepertoire } from '@/features/repertoire/contexts';
import {
  getLegacyFileAttachments, 
  getLegacyLinkResources, 
  AttachmentEntityType,
  AttachmentType,
  mockAttachments,
  mockAttachmentAssociations,
  createAttachmentId,
  createAttachmentAssociation,
  addFileAttachment,
  deleteFileAttachment
} from '@/lib/attachment-utils';
import AttachmentManager from '@/components/common/AttachmentManager';
import { FileUpload, SelectedFile } from '@/components/ui/file-upload';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

// Import Supabase hooks
import { useStudents } from '@/hooks/useStudents';
import { useMasterRepertoire, useStudentRepertoire, useUpdateStudentRepertoire, useDeleteStudentRepertoire } from '@/features/repertoire/hooks';

// Import types for Supabase data
import type { Database } from '@/types/supabase';
type SupabaseStudent = Database['public']['Tables']['students']['Row'];
type StudentRepertoire = Database['public']['Tables']['student_repertoire']['Row'];
type MasterRepertoire = Database['public']['Tables']['master_repertoire']['Row'];

// Add file attachment interface
interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  entityId: string;
  entityType: AttachmentEntityType;
  createdAt: string;
}

// Add link resource interface
interface LinkResource {
  id: string;
  title: string;
  url: string;
  entityId: string;
  entityType: AttachmentEntityType;
  createdAt: string;
}

// Add a new component for student repertoire actions
interface StudentRepertoireActionsProps {
  piece: RepertoireItemData;
  onStatusChange: (id: string, status: 'current' | 'completed') => void;
  onDelete: (id: string) => void;
}

const StudentRepertoireActions: React.FC<StudentRepertoireActionsProps> = ({ 
  piece, 
  onStatusChange,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {piece.status === 'current' ? (
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(piece.id, 'completed');
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Mark as Completed
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(piece.id, 'current');
              }}
            >
              <RotateCw className="mr-2 h-4 w-4 text-blue-500" />
              Mark as Current
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="text-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove from Student
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{piece.title}" from this student's repertoire? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onDelete(piece.id);
                setShowDeleteConfirm(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const RepertoirePage = () => {
  // State
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [repertoireList, setRepertoireList] = useState<RepertoireItemData[]>([]);
  const [activeStudent, setActiveStudent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'completed' | 'all'>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'title' | 'composer' | 'difficulty'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [displayMode, setDisplayMode] = useState<'cards' | 'grid' | 'table'>('table');
  const [viewMode, setViewMode] = useState<'list' | 'composer'>('list');
  
  // Dialog states
  const [isAddPieceDialogOpen, setIsAddPieceDialogOpen] = useState(false);
  const [isAssignPieceDialogOpen, setIsAssignPieceDialogOpen] = useState(false);
  const [isPieceDetailDialogOpen, setIsPieceDetailDialogOpen] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<RepertoireItemData | null>(null);
  
  // Supabase hooks for data
  const { data: supabaseStudents, isLoading: isLoadingStudents } = useStudents();
  const { data: masterRepertoireData, isLoading: isLoadingMasterRepertoire } = useMasterRepertoire();
  const { data: studentRepertoireData, isLoading: isLoadingStudentRepertoire } = useStudentRepertoire(
    activeStudent || undefined
  );
  
  // Mutation hooks for updating and deleting student repertoire
  const updateRepertoireMutation = useUpdateStudentRepertoire();
  const deleteRepertoireMutation = useDeleteStudentRepertoire();

  // For toast notifications
  const { toast } = useToast();
  
  // Helper functions to get pieces information for legacy data
  const getPieceTitle = (piece: RepertoirePiece | LegacyRepertoirePiece): string => {
    // For legacy pieces we might need to extract title from id
    if ('title' in piece) return piece.title;
    return piece.id.replace(ID_PREFIXES.PIECE, '').split('_').join(' ');
  };
  
  const getPieceComposer = (piece: RepertoirePiece | LegacyRepertoirePiece): string => {
    if ('composer' in piece) return piece.composer;
    return 'Unknown Composer';
  };
  
  // Update states when master repertoire data loads
  useEffect(() => {
    if (masterRepertoireData) {
      // Transform the master repertoire data to match the expected format
      const formattedRepertoire: RepertoireItemData[] = masterRepertoireData.map(piece => {
        // Map difficulty level to expected values
        let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
        if (piece.difficulty === 'beginner' || piece.difficulty === 'advanced') {
          difficulty = piece.difficulty as 'beginner' | 'advanced';
        }
        
  return {
          id: piece.id,
          title: piece.title,
          composer: piece.composer || 'Unknown',
          difficulty,
          startedDate: piece.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
        };
      });
      setRepertoireList(formattedRepertoire);
    }
  }, [masterRepertoireData]);

  // Update states when student data loads
  useEffect(() => {
    if (supabaseStudents) {
      // Transform Supabase students to match the expected format
      const formattedStudents: Student[] = supabaseStudents.map(student => ({
        id: student.id,
        name: student.name,
        avatarUrl: student.avatar_url || '',
        level: student.level || 'Intermediate',
        nextLesson: student.next_lesson || 'No upcoming lesson',
        unreadMessages: 0, // Default value
        currentRepertoire: [], // Will be populated from student repertoire data
        pastRepertoire: [], // Will be populated from student repertoire data
      }));
      setStudentsList(formattedStudents);
    }
  }, [supabaseStudents]);
  
  // Add debug log for studentRepertoireData
  useEffect(() => {
    if (activeStudent && studentRepertoireData) {
      console.log(`Student repertoire data for ${activeStudent}:`, studentRepertoireData);
    }
  }, [activeStudent, studentRepertoireData]);
  
  // Update the useEffect to better handle the student repertoire data
  useEffect(() => {
    if (activeStudent && studentRepertoireData && studentsList.length > 0) {
      // Find the active student in our list
      const studentIndex = studentsList.findIndex(s => s.id === activeStudent);
      if (studentIndex === -1) return;
      
      // Create updated student data with repertoire
      const updatedStudents = [...studentsList];
      const student = {...updatedStudents[studentIndex]};
      
      // Separate current and completed repertoire
      const currentRepertoire: RepertoirePiece[] = [];
      const pastRepertoire: RepertoirePiece[] = [];
      
      // Log how many pieces we're processing
      console.log(`Processing ${studentRepertoireData.length} pieces for student ${activeStudent}`);
      
      studentRepertoireData.forEach(item => {
        // Find master piece details from the master repertoire
        const masterPiece = repertoireList.find(mp => mp.id === item.master_piece_id);
        
        // Create the piece object with as much information as we have
        const piece: RepertoirePiece = {
          id: item.id,
          masterPieceId: item.master_piece_id,
          startDate: item.start_date || new Date().toISOString().split('T')[0],
          status: item.status as 'current' | 'completed',
          notes: item.notes || undefined,
          // Use master piece data if available
          title: masterPiece?.title,
          composer: masterPiece?.composer,
          // Track the data source
          _source: (item as any)._source
        };
        
        // Add end date if it exists
        if (item.end_date) {
          piece.endDate = item.end_date;
        }
        
        // Categorize by status
        if (item.status === 'current') {
          currentRepertoire.push(piece);
        } else if (item.status === 'completed') {
          pastRepertoire.push(piece);
        }
      });
      
      // Log repertoire counts
      console.log(`Found ${currentRepertoire.length} current pieces and ${pastRepertoire.length} completed pieces`);
      
      // Check if the current and past repertoire actually changed
      const currentStudent = studentsList[studentIndex];
      const currentRepertoireChanged = 
        currentRepertoire.length !== currentStudent.currentRepertoire.length ||
        JSON.stringify(currentRepertoire.map(p => p.id).sort()) !== 
        JSON.stringify(currentStudent.currentRepertoire.map(p => p.id).sort());
      
      const pastRepertoireChanged = 
        pastRepertoire.length !== currentStudent.pastRepertoire.length ||
        JSON.stringify(pastRepertoire.map(p => p.id).sort()) !== 
        JSON.stringify(currentStudent.pastRepertoire.map(p => p.id).sort());
      
      // Only update if there's an actual change to avoid infinite loops
      if (currentRepertoireChanged || pastRepertoireChanged) {
        // Update the student with repertoire data
        student.currentRepertoire = currentRepertoire;
        student.pastRepertoire = pastRepertoire;
        updatedStudents[studentIndex] = student;
        
        // Update the students list with the new data
        setStudentsList(updatedStudents);
      }
    }
  }, [activeStudent, studentRepertoireData, repertoireList, studentsList]);
  
  // Format composer name to Last name, First name
  const formatComposerName = (fullName: string): string => {
    if (!fullName) return '';
    
    // Handle special cases like "J.S. Bach" or "W.A. Mozart"
    if (fullName.includes('.')) {
      const parts = fullName.split(' ');
      // If we have initials and last name (like "J.S. Bach")
      if (parts.length >= 2) {
        const lastName = parts[parts.length - 1];
        const initials = parts.slice(0, parts.length - 1).join(' ');
        return `${lastName}, ${initials}`;
      }
      return fullName; // Fallback
    }
    
    // Handle regular names like "Ludwig van Beethoven" or "Claude Debussy"
    const parts = fullName.split(' ');
    if (parts.length === 1) return fullName; // Single name case
    
    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, parts.length - 1).join(' ');
    
    return `${lastName}, ${firstName}`;
  };
  
  // Get last name for sorting
  const getLastName = (fullName: string | undefined): string => {
    if (!fullName) return '';
    
    // Handle special cases with initials
    if (fullName.includes('.')) {
      const parts = fullName.split(' ');
      if (parts.length >= 2) {
        return parts[parts.length - 1].toLowerCase();
      }
      return fullName.toLowerCase();
    }
    
    // Regular names
    const parts = fullName.split(' ');
    if (parts.length === 1) return fullName.toLowerCase();
    
    return parts[parts.length - 1].toLowerCase();
  };
  
  // Handle sorting column headers
  const handleHeaderClick = (field: 'title' | 'composer' | 'difficulty') => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort repertoire based on active student, search query, and active tab
  const filteredRepertoire = useMemo(() => {
    let result = [...repertoireList];
    
    // If we have an active student, filter to show only their repertoire
    if (activeStudent) {
      const student = studentsList.find(s => s.id === activeStudent);
      if (!student) return [];
      
      // Get all repertoire pieces for this student
      const pieces: RepertoireItemData[] = [];
      
      // Process current pieces
      student.currentRepertoire.forEach(piece => {
        // Find the master piece data
        const masterPiece = repertoireList.find(mp => mp.id === piece.masterPieceId);
        
        // Create a valid piece with fallbacks for missing data
        pieces.push({
          id: piece.id,
          title: masterPiece?.title || getPieceTitle(piece) || 'Unknown Piece',
          composer: masterPiece?.composer || getPieceComposer(piece) || 'Unknown Composer',
          difficulty: masterPiece?.difficulty || 'intermediate',
          startedDate: piece.startDate,
          status: 'current',
          notes: piece.notes
        });
      });
      
      // Process completed pieces
      student.pastRepertoire.forEach(piece => {
        // Find the master piece data
        const masterPiece = repertoireList.find(mp => mp.id === piece.masterPieceId);
        
        // Create a valid piece with fallbacks for missing data
        pieces.push({
          id: piece.id,
          title: masterPiece?.title || getPieceTitle(piece) || 'Unknown Piece',
          composer: masterPiece?.composer || getPieceComposer(piece) || 'Unknown Composer',
          difficulty: masterPiece?.difficulty || 'intermediate',
          startedDate: piece.startDate,
          endDate: piece.endDate,
          status: 'completed',
          notes: piece.notes
        });
      });
      
      result = pieces;
      
      // Filter by tab
      if (activeTab !== 'all') {
        result = result.filter(item => item.status === activeTab);
      }
    }
      
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.title?.toLowerCase()?.includes(query) || 
        item.composer?.toLowerCase()?.includes(query)) ?? false
      );
    }
    
    // Filter out invalid items to prevent errors
    result = result.filter(item => item.title && item.composer);
    
    // Sort results
    if (sortField) {
      result.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortField) {
          case 'title':
            valueA = a.title?.toLowerCase() || '';
            valueB = b.title?.toLowerCase() || '';
            break;
          case 'composer':
            valueA = getLastName(a.composer);
            valueB = getLastName(b.composer);
            break;
          case 'difficulty':
            // Map difficulty to numeric value for sorting
            const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };
            valueA = difficultyMap[a.difficulty] || 2;
            valueB = difficultyMap[b.difficulty] || 2;
            break;
          default:
            return 0;
        }
        
        if (sortDirection === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      });
    }
    
    return result;
  }, [
    repertoireList, 
    activeStudent, 
    studentsList, 
    activeTab, 
    searchQuery, 
    sortField, 
    sortDirection,
    getPieceTitle,
    getPieceComposer,
    getLastName
  ]);
  
  // Group repertoire by composer (for composer view)
  const groupedRepertoire = useMemo(() => {
    const grouped: Record<string, RepertoireItemData[]> = {};
    
    filteredRepertoire.forEach(piece => {
      if (!grouped[piece.composer]) {
        grouped[piece.composer] = [];
      }
      grouped[piece.composer].push(piece);
    });
    
    return grouped;
  }, [filteredRepertoire]);
  
  // Handle adding a new piece to the master repertoire
  const handleAddPiece = (newPiece: { title: string; composer: string; difficulty: string; notes?: string }) => {
    // Create a new piece with a temporary ID (would be replaced by database ID)
    const piece: RepertoireItemData = {
      id: `temp-${Date.now()}`,
      title: newPiece.title,
      composer: newPiece.composer,
      difficulty: newPiece.difficulty as 'beginner' | 'intermediate' | 'advanced',
      startedDate: new Date().toISOString().split('T')[0],
      notes: newPiece.notes
    };
    
    // In a real implementation, we would call the useCreateMasterRepertoire hook here
    // For now, just update the local state
    setRepertoireList(prev => [...prev, piece]);
    
    toast({
      title: "Piece added",
      description: `${newPiece.title} has been added to the master repertoire.`,
    });
  };
  
  // Handle assigning a piece to a student
  const handleAssignPiece = (pieceId: string, studentId: string) => {
    // Find the piece and student
    const piece = repertoireList.find(p => p.id === pieceId);
    const student = studentsList.find(s => s.id === studentId);
    
    if (!piece || !student) return;
    
    // In a real implementation, we would call the useAssignRepertoire hook here
    // For now, update the local state
    const newPiece: RepertoirePiece = {
      id: `student-piece-${Date.now()}`,
      masterPieceId: pieceId,
      startDate: new Date().toISOString().split('T')[0],
      status: 'current'
    };
    
    setStudentsList(prev => 
      prev.map(s => 
        s.id === studentId
          ? { ...s, currentRepertoire: [...s.currentRepertoire, newPiece] }
          : s
      )
    );
    
    toast({
      title: "Piece assigned",
      description: `${piece.title} has been assigned to ${student.name}.`,
    });
  };
  
  // Handle opening piece details dialog
  const handleOpenPieceDetail = (piece: RepertoireItemData) => {
    // Navigate to piece details page using window.location for reliable navigation
    window.location.href = `/repertoire/${piece.id}`;
  };
  
  // Handler for changing repertoire status
  const handleStatusChange = (id: string, status: 'current' | 'completed') => {
    if (!activeStudent) return;
    
    // Find the piece to update
    const student = studentsList.find(s => s.id === activeStudent);
    if (!student) return;
    
    // Find the piece in the student's repertoire
    const allPieces = [...student.currentRepertoire, ...(student.pastRepertoire || [])];
    const piece = allPieces.find(p => p.id === id);
    if (!piece) return;
    
    // Prepare the update
    const updates: Partial<StudentRepertoire> = {
      status,
    };
    
    // If changing to completed, set the end date
    if (status === 'completed' && !piece.endDate) {
      updates.end_date = new Date().toISOString().split('T')[0];
    }
    
    // If changing to current, remove the end date
    if (status === 'current' && piece.endDate) {
      updates.end_date = null;
    }
    
    // Optimistic UI update
    const updatedStudents = [...studentsList];
    const studentIndex = updatedStudents.findIndex(s => s.id === activeStudent);
    
    if (studentIndex !== -1) {
      const student = {...updatedStudents[studentIndex]};
      
      if (status === 'completed' && piece.status === 'current') {
        // Move from current to completed
        const pieceIndex = student.currentRepertoire.findIndex(p => p.id === id);
        if (pieceIndex !== -1) {
          const updatedPiece = {...student.currentRepertoire[pieceIndex], status, endDate: updates.end_date};
          student.currentRepertoire.splice(pieceIndex, 1);
          student.pastRepertoire = [...(student.pastRepertoire || []), updatedPiece];
        }
      } else if (status === 'current' && piece.status === 'completed') {
        // Move from completed to current
        const pieceIndex = student.pastRepertoire?.findIndex(p => p.id === id) ?? -1;
        if (pieceIndex !== -1) {
          const updatedPiece = {...student.pastRepertoire![pieceIndex], status, endDate: undefined};
          student.pastRepertoire!.splice(pieceIndex, 1);
          student.currentRepertoire = [...student.currentRepertoire, updatedPiece];
        }
      }
      
      updatedStudents[studentIndex] = student;
      setStudentsList(updatedStudents);
    }
    
    // Update in the database
    updateRepertoireMutation.mutate({
      id,
      updates
    }, {
      onError: (error) => {
        console.error('Error updating repertoire status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update repertoire status',
          variant: 'destructive',
        });
      }
    });
  };
  
  // Handler for deleting a piece from student repertoire
  const handleDeleteRepertoire = (id: string) => {
    if (!activeStudent) return;
    
    // Optimistic UI update - find the piece in the studentsList and remove it
    const updatedStudents = [...studentsList];
    const studentIndex = updatedStudents.findIndex(s => s.id === activeStudent);
    
    if (studentIndex !== -1) {
      const student = {...updatedStudents[studentIndex]};
      
      // Try to find the piece in current repertoire first
      let pieceFound = false;
      let pieceTitle = "";
      
      // Check current repertoire
      const pieceIndexCurrent = student.currentRepertoire.findIndex(p => p.id === id);
      if (pieceIndexCurrent !== -1) {
        pieceTitle = repertoireList.find(p => p.id === student.currentRepertoire[pieceIndexCurrent].masterPieceId)?.title || "piece";
        student.currentRepertoire.splice(pieceIndexCurrent, 1);
        pieceFound = true;
      }
      
      // Check completed repertoire
      if (!pieceFound) {
        const pieceIndexCompleted = student.pastRepertoire.findIndex(p => p.id === id);
        if (pieceIndexCompleted !== -1) {
          pieceTitle = repertoireList.find(p => p.id === student.pastRepertoire[pieceIndexCompleted].masterPieceId)?.title || "piece";
          student.pastRepertoire.splice(pieceIndexCompleted, 1);
          pieceFound = true;
        }
      }
      
      if (pieceFound) {
        updatedStudents[studentIndex] = student;
        setStudentsList(updatedStudents);
      }
    }
    
    // Call the mutation
    deleteRepertoireMutation.mutate(
      id,
      {
        onSuccess: () => {
          toast({
            title: "Piece removed",
            description: "The piece has been removed from this student's repertoire.",
            variant: "default"
          });
        },
        onError: (error) => {
          toast({
            title: "Error removing piece",
            description: `${error}`,
            variant: "destructive"
          });
          
          // Revert the optimistic update
          // This would require refetching the data
          // But for simplicity, we'll just show an error message
        }
      }
    );
  };
  
  return (
      <div>
        <PageHeader 
          title="Repertoire" 
          description="Manage and track all repertoire pieces for students"
        >
            <Button onClick={() => setIsAddPieceDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Piece
            </Button>
        </PageHeader>
        
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 mt-6">
        {/* Sidebar */}
          <div className="w-full">
            <div className="p-4 border rounded-lg bg-card">
              <div className="space-y-2">
                <h3 className="text-md font-medium mb-3">Library</h3>
                
                <Button 
                  variant={activeStudent === null ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveStudent(null)}
                >
                  <Music className="mr-2 h-4 w-4" />
                  Master Repertoire
                </Button>
                
                <h4 className="text-sm font-medium mt-4 mb-2">Students</h4>
              
              {isLoadingStudents ? (
                // Show skeletons while loading
                Array(3).fill(0).map((_, i) => (
                  <div key={`skeleton-${i}`} className="w-full h-10 my-1">
                    <Skeleton className="h-full w-full" />
                  </div>
                ))
              ) : studentsList.length === 0 ? (
                // Show empty state if no students
                <div className="text-sm text-muted-foreground p-2">
                  No students found. Add students in the Students page.
                </div>
              ) : (
                // Show the list of students
                studentsList.map(student => (
                  <Button 
                    key={student.id} 
                    variant={activeStudent === student.id ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveStudent(student.id);
                      // Reset active tab when switching students
                      setActiveTab('current');
                    }}
                  >
                    {student.name}
                  </Button>
                ))
              )}
              </div>
            </div>
          </div>
        
        {/* Main content */}
          <div className="w-full">
          {/* Search bar and controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full md:w-80 mr-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search repertoire..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
            <div className="flex items-center gap-2">
              {!activeStudent ? (
                <Button variant="outline" size="sm" onClick={() => setIsAddPieceDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Piece
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsAssignPieceDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Assign Piece
                </Button>
              )}
              
              {/* View controls */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup 
                      value={displayMode} 
                      onValueChange={(value: string) => setDisplayMode(value as 'cards' | 'grid' | 'table')}
                    >
                      <DropdownMenuRadioItem value="cards">
                        <List className="mr-2 h-4 w-4" /> Card View
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="grid">
                        <Grid className="mr-2 h-4 w-4" /> Grid View
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="table">
                        <ListFilter className="mr-2 h-4 w-4" /> Table View
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                  
                  {!activeStudent && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuRadioGroup 
                          value={viewMode} 
                          onValueChange={(value: string) => setViewMode(value as 'list' | 'composer')}
                        >
                          <DropdownMenuRadioItem value="list">
                            <List className="mr-2 h-4 w-4" /> List View
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="composer">
                            <BookText className="mr-2 h-4 w-4" /> Group by Composer
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuGroup>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            </div>
            
          {/* Student tabs */}
          {activeStudent && (
            <Tabs value={activeTab} className="mb-6" onValueChange={(value: string) => {
              if (value === 'current' || value === 'completed' || value === 'all') {
                setActiveTab(value);
              }
            }}>
              <TabsList>
                  <TabsTrigger value="current">Current</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
            </Tabs>
          )}
          
          {/* Loading state */}
          {(isLoadingMasterRepertoire || (activeStudent && isLoadingStudentRepertoire)) ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={`skeleton-${i}`} className="w-full h-24" />
                        ))}
                      </div>
                    ) : (
            <>
              {/* No results state */}
              {filteredRepertoire.length === 0 ? (
                <div className="text-center p-10 border rounded-md">
                  <div className="text-muted-foreground mb-2">
                    {searchQuery ? 
                      `No results found for "${searchQuery}"` : 
                      activeStudent ? 
                        `No ${activeTab !== 'all' ? activeTab : ''} repertoire found for this student` :
                        'No repertoire found'
                    }
                  </div>
                  <Button
                    variant="outline" 
                    onClick={() => activeStudent ? setIsAssignPieceDialogOpen(true) : setIsAddPieceDialogOpen(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {activeStudent ? 'Assign Piece' : 'Add Piece'}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Group by Composer view */}
                  {!activeStudent && viewMode === 'composer' ? (
                    <div className="space-y-4">
                      <Accordion 
                        type="multiple" 
                        className="w-full space-y-4"
                        defaultValue={Object.keys(groupedRepertoire).map(composer => composer)}
                      >
                        {Object.entries(groupedRepertoire)
                          .sort(([composerA], [composerB]) => 
                            getLastName(composerA).localeCompare(getLastName(composerB))
                          )
                          .map(([composer, pieces]) => (
                            <AccordionItem 
                              key={composer} 
                              value={composer}
                              className="border rounded-md px-4 py-2"
                            >
                              <AccordionTrigger className="hover:no-underline py-2">
                                <div className="flex items-center justify-between w-full">
                                  <div className="font-medium text-left flex items-center">
                                    <Music className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {formatComposerName(composer)}
                                    <Badge className="ml-3" variant="outline">{pieces.length}</Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-2 pb-1">
                                {displayMode === 'table' && (
                                  <div className="rounded-md border">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead 
                                            className="cursor-pointer" 
                                            onClick={() => handleHeaderClick('title')}
                                          >
                                            Piece {sortField === 'title' && (
                                              sortDirection === 'asc' ? 
                                                <ChevronUp className="inline h-3 w-3" /> : 
                                                <ChevronDown className="inline h-3 w-3" />
                                            )}
                                          </TableHead>
                                          <TableHead></TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {pieces.map(item => (
                                          <TableRow 
                                            key={item.id} 
                                            className="cursor-pointer" 
                                            onClick={() => handleOpenPieceDetail(item)}
                                          >
                                            <TableCell className="font-medium">{item.title}</TableCell>
                                            <TableCell>
                                              {activeStudent ? (
                                                <StudentRepertoireActions 
                                                  piece={item}
                                                  onStatusChange={handleStatusChange}
                                                  onDelete={handleDeleteRepertoire}
                                                />
                                              ) : (
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenPieceDetail(item); 
                                                  }}
                                                >
                                                  <ChevronRight className="h-4 w-4" />
                                                </Button>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                                
                                {displayMode === 'grid' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                                    {pieces.map(item => (
                                      <Card 
                                        key={item.id} 
                                        className="cursor-pointer hover:border-primary transition-colors"
                                        onClick={() => handleOpenPieceDetail(item)}
                                      >
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-lg truncate">{item.title}</CardTitle>
                                        </CardHeader>
                                        <CardFooter>
                                          {activeStudent ? (
                                            <StudentRepertoireActions 
                                              piece={item}
                                              onStatusChange={handleStatusChange}
                                              onDelete={handleDeleteRepertoire}
                                            />
                                          ) : (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenPieceDetail(item); 
                                              }}
                                            >
                                              <ChevronRight className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </CardFooter>
                                      </Card>
                                    ))}
                                  </div>
                                )}
                                
                                {displayMode === 'cards' && (
                                  <div className="space-y-3 pt-2">
                                    {pieces.map(item => (
                                      <Card 
                                        key={item.id} 
                                        className="cursor-pointer hover:border-primary transition-colors"
                                        onClick={() => handleOpenPieceDetail(item)}
                                      >
                                        <CardContent className="p-4 flex items-center justify-between">
                                          <div>
                                            <div className="font-medium mb-1">{item.title}</div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {activeStudent ? (
                                              <StudentRepertoireActions 
                                                piece={item}
                                                onStatusChange={handleStatusChange}
                                                onDelete={handleDeleteRepertoire}
                                              />
                                            ) : (
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleOpenPieceDetail(item); 
                                                }}
                                              >
                                                <ChevronRight className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                      </Accordion>
                    </div>
                  ) : (
                    <>
                      {/* Table view */}
                      {displayMode === 'table' && (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead 
                                  className="cursor-pointer" 
                                  onClick={() => handleHeaderClick('title')}
                                >
                                  Piece {sortField === 'title' && (
                                    sortDirection === 'asc' ? 
                                      <ChevronUp className="inline h-3 w-3" /> : 
                                      <ChevronDown className="inline h-3 w-3" />
                                  )}
                                </TableHead>
                                <TableHead 
                                  className="cursor-pointer" 
                                  onClick={() => handleHeaderClick('composer')}
                                >
                                  Composer {sortField === 'composer' && (
                                    sortDirection === 'asc' ? 
                                      <ChevronUp className="inline h-3 w-3" /> : 
                                      <ChevronDown className="inline h-3 w-3" />
                                  )}
                                </TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredRepertoire.map(item => (
                                <TableRow 
                                  key={item.id} 
                                  className="cursor-pointer" 
                                  onClick={() => handleOpenPieceDetail(item)}
                                >
                                  <TableCell className="font-medium">{item.title}</TableCell>
                                  <TableCell>
                                    {formatComposerName(item.composer)}
                                  </TableCell>
                                  <TableCell>
                                    {activeStudent ? (
                                      <StudentRepertoireActions 
                                        piece={item}
                                        onStatusChange={handleStatusChange}
                                        onDelete={handleDeleteRepertoire}
                                      />
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenPieceDetail(item); 
                                        }}
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      
                      {/* Grid view */}
                      {displayMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {filteredRepertoire.map(item => (
                            <Card 
                              key={item.id} 
                              className="cursor-pointer hover:border-primary transition-colors"
                              onClick={() => handleOpenPieceDetail(item)}
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg truncate">{item.title}</CardTitle>
                                <CardDescription className="truncate">
                                  {!activeStudent && viewMode === 'composer' 
                                    ? formatComposerName(item.composer) 
                                    : item.composer
                                  }
                                </CardDescription>
                              </CardHeader>
                              <CardFooter>
                                {activeStudent ? (
                                  <StudentRepertoireActions 
                                    piece={item}
                                    onStatusChange={handleStatusChange}
                                    onDelete={handleDeleteRepertoire}
                                  />
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenPieceDetail(item); 
                                    }}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                )}
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                      
                      {/* Card view */}
                      {displayMode === 'cards' && (
                        <div className="space-y-3">
                          {filteredRepertoire.map(item => (
                            <Card 
                              key={item.id} 
                              className="cursor-pointer hover:border-primary transition-colors"
                                onClick={() => handleOpenPieceDetail(item)}
                              >
                              <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                  <div className="font-medium mb-1">{item.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {!activeStudent && viewMode === 'composer' 
                                      ? formatComposerName(item.composer) 
                                      : item.composer
                                    }
                              </div>
                              </div>
                                <div className="flex items-center gap-2">
                                  {activeStudent ? (
                                    <StudentRepertoireActions 
                                      piece={item}
                                      onStatusChange={handleStatusChange}
                                      onDelete={handleDeleteRepertoire}
                                    />
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenPieceDetail(item); 
                                      }}
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  )}
                            </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                    )}
                    </>
                  )}
                </>
              )}
            </>
            )}
        </div>
      </div>
      
      {/* Dialogs */}
      <AddPieceDialog 
        isOpen={isAddPieceDialogOpen}
        onClose={() => setIsAddPieceDialogOpen(false)}
        onAdd={handleAddPiece}
      />
      
      <AssignPieceDialog 
        isOpen={isAssignPieceDialogOpen}
        onClose={() => setIsAssignPieceDialogOpen(false)}
        repertoire={repertoireList}
        students={studentsList}
        onAssign={handleAssignPiece}
      />
      
      <PieceDetailDialog
        isOpen={isPieceDetailDialogOpen}
        onClose={() => setIsPieceDetailDialogOpen(false)}
        piece={selectedPiece}
        students={studentsList}
        repertoire={repertoireList}
      />
    </div>
  );
};

export default RepertoirePage;

// Dialog components
interface AddPieceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (piece: { title: string; composer: string; difficulty: string; notes?: string }) => void;
}

const AddPieceDialog = ({ isOpen, onClose, onAdd }: AddPieceDialogProps) => {
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!title || !composer) return;
    
    onAdd({
      title,
      composer,
      difficulty,
      notes: notes || undefined
    });
    
    // Reset form
    setTitle('');
    setComposer('');
    setDifficulty('intermediate');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Piece to Master Repertoire</DialogTitle>
          <DialogDescription>
            Add a new piece to your master repertoire library.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Piece Title</Label>
            <Input 
              id="title" 
              placeholder="Enter piece title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="composer">Composer</Label>
            <Input 
              id="composer" 
              placeholder="Enter composer name" 
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Add notes about this piece" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title || !composer}>Add Piece</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
interface AssignPieceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  repertoire: RepertoireItemData[];
  students: Student[];
  onAssign: (pieceId: string, studentId: string) => void;
}

const AssignPieceDialog = ({ isOpen, onClose, repertoire, students, onAssign }: AssignPieceDialogProps) => {
  const [selectedPieceId, setSelectedPieceId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reset selections when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPieceId('');
      setSelectedStudentId('');
      setSearchQuery('');
    }
  }, [isOpen]);
  
  // Filter repertoire by search query
  const filteredRepertoire = useMemo(() => {
    if (!searchQuery) return repertoire;
    
    const query = searchQuery.toLowerCase();
    return repertoire.filter(piece => 
      piece.title.toLowerCase().includes(query) || 
      piece.composer.toLowerCase().includes(query)
    );
  }, [repertoire, searchQuery]);
  
  const handleAssign = () => {
    if (!selectedPieceId || !selectedStudentId) return;
    
    onAssign(selectedPieceId, selectedStudentId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Piece to Student</DialogTitle>
          <DialogDescription>
            Select a piece from the repertoire to assign to a student.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="search">Search Repertoire</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="search" 
                placeholder="Search by title or composer" 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="border rounded-md max-h-[300px] overflow-y-auto">
            {filteredRepertoire.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No pieces found. Try a different search term.
              </div>
            ) : (
              <RadioGroup value={selectedPieceId} onValueChange={setSelectedPieceId}>
                {filteredRepertoire.map(piece => (
                  <div 
                    key={piece.id} 
                    className={cn(
                      "flex items-center p-3 space-x-2 border-b last:border-0 cursor-pointer hover:bg-accent",
                      selectedPieceId === piece.id && "bg-accent"
                    )}
                    onClick={() => setSelectedPieceId(piece.id)}
                  >
                    <RadioGroupItem value={piece.id} id={piece.id} className="mr-2" />
                    <div className="flex-1">
                      <div className="font-medium">{piece.title}</div>
                      <div className="text-sm text-muted-foreground">{piece.composer}</div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedPieceId || !selectedStudentId}
          >
            Assign Piece
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
interface PieceDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  piece: RepertoireItemData | null;
  students: Student[];
  repertoire: RepertoireItemData[];
}

const PieceDetailDialog = ({ isOpen, onClose, piece, students, repertoire }: PieceDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'students'>('details');
  const { toast } = useToast();
  
  // Reset active tab when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
    }
  }, [isOpen]);
  
  // Find students who have this piece assigned
  const studentsWithPiece = useMemo(() => {
    if (!piece) return [];
    
    return students.filter(student => {
      // Check if this piece is in current or past repertoire
      const inCurrent = student.currentRepertoire.some(p => 
        p.id === piece.id || p.masterPieceId === piece.id
      );
      
      const inPast = student.pastRepertoire.some(p => 
        p.id === piece.id || p.masterPieceId === piece.id
      );
      
      return inCurrent || inPast;
    });
  }, [piece, students]);
  
  // Handle piece status change (mark as completed, etc.)
  const handleStatusChange = (status: 'current' | 'completed') => {
    if (!piece) return;
    
    // In a real implementation, this would call a hook to update the database
    toast({
      title: "Status updated",
      description: `${piece.title} has been marked as ${status}.`,
    });
  };
  
  if (!piece) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{piece.title}</DialogTitle>
          <DialogDescription>
            {piece.composer}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value: string) => {
          if (value === 'details' || value === 'attachments' || value === 'students') {
            setActiveTab(value);
          }
        }}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Title</Label>
                <div className="font-medium">{piece.title}</div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Composer</Label>
                <div className="font-medium">{piece.composer}</div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <div className="font-medium capitalize">{piece.status || 'In Master Repertoire'}</div>
              </div>
              
              {piece.startedDate && (
                <div>
                  <Label className="text-sm text-muted-foreground">Started Date</Label>
                  <div className="font-medium">{piece.startedDate}</div>
                </div>
              )}
              
              {piece.endDate && (
                <div>
                  <Label className="text-sm text-muted-foreground">Completed Date</Label>
                  <div className="font-medium">{piece.endDate}</div>
                </div>
              )}
            </div>
            
            {piece.notes && (
              <div className="mt-4">
                <Label className="text-sm text-muted-foreground">Notes</Label>
                <div className="mt-1 text-sm whitespace-pre-wrap p-3 border rounded-md bg-muted/50">
                  {piece.notes}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 mt-6">
              {piece.status === 'current' ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange('completed')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Completed
                </Button>
              ) : piece.status === 'completed' ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStatusChange('current')}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Move to Current
                </Button>
              ) : null}
              
              <Button variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Assign to Student
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="attachments" className="py-4">
            <AttachmentManager 
              entityId={piece.id}
              entityType={AttachmentEntityType.PIECE}
              allowUpload={true}
              allowDelete={true}
              title="Piece Attachments"
            />
          </TabsContent>
          
          <TabsContent value="students" className="py-4">
            {studentsWithPiece.length === 0 ? (
              <div className="text-center p-6 border rounded-md bg-muted/50">
                <div className="text-muted-foreground mb-2">
                  This piece has not been assigned to any students yet.
                </div>
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Assign to Student
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {studentsWithPiece.map(student => (
                  <Card key={student.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={student.avatarUrl} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.currentRepertoire.some(p => p.id === piece.id || p.masterPieceId === piece.id) ? 
                              'Current Repertoire' : 'Completed Repertoire'}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};



