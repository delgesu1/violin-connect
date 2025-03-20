import React from 'react';
import { isDevMode, devLog, prodLog } from '@/lib/development-mode';

/**
 * This component demonstrates how to handle development vs production mode
 * for database features.
 */
const SchemaExample: React.FC = () => {
  // Log based on the current mode
  React.useEffect(() => {
    devLog('Component loaded in development mode with mock data');
    prodLog('Component loaded in production mode with real data');
    
    console.log(`Current mode: ${isDevMode() ? 'DEVELOPMENT' : 'PRODUCTION'}`);
  }, []);

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-2">Development Workflow Example</h2>
      
      <div className="bg-gray-100 p-3 rounded mb-4">
        <p className="text-sm">
          Current Mode: <strong>{isDevMode() ? 'DEVELOPMENT' : 'PRODUCTION'}</strong>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          This is controlled by VITE_DEV_MODE in your .env file
        </p>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">How to develop with schema tracking:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Create a migration: <code>npm run db:migration new_feature</code></li>
          <li>Edit the migration SQL file in supabase/migrations/</li>
          <li>Apply the migration: <code>npm run db:reset</code></li>
          <li>Generate TypeScript types: <code>npm run db:types</code></li>
          <li>Develop your feature using mock data</li>
          <li>Test in production mode when ready</li>
        </ol>
      </div>
    </div>
  );
};

export default SchemaExample; 