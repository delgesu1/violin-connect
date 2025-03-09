
import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  PlusCircle, 
  Music, 
  Search,
  Filter
} from 'lucide-react';
import RepertoireItem, { RepertoireItemData } from '@/components/common/RepertoireItem';
import StudentCard, { Student } from '@/components/common/StudentCard';

// Mock data
const students: Student[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    currentRepertoire: [
      { id: '101', title: 'Bach Partita No. 2', composer: 'J.S. Bach', startDate: '2023-10-01', status: 'current' }
    ],
    nextLesson: 'Today, 4:00 PM',
  },
  {
    id: '2',
    name: 'James Wilson',
    currentRepertoire: [
      { id: '201', title: 'Paganini Caprice No. 24', composer: 'N. Paganini', startDate: '2023-09-10', status: 'current' }
    ],
    nextLesson: 'Tomorrow, 3:30 PM',
  },
  {
    id: '3',
    name: 'Sophia Chen',
    currentRepertoire: [
      { id: '301', title: 'Tchaikovsky Violin Concerto', composer: 'P.I. Tchaikovsky', startDate: '2023-09-05', status: 'current' }
    ],
    nextLesson: 'Friday, 5:00 PM',
  },
  {
    id: '4',
    name: 'Michael Brown',
    currentRepertoire: [
      { id: '401', title: 'Mozart Violin Sonata K.304', composer: 'W.A. Mozart', startDate: '2023-09-20', status: 'current' }
    ],
    nextLesson: 'Next Monday, 4:30 PM',
  }
];

const repertoire: RepertoireItemData[] = [
  {
    id: '1',
    title: 'Partita No. 2',
    composer: 'J.S. Bach',
    startedDate: '2023-10-15',
    status: 'current',
    difficulty: 'advanced'
  },
  {
    id: '2',
    title: 'Violin Concerto in D major',
    composer: 'P.I. Tchaikovsky',
    startedDate: '2023-08-01',
    status: 'current',
    difficulty: 'advanced'
  },
  {
    id: '3',
    title: 'Caprice No. 24',
    composer: 'N. Paganini',
    startedDate: '2023-09-12',
    status: 'current',
    difficulty: 'advanced'
  },
  {
    id: '4',
    title: 'Violin Sonata K.304',
    composer: 'W.A. Mozart',
    startedDate: '2023-07-20',
    status: 'current',
    difficulty: 'intermediate'
  },
  {
    id: '5',
    title: 'Violin Sonata No. 5 (Spring)',
    composer: 'L.V. Beethoven',
    startedDate: '2023-05-10',
    status: 'completed',
    difficulty: 'intermediate'
  },
  {
    id: '6',
    title: 'Introduction and Rondo Capriccioso',
    composer: 'C. Saint-Saëns',
    startedDate: '2023-03-15',
    status: 'completed',
    difficulty: 'advanced'
  }
];

const RepertoirePage = () => {
  const [activeStudent, setActiveStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter repertoire based on active student and search query
  const filteredRepertoire = repertoire.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.composer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });
  
  return (
    <>
      <PageHeader 
        title="Repertoire" 
        description="Manage your students' repertoire"
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Piece
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-4 sticky top-6">
            <div className="rounded-lg border p-4 animate-slide-up animate-stagger-1">
              <h3 className="font-medium mb-3">Students</h3>
              <div className="space-y-2">
                <Button 
                  variant={activeStudent === null ? "default" : "outline"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveStudent(null)}
                >
                  <Music className="mr-2 h-4 w-4" />
                  All Repertoire
                </Button>
                
                {students.map(student => (
                  <Button 
                    key={student.id} 
                    variant={activeStudent === student.id ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => setActiveStudent(student.id)}
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
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="current" className="animate-slide-up animate-stagger-3">
            <TabsList className="mb-4">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-4 mt-0">
              {filteredRepertoire
                .filter(item => item.status === 'current')
                .map(item => (
                  <RepertoireItem key={item.id} item={item} />
                ))}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4 mt-0">
              {filteredRepertoire
                .filter(item => item.status === 'completed')
                .map(item => (
                  <RepertoireItem key={item.id} item={item} />
                ))}
            </TabsContent>
            
            <TabsContent value="all" className="space-y-4 mt-0">
              {filteredRepertoire.map(item => (
                <RepertoireItem key={item.id} item={item} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default RepertoirePage;
