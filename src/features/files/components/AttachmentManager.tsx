import React, { useState, useEffect } from 'react';
import { Button } from '@core/components/ui/inputs';
import { Input } from '@core/components/ui/inputs';
import { Label } from '@core/components/ui/inputs';
import { Badge } from '@core/components/ui/data-display';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@core/components/ui/overlays';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/ui/inputs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@core/components/ui/data-display';
import { FileText, Link as LinkIcon, Paperclip, Plus, X, Download, ExternalLink } from 'lucide-react';
import { 
  AttachmentEntityType,
  AttachmentType,
  createAttachmentId,
  createAttachmentAssociation,
  getAttachmentsForEntity,
  getEntitiesForAttachment,
  mockAttachments,
  mockAttachmentAssociations
} from '@features/files/utils';

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

export function AttachmentManager({
  entityType,
  entityId,
  allowUpload = true,
  allowDelete = true,
  showAssociations = false,
  title = 'Attachments',
  onAttachmentSelect,
  className = ''
}: AttachmentManagerProps) {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
  const [isAddAttachmentOpen, setIsAddAttachmentOpen] = useState(false);

  // Load attachments for this entity on mount
  useEffect(() => {
    // In a real app, this would be an API call
    const entityAttachments = getAttachmentsForEntity(entityType, entityId);
    setAttachments(entityAttachments);
  }, [entityType, entityId]);

  // Handle clicking on an attachment
  const handleAttachmentSelect = (attachmentId: string) => {
    if (onAttachmentSelect) {
      onAttachmentSelect(attachmentId);
    } else {
      // Show attachment details if no custom handler is provided
      const attachment = mockAttachments.find(a => a.id === attachmentId);
      if (attachment) {
        setSelectedAttachment(attachment);
        setIsDetailsOpen(true);
      }
    }
  };

  // Format file size from bytes to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Format entity type to be more readable
  const formatEntityType = (type: AttachmentEntityType): string => {
    const formatted = type.replace(/_/g, ' ').toLowerCase();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Get icon based on attachment type
  const getAttachmentIcon = (attachment: any) => {
    switch (attachment.type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <Paperclip className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        {allowUpload && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddAttachmentOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </Button>
        )}
      </div>

      {attachments.length === 0 ? (
        <div className="text-center p-4 border border-dashed rounded-md">
          <p className="text-muted-foreground">No attachments found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attachments.map(attachment => (
              <TableRow key={attachment.id}>
                <TableCell>
                  <div className="flex items-center">
                    {getAttachmentIcon(attachment)}
                  </div>
                </TableCell>
                <TableCell 
                  className="font-medium cursor-pointer hover:text-primary"
                  onClick={() => handleAttachmentSelect(attachment.id)}
                >
                  {attachment.fileName || attachment.title}
                </TableCell>
                <TableCell>
                  {attachment.fileSize ? formatFileSize(attachment.fileSize) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    {attachment.type === 'document' && (
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {attachment.type === 'link' && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    {allowDelete && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive"
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
      )}

      {/* Attachment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attachment Details</DialogTitle>
          </DialogHeader>
          {selectedAttachment && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <div className="font-medium">
                  {selectedAttachment.fileName || selectedAttachment.title}
                </div>
              </div>
              
              <div>
                <Label>Type</Label>
                <div>
                  <Badge variant="outline">
                    {selectedAttachment.type}
                  </Badge>
                </div>
              </div>
              
              {selectedAttachment.fileSize && (
                <div>
                  <Label>Size</Label>
                  <div>{formatFileSize(selectedAttachment.fileSize)}</div>
                </div>
              )}
              
              {selectedAttachment.url && (
                <div>
                  <Label>URL</Label>
                  <div className="truncate text-blue-600">
                    <a href={selectedAttachment.url} target="_blank" rel="noopener noreferrer">
                      {selectedAttachment.url}
                    </a>
                  </div>
                </div>
              )}
              
              {showAssociations && (
                <div>
                  <Label>Used In</Label>
                  <div className="space-y-1 mt-1">
                    {getEntitiesForAttachment(selectedAttachment.id).map(assoc => (
                      <Badge key={assoc.entityId} variant="secondary" className="mr-1">
                        {formatEntityType(assoc.entityType)} {assoc.entityId.substring(0, 8)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Attachment Dialog - Would be implemented in a real application */}
      <Dialog open={isAddAttachmentOpen} onOpenChange={setIsAddAttachmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="attachment-type">Type</Label>
              <Select defaultValue="document">
                <SelectTrigger id="attachment-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">File</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="attachment-file">File</Label>
              <Input type="file" id="attachment-file" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAttachmentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setIsAddAttachmentOpen(false)}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 