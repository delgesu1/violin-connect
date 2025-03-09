import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  PlusCircle, 
  Music, 
  Search,
  Filter,
  Check,
  CircleCheck,
  Clock,
  XCircle,
  Plus,
  Users,
  Calendar,
  Info,
  BookText,
  List,
  FileText,
  Upload,
  X,
  Download,
  ExternalLink,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import RepertoireItem, { RepertoireItemData } from '@/components/common/RepertoireItem';
import StudentCard, { Student, RepertoirePiece } from '@/components/common/StudentCard';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data
const students: Student[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    currentRepertoire: [
      { id: '1-101', title: 'Partita No. 2 in D minor, BWV 1004', composer: 'J.S. Bach', startDate: '2023-10-01', status: 'current', notes: 'Working on Chaconne section' },
      { id: '1-102', title: 'Violin Concerto in E minor, Op. 64', composer: 'F. Mendelssohn', startDate: '2023-11-15', status: 'current', notes: 'Preparing for spring competition' },
      { id: '1-103', title: 'Tzigane', composer: 'M. Ravel', startDate: '2024-01-10', status: 'current' }
    ],
    pastRepertoire: [
      { id: '1-104', title: 'Violin Sonata No. 5 in F major (Spring)', composer: 'L.V. Beethoven', startDate: '2023-05-10', endDate: '2023-09-15', status: 'completed', notes: 'Performed at summer recital' },
      { id: '1-105', title: 'The Four Seasons - Spring', composer: 'A. Vivaldi', startDate: '2023-01-15', endDate: '2023-04-20', status: 'completed' },
      { id: '1-106', title: 'Meditation from Thaïs', composer: 'J. Massenet', startDate: '2022-11-05', endDate: '2023-02-10', status: 'completed' },
      { id: '1-107', title: 'Introduction and Rondo Capriccioso', composer: 'C. Saint-Saëns', startDate: '2022-08-15', endDate: '2022-12-20', status: 'completed', notes: 'Performed with university orchestra' }
    ],
    nextLesson: 'Today, 4:00 PM',
  },
  {
    id: '2',
    name: 'James Wilson',
    currentRepertoire: [
      { id: '2-201', title: 'Caprice No. 24 in A minor', composer: 'N. Paganini', startDate: '2023-09-10', status: 'current', notes: 'Focus on variation techniques' },
      { id: '2-202', title: 'Violin Concerto in D major, Op. 77', composer: 'J. Brahms', startDate: '2023-10-05', status: 'current' }
    ],
    pastRepertoire: [
      { id: '2-203', title: 'Introduction and Rondo Capriccioso', composer: 'C. Saint-Saëns', startDate: '2023-03-15', endDate: '2023-08-20', status: 'completed' },
      { id: '2-204', title: 'Violin Concerto in D major, Op. 35', composer: 'P.I. Tchaikovsky', startDate: '2022-10-10', endDate: '2023-02-25', status: 'completed', notes: 'Performed with youth symphony' },
      { id: '2-205', title: 'Partita No. 3 in E major, BWV 1006', composer: 'J.S. Bach', startDate: '2022-06-15', endDate: '2022-11-30', status: 'completed' }
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
    id: '1',
    title: 'Partita No. 2 in D minor, BWV 1004',
    composer: 'J.S. Bach',
    startedDate: '2023-10-15',
    difficulty: 'advanced'
  },
  {
    id: '2',
    title: 'Sonata No. 1 in G minor, BWV 1001',
    composer: 'J.S. Bach',
    startedDate: '2023-07-10',
    difficulty: 'advanced'
  },
  {
    id: '10',
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

// Mock file data with accurate filenames matching the correct pieces
const mockFileAttachments: Record<string, FileAttachment[]> = {
  // Bach Partita No. 2 in D minor, BWV 1004 (ID: 1)
  '1': [ 
    {
      id: 'file1',
      name: 'Bach_Partita_No2_Dmajor_BWV1004_Urtext.pdf',
      type: 'application/pdf',
      size: 3214567,
      url: '#',
      uploadDate: '2023-09-15',
      uploadedBy: 'You'
    },
    {
      id: 'file2',
      name: 'Bach_Partita2_Chaconne_Fingerings.pdf',
      type: 'application/pdf',
      size: 2128433,
      url: '#',
      uploadDate: '2023-10-02',
      uploadedBy: 'You'
    },
    {
      id: 'file3',
      name: 'Bach_Partita2_Practice_Notes.pdf',
      type: 'application/pdf',
      size: 1057624,
      url: '#',
      uploadDate: '2023-11-10',
      uploadedBy: 'You'
    }
  ],
  
  // Bach Sonata No. 1 in G minor, BWV 1001 (ID: 2)
  '2': [
    {
      id: 'file27',
      name: 'Bach_Sonata1_Gminor_BWV1001_Urtext.pdf',
      type: 'application/pdf',
      size: 2876543,
      url: '#',
      uploadDate: '2023-07-05',
      uploadedBy: 'You'
    },
    {
      id: 'file28',
      name: 'Bach_Sonata1_Performance_Notes.pdf',
      type: 'application/pdf',
      size: 1365478,
      url: '#',
      uploadDate: '2023-07-12',
      uploadedBy: 'You'
    }
  ],
  
  // Tchaikovsky Violin Concerto in D major, Op. 35 (ID: 3)
  '3': [ 
    {
      id: 'file4',
      name: 'Tchaikovsky_ViolinConcerto_Dmajor_Op35_Score.pdf',
      type: 'application/pdf',
      size: 4251984,
      url: '#',
      uploadDate: '2023-07-22',
      uploadedBy: 'You'
    },
    {
      id: 'file5',
      name: 'Tchaikovsky_ViolinConcerto_PianoReduction.pdf',
      type: 'application/pdf',
      size: 3782145,
      url: '#',
      uploadDate: '2023-07-22',
      uploadedBy: 'You'
    },
    {
      id: 'file6',
      name: 'Tchaikovsky_ViolinConcerto_1stMvt_Cadenza.pdf',
      type: 'application/pdf',
      size: 1245632,
      url: '#',
      uploadDate: '2023-08-15',
      uploadedBy: 'You'
    }
  ],
  
  // Paganini Caprice No. 24 in A minor (ID: 4)
  '4': [ 
    {
      id: 'file7',
      name: 'Paganini_Caprice24_Aminor_Urtext.pdf',
      type: 'application/pdf',
      size: 2831234,
      url: '#',
      uploadDate: '2023-09-15',
      uploadedBy: 'You'
    },
    {
      id: 'file8',
      name: 'Paganini_Caprice24_Advanced_Fingerings.pdf',
      type: 'application/pdf',
      size: 1258433,
      url: '#',
      uploadDate: '2023-10-02',
      uploadedBy: 'You'
    },
    {
      id: 'file9',
      name: 'Paganini_Caprice24_Practice_Techniques.pdf',
      type: 'application/pdf',
      size: 1624578,
      url: '#',
      uploadDate: '2023-10-18',
      uploadedBy: 'You'
    }
  ],
  
  // Mozart Violin Sonata K.304 in E minor (ID: 5)
  '5': [ 
    {
      id: 'file10',
      name: 'Mozart_ViolinSonata_K304_Eminor_Score.pdf',
      type: 'application/pdf',
      size: 3521984,
      url: '#',
      uploadDate: '2023-08-22',
      uploadedBy: 'You'
    },
    {
      id: 'file11',
      name: 'Mozart_ViolinSonata_K304_PianoScore.pdf',
      type: 'application/pdf',
      size: 2893456,
      url: '#',
      uploadDate: '2023-08-22',
      uploadedBy: 'You'
    }
  ],
  
  // Beethoven Spring Sonata No. 5 in F major (ID: 6)
  '6': [ 
    {
      id: 'file12',
      name: 'Beethoven_SpringSonata_No5_Fmajor_Score.pdf',
      type: 'application/pdf',
      size: 3124853,
      url: '#',
      uploadDate: '2023-05-08',
      uploadedBy: 'You'
    },
    {
      id: 'file13',
      name: 'Beethoven_SpringSonata_InterpretationNotes.pdf',
      type: 'application/pdf',
      size: 1452369,
      url: '#',
      uploadDate: '2023-05-20',
      uploadedBy: 'You'
    }
  ],
  
  // Saint-Saëns Introduction and Rondo Capriccioso (ID: 7)
  '7': [ 
    {
      id: 'file14',
      name: 'SaintSaens_IntroRondoCapriccioso_Score.pdf',
      type: 'application/pdf',
      size: 3245178,
      url: '#',
      uploadDate: '2023-03-10',
      uploadedBy: 'You'
    },
    {
      id: 'file15',
      name: 'SaintSaens_IntroRondoCapriccioso_OrchestraParts.pdf',
      type: 'application/pdf',
      size: 5123478,
      url: '#',
      uploadDate: '2023-03-10',
      uploadedBy: 'You'
    },
    {
      id: 'file16',
      name: 'SaintSaens_IntroRondoCapriccioso_Recording.mp3',
      type: 'audio/mpeg',
      size: 8234567,
      url: '#',
      uploadDate: '2023-04-02',
      uploadedBy: 'You'
    }
  ],
  
  // Saint-Saëns Violin Concerto No. 3 in B minor, Op. 61 (ID: 8)
  '8': [
    {
      id: 'file29',
      name: 'SaintSaens_ViolinConcerto3_Bminor_Score.pdf',
      type: 'application/pdf',
      size: 3876543,
      url: '#',
      uploadDate: '2023-06-10',
      uploadedBy: 'You'
    },
    {
      id: 'file30',
      name: 'SaintSaens_ViolinConcerto3_PianoReduction.pdf',
      type: 'application/pdf',
      size: 2987654,
      url: '#',
      uploadDate: '2023-06-10',
      uploadedBy: 'You'
    }
  ],
  
  // Mendelssohn Violin Concerto in E minor, Op. 64 (ID: 9)
  '9': [ 
    {
      id: 'file17',
      name: 'Mendelssohn_ViolinConcerto_Eminor_Score.pdf',
      type: 'application/pdf',
      size: 4215673,
      url: '#',
      uploadDate: '2023-04-18',
      uploadedBy: 'You'
    },
    {
      id: 'file18',
      name: 'Mendelssohn_ViolinConcerto_PianoReduction.pdf',
      type: 'application/pdf',
      size: 3452187,
      url: '#',
      uploadDate: '2023-04-18',
      uploadedBy: 'You'
    },
    {
      id: 'file19',
      name: 'Mendelssohn_ViolinConcerto_Cadenza_Analysis.pdf',
      type: 'application/pdf',
      size: 1574236,
      url: '#',
      uploadDate: '2023-05-05',
      uploadedBy: 'You'
    }
  ],
  
  // Bach Violin Concerto in A minor, BWV 1041 (ID: 10)
  '10': [
    {
      id: 'file31',
      name: 'Bach_ViolinConcerto_Aminor_BWV1041_Score.pdf',
      type: 'application/pdf',
      size: 2765432,
      url: '#',
      uploadDate: '2023-10-25',
      uploadedBy: 'You'
    },
    {
      id: 'file32',
      name: 'Bach_ViolinConcerto_Aminor_PianoReduction.pdf',
      type: 'application/pdf',
      size: 2345678,
      url: '#',
      uploadDate: '2023-10-25',
      uploadedBy: 'You'
    }
  ],
  
  // Brahms Violin Concerto in D major, Op. 77 (ID: 11)
  '11': [
    {
      id: 'file33',
      name: 'Brahms_ViolinConcerto_Dmajor_Op77_Score.pdf',
      type: 'application/pdf',
      size: 4567823,
      url: '#',
      uploadDate: '2023-05-25',
      uploadedBy: 'You'
    },
    {
      id: 'file34',
      name: 'Brahms_ViolinConcerto_PianoReduction.pdf',
      type: 'application/pdf',
      size: 3654321,
      url: '#',
      uploadDate: '2023-05-25',
      uploadedBy: 'You'
    },
    {
      id: 'file35',
      name: 'Brahms_ViolinConcerto_JoachimCadenza.pdf',
      type: 'application/pdf',
      size: 1645789,
      url: '#',
      uploadDate: '2023-06-10',
      uploadedBy: 'You'
    }
  ],
  
  // Sarasate Zigeunerweisen, Op. 20 (ID: 12)
  '12': [
    {
      id: 'file36',
      name: 'Sarasate_Zigeunerweisen_Op20_Score.pdf',
      type: 'application/pdf',
      size: 2876543,
      url: '#',
      uploadDate: '2023-08-10',
      uploadedBy: 'You'
    },
    {
      id: 'file37',
      name: 'Sarasate_Zigeunerweisen_PianoReduction.pdf',
      type: 'application/pdf',
      size: 2345678,
      url: '#',
      uploadDate: '2023-08-10',
      uploadedBy: 'You'
    }
  ],
  
  // Bruch Violin Concerto No. 1 in G minor, Op. 26 (ID: 13)
  '13': [
    {
      id: 'file38',
      name: 'Bruch_ViolinConcerto1_Gminor_Op26_Score.pdf',
      type: 'application/pdf',
      size: 3752816,
      url: '#',
      uploadDate: '2023-08-25',
      uploadedBy: 'You'
    },
    {
      id: 'file39',
      name: 'Bruch_ViolinConcerto1_PianoReduction.pdf',
      type: 'application/pdf',
      size: 2987654,
      url: '#',
      uploadDate: '2023-08-25',
      uploadedBy: 'You'
    }
  ],
  
  // Beethoven Violin Sonata No. 9 (Kreutzer) (ID: 14)
  '14': [
    {
      id: 'file40',
      name: 'Beethoven_KreutzerSonata_No9_Score.pdf',
      type: 'application/pdf',
      size: 3546782,
      url: '#',
      uploadDate: '2023-01-10',
      uploadedBy: 'You'
    },
    {
      id: 'file41',
      name: 'Beethoven_KreutzerSonata_Analysis.pdf',
      type: 'application/pdf',
      size: 1872634,
      url: '#',
      uploadDate: '2023-01-20',
      uploadedBy: 'You'
    }
  ],
  
  // Vivaldi Four Seasons - Spring (ID: 15)
  '15': [ 
    {
      id: 'file20',
      name: 'Vivaldi_FourSeasons_Spring_Score.pdf',
      type: 'application/pdf',
      size: 2874123,
      url: '#',
      uploadDate: '2023-02-08',
      uploadedBy: 'You'
    },
    {
      id: 'file21',
      name: 'Vivaldi_FourSeasons_Spring_SoloPartMarked.pdf',
      type: 'application/pdf',
      size: 1563248,
      url: '#',
      uploadDate: '2023-02-15',
      uploadedBy: 'You'
    }
  ],
  
  // Massenet Meditation from Thaïs (ID: 16)
  '16': [
    {
      id: 'file42',
      name: 'Massenet_Meditation_Thais_Score.pdf',
      type: 'application/pdf',
      size: 1987634,
      url: '#',
      uploadDate: '2023-02-28',
      uploadedBy: 'You'
    },
    {
      id: 'file43',
      name: 'Massenet_Meditation_PianoReduction.pdf',
      type: 'application/pdf',
      size: 1543278,
      url: '#',
      uploadDate: '2023-02-28',
      uploadedBy: 'You'
    }
  ],
  
  // Lalo Symphonie Espagnole (ID: 17)
  '17': [
    {
      id: 'file44',
      name: 'Lalo_SymphonieEspagnole_Score.pdf',
      type: 'application/pdf',
      size: 4751862,
      url: '#',
      uploadDate: '2023-09-28',
      uploadedBy: 'You'
    },
    {
      id: 'file45',
      name: 'Lalo_SymphonieEspagnole_PianoReduction.pdf',
      type: 'application/pdf',
      size: 3678245,
      url: '#',
      uploadDate: '2023-09-28',
      uploadedBy: 'You'
    },
    {
      id: 'file46',
      name: 'Lalo_SymphonieEspagnole_1stMovement_Notes.pdf',
      type: 'application/pdf',
      size: 1254367,
      url: '#',
      uploadDate: '2023-10-05',
      uploadedBy: 'You'
    }
  ],
  
  // Kreisler Schön Rosmarin (ID: 18)
  '18': [
    {
      id: 'file47',
      name: 'Kreisler_SchonRosmarin_Score.pdf',
      type: 'application/pdf',
      size: 1254367,
      url: '#',
      uploadDate: '2023-09-10',
      uploadedBy: 'You'
    },
    {
      id: 'file48',
      name: 'Kreisler_SchonRosmarin_PianoReduction.pdf',
      type: 'application/pdf',
      size: 987654,
      url: '#',
      uploadDate: '2023-09-10',
      uploadedBy: 'You'
    }
  ],
  
  // Ravel Tzigane (ID: 19)
  '19': [ 
    {
      id: 'file25',
      name: 'Ravel_Tzigane_Score.pdf',
      type: 'application/pdf',
      size: 2978456,
      url: '#',
      uploadDate: '2023-10-18',
      uploadedBy: 'You'
    },
    {
      id: 'file26',
      name: 'Ravel_Tzigane_TechnicalGuide.pdf',
      type: 'application/pdf',
      size: 1856327,
      url: '#',
      uploadDate: '2023-10-25',
      uploadedBy: 'You'
    }
  ],
  
  // Wieniawski Violin Concerto No. 2 in D minor, Op. 22 (ID: 20)
  '20': [
    {
      id: 'file49',
      name: 'Wieniawski_ViolinConcerto2_Dminor_Op22_Score.pdf',
      type: 'application/pdf',
      size: 3567891,
      url: '#',
      uploadDate: '2023-08-20',
      uploadedBy: 'You'
    },
    {
      id: 'file50',
      name: 'Wieniawski_ViolinConcerto2_PianoReduction.pdf',
      type: 'application/pdf',
      size: 2789654,
      url: '#',
      uploadDate: '2023-08-20',
      uploadedBy: 'You'
    }
  ],
  
  // Sibelius Violin Concerto in D minor, Op. 47 (ID: 51)
  '51': [ 
    {
      id: 'file22',
      name: 'Sibelius_ViolinConcerto_Dminor_Op47_Score.pdf',
      type: 'application/pdf',
      size: 4562137,
      url: '#',
      uploadDate: '2023-01-03',
      uploadedBy: 'You'
    },
    {
      id: 'file23',
      name: 'Sibelius_ViolinConcerto_PianoReduction.pdf',
      type: 'application/pdf',
      size: 3789456,
      url: '#',
      uploadDate: '2023-01-03',
      uploadedBy: 'You'
    },
    {
      id: 'file24',
      name: 'Sibelius_ViolinConcerto_InterpretationGuide.pdf',
      type: 'application/pdf',
      size: 2145678,
      url: '#',
      uploadDate: '2023-01-25',
      uploadedBy: 'You'
    }
  ]
};

// Mock link resources for various pieces
const mockLinkResources: Record<string, LinkResource[]> = {
  // Bach Partita No. 2 in D minor, BWV 1004 (ID: 1)
  '1': [
    {
      id: 'link1-1',
      title: 'Hilary Hahn performs Bach Partita No. 2 - Chaconne',
      url: 'https://www.youtube.com/watch?v=QqA3qQMKueA',
      type: 'youtube',
      description: 'Acclaimed performance of the Chaconne by Hilary Hahn',
      thumbnailUrl: '/mockImages/hilary-hahn-chaconne.jpg',
      addedDate: '2023-10-05'
    },
    {
      id: 'link1-2',
      title: 'Historical Context of Bach\'s Partita No. 2',
      url: 'https://www.violinist.com/blog/laurie/20159/17019/',
      type: 'article',
      description: 'An in-depth analysis of the historical and musical significance of the Partita',
      addedDate: '2023-09-20'
    },
    {
      id: 'link1-3',
      title: 'Itzhak Perlman plays Bach Partita No.2',
      url: 'https://www.youtube.com/watch?v=6KaYzgofHjc',
      type: 'youtube',
      description: 'Masterful interpretation by Itzhak Perlman',
      thumbnailUrl: '/mockImages/perlman-bach.jpg',
      addedDate: '2023-11-15'
    }
  ],
  
  // Bach Sonata No. 1 in G minor, BWV 1001 (ID: 2)
  '2': [
    {
      id: 'link2-1',
      title: 'James Ehnes performs Bach Sonata No. 1 in G minor',
      url: 'https://www.youtube.com/watch?v=PZoaEmxrsZQ',
      type: 'youtube',
      description: 'Complete performance by James Ehnes',
      thumbnailUrl: '/mockImages/ehnes-bach.jpg',
      addedDate: '2023-08-10'
    },
    {
      id: 'link2-2',
      title: 'Analysis: Bach\'s Solo Violin Sonatas and Partitas',
      url: 'https://www.thestrad.com/playing/analysis-bachs-solo-violin-sonatas-and-partitas/7725.article',
      type: 'article',
      description: 'Structural analysis and practice guidance for Bach\'s solo works',
      addedDate: '2023-07-28'
    }
  ],
  
  // Paganini Caprice No. 24 (ID: 5)
  '5': [
    {
      id: 'link5-1',
      title: 'Augustin Hadelich plays Paganini Caprice No. 24',
      url: 'https://www.youtube.com/watch?v=adBKmDAdqto',
      type: 'youtube',
      description: 'Virtuosic performance with incredible technique',
      thumbnailUrl: '/mockImages/hadelich-paganini.jpg',
      addedDate: '2023-09-18'
    },
    {
      id: 'link5-2',
      title: 'The Technical Challenges of Paganini\'s Caprices',
      url: 'https://stringsmagazine.com/the-technical-challenges-of-paganinis-caprices/',
      type: 'article',
      description: 'Breakdown of technical demands and practice strategies',
      addedDate: '2023-10-14'
    },
    {
      id: 'link5-3',
      title: 'Rachel Barton Pine on Paganini Caprice No. 24',
      url: 'https://www.youtube.com/watch?v=UWfYLmI6NMc',
      type: 'youtube',
      description: 'Performance and tutorial on approaching this challenging piece',
      thumbnailUrl: '/mockImages/rachel-barton-pine.jpg',
      addedDate: '2023-11-02'
    }
  ],
  
  // Tchaikovsky Violin Concerto (ID: 9)
  '9': [
    {
      id: 'link9-1',
      title: 'Janine Jansen performs Tchaikovsky Violin Concerto',
      url: 'https://www.youtube.com/watch?v=cbJZeNWrWKU',
      type: 'youtube',
      description: 'Emotional interpretation with the London Symphony Orchestra',
      thumbnailUrl: '/mockImages/jansen-tchaikovsky.jpg',
      addedDate: '2023-08-15'
    },
    {
      id: 'link9-2',
      title: 'The Story Behind Tchaikovsky\'s Violin Concerto',
      url: 'https://www.classicfm.com/composers/tchaikovsky/music/violin-concerto/',
      type: 'article',
      description: 'Historical context and analysis of this beloved concerto',
      addedDate: '2023-09-05'
    }
  ]
};

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
      id: Date.now().toString(),
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
  setActiveStudent: (studentId: string | null) => void;
  setActiveTab: (tab: string) => void;
}

const PieceDetailDialog: React.FC<PieceDetailDialogProps> = ({ 
  isOpen, 
  onClose, 
  piece, 
  students, 
  setActiveStudent, 
  setActiveTab 
}) => {
  if (!piece) return null;
  
  // Modified approach to properly match any student piece with its master repertoire counterpart
  // to ensure consistent display of files and resources
  const getMasterPieceId = (): string => {
    // If this is already from the master repertoire, just use its ID
    if (masterRepertoire.some(m => m.id === piece.id)) {
      return piece.id;
    }
    
    // Try to find a matching piece in the master repertoire
    // First, look for an exact title and composer match
    const exactMatch = masterRepertoire.find(m => 
      m.title === piece.title && 
      m.composer === piece.composer
    );
    
    if (exactMatch) {
      return exactMatch.id;
    }
    
    // Next, try with normalized titles and similar composer matching
    const normalizedPieceTitle = normalizePieceTitle(piece.title);
    const normalizedPieceComposer = piece.composer?.toLowerCase().replace(/\./g, '').trim();
    
    for (const masterPiece of masterRepertoire) {
      const normalizedMasterTitle = normalizePieceTitle(masterPiece.title);
      const normalizedMasterComposer = masterPiece.composer?.toLowerCase().replace(/\./g, '').trim();
      
      // Check for matching titles and composers after normalization
      const titleMatches = normalizedPieceTitle === normalizedMasterTitle;
      const composerMatches = normalizedPieceComposer === normalizedMasterComposer ||
                            (normalizedPieceComposer && normalizedMasterComposer && 
                             (normalizedPieceComposer.includes(normalizedMasterComposer) || 
                              normalizedMasterComposer.includes(normalizedPieceComposer)));
      
      if (titleMatches && composerMatches) {
        return masterPiece.id;
      }
      
      // Check for catalog numbers (BWV, K, Op. etc.) in titles
      const catalogRegex = /\b(bwv|k\.|op\.|opus|sz\.)\s*\d+/i;
      const pieceCatalog = normalizedPieceTitle.match(catalogRegex);
      const masterCatalog = normalizedMasterTitle.match(catalogRegex);
      
      if (pieceCatalog && masterCatalog && 
          pieceCatalog[0].toLowerCase() === masterCatalog[0].toLowerCase() &&
          composerMatches) {
        return masterPiece.id;
      }
    }
    
    // Try with broader matching criteria
    for (const masterPiece of masterRepertoire) {
      // Use the existing isPieceSimilar function which has good matching logic
      if (isPieceSimilar(masterPiece.title, piece.title, masterPiece.composer, piece.composer)) {
        return masterPiece.id;
      }
    }
    
    // If still not found, let's try a more aggressive matching approach
    for (const masterPiece of masterRepertoire) {
      const normalizedMasterTitle = normalizePieceTitle(masterPiece.title);
      
      // Check if titles are significant substrings of each other (e.g., "Violin Concerto No. 5" vs "Concerto No. 5")
      const titleOverlap = normalizedPieceTitle.includes(normalizedMasterTitle) || 
                          normalizedMasterTitle.includes(normalizedPieceTitle);
      
      // Also check composer initials
      const pieceComposerInitials = normalizedPieceComposer?.split(' ').map(word => word[0]).join('');
      const masterComposerInitials = normalizedMasterComposer?.split(' ').map(word => word[0]).join('');
      const composerInitialsMatch = pieceComposerInitials === masterComposerInitials;
      
      if (titleOverlap && (composerInitialsMatch || composerMatches)) {
        return masterPiece.id;
      }
    }
    
    // If we can't find a match, return the original ID
    // Note: In a production app, we might want to log this for future improvement
    return piece.id;
  };
  
  // Find the master ID for consistent access to resources
  const masterPieceId = getMasterPieceId();
  
  // Get files and links using the master piece ID for consistency
  const files = mockFileAttachments[masterPieceId] || [];
  const links = mockLinkResources[masterPieceId] || [];
  
  // State for UI interactions
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Compute all files list (both from mockFileAttachments and uploadedFiles)
  const allFiles = [...files, ...uploadedFiles];
  
  // Reset uploaded files and preview when piece changes
  useEffect(() => {
    setUploadedFiles([]);
    setPreviewFile(null);
    setUploadProgress({});
  }, [piece.id]);
  
  // Helper function to normalize piece titles for better matching
  const normalizePieceTitle = (title: string): string => {
    return title.toLowerCase().trim()
      .replace(/\s+/g, ' ') // normalize spaces
      .replace(/sonata\s+in\s+/i, 'sonata ') // normalize "Sonata in X" to "Sonata X"
      .replace(/concerto\s+in\s+/i, 'concerto '); // normalize "Concerto in X" to "Concerto X"
  };
  
  // Helper function to check if two pieces are likely the same
  const isPieceSimilar = (pieceA: string, pieceB: string, composerA?: string, composerB?: string): boolean => {
    // Normalize both titles
    const normalizedA = normalizePieceTitle(pieceA);
    const normalizedB = normalizePieceTitle(pieceB);
    
    // Exact match after normalization
    if (normalizedA === normalizedB) return true;
    
    // Check for catalog numbers (K.304, BWV 1006, Op. 35, etc.)
    const catalogRegex = /\b(k\.\s*\d+|bwv\s*\d+|op\.\s*\d+)/i;
    const catalogA = normalizedA.match(catalogRegex);
    const catalogB = normalizedB.match(catalogRegex);
    
    if (catalogA && catalogB && catalogA[0].toLowerCase() === catalogB[0].toLowerCase()) {
      // If catalog numbers match and composers match (when both are present), it's likely the same piece
      if (composerA && composerB) {
        return composerA.toLowerCase().includes(composerB.toLowerCase()) || 
               composerB.toLowerCase().includes(composerA.toLowerCase());
      }
      // If catalog numbers match but we don't have complete composer info, assume it's the same piece
      return true;
    }
    
    // If no catalog numbers but we have composers and one title is contained in the other
    if (composerA && composerB && 
        (composerA.toLowerCase().includes(composerB.toLowerCase()) || 
         composerB.toLowerCase().includes(composerA.toLowerCase()))) {
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
  };
  
  // Find all instances of this piece across all students, using more flexible matching
  const pieceInstances: Array<{
    studentId: string;
    studentName: string;
    status: 'current' | 'completed' | 'planned';
    startDate: string;
    endDate?: string;
    notes?: string;
    pieceTitle: string; // Store the actual title used by this student
    pieceId: string; // Store the actual piece ID for reference
  }> = [];
  
  students.forEach(student => {
    // Check current repertoire
    student.currentRepertoire.forEach(p => {
      // Use the improved matching function to determine if pieces are similar
      if (isPieceSimilar(p.title, piece.title, p.composer, piece.composer)) {
        pieceInstances.push({
          studentId: student.id,
          studentName: student.name,
          status: p.status,
          startDate: p.startDate,
          endDate: undefined, // Current pieces don't have end dates
          notes: p.notes,
          pieceTitle: p.title, // Store the actual title used
          pieceId: p.id // Store the piece ID
        });
      }
    });
    
    // Check past repertoire
    student.pastRepertoire?.forEach(p => {
      if (isPieceSimilar(p.title, piece.title, p.composer, piece.composer)) {
        pieceInstances.push({
          studentId: student.id,
          studentName: student.name,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate, // Add end date for completed pieces
          notes: p.notes,
          pieceTitle: p.title, // Store the actual title used
          pieceId: p.id // Store the piece ID
        });
      }
    });
  });
  
  // Remove duplicates (in case the same student has the same piece listed multiple times)
  const uniqueInstances = pieceInstances.reduce((acc, current) => {
    const isDuplicate = acc.some(item => 
      item.studentId === current.studentId && 
      item.status === current.status && 
      item.startDate === current.startDate
    );
    
    if (!isDuplicate) {
      acc.push(current);
    }
    return acc;
  }, [] as typeof pieceInstances);

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

  // Calculate statistics
  const totalStudents = uniqueInstances.length;
  const currentStudents = uniqueInstances.filter(i => i.status === 'current').length;
  const completedStudents = uniqueInstances.filter(i => i.status === 'completed').length;
  
  // Calculate average completion time (only for completed pieces with both dates)
  const completedWithDates = uniqueInstances.filter(i => i.status === 'completed' && i.startDate && i.endDate);
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

  // File handling functions
  const handleFileUpload = (uploadedFileList: FileList | null) => {
    if (!uploadedFileList || !uploadedFileList.length) return;
    
    // Process each file
    Array.from(uploadedFileList).forEach(file => {
      // Create temporary progress tracker
      const tempId = `temp-${Date.now()}-${file.name}`;
      setUploadProgress(prev => ({ ...prev, [tempId]: 0 }));
      
      // Simulate file upload with progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Add the file to the list after "upload" completes
          setTimeout(() => {
            // Create a filename based on the piece
            const baseName = file.name.split('.').slice(0, -1).join('.');
            const extension = file.name.split('.').pop();
            
            // Format composer name
            const composerFormatted = piece.composer.replace(/\s+/g, '').replace(/\./g, '');
            
            // Format piece title
            const titleFormatted = piece.title
              .replace(/\s+/g, '_')
              .replace(/[^\w]/g, '')
              .replace(/_+/g, '_');
            
            // Create a more meaningful filename
            const newFilename = `${composerFormatted}_${titleFormatted}_${baseName}.${extension}`;
            
            const newFile: FileAttachment = {
              id: `file-${Date.now()}`,
              name: newFilename,
              type: file.type,
              size: file.size,
              url: '#', // In a real app, this would be the uploaded file URL
              uploadDate: new Date().toISOString().split('T')[0],
              uploadedBy: 'You'
            };
            
            // Add to uploaded files
            setUploadedFiles(prev => [...prev, newFile]);
            
            // In a real app, we would update mockFileAttachments[piece.id] here
            // mockFileAttachments[piece.id] = [...(mockFileAttachments[piece.id] || []), newFile];
            
            // Remove from progress tracking
            setUploadProgress(prev => {
              const updated = { ...prev };
              delete updated[tempId];
              return updated;
            });
          }, 500);
        }
        
        setUploadProgress(prev => ({ ...prev, [tempId]: Math.min(progress, 100) }));
      }, 300);
    });
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };
  
  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    
    // If we're currently previewing this file, close the preview
    if (previewFile?.id === fileId) {
      setPreviewFile(null);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-medium">{piece.title}</DialogTitle>
              <DialogDescription className="text-base">
                {piece.composer} • 
                <span className="ml-1 text-muted-foreground">
                  Added {piece.startedDate}
                </span>
              </DialogDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              {piece.difficulty || 'Unknown difficulty'}
            </Badge>
          </div>
        </DialogHeader>
        
        <ScrollArea className="p-6 h-[calc(90vh-8rem)]">
          {/* Statistics panel */}
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
            
            {/* ... existing student history table ... */}
            {uniqueInstances.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueInstances.map((instance, index) => {
                    const start = new Date(instance.startDate);
                    const end = instance.endDate ? new Date(instance.endDate) : new Date();
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const duration = diffDays > 0 ? `${diffDays} days` : 'Just started';
                    
                    const titleDiffers = normalizePieceTitle(instance.pieceTitle) !== normalizePieceTitle(piece.title);
                    
                    // Find the student from the list to ensure data consistency
                    const student = students.find(s => s.id === instance.studentId);
                    
                    // Verify piece status to ensure consistency with student view
                    let verifiedStatus = instance.status;
                    let verifiedEndDate = instance.endDate;
                    
                    if (student) {
                      // Check if piece is in current repertoire
                      const currentPiece = student.currentRepertoire.find(p => p.id === instance.pieceId);
                      if (currentPiece) {
                        verifiedStatus = currentPiece.status;
                        verifiedEndDate = undefined; // Current pieces don't have end dates
                      }
                      
                      // Check if piece is in past repertoire
                      const pastPiece = student.pastRepertoire?.find(p => p.id === instance.pieceId);
                      if (pastPiece) {
                        verifiedStatus = pastPiece.status;
                        verifiedEndDate = pastPiece.endDate;
                      }
                    }
                    
                    return (
                      <TableRow key={`${instance.studentId}-${index}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Button 
                              variant="link" 
                              className="p-0 h-auto font-medium text-sm"
                              onClick={() => {
                                // Navigate to the student's view and set the appropriate tab
                                setActiveStudent(instance.studentId);
                                setActiveTab(verifiedStatus === 'current' ? 'current' : 'completed');
                                // Close the dialog
                                onClose();
                              }}
                            >
                              {instance.studentName}
                            </Button>
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
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={verifiedStatus === 'current' ? 'outline' : 'default'}>
                            {verifiedStatus === 'current' ? 'In Progress' : 'Completed'}
                          </Badge>
                        </TableCell>
                        <TableCell>{instance.startDate}</TableCell>
                        <TableCell>{verifiedEndDate || '—'}</TableCell>
                        <TableCell>{verifiedStatus === 'completed' ? duration : 'Ongoing'}</TableCell>
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
          
          {/* Links section - New addition */}
          <div className="mt-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-lg">Links</h3>
              </div>
            </div>
            
            {links.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {links.map((link) => (
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
                <Button variant="link" size="sm" className="mt-1 h-7 text-xs">
                  <PlusCircle className="h-3 w-3 mr-1" /> Add a link
                </Button>
              </div>
            )}
          </div>
          
          {/* Files section */}
          <div className="mt-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-lg">Files</h3>
              </div>
              <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                className="hidden" 
                onChange={(e) => handleFileUpload(e.target.files)} 
              />
            </div>
            
            {/* File drop area */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg transition-all duration-200 mb-4",
                isDragging
                  ? "border-primary bg-primary/5"
                  : allFiles.length === 0 && Object.keys(uploadProgress).length === 0
                  ? "border-muted-foreground/20 hover:border-primary/50"
                  : "border-transparent",
                allFiles.length === 0 && Object.keys(uploadProgress).length === 0 ? "p-8" : "p-0"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {allFiles.length === 0 && Object.keys(uploadProgress).length === 0 ? (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Drag & drop files here or <span className="text-primary font-medium">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, images, and audio files
                  </p>
                </div>
              ) : null}
            </div>
            
            {/* Files list */}
            {files.length > 0 || uploadedFiles.length > 0 ? (
              <div className="space-y-2 mt-4">
                {/* Currently uploading files */}
                {Object.entries(uploadProgress).map(([id, progress]) => (
                  <div key={id} className="flex items-center p-3 border rounded-md">
                    <div className="mr-3 shrink-0">
                      <FileText className="h-9 w-9 text-muted-foreground/60" />
                    </div>
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-medium truncate">
                          {id.split('-').slice(2).join('-')}
                        </p>
                        <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted-foreground/20 rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Completed uploads */}
                {allFiles.map(file => (
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
                                  <ExternalLink className="h-3.5 w-3.5" />
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
                                  className="h-7 w-7 text-destructive hover:text-destructive/80"
                                  onClick={() => handleDeleteFile(file.id)}
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
                <p>No files available for this piece. Upload one to get started.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
      
      {/* File Preview Dialog */}
      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-background sticky top-0 z-10 border-b">
              <DialogTitle className="text-base font-medium">{previewFile.name}</DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setPreviewFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-64px)]">
              {previewFile.type.includes('pdf') ? (
                <div className="w-full h-[70vh] bg-muted rounded-md flex items-center justify-center">
                  <iframe 
                    title={previewFile.name} 
                    src="/placeholder-pdf-viewer.html" 
                    className="w-full h-full rounded-md"
                  />
                </div>
              ) : previewFile.type.includes('image') ? (
                <div className="flex justify-center">
                  <img 
                    src="/placeholder-image.jpg" 
                    alt={previewFile.name} 
                    className="max-w-full max-h-[70vh] object-contain rounded-md" 
                  />
                </div>
              ) : (
                <div className="w-full h-[30vh] bg-muted flex items-center justify-center rounded-md">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                    <p>This file type cannot be previewed</p>
                    <Button 
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.open(previewFile.url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
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
  
  // Filter repertoire based on active student, search query, and active tab
  const getFilteredRepertoire = () => {
    let filteredItems: RepertoireItemData[] = [];
    
    if (activeStudent) {
      // Find the active student
      const student = studentsList.find(s => s.id === activeStudent);
      
      if (student) {
        // Combine current and past repertoire for the student
        const studentRepertoire: RepertoireItemData[] = [
          ...(student.currentRepertoire || []).map(piece => ({
            id: piece.id,
            title: piece.title,
            composer: piece.composer || '',
            startedDate: piece.startDate,
            status: piece.status,
            studentId: student.id
          })),
          ...(student.pastRepertoire || []).map(piece => ({
            id: piece.id,
            title: piece.title,
            composer: piece.composer || '',
            startedDate: piece.startDate,
            status: piece.status,
            studentId: student.id
          }))
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
    
    // Create a new student repertoire piece
    const newStudentPiece: RepertoirePiece = {
      id: `${studentId}-${pieceId}`,
      title: piece.title,
      composer: piece.composer,
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
    setSelectedPiece(piece);
    setIsPieceDetailDialogOpen(true);
  };

  const filteredRepertoire = getFilteredRepertoire();
  const groupedRepertoire = groupByComposer(filteredRepertoire);
  
  return (
    <>
      <PageHeader 
        title="Repertoire" 
        description="Manage your students' repertoire"
      >
        <div className="flex gap-2">
          <Button onClick={() => setIsAssignPieceDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Assign to Student
          </Button>
          <Button variant="outline" onClick={() => setIsAddPieceDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Piece
          </Button>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-4 sticky top-6">
            <div className="rounded-lg border p-4 animate-slide-up animate-stagger-1">
              <h3 className="font-medium mb-3">Repertoire Views</h3>
              <div className="space-y-2">
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
            
            {/* View Mode Toggle - Only visible for Master Repertoire */}
            {!activeStudent && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setViewMode(viewMode === 'list' ? 'composer' : 'list')}
                      className="mr-1"
                    >
                      {viewMode === 'list' ? 
                        <BookText className="h-4 w-4" /> : 
                        <List className="h-4 w-4" />
                      }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {viewMode === 'list' ? 'Switch to Composer View' : 'Switch to List View'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
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
              
              <TabsContent value={activeTab} className="space-y-4 mt-0">
                {filteredRepertoire.length > 0 ? (
                  filteredRepertoire.map(item => (
                    <div key={item.id} className="flex items-center">
                      <div 
                        className="flex-1 cursor-pointer" 
                        onClick={() => handleOpenPieceDetail(item)}
                      >
                        <RepertoireItem item={item} className="flex-1" />
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
                  ))
                ) : (
                  <Card className="p-6 text-center text-muted-foreground">
                    <p>No repertoire found. Try changing your search or filters.</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            /* Master Repertoire View without tabs or status filtering */
            <div className="space-y-4 animate-slide-up animate-stagger-3">
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
                      <AccordionContent className="px-4 pt-2 pb-4 space-y-3">
                        {pieces.map(item => (
                          <div key={item.id} className="flex items-center">
                            <div 
                              className="flex-1 cursor-pointer" 
                              onClick={() => handleOpenPieceDetail(item)}
                            >
                              <RepertoireItem item={item} className="flex-1" />
                            </div>
                            <div className="flex flex-col gap-2 ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsAssignPieceDialogOpen(true)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : filteredRepertoire.length > 0 ? (
                /* List View */
                filteredRepertoire.map(item => (
                  <div key={item.id} className="flex items-center">
                    <div 
                      className="flex-1 cursor-pointer" 
                      onClick={() => handleOpenPieceDetail(item)}
                    >
                      <RepertoireItem item={item} className="flex-1" />
                    </div>
                    <div className="flex flex-col gap-2 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsAssignPieceDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <Card className="p-6 text-center text-muted-foreground">
                  <p>No repertoire found. Try changing your search or filters.</p>
                </Card>
              )}
            </div>
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
        setActiveStudent={setActiveStudent}
        setActiveTab={setActiveTab}
      />
    </>
  );
};

export default RepertoirePage;
