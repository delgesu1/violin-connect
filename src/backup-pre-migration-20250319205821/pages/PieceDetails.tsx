import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMasterRepertoirePiece } from '@/hooks/useRepertoire';
import { useRepertoireFiles } from '@/hooks/useRepertoireFiles';
import { useRepertoireLinks } from '@/hooks/useRepertoireLinks';
import { usePieceStudentHistory } from '@/hooks/usePieceStudentHistory';
import { useStudents } from '@/hooks/useStudents';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { 
  Share, 
  Edit, 
  FileText, 
  ArrowLeft, 
  Download,
  ExternalLink,
  Music, 
  Users,
  Youtube,
  Clock,
  CheckCircle,
  PlusCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/types/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type MasterRepertoire = Database['public']['Tables']['master_repertoire']['Row'];

const PieceDetailsPage = () => {
  const { pieceId } = useParams<{ pieceId: string }>();
  const { toast } = useToast();
  
  // Fetch the piece data
  const { data: piece, isLoading: pieceLoading } = useMasterRepertoirePiece(pieceId);
  
  // Fetch files and links for this piece
  const { data: files = [], isLoading: filesLoading } = useRepertoireFiles(pieceId);
  const { data: links = [], isLoading: linksLoading } = useRepertoireLinks(pieceId);
  
  // Fetch student history for this piece
  const { data: studentHistory = [], isLoading: historyLoading } = usePieceStudentHistory(pieceId);
  
  // Convert MasterRepertoire to RepertoirePiece format for the PieceCard component
  const transformPiece = (masterPiece: MasterRepertoire) => {
    return {
      id: masterPiece.id,
      masterPieceId: masterPiece.id, // Self-reference for master pieces
      startDate: masterPiece.started_date || new Date().toISOString().split('T')[0],
      status: 'current' as const,
      title: masterPiece.title,
      composer: masterPiece.composer || 'Unknown',
      notes: masterPiece.notes || undefined,
      _source: (masterPiece as any)._source
    };
  };
  
  // Handle assigning the piece to a student
  const handleAssign = () => {
    toast({
      title: "Feature coming soon",
      description: "Assigning pieces to students will be available in the next update.",
    });
  };
  
  // Handle adding a new file
  const handleAddFile = () => {
    toast({
      title: "Add File",
      description: "File upload functionality coming soon",
    });
  };
  
  // Handle adding a new link
  const handleAddLink = () => {
    toast({
      title: "Add Link",
      description: "Link creation functionality coming soon",
    });
  };
  
  // Determine icon for file type
  const getFileIcon = (type: string) => {
    if (type && type.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (type && type.includes('audio')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };
  
  // Determine icon for link type
  const getLinkIcon = (url: string) => {
    if (url.includes('youtube')) return <Youtube className="h-4 w-4 text-red-500" />;
    if (url.includes('spotify')) return <Music className="h-4 w-4 text-green-500" />;
    return <ExternalLink className="h-4 w-4" />;
  };
  
  if (pieceLoading || filesLoading || linksLoading || historyLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Piece Details" />
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  if (!piece) {
    return (
      <div className="container mx-auto px-4 py-6">
        <PageHeader title="Piece Not Found" />
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-xl font-medium mb-2">The piece you're looking for doesn't exist</h2>
          <p className="text-muted-foreground mb-6">It may have been removed or the URL is incorrect.</p>
          <Button asChild>
            <Link to="/repertoire">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Repertoire
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const transformedPiece = transformPiece(piece as MasterRepertoire);
  const currentStudents = studentHistory.filter(s => s.status === 'current').length;
  const pastStudents = studentHistory.filter(s => s.status === 'completed').length;

  return (
    <div>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold">{piece.title || 'Unknown'}</h1>
            <p className="text-xl text-muted-foreground">{piece.composer || 'Unknown'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/repertoire">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button onClick={handleAssign}>
              <Share className="h-4 w-4 mr-2" />
              Assign to Student
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container max-w-4xl mx-auto px-4">
        {/* Files Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Files</h2>
            <Button variant="outline" size="sm" onClick={handleAddFile}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add File
            </Button>
          </div>
          
          {files.length === 0 ? (
            <p className="text-muted-foreground">No files attached to this piece</p>
          ) : (
            <div className="space-y-2">
              {files.map(file => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-3 border-b hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.file_type || '')}
                    <div>
                      <div className="font-medium">{file.file_name}</div>
                      <div className="text-xs text-muted-foreground">{file.file_type || 'Unknown type'}</div>
                    </div>
                    {file._source && (
                      <Badge 
                        variant={
                          file._source === 'database' ? 'outline' : 
                          file._source === 'cached' ? 'secondary' : 
                          'destructive'
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-xs"
                      >
                        {file._source}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Links Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Links</h2>
            <Button variant="outline" size="sm" onClick={handleAddLink}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
          
          {links.length === 0 ? (
            <p className="text-muted-foreground">No links associated with this piece</p>
          ) : (
            <div className="space-y-2">
              {links.map(link => (
                <div 
                  key={link.id}
                  className="flex items-center justify-between p-3 border-b hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {getLinkIcon(link.url)}
                    <div>
                      <div className="font-medium">{link.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                    </div>
                    {link._source && (
                      <Badge 
                        variant={
                          link._source === 'database' ? 'outline' : 
                          link._source === 'cached' ? 'secondary' : 
                          'destructive'
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-xs"
                      >
                        {link._source}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Students Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Students</h2>
            <Button variant="outline" size="sm" onClick={handleAssign}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Assign to Student
            </Button>
          </div>
          
          {studentHistory.length === 0 ? (
            <p className="text-muted-foreground">No students have played this piece</p>
          ) : (
            <div className="space-y-6">
              {currentStudents > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Currently Playing</h3>
                  <div className="space-y-2">
                    {studentHistory
                      .filter(student => student.status === 'current')
                      .map(student => (
                        <div 
                          key={student.id} 
                          className="flex items-center justify-between p-3 border-b hover:bg-muted/30 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.avatarUrl} alt={student.name} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-1" />
                                <span>Started {student.startDate}</span>
                              </div>
                            </div>
                            {student._source && (
                              <Badge 
                                variant={
                                  student._source === 'database' ? 'outline' : 
                                  student._source === 'cached' ? 'secondary' : 
                                  'destructive'
                                }
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-xs"
                              >
                                {student._source}
                              </Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {pastStudents > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Previously Played</h3>
                  <div className="space-y-2">
                    {studentHistory
                      .filter(student => student.status === 'completed')
                      .map(student => (
                        <div 
                          key={student.id} 
                          className="flex items-center justify-between p-3 border-b hover:bg-muted/30 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.avatarUrl} alt={student.name} />
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                <span>Completed {student.endDate}</span>
                              </div>
                            </div>
                            {student._source && (
                              <Badge 
                                variant={
                                  student._source === 'database' ? 'outline' : 
                                  student._source === 'cached' ? 'secondary' : 
                                  'destructive'
                                }
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-xs"
                              >
                                {student._source}
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">Completed</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Teaching Resources */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Teaching Resources</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-lg">
              <FileText className="h-8 w-8 text-blue-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">Teaching Materials</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Exercises, techniques, and pedagogy tips for teaching this piece effectively.
              </p>
              <Button variant="outline" className="w-full">
                View Teaching Guide
              </Button>
            </div>
            
            <div className="p-5 bg-amber-50/30 border border-amber-100 rounded-lg">
              <FileText className="h-8 w-8 text-amber-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">Practice Routine</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Suggested practice schedule and exercises for students working on this piece.
              </p>
              <Button variant="outline" className="w-full">
                View Practice Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieceDetailsPage; 