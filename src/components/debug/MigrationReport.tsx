import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useRepertoire } from '@/contexts/RepertoireContext';
import { Student, RepertoirePiece, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { getMigrationStatus, migrateAllPieces, MigrationStats } from '@/lib/migrations/migrate-all-pieces';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * MigrationReport Component
 * 
 * Generates a report on the migration status of repertoire pieces in the application.
 * Shows statistics on migrated vs unmigrated pieces and identifies potential issues.
 */
const MigrationReport: React.FC<{ students: Student[] }> = ({ students }) => {
  const { masterRepertoire, refreshMasterRepertoire, updateStudentsList } = useRepertoire();
  const [stats, setStats] = useState<MigrationStats>({
    totalPieces: 0,
    migratedPieces: 0,
    newMasterPiecesCreated: 0,
    unmatchedPieces: 0,
    errors: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);
  
  // Generate the migration report
  useEffect(() => {
    if (!students || !masterRepertoire) return;
    
    // Use the utility function to get migration status
    const migrationStats = getMigrationStatus(students, masterRepertoire);
    setStats(migrationStats);
  }, [students, masterRepertoire, migrationDone]);
  
  const getMigrationPercentage = () => {
    if (stats.totalPieces === 0) return 0;
    return Math.round((stats.migratedPieces / stats.totalPieces) * 100);
  };
  
  const getTopUnmatchedPieces = () => {
    const unmatchedCounts: Record<string, number> = {};
    
    // Process all students to find unmigrated pieces
    students.forEach(student => {
      // Check current repertoire
      if (student.currentRepertoire) {
        student.currentRepertoire.forEach(piece => {
          if (!piece.masterPieceId && piece.title && piece.composer) {
            const key = `${piece.title} by ${piece.composer}`;
            unmatchedCounts[key] = (unmatchedCounts[key] || 0) + 1;
          }
        });
      }
      
      // Check past repertoire
      if (student.pastRepertoire) {
        student.pastRepertoire.forEach(piece => {
          if (!piece.masterPieceId && piece.title && piece.composer) {
            const key = `${piece.title} by ${piece.composer}`;
            unmatchedCounts[key] = (unmatchedCounts[key] || 0) + 1;
          }
        });
      }
      
      // Check lesson repertoire
      if (student.lessons) {
        student.lessons.forEach(lesson => {
          if (lesson.repertoire) {
            lesson.repertoire.forEach(piece => {
              if (!piece.masterPieceId && piece.title && piece.composer) {
                const key = `${piece.title} by ${piece.composer}`;
                unmatchedCounts[key] = (unmatchedCounts[key] || 0) + 1;
              }
            });
          }
        });
      }
    });
    
    // Convert to array, sort by count, and return top 10
    return Object.entries(unmatchedCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  };
  
  const handleRunMigration = async () => {
    if (!students || !masterRepertoire || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Use setTimeout to allow the UI to update before running the potentially
      // heavy migration process
      setTimeout(() => {
        // Make copies of the data to avoid direct mutation
        const studentsToMigrate = [...students];
        const masterRepertoireToUse = [...masterRepertoire];
        
        // Run the migration on all pieces
        const migrationResult = migrateAllPieces(studentsToMigrate, masterRepertoireToUse, {
          createMissingMasterPieces: true,
          dryRun: false
        });
        
        // Update the context with the migrated data
        updateStudentsList(studentsToMigrate);
        refreshMasterRepertoire(masterRepertoireToUse);
        
        // Update the local state
        setStats(migrationResult);
        setMigrationDone(true);
        setIsLoading(false);
      }, 100);
    } catch (error) {
      console.error('Error during migration:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Repertoire Migration Report</CardTitle>
        <CardDescription>
          Status of the migration from direct title/composer properties to masterPieceId references
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {migrationDone && (
          <Alert className="bg-green-50 border-green-200 text-green-800 mb-6">
            <Check className="h-4 w-4" />
            <AlertTitle>Migration Completed</AlertTitle>
            <AlertDescription>
              Successfully migrated {stats.newMasterPiecesCreated} new master pieces and updated {stats.migratedPieces} references.
            </AlertDescription>
          </Alert>
        )}
      
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Migration Progress</span>
            <span className="text-sm font-medium">{getMigrationPercentage()}%</span>
          </div>
          <Progress value={getMigrationPercentage()} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{stats.migratedPieces} migrated</span>
            <span>{stats.totalPieces - stats.migratedPieces} remaining</span>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-md p-4">
            <div className="flex items-center text-green-600 font-medium mb-2">
              <Check className="h-4 w-4 mr-2" />
              Migrated Pieces
            </div>
            <div className="text-2xl font-bold">{stats.migratedPieces}</div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-md p-4">
            <div className="flex items-center text-amber-600 font-medium mb-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              Unmigrated Pieces
            </div>
            <div className="text-2xl font-bold">{stats.totalPieces - stats.migratedPieces}</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
            <div className="flex items-center text-blue-600 font-medium mb-2">
              <Check className="h-4 w-4 mr-2" />
              Master Repertoire
            </div>
            <div className="text-2xl font-bold">{masterRepertoire?.length || 0}</div>
          </div>
        </div>
        
        {stats.errors.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-md p-4">
            <div className="flex items-center text-red-600 font-medium mb-2">
              <X className="h-4 w-4 mr-2" />
              Migration Errors ({stats.errors.length})
            </div>
            <ul className="text-sm text-red-700 space-y-1 mt-2">
              {stats.errors.slice(0, 5).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
              {stats.errors.length > 5 && (
                <li>...and {stats.errors.length - 5} more errors</li>
              )}
            </ul>
          </div>
        )}
        
        <Accordion type="single" collapsible className="border rounded-md">
          <AccordionItem value="unmatched-pieces">
            <AccordionTrigger className="px-4">
              Top unmatched pieces
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {getTopUnmatchedPieces().map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span>{item.name}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))}
                {getTopUnmatchedPieces().length === 0 && (
                  <div className="text-sm text-muted-foreground py-2">
                    No unmatched pieces found
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleRunMigration} 
            disabled={isLoading || stats.totalPieces === stats.migratedPieces}
            className="relative"
          >
            {isLoading && (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            )}
            {isLoading ? 'Running Migration...' : 'Run Migration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MigrationReport; 