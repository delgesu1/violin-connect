import React from 'react';
import { UseQueryResult } from '@tanstack/react-query';

interface HookHealthDashboardProps {
  hook: UseQueryResult<any, unknown>;
  label?: string;
}

/**
 * A development component for visualizing hook data sources and status
 * 
 * This component helps track where data is coming from (database, mock, cached)
 * and displays the current status of the query for debugging.
 */
const HookHealthDashboard: React.FC<HookHealthDashboardProps> = ({
  hook,
  label = 'Hook Status'
}) => {
  const { data, isLoading, isError, error, isFetching, isSuccess } = hook;
  
  // Determine the data source
  let source = 'unknown';
  if (data) {
    if (Array.isArray(data)) {
      source = data.length > 0 ? data[0]?._source || 'unknown' : 'empty array';
    } else {
      source = data._source || 'unknown';
    }
  }
  
  // Set colors based on status
  const getBgColor = () => {
    if (isError) return 'bg-red-100 border-red-300';
    if (isLoading) return 'bg-yellow-100 border-yellow-300';
    if (isSuccess) {
      if (source === 'database') return 'bg-green-100 border-green-300';
      if (source === 'mock') return 'bg-blue-100 border-blue-300';
      if (source === 'cached') return 'bg-purple-100 border-purple-300';
      return 'bg-gray-100 border-gray-300';
    }
    return 'bg-gray-100 border-gray-300';
  };
  
  // Only show in development mode
  if (import.meta.env.VITE_DEV_MODE !== 'true') {
    return null;
  }
  
  return (
    <div className={`p-3 my-2 rounded border ${getBgColor()}`} data-testid="hook-health-dashboard">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-sm">{label}</h3>
        <div className="flex gap-2">
          {isLoading && (
            <span className="px-2 py-1 text-xs rounded bg-yellow-200 text-yellow-800">
              Loading
            </span>
          )}
          {isFetching && !isLoading && (
            <span className="px-2 py-1 text-xs rounded bg-blue-200 text-blue-800">
              Fetching
            </span>
          )}
          {isError && (
            <span className="px-2 py-1 text-xs rounded bg-red-200 text-red-800">
              Error
            </span>
          )}
          {isSuccess && (
            <span className="px-2 py-1 text-xs rounded bg-green-200 text-green-800">
              Success
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="bg-gray-50 p-2 rounded">
          <span className="font-medium">Source:</span>{' '}
          <span className={
            source === 'database' ? 'text-green-600 font-medium' : 
            source === 'mock' ? 'text-blue-600 font-medium' : 
            source === 'cached' ? 'text-purple-600 font-medium' : 
            'text-gray-600'
          }>
            {source}
          </span>
        </div>
        
        <div className="bg-gray-50 p-2 rounded">
          <span className="font-medium">Data Type:</span>{' '}
          {data ? (
            <span>
              {Array.isArray(data) 
                ? `Array (${data.length})` 
                : typeof data === 'object' 
                  ? 'Object' 
                  : typeof data}
            </span>
          ) : (
            <span className="text-gray-600">null</span>
          )}
        </div>
      </div>
      
      {isError && error && (
        <div className="mt-2 p-2 rounded bg-red-50 text-red-800 text-xs overflow-auto max-h-24">
          <div className="font-medium">Error:</div>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      
      {import.meta.env.VITE_DEV_MODE === 'true' && import.meta.env.MODE === 'development' && (
        <div className="mt-2 text-right">
          <button 
            onClick={() => console.log('Hook Data:', data)} 
            className="text-xs text-blue-600 underline"
          >
            Log data to console
          </button>
        </div>
      )}
    </div>
  );
};

export default HookHealthDashboard; 