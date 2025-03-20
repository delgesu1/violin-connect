import React from 'react';
import { RepertoirePiece, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRepertoire } from '@/contexts/RepertoireContext';
import { 
  Music, 
  FileText, 
  Link as LinkIcon, 
  Users, 
  Download, 
  Calendar, 
  GraduationCap,
  Sparkles,
  Clock,
  BookOpen,
  ExternalLink,
  Youtube,
  CheckCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface LinkResource {
  id: string;
  title: string;
  url: string;
}

interface StudentHistory {
  id: string;
  name: string;
  avatarUrl?: string;
  status: 'current' | 'completed';
  startDate: string;
  endDate?: string;
}

interface PieceCardProps {
  piece: RepertoirePiece | LegacyRepertoirePiece;
  files?: FileAttachment[];
  links?: LinkResource[];
  studentHistory?: StudentHistory[];
  className?: string;
  showSource?: boolean;
}

/**
 * A beautiful, modern piece card component with vertical scrolling design
 */
const PieceCard: React.FC<PieceCardProps> = ({
  piece,
  files = [],
  links = [],
  studentHistory = [],
  className = '',
  showSource = true
}) => {
  // Get piece information from context
  const { getPieceTitle, getPieceComposer, getPieceDifficulty } = useRepertoire();
  
  // Get piece details
  const title = getPieceTitle(piece);
  const composer = getPieceComposer(piece);
  const difficulty = getPieceDifficulty(piece);
  
  // Count students by status
  const currentStudents = studentHistory.filter(s => s.status === 'current').length;
  const pastStudents = studentHistory.filter(s => s.status === 'completed').length;
  
  // File types with corresponding icons
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (type.includes('image')) return <FileText className="h-4 w-4 text-green-500" />;
    if (type.includes('audio')) return <FileText className="h-4 w-4 text-amber-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };
  
  // Determine icon for link type
  const getLinkIcon = (url: string) => {
    if (url.includes('youtube')) return <Youtube className="h-4 w-4 text-red-500" />;
    if (url.includes('spotify')) return <Music className="h-4 w-4 text-green-500" />;
    return <ExternalLink className="h-4 w-4 text-blue-500" />;
  };
  
  return (
    <Card className={cn(
      "overflow-hidden border border-gray-200 transition-all duration-300",
      "hover:border-primary/30 hover:shadow-sm",
      className
    )}>
      {/* Header with main piece info */}
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold leading-tight flex items-center gap-2">
              {title}
              {difficulty && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {difficulty}
                </Badge>
              )}
              {showSource && (piece as any)._source && (
                <Badge 
                  variant={
                    (piece as any)._source === 'database' ? 'outline' : 
                    (piece as any)._source === 'cached' ? 'secondary' : 
                    'destructive'
                  } 
                  className="ml-auto text-xs"
                >
                  {(piece as any)._source}
                </Badge>
              )}
            </CardTitle>
            <div className="text-muted-foreground font-medium">
              {composer}
            </div>
          </div>
          <div className="rounded-full bg-gray-50 p-2 border border-gray-100 bg-opacity-80">
            <Music className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-8">
          {/* Overview section */}
          <section className="space-y-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-primary">Overview</h3>
              <div className="h-px flex-1 bg-gray-100 ml-3"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Difficulty</div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{difficulty || 'Not specified'}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Started</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{piece.startDate || 'Not started'}</span>
                </div>
              </div>
            </div>
            
            {piece.notes && (
              <div className="space-y-2 pt-1">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Notes</div>
                <div className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                  {piece.notes}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex flex-col items-center px-3">
                <span className="text-lg font-semibold">{currentStudents}</span>
                <span className="text-xs text-muted-foreground">Current</span>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="flex flex-col items-center px-3">
                <span className="text-lg font-semibold">{pastStudents}</span>
                <span className="text-xs text-muted-foreground">Past</span>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="flex flex-col items-center px-3">
                <span className="text-lg font-semibold">{files.length}</span>
                <span className="text-xs text-muted-foreground">Files</span>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="flex flex-col items-center px-3">
                <span className="text-lg font-semibold">{links.length}</span>
                <span className="text-xs text-muted-foreground">Links</span>
              </div>
            </div>
          </section>
          
          {/* Files section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-primary flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Files
              </h3>
              <div className="h-px flex-1 bg-gray-100 ml-3"></div>
            </div>
            
            {files.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No files attached to this piece</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map(file => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <div className="text-sm font-medium">{file.name}</div>
                        <div className="text-xs text-muted-foreground">{file.type}</div>
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {/* Links section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-primary flex items-center">
                <LinkIcon className="h-4 w-4 mr-2" />
                Links
              </h3>
              <div className="h-px flex-1 bg-gray-100 ml-3"></div>
            </div>
            
            {links.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No links associated with this piece</p>
              </div>
            ) : (
              <div className="space-y-2">
                {links.map(link => (
                  <div 
                    key={link.id} 
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      {getLinkIcon(link.url)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{link.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {/* Students section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-primary flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Students
              </h3>
              <div className="h-px flex-1 bg-gray-100 ml-3"></div>
            </div>
            
            {studentHistory.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No students have played this piece</p>
              </div>
            ) : (
              <div className="space-y-5">
                {currentStudents > 0 && (
                  <div>
                    <h4 className="text-xs font-medium mb-2 text-primary/80">Currently Playing</h4>
                    <div className="space-y-2">
                      {studentHistory
                        .filter(student => student.status === 'current')
                        .map(student => (
                          <div 
                            key={student.id} 
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={student.avatarUrl} alt={student.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{student.name}</div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  <span>Started {student.startDate}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">Current</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                {pastStudents > 0 && (
                  <div>
                    <h4 className="text-xs font-medium mb-2 text-muted-foreground">Previously Played</h4>
                    <div className="space-y-2">
                      {studentHistory
                        .filter(student => student.status === 'completed')
                        .map(student => (
                          <div 
                            key={student.id} 
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={student.avatarUrl} alt={student.name} />
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{student.name}</div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <CheckCircle className="h-3 w-3 inline mr-1" />
                                  <span>Completed {student.endDate}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">Completed</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-3 flex justify-between border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <Music className="h-3.5 w-3.5 mr-1" />
            Play
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <BookOpen className="h-3.5 w-3.5 mr-1" />
            Details
          </Button>
        </div>
        
        <Button variant="default" size="sm" className="h-8">
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          Assign
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PieceCard; 