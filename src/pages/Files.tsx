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
  BookText,
  User,
  Calendar,
  Music,
  MoreHorizontal,
  ListFilter,
  Grid,
  List,
  Download,
  Share,
  Link as LinkIcon,
  File
} from 'lucide-react';
import { AttachmentEntityType, AttachmentType, mockAttachments, mockAttachmentAssociations } from '@/lib/attachment-utils';
import AttachmentManager from '@/components/common/AttachmentManager';
import { cn } from '@/lib/utils';

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
  
  // Map the entity types to tabs
  const entityTypeTabs = [
    { id: 'all', label: 'All Files', icon: FileArchive },
    { id: AttachmentEntityType.PIECE, label: 'Repertoire', icon: BookText },
    { id: AttachmentEntityType.STUDENT, label: 'Students', icon: User },
    { id: AttachmentEntityType.LESSON, label: 'Lessons', icon: Calendar },
    { id: AttachmentEntityType.PRACTICE, label: 'Practice', icon: Music }
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
  
  return (
    <div className="container py-6">
      <PageHeader
        title="Files"
        description="Manage and organize all your uploaded resources"
        className="mb-6"
      />
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-6">
          {/* Tabs */}
          <Card>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                {entityTypeTabs.map(tab => (
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
                  <Button variant="outline" size="icon">
                    <ListFilter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Dynamic content based on selected tab */}
              {activeTab === 'all' ? (
                <div className="space-y-6">
                  {Object.entries(AttachmentEntityType).map(([key, entityType]) => (
                    <div key={entityType} className="mb-6">
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        {(() => {
                          const tabInfo = entityTypeTabs.find(tab => tab.id === entityType);
                          if (tabInfo && tabInfo.icon) {
                            return React.createElement(tabInfo.icon, { className: "h-5 w-5 text-primary" });
                          }
                          return null;
                        })()}
                        {entityTypeTabs.find(tab => tab.id === entityType)?.label || entityType}
                      </h3>
                      
                      {/* List entities of this type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockAttachmentAssociations
                          .filter(assoc => assoc.entityType === entityType)
                          .map(assoc => {
                            const attachment = mockAttachments[assoc.attachmentId];
                            if (!attachment) return null;
                            
                            // Filter by tags if any are selected
                            if (selectedTags.length > 0 && 
                                (!attachment.tags || !selectedTags.some(tag => attachment.tags?.includes(tag)))) {
                              return null;
                            }
                            
                            return (
                              <Card key={`${assoc.entityType}-${assoc.entityId}-${assoc.attachmentId}`} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                  <div className="p-4">
                                    <div className="flex items-start gap-3">
                                      {attachment.type === AttachmentType.FILE ? (
                                        <FileIcon className="h-10 w-10 text-primary/70" />
                                      ) : (
                                        <LinkIcon className="h-10 w-10 text-blue-500/70" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium truncate">{attachment.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {attachment.type === AttachmentType.FILE ? (
                                            <>
                                              {attachment.fileType.split('/')[1]?.toUpperCase()} • 
                                              {attachment.size < 1024 * 1024 
                                                ? `${Math.round(attachment.size / 1024)} KB` 
                                                : `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`}
                                            </>
                                          ) : (
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
                                        <Download className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Share className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <AttachmentManager 
                  entityType={activeTab === 'all' ? AttachmentEntityType.PIECE : activeTab as AttachmentEntityType}
                  entityId="*" // Special value to show all entities of this type
                  showAssociations={true}
                  title={entityTypeTabs.find(tab => tab.id === activeTab)?.label || 'Files'}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FilesPage;
