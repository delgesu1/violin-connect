import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Calendar, CheckCircle, Clock, Filter, LucideIcon, Menu, Music, PlusCircle, 
         ListFilter, Grid, User, Search, ChevronRight, ChevronLeft, Download, 
         ExternalLink, Trash, Trash2, Upload, BookMarked, Bookmark, File as FileIcon, 
         Paperclip, X, Youtube, LinkIcon, Plus, Eye, Share, RotateCw, FileArchive, 
         FileText, ChevronDown, ChevronUp, Users, Info, BookText, List, Check as CircleCheck } from 'lucide-react';
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
  DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Student, RepertoirePiece } from '@/components/common/StudentCard';
import RepertoireItem, { RepertoireItemData } from '@/components/common/RepertoireItem';
import { ID_PREFIXES, createPrefixedId, createStudentPieceId, getIdWithoutPrefix } from '@/lib/id-utils';
import { getMasterPieceById, getPieceDetails } from '@/lib/utils/repertoire-utils';
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

// Mock data
const students: Student[] = [
  {
    id: createPrefixedId(ID_PREFIXES.STUDENT, '1'),
    name: 'Emma Thompson',
    currentRepertoire: [
      { 
        id: createStudentPieceId('1', '1'), 
        masterPieceId: createPrefixedId(ID_PREFIXES.PIECE, '1'),
        startDate: '2023-10-01', 
        status: 'current', 
        notes: 'Working on Chaconne section' 
      },
      { 
        id: createStudentPieceId('1', '9'), 
        masterPieceId: createPrefixedId(ID_PREFIXES.PIECE, '9'),
        startDate: '2023-11-15', 
        status: 'current', 
        notes: 'Preparing for spring competition' 
      },
      { 
        id: createStudentPieceId('1', '19'), 
        masterPieceId: createPrefixedId(ID_PREFIXES.PIECE, '19'),
        startDate: '2024-01-10', 
        status: 'current' 
      }
    ],
    pastRepertoire: [
      { 
        id: createStudentPieceId('1', '6'), 
        masterPieceId: createPrefixedId(ID_PREFIXES.PIECE, '6'),
        startDate: '2023-05-10', 
        endDate: '2023-09-15', 
        status: 'completed', 
        notes: 'Performed at summer recital' 
      },
      { 
        id: createStudentPieceId('1', '15'), 
        masterPieceId: createPrefixedId(ID_PREFIXES.PIECE, '15'),
        startDate: '2023-01-15', 
        endDate: '2023-04-20', 
        status: 'completed' 
      },
      { 
        id: createStudentPieceId('1', '16'), 
        masterPieceId: createPrefixedId(ID_PREFIXES.PIECE, '16'),
        startDate: '2022-11-05', 
        endDate: '2023-02-10', 
        status: 'completed' 
      },
      { 
        id: createStudentPieceId('1', '7'), 
        masterPieceId: createPrefixedId(ID_PREFIXES.PIECE, '7'),
        startDate: '2022-08-15', 
        endDate: '2022-12-20', 
        status: 'completed', 
        notes: 'Performed with university orchestra' 
      }
    ],
    nextLesson: 'Today, 4:00 PM',
  },
  {
    id: createPrefixedId(ID_PREFIXES.STUDENT, '2'),
    name: 'James Wilson',
    currentRepertoire: [
      { id: createStudentPieceId('2', '4'), title: 'Caprice No. 24 in A minor', composer: 'N. Paganini', startDate: '2023-09-10', status: 'current', notes: 'Focus on variation techniques' },
      { id: createStudentPieceId('2', '11'), title: 'Violin Concerto in D major, Op. 77', composer: 'J. Brahms', startDate: '2023-10-05', status: 'current' }
    ],
    pastRepertoire: [
      { id: createStudentPieceId('2', '7'), title: 'Introduction and Rondo Capriccioso', composer: 'C. Saint-Saëns', startDate: '2023-03-15', endDate: '2023-08-20', status: 'completed' },
      { id: createStudentPieceId('2', '3'), title: 'Violin Concerto in D major, Op. 35', composer: 'P.I. Tchaikovsky', startDate: '2022-10-10', endDate: '2023-02-25', status: 'completed', notes: 'Performed with youth symphony' },
      { id: createStudentPieceId('2', '33'), title: 'Partita No. 3 in E major, BWV 1006', composer: 'J.S. Bach', startDate: '2022-06-15', endDate: '2022-11-30', status: 'completed' }
    ],
    nextLesson: 'Tomorrow, 3:30 PM',
  },
  {
    id: '3',
    name: 'Sophia Chen',
    currentRepertoire: [
      { id: '3-301', title: 'Violin Concerto in D major, Op. 35', composer: 'P.I. Tchaikovsky', startDate: '2023-09-05', status: 'current', notes: 'Working on first movement cadenza' },
      { id: '3-302', title: 'Caprice No. 5 in A minor', composer: 'N. Paganini', startDate: '2023-11-10', status: 'current' },
      { id: '3-303', title: 'Liebesleid', composer: 'F. Kreisler', startDate: '2023-12-15', status: 'current' }
    ],
    pastRepertoire: [
      { id: '3-304', title: 'Violin Sonata K.304 in E minor', composer: 'W.A. Mozart', startDate: '2023-04-20', endDate: '2023-08-30', status: 'completed' },
      { id: '3-305', title: 'The Four Seasons - Summer', composer: 'A. Vivaldi', startDate: '2023-01-05', endDate: '2023-04-15', status: 'completed', notes: 'Summer festival performance' },
      { id: '3-306', title: 'Meditation from Thaïs', composer: 'J. Massenet', startDate: '2022-09-15', endDate: '2022-12-20', status: 'completed' }
    ],
    nextLesson: 'Friday, 5:00 PM',
  },
  {
    id: '4',
    name: 'Michael Brown',
    currentRepertoire: [
      { id: '4-401', title: 'Violin Sonata K.304 in E minor', composer: 'W.A. Mozart', startDate: '2023-09-20', status: 'current', notes: 'Working on second movement' },
      { id: '4-402', title: 'Schön Rosmarin', composer: 'F. Kreisler', startDate: '2023-11-05', status: 'current' }
    ],
    pastRepertoire: [
      { id: '4-403', title: 'Violin Concerto No. 3 in B minor, Op. 61', composer: 'C. Saint-Saëns', startDate: '2023-06-15', endDate: '2023-09-10', status: 'completed', notes: 'Performed at fall showcase' },
      { id: '4-404', title: 'The Four Seasons - Autumn', composer: 'A. Vivaldi', startDate: '2023-03-10', endDate: '2023-06-05', status: 'completed' },
      { id: '4-405', title: 'Carmen Fantasy, Op. 25', composer: 'P. de Sarasate', startDate: '2022-11-20', endDate: '2023-03-01', status: 'completed' }
    ],
    nextLesson: 'Next Monday, 4:30 PM',
  },
  {
    id: '5',
    name: 'Olivia Martinez',
    currentRepertoire: [
      { id: '5-501', title: 'Violin Concerto in E minor, Op. 64', composer: 'F. Mendelssohn', startDate: '2023-10-15', status: 'current', notes: 'Preparing for conservatory audition' },
      { id: '5-502', title: 'Partita No. 2 in D minor, BWV 1004', composer: 'J.S. Bach', startDate: '2023-12-01', status: 'current' }
    ],
    pastRepertoire: [
      { id: '5-503', title: 'Violin Concerto No. 1 in G minor, Op. 26', composer: 'M. Bruch', startDate: '2023-05-20', endDate: '2023-09-25', status: 'completed', notes: 'Regional competition winner' },
      { id: '5-504', title: 'Introduction and Rondo Capriccioso', composer: 'C. Saint-Saëns', startDate: '2023-01-10', endDate: '2023-05-15', status: 'completed' },
      { id: '5-505', title: 'Violin Sonata No. 9 (Kreutzer)', composer: 'L.V. Beethoven', startDate: '2022-08-15', endDate: '2022-12-20', status: 'completed', notes: 'Winter recital performance' }
    ],
    nextLesson: 'Thursday, 5:30 PM',
  },
  {
    id: '6',
    name: 'Daniel Kim',
    currentRepertoire: [
      { id: '6-601', title: 'Violin Concerto in D minor, Op. 47', composer: 'J. Sibelius', startDate: '2023-11-01', status: 'current', notes: 'Working on first movement' },
      { id: '6-602', title: 'Caprice No. 24 in A minor', composer: 'N. Paganini', startDate: '2023-09-15', status: 'current' }
    ],
    pastRepertoire: [
      { id: '6-603', title: 'Tzigane', composer: 'M. Ravel', startDate: '2023-06-10', endDate: '2023-10-25', status: 'completed', notes: 'Summer intensive final performance' },
      { id: '6-604', title: 'Violin Concerto in D major, Op. 35', composer: 'P.I. Tchaikovsky', startDate: '2022-12-15', endDate: '2023-05-30', status: 'completed' },
      { id: '6-605', title: 'Violin Sonata in G minor, L. 140', composer: 'C. Debussy', startDate: '2022-09-10', endDate: '2022-12-05', status: 'completed' }
    ],
    nextLesson: 'Wednesday, 6:00 PM',
  }
];

