
import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload,
  Search,
  Filter,
  FileText,
  FileImage,
  FileAudio,
  File, // Replace FilePdf with File
  MoreVertical,
  Download,
  Share,
  Trash,
  Clock,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock file data
interface FileData {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'audio' | 'text' | 'other';
  size: string;
  uploadedBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  uploadedAt: string;
  lastModified: string;
  tags: string[];
  student?: string;
}

const files: FileData[] = [
  {
    id: '1',
    name: 'Bach_Partita_Sheet_Music.pdf',
    type: 'pdf',
    size: '2.4 MB',
    uploadedBy: {
      id: '1',
      name: 'Teacher',
    },
    uploadedAt: '2023-10-12',
    lastModified: '2023-10-12',
    tags: ['sheet music', 'bach', 'partita'],
    student: 'Emma Thompson'
  },
  {
    id: '2',
    name: 'Paganini_Caprice_24_Recording.mp3',
    type: 'audio',
    size: '5.7 MB',
    uploadedBy: {
      id: '2',
      name: 'James Wilson',
    },
    uploadedAt: '2023-10-10',
    lastModified: '2023-10-10',
    tags: ['recording', 'paganini', 'caprice'],
  },
  {
    id: '3',
    name: 'Violin_Posture_Technique.jpg',
    type: 'image',
    size: '1.2 MB',
    uploadedBy: {
      id: '1',
      name: 'Teacher',
    },
    uploadedAt: '2023-10-08',
    lastModified: '2023-10-08',
    tags: ['technique', 'posture', 'tutorial'],
  },
  {
    id: '4',
    name: 'Practice_Schedule_Template.pdf',
    type: 'pdf',
    size: '0.8 MB',
    uploadedBy: {
      id: '1',
      name: 'Teacher',
    },
    uploadedAt: '2023-10-05',
    lastModified: '2023-10-05',
    tags: ['schedule', 'practice', 'template'],
  },
  {
    id: '5',
    name: 'Tchaikovsky_Concerto_Notes.txt',
    type: 'text',
    size: '0.1 MB',
    uploadedBy: {
      id: '3',
      name: 'Sophia Chen',
    },
    uploadedAt: '2023-10-03',
    lastModified: '2023-10-03',
    tags: ['notes', 'tchaikovsky', 'concerto'],
    student: 'Sophia Chen'
  },
  {
    id: '6',
    name: 'Mozart_Sonata_K304_Recording.mp3',
    type: 'audio',
    size: '4.5 MB',
    uploadedBy: {
      id: '4',
      name: 'Michael Brown',
    },
    uploadedAt: '2023-10-01',
    lastModified: '2023-10-01',
    tags: ['recording', 'mozart', 'sonata'],
    student: 'Michael Brown'
  }
];

const FileIcon = ({ type }: { type: FileData['type'] }) => {
  switch (type) {
    case 'pdf':
      return <File className="h-5 w-5 text-red-500" />; // Replace FilePdf with File
    case 'image':
      return <FileImage className="h-5 w-5 text-blue-500" />;
    case 'audio':
      return <FileAudio className="h-5 w-5 text-purple-500" />;
    case 'text':
      return <FileText className="h-5 w-5 text-yellow-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

const FilesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Get unique tags from all files
  const allTags = Array.from(new Set(files.flatMap(file => file.tags)));
  
  // Filter files based on search and tags
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => file.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  return (
    <>
      <PageHeader 
        title="Files" 
        description="Upload and manage sheet music, recordings, and more"
      >
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </PageHeader>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="relative flex-1 animate-slide-up animate-stagger-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap animate-slide-up animate-stagger-2">
          {allTags.slice(0, 5).map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          
          <Button variant="outline" size="sm">
            <Filter className="h-3.5 w-3.5 mr-1" />
            More Filters
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="animate-slide-up animate-stagger-3">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map(file => (
              <Card key={file.id} className="card-hover overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-muted p-2 flex items-center justify-center">
                          <FileIcon type={file.type} />
                        </div>
                        <div>
                          <h3 className="font-medium line-clamp-1">{file.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <span>{file.size}</span>
                            <span>•</span>
                            <span>{file.type.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {file.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 border-t bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={file.uploadedBy.avatarUrl || "/placeholder.svg"} alt={file.uploadedBy.name} />
                        <AvatarFallback>{file.uploadedBy.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{file.uploadedBy.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{file.uploadedAt}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No files match your search criteria.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="shared" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Files shared with you will appear here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="recent" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Your recently accessed files will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default FilesPage;
