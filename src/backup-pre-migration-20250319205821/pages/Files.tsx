import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Upload, 
  FileArchive,
  FileType,
  Link as LinkIcon,
  Video,
  Music,
  MoreHorizontal,
  ListFilter,
  Grid,
  List,
  Download,
  Share,
  File,
  Info,
  ExternalLink
} from 'lucide-react';
import { AttachmentEntityType, AttachmentType, mockAttachments, mockAttachmentAssociations } from '@/lib/attachment-utils';
import AttachmentManager from '@/components/common/AttachmentManager';
import { cn } from '@/lib/utils';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

// Simple FileIcon component that renders an icon based on file type
const FileIcon: React.FC<{ type?: string; className?: string }> = ({ type = 'other', className }) => {
  return <File className={className} />;
};

const FilesPage = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'filter'>('list');
  
  // Map the file types to tabs
  const fileTypeTabs = [
    { id: 'all', label: 'All Files', icon: FileArchive },
    { id: 'pdf', label: 'PDFs', icon: FileType },
    { id: 'link', label: 'Links', icon: LinkIcon },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music }
  ];
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Get all available tags from the attachments
  const allTags = Object.values(mockAttachments)
    .flatMap(attachment => attachment.tags || [])
    .filter((tag, index, self) => self.indexOf(tag) === index)
    .sort();
  
  // Function to get the appropriate icon for file type
  const getFileTypeIcon = (attachment: any) => {
    if (attachment.type === AttachmentType.FILE) {
      if (attachment.fileType.includes('pdf')) return <FileType className="h-4 w-4 text-primary" />;
      if (attachment.fileType.includes('audio')) return <Music className="h-4 w-4 text-primary" />;
      return <File className="h-4 w-4 text-primary" />;
    } else if (attachment.type === AttachmentType.LINK) {
      if (attachment.linkType === 'youtube') return <Video className="h-4 w-4 text-red-500" />;
      return <LinkIcon className="h-4 w-4 text-blue-500" />;
    }
    return <File className="h-4 w-4" />;
  };
  
  // Filter attachments based on active tab
  const filterAttachmentsByTab = (attachment: any) => {
    if (activeTab === 'all') return true;
    
    if (activeTab === 'pdf') {
      return attachment.type === AttachmentType.FILE && attachment.fileType.includes('pdf');
    }
    
    if (activeTab === 'link') {
      return attachment.type === AttachmentType.LINK && attachment.linkType === 'article';
    }
    
    if (activeTab === 'video') {
      return attachment.type === AttachmentType.LINK && attachment.linkType === 'youtube';
    }
    
    if (activeTab === 'audio') {
      return attachment.type === AttachmentType.FILE && 
        (attachment.fileType.includes('audio') || attachment.fileType.includes('mp3'));
    }
    
    return false;
  };
  
  // Get filtered attachments based on active tab and selected tags
  const getFilteredAttachments = () => {
    return Object.values(mockAttachments)
      .filter(attachment => 
        filterAttachmentsByTab(attachment) && 
        (selectedTags.length === 0 || selectedTags.some(tag => attachment.tags?.includes(tag)))
      );
  };
  
  // Get filtered PDF attachments
  const getPdfAttachments = () => {
    return getFilteredAttachments().filter(attachment => 
      attachment.type === AttachmentType.FILE && attachment.fileType.includes('pdf')
    );
  };
  
  // Get filtered Link attachments
  const getLinkAttachments = () => {
    return getFilteredAttachments().filter(attachment => 
      attachment.type === AttachmentType.LINK && attachment.linkType === 'article'
    );
  };
  
  // Get filtered Video attachments
  const getVideoAttachments = () => {
    return getFilteredAttachments().filter(attachment => 
      attachment.type === AttachmentType.LINK && attachment.linkType === 'youtube'
    );
  };
  
  // Get filtered Audio attachments
  const getAudioAttachments = () => {
    return getFilteredAttachments().filter(attachment => 
      attachment.type === AttachmentType.FILE && 
      (attachment.fileType.includes('audio') || attachment.fileType.includes('mp3'))
    );
  };
  
  // Determine if we should show a section based on the active tab
  const shouldShowSection = (sectionType: string) => {
    if (activeTab === 'all') return true;
    return activeTab === sectionType;
  };
  
  return (
    <div>
      <PageHeader
        title="Files"
        description="Manage and organize all your uploaded resources"
      />
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-6">
          {/* Tabs */}
          <Card>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                {fileTypeTabs.map(tab => (
                  <button
                    key={tab.id}
                    className={cn(
                      "flex items-center gap-2 py-2 px-3 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-primary/5 text-primary border-r-2 border-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {React.createElement(tab.icon, { className: "h-4 w-4" })}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
          
          {/* Tags */}
          <Card>
            <CardContent className="p-3">
              <h3 className="text-sm font-medium mb-2 px-2">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {allTags.length === 0 && (
                  <p className="text-sm text-muted-foreground px-2">No tags found</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Storage */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <h3 className="text-sm font-medium">Storage</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used</span>
                  <span>2.4 GB</span>
                </div>
                <Progress value={30} />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span>8 GB</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <Card>
            <CardContent className="p-6">
              {/* Search and view controls */}
              <div className="flex justify-between mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search files..."
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={viewMode === 'filter' ? "default" : "outline"} 
                    size="icon"
                    onClick={() => setViewMode('filter')}
                  >
                    <ListFilter className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'grid' ? "default" : "outline"} 
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? "default" : "outline"} 
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Display PDFs */}
                {shouldShowSection('pdf') && getPdfAttachments().length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <FileType className="h-5 w-5 text-primary" />
                      PDFs
                    </h3>
                    
                    {/* List PDF files */}
                    {viewMode === 'list' ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40px]"></TableHead>
                              <TableHead>File Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead>Added</TableHead>
                              <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getPdfAttachments().map(attachment => (
                              <TableRow key={attachment.id} className="cursor-pointer hover:bg-muted/50">
                                <TableCell>
                                  <FileType className="h-4 w-4 text-primary" />
                                </TableCell>
                                <TableCell className="font-medium">
                                  {attachment.name}
                                  {attachment.description && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-3.5 w-3.5 inline ml-2 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{attachment.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </TableCell>
                                <TableCell>PDF</TableCell>
                                <TableCell>
                                  {attachment.type === AttachmentType.FILE && (
                                    attachment.size < 1024 * 1024 
                                      ? `${Math.round(attachment.size / 1024)} KB` 
                                      : `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`
                                  )}
                                </TableCell>
                                <TableCell>{new Date(attachment.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Download className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Share className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getPdfAttachments().map(attachment => (
                          <Card key={attachment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  <FileIcon className="h-10 w-10 text-primary/70" />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{attachment.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {attachment.type === AttachmentType.FILE && (
                                        <>
                                          {attachment.fileType.split('/')[1]?.toUpperCase()} • 
                                          {attachment.size < 1024 * 1024 
                                            ? `${Math.round(attachment.size / 1024)} KB` 
                                            : `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`}
                                        </>
                                      )}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                {attachment.tags && attachment.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {attachment.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="px-4 py-2 bg-muted/30 border-t flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  Added {new Date(attachment.createdAt).toLocaleDateString()}
                                </span>
                                
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Share className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Display Links */}
                {shouldShowSection('link') && getLinkAttachments().length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-primary" />
                      Links
                    </h3>
                    
                    {/* List links */}
                    {viewMode === 'list' ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40px]"></TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Added</TableHead>
                              <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getLinkAttachments().map(attachment => (
                              <TableRow key={attachment.id} className="cursor-pointer hover:bg-muted/50">
                                <TableCell>
                                  <LinkIcon className="h-4 w-4 text-blue-500" />
                                </TableCell>
                                <TableCell className="font-medium">
                                  {attachment.name}
                                  {attachment.description && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-3.5 w-3.5 inline ml-2 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{attachment.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </TableCell>
                                <TableCell>Article</TableCell>
                                <TableCell>{new Date(attachment.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Share className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getLinkAttachments().map(attachment => (
                          <Card key={attachment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  <LinkIcon className="h-10 w-10 text-blue-500/70" />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{attachment.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {attachment.type === AttachmentType.LINK && (
                                        <>{attachment.linkType}</>
                                      )}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                {attachment.tags && attachment.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {attachment.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="px-4 py-2 bg-muted/30 border-t flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  Added {new Date(attachment.createdAt).toLocaleDateString()}
                                </span>
                                
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Share className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Display Videos */}
                {shouldShowSection('video') && getVideoAttachments().length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      Videos
                    </h3>
                    
                    {/* List videos */}
                    {viewMode === 'list' ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40px]"></TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Added</TableHead>
                              <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getVideoAttachments().map(attachment => (
                              <TableRow key={attachment.id} className="cursor-pointer hover:bg-muted/50">
                                <TableCell>
                                  <Video className="h-4 w-4 text-red-500" />
                                </TableCell>
                                <TableCell className="font-medium">
                                  {attachment.name}
                                  {attachment.description && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-3.5 w-3.5 inline ml-2 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{attachment.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </TableCell>
                                <TableCell>YouTube</TableCell>
                                <TableCell>{new Date(attachment.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Share className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getVideoAttachments().map(attachment => (
                          <Card key={attachment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                              {attachment.thumbnailUrl && (
                                <div className="w-full aspect-video bg-muted">
                                  <img src={attachment.thumbnailUrl} alt={attachment.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  <Video className="h-10 w-10 text-red-500/70" />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{attachment.name}</h4>
                                    <p className="text-sm text-muted-foreground">YouTube</p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                {attachment.tags && attachment.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {attachment.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="px-4 py-2 bg-muted/30 border-t flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  Added {new Date(attachment.createdAt).toLocaleDateString()}
                                </span>
                                
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Share className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Display Audio */}
                {shouldShowSection('audio') && getAudioAttachments().length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Music className="h-5 w-5 text-primary" />
                      Audio
                    </h3>
                    
                    {/* List audio files */}
                    {viewMode === 'list' ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40px]"></TableHead>
                              <TableHead>File Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead>Added</TableHead>
                              <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getAudioAttachments().map(attachment => (
                              <TableRow key={attachment.id} className="cursor-pointer hover:bg-muted/50">
                                <TableCell>
                                  <Music className="h-4 w-4 text-primary" />
                                </TableCell>
                                <TableCell className="font-medium">
                                  {attachment.name}
                                  {attachment.description && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Info className="h-3.5 w-3.5 inline ml-2 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{attachment.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </TableCell>
                                <TableCell>Audio</TableCell>
                                <TableCell>
                                  {attachment.type === AttachmentType.FILE && (
                                    attachment.size < 1024 * 1024 
                                      ? `${Math.round(attachment.size / 1024)} KB` 
                                      : `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`
                                  )}
                                </TableCell>
                                <TableCell>{new Date(attachment.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Download className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <Share className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getAudioAttachments().map(attachment => (
                          <Card key={attachment.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  <Music className="h-10 w-10 text-primary/70" />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{attachment.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {attachment.type === AttachmentType.FILE && (
                                        <>
                                          {attachment.fileType.split('/')[1]?.toUpperCase()} • 
                                          {attachment.size < 1024 * 1024 
                                            ? `${Math.round(attachment.size / 1024)} KB` 
                                            : `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`}
                                        </>
                                      )}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                {attachment.tags && attachment.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {attachment.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="px-4 py-2 bg-muted/30 border-t flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  Added {new Date(attachment.createdAt).toLocaleDateString()}
                                </span>
                                
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Share className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Display a message if no files match the current filter */}
                {getFilteredAttachments().length === 0 && (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <FileArchive className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No files found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      No files match your current filter. Try selecting a different category or removing tag filters.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FilesPage;