// Master repertoire list with a larger selection of pieces - removed status property
const masterRepertoire: RepertoireItemData[] = [
  // Bach
  {
    id: createPrefixedId(ID_PREFIXES.PIECE, '1'),
    title: 'Partita No. 2 in D minor, BWV 1004',
    composer: 'J.S. Bach',
    startedDate: '2023-10-15',
    difficulty: 'advanced'
  },
  {
    id: createPrefixedId(ID_PREFIXES.PIECE, '2'),
    title: 'Sonata No. 1 in G minor, BWV 1001',
    composer: 'J.S. Bach',
    startedDate: '2023-07-10',
    difficulty: 'advanced'
  },
  {
    id: createPrefixedId(ID_PREFIXES.PIECE, '10'),
    title: 'Violin Concerto in A minor, BWV 1041',
    composer: 'J.S. Bach',
    startedDate: '2023-11-01',
    difficulty: 'intermediate'
  },
  {
    id: '33',
    title: 'Partita No. 3 in E major, BWV 1006',
    composer: 'J.S. Bach',
    startedDate: '2022-09-15',
    difficulty: 'advanced'
  },
  {
    id: '34',
    title: 'Sonata No. 2 in A minor, BWV 1003',
    composer: 'J.S. Bach',
    startedDate: '2022-06-20',
    difficulty: 'advanced'
  },
  
  // Tchaikovsky
  {
    id: '3',
    title: 'Violin Concerto in D major, Op. 35',
    composer: 'P.I. Tchaikovsky',
    startedDate: '2023-08-01',
    difficulty: 'advanced'
  },
  {
    id: '35',
    title: 'Sérénade mélancolique, Op. 26',
    composer: 'P.I. Tchaikovsky',
    startedDate: '2023-01-15',
    difficulty: 'advanced'
  },
  {
    id: '36',
    title: 'Valse-Scherzo, Op. 34',
    composer: 'P.I. Tchaikovsky',
    startedDate: '2022-11-10',
    difficulty: 'advanced'
  },
  
  // Paganini
  {
    id: '4',
    title: 'Caprice No. 24 in A minor',
    composer: 'N. Paganini',
    startedDate: '2023-09-12',
    difficulty: 'advanced'
  },
  {
    id: '37',
    title: 'Caprice No. 5 in A minor',
    composer: 'N. Paganini',
    startedDate: '2023-03-05',
    difficulty: 'advanced'
  },
  {
    id: '38',
    title: 'Violin Concerto No. 1 in D major, Op. 6',
    composer: 'N. Paganini',
    startedDate: '2022-10-30',
    difficulty: 'advanced'
  },
  
  // Mozart
  {
    id: '5',
    title: 'Violin Sonata K.304 in E minor',
    composer: 'W.A. Mozart',
    startedDate: '2023-07-20',
    difficulty: 'intermediate'
  },
  {
    id: '39',
    title: 'Violin Concerto No. 5 in A major, K.219',
    composer: 'W.A. Mozart',
    startedDate: '2023-04-12',
    difficulty: 'intermediate'
  },
  {
    id: '40',
    title: 'Violin Sonata K.301 in G major',
    composer: 'W.A. Mozart',
    startedDate: '2022-08-15',
    difficulty: 'intermediate'
  },
  
  // Beethoven
  {
    id: '6',
    title: 'Violin Sonata No. 5 in F major (Spring)',
    composer: 'L.V. Beethoven',
    startedDate: '2023-05-10',
    difficulty: 'intermediate'
  },
  {
    id: '14',
    title: 'Violin Sonata No. 9 (Kreutzer)',
    composer: 'L.V. Beethoven',
    startedDate: '2023-01-15',
    difficulty: 'advanced'
  },
  {
    id: '41',
    title: 'Violin Concerto in D major, Op. 61',
    composer: 'L.V. Beethoven',
    startedDate: '2023-02-28',
    difficulty: 'advanced'
  },
  
  // Saint-Saëns
  {
    id: '7',
    title: 'Introduction and Rondo Capriccioso',
    composer: 'C. Saint-Saëns',
    startedDate: '2023-03-15',
    difficulty: 'advanced'
  },
  {
    id: '8',
    title: 'Violin Concerto No. 3 in B minor, Op. 61',
    composer: 'C. Saint-Saëns',
    startedDate: '2023-06-15',
    difficulty: 'advanced'
  },
  {
    id: '42',
    title: 'Havanaise, Op. 83',
    composer: 'C. Saint-Saëns',
    startedDate: '2022-12-10',
    difficulty: 'advanced'
  },
  
  // Mendelssohn
  {
    id: '9',
    title: 'Violin Concerto in E minor, Op. 64',
    composer: 'F. Mendelssohn',
    startedDate: '2023-04-20',
    difficulty: 'advanced'
  },
  
  // Brahms
  {
    id: '11',
    title: 'Violin Concerto in D major, Op. 77',
    composer: 'J. Brahms',
    startedDate: '2023-05-30',
    difficulty: 'advanced'
  },
  {
    id: '43',
    title: 'Violin Sonata No. 1 in G major, Op. 78',
    composer: 'J. Brahms',
    startedDate: '2022-09-05',
    difficulty: 'advanced'
  },
  
  // Sarasate
  {
    id: '12',
    title: 'Zigeunerweisen, Op. 20',
    composer: 'P. de Sarasate',
    startedDate: '2023-08-15',
    difficulty: 'advanced'
  },
  {
    id: '44',
    title: 'Carmen Fantasy, Op. 25',
    composer: 'P. de Sarasate',
    startedDate: '2022-11-20',
    difficulty: 'advanced'
  },
  
  // Bruch
  {
    id: '13',
    title: 'Violin Concerto No. 1 in G minor, Op. 26',
    composer: 'M. Bruch',
    startedDate: '2023-09-01',
    difficulty: 'advanced'
  },
  
  // Vivaldi
  {
    id: '15',
    title: 'The Four Seasons - Spring',
    composer: 'A. Vivaldi',
    startedDate: '2023-02-10',
    difficulty: 'intermediate'
  },
  {
    id: '45',
    title: 'The Four Seasons - Summer',
    composer: 'A. Vivaldi',
    startedDate: '2023-03-15',
    difficulty: 'intermediate'
  },
  {
    id: '46',
    title: 'The Four Seasons - Autumn',
    composer: 'A. Vivaldi',
    startedDate: '2023-04-20',
    difficulty: 'intermediate'
  },
  {
    id: '47',
    title: 'The Four Seasons - Winter',
    composer: 'A. Vivaldi',
    startedDate: '2023-05-25',
    difficulty: 'intermediate'
  },
  
  // Massenet
  {
    id: '16',
    title: 'Meditation from Thaïs',
    composer: 'J. Massenet',
    startedDate: '2023-03-01',
    difficulty: 'intermediate'
  },
  
  // Lalo
  {
    id: '17',
    title: 'Symphonie Espagnole',
    composer: 'É. Lalo',
    startedDate: '2023-10-01',
    difficulty: 'advanced'
  },
  
  // Kreisler
  {
    id: '18',
    title: 'Schön Rosmarin',
    composer: 'F. Kreisler',
    startedDate: '2023-09-15',
    difficulty: 'intermediate'
  },
  {
    id: '48',
    title: 'Liebesleid',
    composer: 'F. Kreisler',
    startedDate: '2022-12-05',
    difficulty: 'intermediate'
  },
  {
    id: '49',
    title: 'Caprice Viennois, Op. 2',
    composer: 'F. Kreisler',
    startedDate: '2023-01-20',
    difficulty: 'intermediate'
  },
  
  // Ravel
  {
    id: '19',
    title: 'Tzigane',
    composer: 'M. Ravel',
    startedDate: '2023-10-20',
    difficulty: 'advanced'
  },
  
  // Wieniawski
  {
    id: '20',
    title: 'Violin Concerto No. 2 in D minor, Op. 22',
    composer: 'H. Wieniawski',
    startedDate: '2023-08-25',
    difficulty: 'advanced'
  },
  {
    id: '50',
    title: 'Polonaise Brillante No. 1 in D major, Op. 4',
    composer: 'H. Wieniawski',
    startedDate: '2022-10-10',
    difficulty: 'advanced'
  },
  
  // Sibelius
  {
    id: '51',
    title: 'Violin Concerto in D minor, Op. 47',
    composer: 'J. Sibelius',
    startedDate: '2023-01-05',
    difficulty: 'advanced'
  },
  
  // Dvorak
  {
    id: '52',
    title: 'Violin Concerto in A minor, Op. 53',
    composer: 'A. Dvorak',
    startedDate: '2022-11-15',
    difficulty: 'advanced'
  },
  
  // Bartók
  {
    id: '53',
    title: 'Violin Concerto No. 2, Sz. 112',
    composer: 'B. Bartók',
    startedDate: '2023-02-10',
    difficulty: 'advanced'
  },
  
  // Elgar
  {
    id: '54',
    title: 'Violin Concerto in B minor, Op. 61',
    composer: 'E. Elgar',
    startedDate: '2022-09-20',
    difficulty: 'advanced'
  },
  
  // Debussy
  {
    id: '55',
    title: 'Violin Sonata in G minor, L. 140',
    composer: 'C. Debussy',
    startedDate: '2023-03-10',
    difficulty: 'advanced'
  }
];

