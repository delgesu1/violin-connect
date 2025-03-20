import React, { useState, useEffect } from 'react';
import { useMasterRepertoire } from '@/features/repertoire/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function MigrationExampleComponent() {
  const { data: repertoire, isLoading, refetch } = useMasterRepertoire();
  const [cacheStatus, setCacheStatus] = useState<string | null>(null);
  
  // Check for existing cache on mount
  useEffect(() => {
    const cacheExists = localStorage.getItem('mock_masterRepertoire');
    setCacheStatus(cacheExists ? 'Cache exists' : 'No cache found');
  }, []);
  
  const handleClearCache = () => {
    localStorage.removeItem('mock_masterRepertoire');
    setCacheStatus('Cache cleared');
    console.log('🧹 Cleared cached mock data for masterRepertoire');
    refetch();
  };
  
  return (
    <div className="container p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Migration Example</h1>
          <p className="text-muted-foreground">Testing hybrid caching with enhanced hooks</p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => refetch()} variant="outline" className="mb-4">
            Refresh Data
          </Button>
          <Button onClick={handleClearCache} variant="destructive" className="mb-4">
            Clear Cache
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Cache Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={cacheStatus?.includes('exists') ? 'secondary' : 'outline'}>
              {cacheStatus || 'Checking...'}
            </Badge>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Data Sources</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">database</Badge>
                  <span className="text-sm">From Supabase</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">cached</Badge>
                  <span className="text-sm">From localStorage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">mock</Badge>
                  <span className="text-sm">Default fallback</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Repertoire ({repertoire?.length || 0} items)</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading data...' : `Showing ${repertoire?.length || 0} pieces from various sources`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <p>Loading repertoire data...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {repertoire?.map(piece => (
                  <div key={piece.id} className="p-3 border rounded-md flex justify-between">
                    <div>
                      <div className="font-medium">{piece.title}</div>
                      <div className="text-sm text-muted-foreground">{piece.composer}</div>
                    </div>
                    <Badge variant={
                      (piece as any)._source === 'database' ? 'outline' : 
                      (piece as any)._source?.includes('cached') ? 'secondary' : 
                      'destructive'
                    }>
                      {(piece as any)._source || 'unknown'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>First attempts to fetch data from Supabase</li>
            <li>If database connection fails, checks localStorage for cached data</li>
            <li>If no cache exists, falls back to mock data</li>
            <li>Badges show the data source for complete transparency</li>
          </ol>
          
          <Separator className="my-4" />
          
          <div className="text-sm text-muted-foreground">
            <p>This approach ensures your app works in all scenarios:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Connected to Supabase: Real-time data</li>
              <li>Offline or no Supabase: Cached or mock data</li>
              <li>Development environment: No database setup needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MigrationExampleComponent; 