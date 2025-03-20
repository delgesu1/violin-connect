import React from 'react';
import { Badge } from '@core/components/ui/data-display';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@core/components/ui/data-display';
import { Avatar, AvatarFallback, AvatarImage } from '@core/components/ui/data-display';
import { Button } from '@core/components/ui/inputs';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@core/components/ui/overlays';
import { 
  Music, 
  FileText, 
  Link as LinkIcon, 
  Users, 
  Download, 
  Calendar, 
  ExternalLink,
  Youtube,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn } from '@core/utils';
import { useRepertoire } from '@/features/repertoire/contexts';
import type { RepertoirePiece, LegacyRepertoirePiece } from '@/features/repertoire/types';

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
export default function PieceCard({
  piece,
  files = [],
  links = [],
  studentHistory = [],
  className = '',
  showSource = true
}: PieceCardProps) {
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
    <Card className={cn("overflow-hidden h-full flex flex-col", className)}>
      <CardHeader className="bg-muted/40 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {composer}
            </p>
          </div>
          {difficulty && (
            <Badge variant="outline" className="ml-2">
              {difficulty}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-0">
        <div className="h-full overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {/* Students Section */}
          {studentHistory.length > 0 && (
            <div>
              <h3 className="font-medium text-sm flex items-center mb-2">
                <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
                Students
              </h3>
              <div className="space-y-2">
                {studentHistory.map(student => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={student.avatarUrl} />
                        <AvatarFallback>
                          {student.name?.charAt(0) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{student.name}</span>
                    </div>
                    <div className="flex items-center">
                      {student.status === 'current' ? (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Completed</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Files Section */}
          {files.length > 0 && (
            <div>
              <h3 className="font-medium text-sm flex items-center mb-2">
                <FileText className="h-4 w-4 mr-1.5 text-muted-foreground" />
                Files
              </h3>
              <div className="space-y-1.5">
                {files.map(file => (
                  <div key={file.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getFileIcon(file.type)}
                      <span className="text-sm ml-1.5">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Links Section */}
          {links.length > 0 && (
            <div>
              <h3 className="font-medium text-sm flex items-center mb-2">
                <LinkIcon className="h-4 w-4 mr-1.5 text-muted-foreground" />
                Links
              </h3>
              <div className="space-y-1.5">
                {links.map(link => (
                  <div key={link.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getLinkIcon(link.url)}
                      <span className="text-sm ml-1.5">{link.title}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      asChild
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Source Information */}
          {showSource && piece._source && (
            <div className="mt-auto pt-2">
              <p className="text-xs text-muted-foreground flex items-center">
                <span>Source: {piece._source}</span>
                {piece.masterPieceId && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="ml-1.5">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Master Piece ID: {piece.masterPieceId}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/30 justify-between py-2 px-4">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          <span>Added: {new Date(piece.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          {currentStudents > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    <Music className="h-3 w-3 mr-1" />
                    {currentStudents}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{currentStudents} student{currentStudents !== 1 ? 's' : ''} currently learning</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {pastStudents > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {pastStudents}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{pastStudents} student{pastStudents !== 1 ? 's' : ''} completed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 