// Add this interface to track file attachments
interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: string;
  uploadedBy?: string;
}

// Interface for Link resources
interface LinkResource {
  id: string;
  title: string;
  url: string;
  type: 'youtube' | 'article' | 'other';
  description?: string;
  thumbnailUrl?: string;
  addedDate: string;
}

// The original mock data is being replaced by our unified attachment system
// We're keeping these empty objects for compatibility with old code
const mockFileAttachments: Record<string, FileAttachment[]> = {};
const mockLinkResources: Record<string, LinkResource[]> = {};

interface AddPieceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (piece: { id: string; title: string; composer: string; difficulty: string; notes?: string }) => void;
}

const AddPieceDialog: React.FC<AddPieceDialogProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onAdd({
      id: createPrefixedId(ID_PREFIXES.PIECE, Date.now().toString()),
      title,
      composer,
      difficulty,
      notes
    });
    setTitle('');
    setComposer('');
    setDifficulty('intermediate');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Repertoire Piece</DialogTitle>
          <DialogDescription>
            Add a new piece to your master repertoire list.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Violin Concerto in D major"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="composer">Composer</Label>
            <Input 
              id="composer" 
              value={composer} 
              onChange={(e) => setComposer(e.target.value)} 
              placeholder="e.g. W.A. Mozart"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Add any notes about this piece..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Piece</Button>
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

