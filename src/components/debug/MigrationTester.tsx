import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RepertoirePiece, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { RepertoireItemData } from '@/components/common/RepertoireItem';
import { migrateToMasterPieceReference } from '@/lib/utils/repertoire-utils';
import { useRepertoire } from '@/contexts/RepertoireContext';
import PieceDisplay from '@/components/common/PieceDisplay';
import MigrationPieceStatus from './MigrationPieceStatus';

/**
 * Type guard to check if a piece is a valid RepertoirePiece with masterPieceId
 */
const isValidRepertoirePiece = (piece: any): piece is RepertoirePiece => {
  return piece && typeof piece === 'object' && 'masterPieceId' in piece && !!piece.masterPieceId;
};

/**
 * MigrationTester Component
 * 
 * This component allows developers to test the migration process
 * and see the results in real-time.
 */
const MigrationTester: React.FC = () => {
  // Access the repertoire context
  const { masterRepertoire, getPieceTitle, getPieceComposer } = useRepertoire();
  
  // Sample legacy piece for testing - we need to use as any to bypass TypeScript's strict checking
  // This simulates a piece that came from older data that might not have all required fields
  const [sampleLegacyPiece] = useState<any>({
    id: 'sample-1',
    title: 'Violin Concerto in D major',
    composer: 'J. Brahms',
    startDate: '2023-10-05',
    status: 'current'
  });
  
  // State for the migrated piece
  const [migratedPiece, setMigratedPiece] = useState<RepertoirePiece | null>(null);
  const [matchedMasterPiece, setMatchedMasterPiece] = useState<RepertoireItemData | null>(null);
  
  // Run the migration
  const handleRunMigration = () => {
    try {
      // Perform the migration - The function expects RepertoirePiece but can handle legacy data
      const migrated = migrateToMasterPieceReference(sampleLegacyPiece, masterRepertoire);
      
      // Check if we got a valid migrated piece with masterPieceId
      if (isValidRepertoirePiece(migrated)) {
        setMigratedPiece(migrated);
        
        // Find the matched master piece
        const matched = masterRepertoire.find(piece => piece.id === migrated.masterPieceId);
        setMatchedMasterPiece(matched || null);
      } else {
        // Handle case where migration didn't add a masterPieceId
        console.error('Migration did not result in a valid masterPieceId');
      }
    } catch (error) {
      console.error('Error during migration:', error);
    }
  };
  
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Migration Testing Tool</CardTitle>
        <CardDescription>
          Test the migration process from legacy pieces to masterPieceId references
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {migratedPiece ? (
          // Show migration result
          <MigrationPieceStatus 
            originalPiece={sampleLegacyPiece} 
            migratedPiece={migratedPiece}
            masterPiece={matchedMasterPiece || undefined}
          />
        ) : (
          // Show sample piece details
          <Tabs defaultValue="legacy">
            <TabsList>
              <TabsTrigger value="legacy">Legacy Piece</TabsTrigger>
            </TabsList>
            
            <TabsContent value="legacy" className="space-y-4">
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="text-sm font-semibold mb-2">Original Piece Data</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(sampleLegacyPiece, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-semibold mb-2">Rendered with Direct Properties</h3>
                <div className="flex flex-col gap-1">
                  <div><strong>Title:</strong> {sampleLegacyPiece.title}</div>
                  <div><strong>Composer:</strong> {sampleLegacyPiece.composer}</div>
                  <div><strong>Status:</strong> <Badge>{sampleLegacyPiece.status}</Badge></div>
                  <div><strong>Started:</strong> {sampleLegacyPiece.startDate}</div>
                </div>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-semibold mb-2">Rendered with PieceDisplay</h3>
                <PieceDisplay piece={sampleLegacyPiece} layout="detail" showStatus showDates />
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        <div className="flex justify-center pt-4">
          {migratedPiece ? (
            <Button variant="outline" onClick={() => {
              setMigratedPiece(null);
              setMatchedMasterPiece(null);
            }}>
              Reset
            </Button>
          ) : (
            <Button onClick={handleRunMigration}>
              Run Migration
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MigrationTester; 