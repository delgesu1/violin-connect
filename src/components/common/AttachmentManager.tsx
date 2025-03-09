import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { FileText, Link as LinkIcon, Paperclip, Plus, X, Download, ExternalLink } from 'lucide-react';
import { 
  mockAttachments,
  mockAttachmentAssociations,
  AttachmentEntityType,
  AttachmentType,
  createAttachmentId,
  createAttachmentAssociation,
  getAttachmentsForEntity,
  getEntitiesForAttachment
} from '@/lib/attachment-utils';

// Props for the AttachmentManager component
interface AttachmentManagerProps {
  entityType: AttachmentEntityType;
  entityId: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  showAssociations?: boolean;
  title?: string;
  onAttachmentSelect?: (attachmentId: string) => void;
  className?: string;
}

/**
 * AttachmentManager Component
 * 
 * This component displays and manages attachments for a specific entity.
 * It demonstrates the unified attachment system where files can be associated
 * with multiple entity types such as pieces, students, lessons, etc.
 */
const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  entityType,
  entityId,
  allowUpload = true,
  allowDelete = true,
  showAssociations = false,
  title = 'Attachments',
  onAttachmentSelect,
  className = ''
}) => {
  // Local state
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null);
  const [showAttachmentDetails, setShowAttachmentDetails] = useState(false);
  const [attachmentEntities, setAttachmentEntities] = useState<{entityType: AttachmentEntityType; entityId: string}[]>([]);
  
  // Load attachments for this entity
  useEffect(() => {
    const loadedAttachments = getAttachmentsForEntity(
      entityType,
      entityId,
      mockAttachmentAssociations,
      mockAttachments
    );
    
    setAttachments(loadedAttachments);
  }, [entityType, entityId, mockAttachmentAssociations, mockAttachments]);
  
  // Handle attachment selection
  const handleAttachmentSelect = (attachmentId: string) => {
    setSelectedAttachmentId(attachmentId);
    
    // Load entities associated with this attachment
    if (showAssociations) {
      const entities = getEntitiesForAttachment(attachmentId, mockAttachmentAssociations);
      setAttachmentEntities(entities);
      setShowAttachmentDetails(true);
    }
    
    // Call external handler if provided
    if (onAttachmentSelect) {
      onAttachmentSelect(attachmentId);
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Format entity type for display
  const formatEntityType = (type: AttachmentEntityType): string => {
    switch (type) {
      case AttachmentEntityType.PIECE: return 'Repertoire Piece';
      case AttachmentEntityType.STUDENT: return 'Student';
      case AttachmentEntityType.LESSON: return 'Lesson';
      case AttachmentEntityType.PRACTICE: return 'Practice Assignment';
      default: return type;
    }
  };
  
  // Get icon component based on attachment type
  const getAttachmentIcon = (attachment: any) => {
    if (attachment.type === AttachmentType.FILE) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <LinkIcon className="h-4 w-4" />;
    }
  };
  
  return (
    <div className={`attachment-manager ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          {title}
        </h3>
        
        {allowUpload && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        )}
      </div>
      
      {attachments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attachments.map(attachment => (
              <TableRow 
                key={attachment.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleAttachmentSelect(attachment.id)}
              >
                <TableCell>{getAttachmentIcon(attachment)}</TableCell>
                <TableCell>{attachment.name}</TableCell>
                <TableCell>
                  {attachment.type === AttachmentType.FILE ? 
                    attachment.fileType.split('/')[1]?.toUpperCase() : 
                    attachment.linkType.toUpperCase()}
                </TableCell>
                <TableCell className="text-right">
                  {attachment.type === AttachmentType.FILE ? 
                    formatFileSize(attachment.size) : 
                    '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    {attachment.type === AttachmentType.FILE ? (
                      <Button size="icon" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" 
                        onClick={(e) => { 
                          e.stopPropagation();
                          window.open(attachment.url, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {allowDelete && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Here you would implement delete functionality
                          alert(`Delete ${attachment.name}?`);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          No attachments available
        </div>
      )}
      
      {/* Attachment Details Dialog */}
      {showAssociations && (
        <Dialog 
          open={showAttachmentDetails} 
          onOpenChange={setShowAttachmentDetails}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Attachment Associations</DialogTitle>
            </DialogHeader>
            
            {selectedAttachmentId && (
              <div>
                <p className="mb-4">
                  This attachment is associated with the following entities:
                </p>
                
                <div className="space-y-2">
                  {attachmentEntities.map((entity, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                      <Badge>
                        {formatEntityType(entity.entityType)}
                      </Badge>
                      <span>{entity.entityId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowAttachmentDetails(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Add Attachment Dialog - Would be implemented in a real application */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="attachment-type">Attachment Type</Label>
              <Select defaultValue="file">
                <SelectTrigger id="attachment-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="attachment-name">Name</Label>
              <Input id="attachment-name" placeholder="Enter name" />
            </div>
            
            <div>
              <Label htmlFor="attachment-url">URL</Label>
              <Input id="attachment-url" placeholder="Enter URL" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Here you would implement adding an attachment
              alert('Add attachment functionality would be implemented here');
              setIsAddDialogOpen(false);
            }}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttachmentManager; 