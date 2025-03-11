import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RepertoirePiece, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { useRepertoire } from '@/contexts/RepertoireContext';
import { ArrowRight } from 'lucide-react';

interface MigrationPieceStatusProps {
  originalPiece: LegacyRepertoirePiece;
  migratedPiece: RepertoirePiece;
  masterPiece?: RepertoireItemData;
}

/**
 * MigrationPieceStatus Component
 * 
 * Displays the before and after state of a piece during migration,
 * showing how direct properties are replaced with masterPieceId references.
 */
const MigrationPieceStatus: React.FC<MigrationPieceStatusProps> = ({
  originalPiece,
  migratedPiece,
  masterPiece
}) => {
  const { getPieceTitle, getPieceComposer } = useRepertoire();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 p-4">
        <CardTitle className="text-sm">Piece Migration Status</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Original Piece */}
          <div className="flex-1 space-y-3">
            <div className="text-sm font-medium text-muted-foreground">Before Migration</div>
            
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="col-span-2 font-mono text-xs bg-gray-100 p-1 rounded">{originalPiece.id}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="col-span-2">{originalPiece.title}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Composer:</span>
                  <span className="col-span-2">{originalPiece.composer}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="col-span-2 w-min">{originalPiece.status}</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Started:</span>
                  <span className="col-span-2">{originalPiece.startDate}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Master ID:</span>
                  <span className="col-span-2 text-red-500 italic text-xs">Not set</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <ArrowRight className="h-8 w-8 text-muted-foreground" />
          </div>
          
          {/* Migrated Piece */}
          <div className="flex-1 space-y-3">
            <div className="text-sm font-medium text-muted-foreground">After Migration</div>
            
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="col-span-2 font-mono text-xs bg-gray-100 p-1 rounded">{migratedPiece.id}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Title (via):</span>
                  <span className="col-span-2">{getPieceTitle(migratedPiece)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Composer (via):</span>
                  <span className="col-span-2">{getPieceComposer(migratedPiece)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="col-span-2 w-min">{migratedPiece.status}</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Started:</span>
                  <span className="col-span-2">{migratedPiece.startDate}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Master ID:</span>
                  <span className="col-span-2 font-mono text-xs bg-green-100 text-green-800 p-1 rounded">
                    {migratedPiece.masterPieceId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {masterPiece && (
          <div className="mt-6 pt-4 border-t">
            <div className="text-sm font-medium text-muted-foreground mb-3">Master Piece Reference</div>
            
            <div className="border rounded-md p-3 bg-blue-50">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="col-span-2 font-mono text-xs bg-blue-100 p-1 rounded">{masterPiece.id}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="col-span-2 font-medium">{masterPiece.title}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-muted-foreground">Composer:</span>
                    <span className="col-span-2">{masterPiece.composer}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {masterPiece.difficulty && (
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <Badge className="col-span-2 w-min">{masterPiece.difficulty}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MigrationPieceStatus; 