const AssignPieceDialog: React.FC<AssignPieceDialogProps> = ({ 
  isOpen, 
  onClose, 
  repertoire, 
  students, 
  onAssign 
}) => {
  const [selectedPieceId, setSelectedPieceId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const handleSubmit = () => {
    if (selectedPieceId && selectedStudentId) {
      onAssign(selectedPieceId, selectedStudentId);
      setSelectedPieceId('');
      setSelectedStudentId('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Piece to Student</DialogTitle>
          <DialogDescription>
            Assign a piece from your repertoire to a student.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="piece">Piece</Label>
            <Select value={selectedPieceId} onValueChange={setSelectedPieceId}>
              <SelectTrigger id="piece">
                <SelectValue placeholder="Select a piece" />
              </SelectTrigger>
              <SelectContent>
                {repertoire.map(piece => (
                  <SelectItem key={piece.id} value={piece.id}>
                    {piece.title} - {piece.composer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="student">Student</Label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger id="student">
                <SelectValue placeholder="Select a student" />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
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
  repertoire?: RepertoireItemData[];
}

const PieceDetailDialog: React.FC<PieceDetailDialogProps> = ({ 
  isOpen, 
  onClose, 
  piece, 
  students, 
  repertoire 
}) => {
  // Early return if not open or no piece
  if (!isOpen || !piece) return null;
  
  // State for previewing files
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
  // State for file to be deleted
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);
  // State for file upload
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  
  // Does this piece have a masterPieceId (is it a student piece)?
  // Enhanced detection of masterPieceId with debug logging
  const hasMasterPieceId = 'masterPieceId' in piece && typeof (piece as any).masterPieceId === 'string';
  const masterPieceId = hasMasterPieceId ? (piece as any).masterPieceId : null;
  
  console.log('Piece Detail Dialog - Opening piece:', {
    id: piece.id,
    title: piece.title,
    composer: piece.composer,
    hasStudentId: 'studentId' in piece,
    hasMasterPieceId: hasMasterPieceId,
    masterPieceId: masterPieceId,
    studentId: 'studentId' in piece ? (piece as any).studentId : 'none'
  });
  
  // Helper function to normalize titles for comparison
  const normalizeTitle = useMemo(() => {
    const normalize = (title: string) => {
      return title.toLowerCase().replace(/\s+/g, ' ').trim();
    };
    return normalize;
  }, []);
  
  // Get files for this piece using the new attachment system
  const filesForPiece = useMemo(() => {
    // For student pieces, try the masterPieceId first
    if (hasMasterPieceId && masterPieceId) {
      console.log(`Attempting to get files using masterPieceId: ${masterPieceId}`);
      const files = getLegacyFileAttachments(masterPieceId);
      console.log(`Found ${files.length} files using masterPieceId`);
      
      // If we found files, return them
      if (files.length > 0) {
        return files;
      }
      
      // If no files found with masterPieceId, try using just the numeric part
      if (masterPieceId.includes('-')) {
        const numericId = masterPieceId.split('-')[1];
        console.log(`Trying numeric-only master ID: ${numericId}`);
        const filesWithNumericId = getLegacyFileAttachments(numericId);
        console.log(`Found ${filesWithNumericId.length} files using numeric masterPieceId`);
        
        if (filesWithNumericId.length > 0) {
          return filesWithNumericId;
        }
      }
    }
    
    // Try with the piece's own ID as fallback
    console.log(`Fallback: getting files using piece ID: ${piece.id}`);
    return getLegacyFileAttachments(piece.id);
  }, [piece, hasMasterPieceId, masterPieceId]);
  
  // Get links for this piece using the new attachment system
  const linksForPiece = useMemo(() => {
    // For student pieces, try the masterPieceId first
    if (hasMasterPieceId && masterPieceId) {
      console.log(`Attempting to get links using masterPieceId: ${masterPieceId}`);
      const links = getLegacyLinkResources(masterPieceId);
      console.log(`Found ${links.length} links using masterPieceId`);
      
      // If we found links, return them
      if (links.length > 0) {
        return links;
      }
      
      // If no links found with masterPieceId, try using just the numeric part
      if (masterPieceId.includes('-')) {
        const numericId = masterPieceId.split('-')[1];
        console.log(`Trying numeric-only master ID: ${numericId}`);
        const linksWithNumericId = getLegacyLinkResources(numericId);
        console.log(`Found ${linksWithNumericId.length} links using numeric masterPieceId`);
        
        if (linksWithNumericId.length > 0) {
          return linksWithNumericId;
        }
      }
    }
    
    // Try with the piece's own ID as fallback
    console.log(`Fallback: getting links using piece ID: ${piece.id}`);
    return getLegacyLinkResources(piece.id);
  }, [piece, hasMasterPieceId, masterPieceId]);
  
  // Additional debug information to help troubleshoot empty files/links
  useEffect(() => {
    if (filesForPiece.length === 0 && linksForPiece.length === 0) {
      console.warn(`Warning: No files or links found for ${piece.title} (ID: ${piece.id})`);
      
      if (hasMasterPieceId) {
        console.warn(`This is a student piece with masterPieceId: ${masterPieceId}`);
        
        // Try to look up the master piece to confirm it exists
        const masterPiece = repertoire?.find(p => p.id === masterPieceId);
        console.warn(`Master piece found in repertoire: ${!!masterPiece}`);
        
        // Try multiple ID formats for debugging
        ['4', 'p-4', '4'].forEach(testId => {
          const testFiles = getLegacyFileAttachments(testId);
          console.log(`Test ID "${testId}" has ${testFiles.length} files`);
        });
      }
    }
  }, [piece, filesForPiece, linksForPiece, hasMasterPieceId, masterPieceId, repertoire]);
  
  // Helper for piece similarity checking - wrapped in useCallback
  const isPieceSimilar = useCallback((
    pieceA: RepertoirePiece | string, 
    pieceB: RepertoireItemData | string, 
    composerA?: string, 
    composerB?: string, 
    masterRepertoire: RepertoireItemData[] = []
  ): boolean => {
    // Get title strings
    let titleA: string, titleB: string, compA: string | undefined, compB: string | undefined;
    
    // Handle case where pieceA is a RepertoirePiece object
    if (typeof pieceA !== 'string') {
      // Try to get from masterPieceId first
      if (pieceA.masterPieceId) {
        const masterPiece = getMasterPieceById(pieceA.masterPieceId, masterRepertoire);
        if (masterPiece) {
          titleA = masterPiece.title;
          compA = masterPiece.composer;
        } else {
          titleA = pieceA.title || '';
          compA = pieceA.composer;
        }
      } else {
        titleA = pieceA.title || '';
        compA = pieceA.composer;
      }
    } else {
      titleA = pieceA;
      compA = composerA;
    }
    
    // Handle case where pieceB is a RepertoireItemData object
    if (typeof pieceB !== 'string') {
      titleB = pieceB.title;
      compB = pieceB.composer;
    } else {
      titleB = pieceB;
      compB = composerB;
    }
    
    // Use the normalizePieceTitle function directly
    const normalizedPieceTitle = normalizeTitle;
    
    // Normalize both titles
    const normalizedA = normalizedPieceTitle(titleA);
    const normalizedB = normalizedPieceTitle(titleB);
    
    // Exact match after normalization
    if (normalizedA === normalizedB) return true;
    
    // Check for catalog numbers (K.304, BWV 1006, Op. 35, etc.)
    const catalogRegex = /\b(k\.\s*\d+|bwv\s*\d+|op\.\s*\d+)/i;
    const catalogA = normalizedA.match(catalogRegex);
    const catalogB = normalizedB.match(catalogRegex);
    
    if (catalogA && catalogB && catalogA[0].toLowerCase() === catalogB[0].toLowerCase()) {
      // If catalog numbers match and composers match (when both are present), it's likely the same piece
      if (compA && compB) {
        return compA.toLowerCase().includes(compB.toLowerCase()) || 
              compB.toLowerCase().includes(compA.toLowerCase());
      }
      // If catalog numbers match but we don't have complete composer info, assume it's the same piece
      return true;
    }
    
    // If no catalog numbers but we have composers and one title is contained in the other
    if (compA && compB && 
        (compA.toLowerCase().includes(compB.toLowerCase()) || 
        compB.toLowerCase().includes(compA.toLowerCase()))) {
      return normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA);
    }
    
    // More aggressive matching when titles are very similar
    const similarity = (a: string, b: string) => {
      const longer = a.length > b.length ? a : b;
      const shorter = a.length > b.length ? b : a;
      
      // Don't bother with very short strings or large length differences
      if (shorter.length < 5 || longer.length > shorter.length * 2) return 0;
      
      // Count matching characters
      let matches = 0;
      for (let i = 0; i < shorter.length; i++) {
        if (longer.includes(shorter[i])) matches++;
      }
      
      return matches / longer.length;
    };
    
    // If titles are at least 80% similar, consider them the same
    const titleSimilarity = similarity(normalizedA, normalizedB);
    if (titleSimilarity > 0.8) return true;
    
    return false;
  }, [normalizeTitle, getMasterPieceById]);
  
  // Memoize the pieceInstances calculation
  const pieceInstances = useMemo(() => {
    if (!piece) return [];
    
    const instances: Array<{
      studentId: string;
      studentName: string;
      status: 'current' | 'completed' | 'planned';
      startDate: string;
      endDate?: string;
      notes?: string;
      pieceTitle: string;
    }> = [];
    
    students.forEach(student => {
      // Check current repertoire
      student.currentRepertoire.forEach(p => {
        if (isPieceSimilar(p, piece, undefined, undefined, repertoire)) {
          instances.push({
            studentId: student.id,
            studentName: student.name,
            status: p.status,
            startDate: p.startDate,
            endDate: undefined, // Current pieces don't have end dates
            notes: p.notes,
            pieceTitle: p.title || (p.masterPieceId ? getMasterPieceById(p.masterPieceId, repertoire)?.title || '' : '')
          });
        }
      });
      
      // Check past repertoire
      student.pastRepertoire?.forEach(p => {
        if (isPieceSimilar(p, piece, undefined, undefined, repertoire)) {
          instances.push({
            studentId: student.id,
            studentName: student.name,
            status: p.status,
            startDate: p.startDate,
            endDate: p.endDate, // Add end date for completed pieces
            notes: p.notes,
            pieceTitle: p.title || (p.masterPieceId ? getMasterPieceById(p.masterPieceId, repertoire)?.title || '' : '')
          });
        }
      });
    });
    
    // Remove duplicates (in case the same student has the same piece listed multiple times)
    const uniqueInstances = instances.reduce((acc, current) => {
      const isDuplicate = acc.some(item => 
        item.studentId === current.studentId && 
        item.status === current.status && 
        item.startDate === current.startDate
      );
      
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, [] as typeof instances);
    
    // Sort instances by status (current first) then by start date (newest first)
    uniqueInstances.sort((a, b) => {
      // First sort by status (current before completed)
      if (a.status !== b.status) {
        return a.status === 'current' ? -1 : 1;
      }
      
      // Then sort by start date (newest first)
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });
    
    return uniqueInstances;
  }, [piece, students, repertoire, isPieceSimilar, getMasterPieceById]);
  
  // Calculate statistics
  const totalStudents = pieceInstances.length;
  const currentStudents = pieceInstances.filter(i => i.status === 'current').length;
  const completedStudents = pieceInstances.filter(i => i.status === 'completed').length;
  
  // Calculate average completion time (only for completed pieces with both dates)
  const completedWithDates = pieceInstances.filter(i => i.status === 'completed' && i.startDate && i.endDate);
  let averageCompletionDays = 0;
  
  if (completedWithDates.length > 0) {
    const totalDays = completedWithDates.reduce((sum, instance) => {
      const start = new Date(instance.startDate);
      const end = new Date(instance.endDate!);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    averageCompletionDays = Math.round(totalDays / completedWithDates.length);
  }
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handler for uploading files
  const handleFileUpload = useCallback((file: File) => {
    setUploadingFile(true);
    
    // Simulate file upload delay
    setTimeout(() => {
      try {
        // Determine which ID to use for the attachment
        const targetId = masterPieceId || piece.id;
        
        // Create a URL for the file (in a real app, this would be an uploaded file URL)
        const fileUrl = URL.createObjectURL(file);
        
        // Add the file attachment
        addFileAttachment(
          AttachmentEntityType.PIECE, 
          targetId, 
          { 
            name: file.name, 
            type: file.type, 
            size: file.size, 
            url: fileUrl 
          }
        );
        
        // Hide the upload area
        setShowUploadArea(false);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setUploadingFile(false);
      }
    }, 1000); // Simulate 1 second upload delay
  }, [piece, masterPieceId]);
  
  // Handler for deleting files
  const handleDeleteFile = useCallback((fileId: string, fileName: string) => {
    setFileToDelete({ id: fileId, name: fileName });
  }, []);
  
  // Handler for confirming file deletion
  const handleConfirmDelete = useCallback(() => {
    if (fileToDelete) {
      deleteFileAttachment(fileToDelete.id);
      setFileToDelete(null);
    }
  }, [fileToDelete]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[calc(100vh-40px)] overflow-y-auto my-5">
        <DialogHeader>
          <DialogTitle className="text-xl">{piece.title}</DialogTitle>
          <DialogDescription className="text-base">
            by {piece.composer} • {piece.difficulty} difficulty
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
        {/* Files Section */}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-lg">Files</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => setShowUploadArea(prev => !prev)}
            >
              <Upload className="h-3.5 w-3.5" />
              {showUploadArea ? 'Cancel' : 'Upload'}
            </Button>
          </div>
          
          {/* File upload area */}
          {showUploadArea && (
            <div className="mb-4">
              <FileUpload
                onFileSelect={handleFileUpload}
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png,image/gif,audio/mpeg,audio/wav"
                maxSize={20 * 1024 * 1024} // 20MB
                uploading={uploadingFile}
              />
            </div>
          )}
          
          {/* Files list */}
          {filesForPiece.length > 0 ? (
            <div className="space-y-2">
              {filesForPiece.map(file => (
                <div key={file.id} className="flex items-center p-3 border rounded-md hover:bg-accent/5 transition-colors duration-200">
                  <div className="mr-3 shrink-0">
                    <FileText className="h-9 w-9 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        Uploaded {file.uploadDate}
                      </p>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7" 
                                onClick={() => setPreviewFile(file)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Preview</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => window.open(file.url, '_blank')}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Download</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteFile(file.id, file.name)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-muted/20 rounded-md">
              <p>No files available for this piece.</p>
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        {/* Links section */}
        <div className="mt-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-lg">Links</h3>
            </div>
          </div>
          
          {linksForPiece.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {linksForPiece.map((link) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col h-full border rounded-lg overflow-hidden hover:border-primary transition-all duration-200 hover:shadow-sm"
                >
                  {link.type === 'youtube' && (
                    <div className="relative aspect-video overflow-hidden group rounded-t-lg">
                      {/* Standardized elegant graphic instead of external images */}
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20">
                          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="0.5" />
                            <path d="M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="0.5" opacity="0.5" />
                          </svg>
              </div>
                        
                        {/* Video title as subtle text overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-[10px] text-white opacity-90 font-medium truncate">{link.title}</p>
                  </div>
                        
                        {/* Play button */}
                        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-600 ml-0.5">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                  </div>
                    </div>
                  </div>
                )}
                  
                  {link.type === 'article' && (
                    <div className="relative aspect-[3/1] overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border-b">
                      <div className="text-blue-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
              </div>
                    </div>
                  )}
                  
                  <div className="p-2 flex-1 flex flex-col">
                    <h4 className="font-medium line-clamp-1 text-xs">{link.title}</h4>
                    
                    {link.description && (
                      <p className="text-muted-foreground text-[10px] line-clamp-1 mb-1">
                        {link.description}
                      </p>
                    )}
                    
                    <div className="flex items-center mt-auto pt-1 text-[10px]">
                      <Badge variant="outline" className={cn(
                        "mr-1.5 px-1 py-0 text-[9px]",
                        link.type === 'youtube' ? "bg-red-50 text-red-500 border-red-200" : 
                        link.type === 'article' ? "bg-blue-50 text-blue-500 border-blue-200" : 
                        "bg-gray-50 text-gray-500 border-gray-200"
                      )}>
                        {link.type === 'youtube' ? 'Video' : 
                         link.type === 'article' ? 'Article' : 'Resource'}
                      </Badge>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center p-3 bg-muted/20 rounded-md">
              <p className="text-sm">No links available for this piece.</p>
            </div>
        )}
        </div>
        
        <Separator className="my-4" />
        
          {/* Student History section */}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-lg">Student History</h3>
            </div>
            
            {totalStudents > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center text-sm">
                  <Badge variant="outline" className="mr-1.5">{totalStudents}</Badge>
                  <span>Total</span>
                </div>
                
                {currentStudents > 0 && (
                  <div className="flex items-center text-sm">
                    <Badge variant="outline" className="bg-primary/5 text-primary mr-1.5">{currentStudents}</Badge>
                    <span>Current</span>
                  </div>
                )}
                
                {completedStudents > 0 && (
                  <div className="flex items-center text-sm">
                    <Badge variant="outline" className="bg-green-500/5 text-green-500 mr-1.5">{completedStudents}</Badge>
                    <span>Completed</span>
                  </div>
                )}
                
                {averageCompletionDays > 0 && (
                  <div className="flex items-center text-sm">
                    <Badge variant="outline" className="mr-1.5">{averageCompletionDays} days</Badge>
                    <span>Avg. Time</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
            {pieceInstances.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="w-20">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {pieceInstances.map((instance, index) => {
                  // Calculate duration if we have both start and end dates
                  let duration = '';
                  if (instance.startDate && instance.endDate) {
                    const start = new Date(instance.startDate);
                    const end = new Date(instance.endDate);
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    duration = `${diffDays} days`;
                  }
                  
                  // Check if this student's piece title differs from the master title
                    const titleDiffers = normalizeTitle(instance.pieceTitle) !== normalizeTitle(piece.title);
                  
                  return (
                    <TableRow key={`${instance.studentId}-${index}`}>
                      <TableCell className="font-medium">
                        {instance.studentName}
                        {titleDiffers && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="inline-block h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                In student's repertoire as:<br />
                                "{instance.pieceTitle}"
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={instance.status === 'current' ? 'outline' : 'default'}>
                          {instance.status === 'current' ? 'In Progress' : 'Completed'}
                        </Badge>
                      </TableCell>
                      <TableCell>{instance.startDate}</TableCell>
                      <TableCell>{instance.endDate || '—'}</TableCell>
                      <TableCell>{duration || 'Ongoing'}</TableCell>
                      <TableCell>
                        {instance.notes && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                {instance.notes}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-4 bg-muted/20 rounded-md">
              <p>No students have worked on this piece yet.</p>
            </div>
          )}
        </div>
        
          {/* Preview file modal */}
          {previewFile && (
            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
              <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>{previewFile.name}</DialogTitle>
                  <DialogDescription>
                    {formatFileSize(previewFile.size)} - Uploaded {previewFile.uploadDate}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-2 flex-1 overflow-auto">
                  {previewFile.type.includes('image') ? (
                    <img 
                      src={previewFile.url} 
                      alt={previewFile.name} 
                      className="max-w-full object-contain"
                    />
                  ) : previewFile.type.includes('pdf') ? (
                    <iframe 
                      src={previewFile.url} 
                      className="w-full h-[60vh]" 
                      title={previewFile.name}
                    ></iframe>
                  ) : (
                    <div className="p-8 text-center">
                      <p>Preview not available for this file type.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => window.open(previewFile.url, '_blank')}
                      >
                        Open in new tab
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Confirm delete dialog */}
          <ConfirmDialog
            isOpen={!!fileToDelete}
            onClose={() => setFileToDelete(null)}
            onConfirm={handleConfirmDelete}
            title="Delete File"
            description={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            variant="destructive"
          />
          
          {/* Notes section if present */}
        {piece.notes && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Notes</h3>
            </div>
            <div className="p-3 bg-muted/20 rounded-md">
              <p>{piece.notes}</p>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Function to group repertoire by composer
const groupByComposer = (repertoire: RepertoireItemData[]) => {
  const grouped: Record<string, RepertoireItemData[]> = {};
  
  repertoire.forEach(piece => {
    if (!grouped[piece.composer]) {
      grouped[piece.composer] = [];
    }
    grouped[piece.composer].push(piece);
  });
  
  // Sort composers alphabetically
  return Object.keys(grouped)
    .sort()
    .reduce((result: Record<string, RepertoireItemData[]>, composer) => {
      result[composer] = grouped[composer];
      return result;
    }, {});
};

// Helper function to get a master piece by ID
const _getMasterPieceById = (pieceId: string, repertoireList: RepertoireItemData[]): RepertoireItemData | undefined => {
  // Get the ID without prefix for compatibility with the master list
  const idWithoutPrefix = getIdWithoutPrefix(pieceId);
  
  // First try with the full ID (might be using the prefixed ID)
  let masterPiece = repertoireList.find(p => p.id === pieceId);
  
  // If not found, try with the ID without prefix
  if (!masterPiece) {
    masterPiece = repertoireList.find(p => p.id === idWithoutPrefix);
  }
  
  return masterPiece;
};

// Helper function to get piece details (title, composer, etc.) from either a student piece or directly from a master piece ID
const _getPieceDetails = (studentPiece: RepertoirePiece, repertoireList: RepertoireItemData[]): { title: string; composer: string; difficulty?: string } => {
  // Use the imported function from repertoire-utils
  return getPieceDetails(studentPiece, repertoireList);
};

const RepertoirePage = () => {
  const [activeStudent, setActiveStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddPieceDialogOpen, setIsAddPieceDialogOpen] = useState(false);
  const [isAssignPieceDialogOpen, setIsAssignPieceDialogOpen] = useState(false);
  const [isPieceDetailDialogOpen, setIsPieceDetailDialogOpen] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<RepertoireItemData | null>(null);
  const [repertoireList, setRepertoireList] = useState<RepertoireItemData[]>(masterRepertoire);
  const [studentsList, setStudentsList] = useState<Student[]>(students);
  const [activeTab, setActiveTab] = useState('current');
  const [viewMode, setViewMode] = useState<'list' | 'composer'>('list');
  const [displayMode, setDisplayMode] = useState<'cards' | 'grid' | 'table'>('grid');
  const [sortField, setSortField] = useState<'title' | 'composer' | 'difficulty' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Helper function to determine column count based on container width
  const gridColumnCount = 3; // Default value, could be responsive
  
  // Format composer name to Last name, First initial(s)
  const formatComposerName = (fullName: string): string => {
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
    const firstNames = parts.slice(0, parts.length - 1);
    const initials = firstNames.map(name => name.charAt(0)).join('.') + '.';
    
    return `${lastName}, ${initials}`;
  };
  
  // Handle sorting when a column header is clicked
  const handleSort = (field: 'title' | 'composer' | 'difficulty') => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set it and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get sorted repertoire
  const getSortedRepertoire = (items: RepertoireItemData[]): RepertoireItemData[] => {
    if (!sortField) return items;
    
    return [...items].sort((a, b) => {
      let valueA: string | undefined;
      let valueB: string | undefined;
      
      if (sortField === 'title') {
        valueA = a.title?.toLowerCase();
        valueB = b.title?.toLowerCase();
      } else if (sortField === 'composer') {
        // Extract last name for sorting
        const getLastName = (composer: string): string => {
          // Handle special cases like "J.S. Bach" or "W.A. Mozart"
          if (composer.includes('.')) {
            const parts = composer.split(' ');
            // If we have initials and last name (like "J.S. Bach")
            if (parts.length >= 2) {
              return parts[parts.length - 1].toLowerCase();
            }
          }
          
          // Handle regular names like "Ludwig van Beethoven" or "Claude Debussy"
          const parts = composer.split(' ');
          if (parts.length === 1) return composer.toLowerCase();
          
          return parts[parts.length - 1].toLowerCase();
        };
        
        valueA = getLastName(a.composer);
        valueB = getLastName(b.composer);
      } else if (sortField === 'difficulty') {
        // Map difficulty to a numeric value for sorting
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        valueA = a.difficulty ? String(difficultyOrder[a.difficulty] || 0) : '0';
        valueB = b.difficulty ? String(difficultyOrder[b.difficulty] || 0) : '0';
      }
      
      if (!valueA || !valueB) return 0;
      
      // Compare the values based on sort direction
      if (sortDirection === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  };
  
  // Filter repertoire based on active student, search query, and active tab
  const getFilteredRepertoire = (): RepertoireItemData[] => {
    let filteredItems: RepertoireItemData[] = [];
    
    if (activeStudent) {
      // Find the active student
      const student = studentsList.find(s => s.id === activeStudent);
      
      if (student) {
        // Combine current and past repertoire for the student
        const studentRepertoire: RepertoireItemData[] = [
          ...(student.currentRepertoire || []).map(piece => {
            // If the piece uses the new masterPieceId pattern, look up details from master list
            if (piece.masterPieceId) {
              const masterPiece = _getMasterPieceById(piece.masterPieceId, repertoireList);
              if (masterPiece) {
                return {
            id: piece.id,
                  title: masterPiece.title,
                  composer: masterPiece.composer,
            startedDate: piece.startDate,
                  endDate: piece.endDate,
            status: piece.status,
                  studentId: student.id,
                  masterPieceId: piece.masterPieceId,  // Include the masterPieceId in the student piece
                  notes: piece.notes,
                  difficulty: masterPiece.difficulty // Include difficulty from master piece
                };
              }
            }
            
            // Fall back to the old pattern if masterPieceId is not available or master piece is not found
            return {
            id: piece.id,
              title: piece.title || 'Unknown Piece',
              composer: piece.composer || 'Unknown Composer',
            startedDate: piece.startDate,
              endDate: piece.endDate,
            status: piece.status,
              studentId: student.id,
              notes: piece.notes
            };
          }),
          ...(student.pastRepertoire || []).map(piece => {
            // If the piece uses the new masterPieceId pattern, look up details from master list
            if (piece.masterPieceId) {
              const masterPiece = _getMasterPieceById(piece.masterPieceId, repertoireList);
              if (masterPiece) {
                return {
                  id: piece.id,
                  title: masterPiece.title,
                  composer: masterPiece.composer,
                  startedDate: piece.startDate,
                  endDate: piece.endDate,
                  status: piece.status,
                  studentId: student.id,
                  masterPieceId: piece.masterPieceId,  // Include the masterPieceId in the student piece
                  notes: piece.notes,
                  difficulty: masterPiece.difficulty // Include difficulty from master piece
                };
              }
            }
            
            // Fall back to the old pattern if masterPieceId is not available or master piece is not found
            return {
              id: piece.id,
              title: piece.title || 'Unknown Piece',
              composer: piece.composer || 'Unknown Composer',
              startedDate: piece.startDate,
              endDate: piece.endDate,
              status: piece.status,
              studentId: student.id,
              notes: piece.notes
            };
          })
        ];
        
        filteredItems = studentRepertoire;
        
        // Apply tab filter if not showing "all" tab
        if (activeTab !== 'all') {
          filteredItems = filteredItems.filter(item => item.status === activeTab);
        }
      }
    } else {
      // Show master repertoire list - no status filtering for Master Repertoire
      filteredItems = repertoireList;
    }
    
    // Apply search filter
    filteredItems = filteredItems.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.composer.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
    
    return filteredItems;
  };
  
  const handleAddPiece = (newPiece: { id: string; title: string; composer: string; difficulty: string; notes?: string }) => {
    const piece: RepertoireItemData = {
      id: newPiece.id,
      title: newPiece.title,
      composer: newPiece.composer,
      startedDate: new Date().toISOString().split('T')[0],
      status: 'current',
      difficulty: newPiece.difficulty as 'beginner' | 'intermediate' | 'advanced',
      notes: newPiece.notes
    };
    
    setRepertoireList(prev => [...prev, piece]);
  };
  
  const handleAssignPiece = (pieceId: string, studentId: string) => {
    // Find the piece and student
    const piece = repertoireList.find(p => p.id === pieceId);
    
    if (!piece) return;
    
    // Create a new student repertoire piece that references the master piece
    const newStudentPiece: RepertoirePiece = {
      id: createStudentPieceId(studentId, pieceId),
      masterPieceId: pieceId,
      startDate: new Date().toISOString().split('T')[0],
      status: 'current'
    };
    
    // Update the students list
    setStudentsList(prevStudents => 
      prevStudents.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            currentRepertoire: [...student.currentRepertoire, newStudentPiece]
          };
        }
        return student;
      })
    );
  };
  
  const handleToggleStatus = (pieceId: string, studentId?: string) => {
    if (studentId) {
      // Toggle status for a student's piece (this remains unchanged)
      setStudentsList(prevStudents => 
        prevStudents.map(student => {
          if (student.id === studentId) {
            // Check if piece is in current repertoire
            const currentIndex = student.currentRepertoire.findIndex(p => p.id === pieceId);
            
            if (currentIndex !== -1) {
              // Move from current to past
              const piece = student.currentRepertoire[currentIndex];
              const updatedPiece = { 
                ...piece, 
                status: 'completed' as const,
                endDate: new Date().toISOString().split('T')[0] // Add end date when completing
              };
              
              const newCurrentRepertoire = [...student.currentRepertoire];
              newCurrentRepertoire.splice(currentIndex, 1);
              
              return {
                ...student,
                currentRepertoire: newCurrentRepertoire,
                pastRepertoire: [...(student.pastRepertoire || []), updatedPiece]
              };
            }
            
            // Check if piece is in past repertoire
            const pastIndex = student.pastRepertoire?.findIndex(p => p.id === pieceId) ?? -1;
            
            if (pastIndex !== -1 && student.pastRepertoire) {
              // Move from past to current
              const piece = student.pastRepertoire[pastIndex];
              const updatedPiece = { ...piece, status: 'current' as const };
              
              const newPastRepertoire = [...student.pastRepertoire];
              newPastRepertoire.splice(pastIndex, 1);
              
              return {
                ...student,
                currentRepertoire: [...student.currentRepertoire, updatedPiece],
                pastRepertoire: newPastRepertoire
              };
            }
          }
          return student;
        })
      );
    } else {
      // For Master Repertoire, we don't change a status - instead, assign to a student
      setIsAssignPieceDialogOpen(true);
    }
  };

  const handleOpenPieceDetail = (piece: RepertoireItemData) => {
    // Use the original piece temporarily to help with debugging
    console.log('Opening piece detail with ID:', piece.id);
    
    // Pass the piece directly to the dialog - we'll handle the masterPieceId logic inside the dialog
    setSelectedPiece(piece);
    setIsPieceDetailDialogOpen(true);
  };

  const filteredRepertoire = getFilteredRepertoire();
  const sortedRepertoire = getSortedRepertoire(filteredRepertoire);
  const groupedRepertoire = groupByComposer(sortedRepertoire);
  
  return (
    <>
      <div className="container max-w-screen-2xl">
        <PageHeader 
          title="Repertoire" 
          description="Manage and track all repertoire pieces for students"
          className="animate-slide-up"
        >
          <div className="flex space-x-2">
            <Button onClick={() => setIsAddPieceDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Piece
            </Button>
          </div>
        </PageHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <div className="lg:col-span-1 animate-slide-up animate-stagger-1">
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
                {studentsList.map(student => (
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
                ))}
              </div>
            </div>
          </div>
        
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-6 animate-slide-up animate-stagger-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search repertoire..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* View Controls */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    {displayMode === 'cards' ? (
                      <List className="h-4 w-4" />
                    ) : displayMode === 'grid' ? (
                      <Grid className="h-4 w-4" />
                    ) : (
                      <ListFilter className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuRadioGroup value={displayMode} onValueChange={(value) => setDisplayMode(value as 'cards' | 'grid' | 'table')}>
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
                        <DropdownMenuRadioGroup value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'composer')}>
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
            
            {/* Only show tabs for student view, not for master repertoire */}
            {activeStudent ? (
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="animate-slide-up animate-stagger-3"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="current">Current</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-0">
                  {filteredRepertoire.length > 0 ? (
                    displayMode === 'table' ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40px]"></TableHead>
                              <TableHead>Piece</TableHead>
                              <TableHead>Composer</TableHead>
                              <TableHead>Started</TableHead>
                              <TableHead>{activeTab === 'completed' ? 'Completed' : 'Difficulty'}</TableHead>
                              <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredRepertoire.map(item => (
                              <TableRow 
                                key={item.id} 
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleOpenPieceDetail(item)}
                              >
                                <TableCell>
                                  <div 
                                    className={cn(
                                      "rounded-full p-1.5",
                                      item.status === 'current' ? 'bg-primary/10 text-primary' : 
                                      item.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                                      'bg-muted text-muted-foreground'
                                    )}
                                  >
                                    {item.status === 'completed' ? (
                                      <CheckCircle className="h-3.5 w-3.5" />
                                    ) : (
                                      <Music className="h-3.5 w-3.5" />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {item.title}
                                  {item.notes && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-3.5 w-3.5 inline ml-2 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{item.notes}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </TableCell>
                                <TableCell>{item.composer}</TableCell>
                                <TableCell>{item.startedDate}</TableCell>
                                <TableCell>
                                  {activeTab === 'completed' && item.endDate ? (
                                    item.endDate
                                  ) : item.difficulty ? (
                                    <Badge variant="outline">{item.difficulty}</Badge>
                                  ) : null}
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                        <PlusCircle className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleToggleStatus(item.id, item.studentId)}>
                                        {item.status === 'current' ? (
                                          <>
                                            <CircleCheck className="mr-2 h-4 w-4" />
                                            Mark as Completed
                                          </>
                                        ) : (
                                          <>
                                            <Clock className="mr-2 h-4 w-4" />
                                            Mark as Current
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : displayMode === 'grid' ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredRepertoire.map(item => (
                          <RepertoireItem 
                            key={item.id} 
                            item={item} 
                            layout="grid"
                            onClick={() => handleOpenPieceDetail(item)}
                            formatComposerName={!activeStudent ? formatComposerName : undefined}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredRepertoire.map(item => (
                          <div key={item.id} className="flex items-center">
                            <div 
                              className="flex-1 cursor-pointer" 
                              onClick={() => handleOpenPieceDetail(item)}
                            >
                              <RepertoireItem 
                                item={item} 
                                className="flex-1"
                                onClick={() => handleOpenPieceDetail(item)}
                                formatComposerName={!activeStudent ? formatComposerName : undefined}
                              />
                            </div>
                            <div className="flex flex-col gap-2 ml-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <PlusCircle className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleToggleStatus(item.id, item.studentId)}>
                                    {item.status === 'current' ? (
                                      <>
                                        <CircleCheck className="mr-2 h-4 w-4" />
                                        Mark as Completed
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="mr-2 h-4 w-4" />
                                        Mark as Current
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  {!item.studentId && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => setIsAssignPieceDialogOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Assign to Student
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <Card className="p-6 text-center text-muted-foreground">
                      <p>No repertoire found. Try changing your search or filters.</p>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              /* Master Repertoire View without tabs or status filtering */
              <div className="animate-slide-up animate-stagger-3">
                {/* Composer View */}
                {viewMode === 'composer' && Object.keys(groupedRepertoire).length > 0 ? (
                  <Accordion type="multiple" className="space-y-4">
                    {Object.entries(groupedRepertoire).map(([composer, pieces]) => (
                      <AccordionItem key={composer} value={composer} className="border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4 text-primary" />
                            <span className="font-medium">{composer}</span>
                            <Badge variant="outline" className="ml-2">{pieces.length}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2 pb-4">
                          {displayMode === 'table' ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead 
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('title')}
                                  >
                                    Piece
                                    {sortField === 'title' && (
                                      <span className="ml-1">
                                        {sortDirection === 'asc' ? <ChevronUp className="inline h-3.5 w-3.5" /> : <ChevronDown className="inline h-3.5 w-3.5" />}
                                      </span>
                                    )}
                                  </TableHead>
                                  <TableHead 
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleSort('difficulty')}
                                  >
                                    Difficulty
                                    {sortField === 'difficulty' && (
                                      <span className="ml-1">
                                        {sortDirection === 'asc' ? <ChevronUp className="inline h-3.5 w-3.5" /> : <ChevronDown className="inline h-3.5 w-3.5" />}
                                      </span>
                                    )}
                                  </TableHead>
                                  <TableHead className="w-[60px]"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {pieces.map(item => (
                                  <TableRow 
                                    key={item.id} 
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleOpenPieceDetail(item)}
                                  >
                                    <TableCell className="font-medium">
                                      {item.title}
                                      {item.notes && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Info className="h-3.5 w-3.5 inline ml-2 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="max-w-xs">{item.notes}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {item.difficulty && (
                                        <Badge variant="outline">{item.difficulty}</Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedPiece(item);
                                          setIsAssignPieceDialogOpen(true);
                                        }}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : displayMode === 'grid' ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                              {pieces.map(item => (
                                <RepertoireItem 
                                  key={item.id} 
                                  item={item} 
                                  layout="grid"
                                  onClick={() => handleOpenPieceDetail(item)}
                                  formatComposerName={!activeStudent ? formatComposerName : undefined}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {pieces.map(item => (
                                <div key={item.id} className="flex items-center">
                                  <div 
                                    className="flex-1 cursor-pointer" 
                                    onClick={() => handleOpenPieceDetail(item)}
                                  >
                                    <RepertoireItem 
                                      item={item} 
                                      className="flex-1" 
                                      onClick={() => handleOpenPieceDetail(item)}
                                      formatComposerName={!activeStudent ? formatComposerName : undefined}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2 ml-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedPiece(item);
                                        setIsAssignPieceDialogOpen(true);
                                      }}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : filteredRepertoire.length > 0 ? (
                  displayMode === 'table' ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleSort('title')}
                            >
                              Piece
                              {sortField === 'title' && (
                                <span className="ml-1">
                                  {sortDirection === 'asc' ? <ChevronUp className="inline h-3.5 w-3.5" /> : <ChevronDown className="inline h-3.5 w-3.5" />}
                                </span>
                              )}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleSort('composer')}
                            >
                              Composer
                              {sortField === 'composer' && (
                                <span className="ml-1">
                                  {sortDirection === 'asc' ? <ChevronUp className="inline h-3.5 w-3.5" /> : <ChevronDown className="inline h-3.5 w-3.5" />}
                                </span>
                              )}
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleSort('difficulty')}
                            >
                              Difficulty
                              {sortField === 'difficulty' && (
                                <span className="ml-1">
                                  {sortDirection === 'asc' ? <ChevronUp className="inline h-3.5 w-3.5" /> : <ChevronDown className="inline h-3.5 w-3.5" />}
                                </span>
                              )}
                            </TableHead>
                            <TableHead className="w-[60px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedRepertoire.map(item => (
                            <TableRow 
                              key={item.id} 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleOpenPieceDetail(item)}
                            >
                              <TableCell className="font-medium">
                                {item.title}
                                {item.notes && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 inline ml-2 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{item.notes}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </TableCell>
                              <TableCell>{formatComposerName(item.composer)}</TableCell>
                              <TableCell>
                                {item.difficulty && (
                                  <Badge variant="outline">{item.difficulty}</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPiece(item);
                                    setIsAssignPieceDialogOpen(true);
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : displayMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredRepertoire.map(item => (
                        <RepertoireItem 
                          key={item.id} 
                          item={item} 
                          layout="grid"
                          onClick={() => handleOpenPieceDetail(item)}
                          formatComposerName={!activeStudent ? formatComposerName : undefined}
                        />
                      ))}
                    </div>
                  ) : (
                    /* List View */
                    <div className="space-y-4">
                      {filteredRepertoire.map(item => (
                        <div key={item.id} className="flex items-center">
                          <div 
                            className="flex-1 cursor-pointer" 
                            onClick={() => handleOpenPieceDetail(item)}
                          >
                            <RepertoireItem 
                              item={item} 
                              className="flex-1" 
                              onClick={() => handleOpenPieceDetail(item)}
                              formatComposerName={!activeStudent ? formatComposerName : undefined}
                            />
                          </div>
                          <div className="flex flex-col gap-2 ml-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedPiece(item);
                                setIsAssignPieceDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <Card className="p-6 text-center text-muted-foreground">
                    <p>No repertoire found. Try changing your search or filters.</p>
                  </Card>
                )}
              </div>
            )}
          </div>
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
    </>
  );
};

export default RepertoirePage;
