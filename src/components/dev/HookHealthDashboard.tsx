/**
 * Hook Health Dashboard
 * 
 * This component displays the data source of all active hooks in development mode.
 * It helps developers understand where data is coming from (database, cache, mock).
 * 
 * Only visible in development mode.
 */

import { useState, useEffect } from 'react';

// Store active data sources globally to track across components
export const activeHookSources: Record<string, string> = {};

// Set a data source for display in the dashboard
export function setActiveHookSource(hookName: string, source: string) {
  activeHookSources[hookName] = source;
}

// Register a hook's data source
export function registerHookSource<T extends { _source?: string }>(
  hookName: string, 
  data: T | T[] | null | undefined
): void {
  if (!data) {
    setActiveHookSource(hookName, 'empty');
    return;
  }
  
  const source = Array.isArray(data) 
    ? (data[0]?._source || 'unknown') 
    : (data._source || 'unknown');
    
  setActiveHookSource(hookName, source);
}

export function HookHealthDashboard() {
  const [sources, setSources] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // Only render in development mode
  const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
  if (!isDevelopmentMode) return null;
  
  // Update sources state every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setSources({...activeHookSources});
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const getSourceClassName = (source: string) => {
    if (source.includes('database')) return 'text-green-500';
    if (source.includes('cached')) return 'text-blue-500';
    if (source.includes('mock')) return 'text-yellow-500';
    return 'text-gray-400';
  };
  
  const filteredSources = Object.entries(sources).filter(([_, source]) => {
    if (filter === 'all') return true;
    return source.includes(filter);
  });
  
  return (
    <div className="fixed bottom-0 right-0 m-4 z-50">
      <div 
        className="bg-slate-900/95 text-white text-xs rounded-lg shadow-lg overflow-hidden"
        style={{ maxHeight: isExpanded ? '70vh' : '40px' }}
      >
        <div 
          className="p-2 font-mono flex items-center justify-between cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="font-bold">
            Hook Health{' '}
            <span className="text-xs opacity-70">
              ({Object.keys(sources).length})
            </span>
          </span>
          <span>{isExpanded ? '▼' : '▲'}</span>
        </div>
        
        {isExpanded && (
          <>
            <div className="px-2 py-1 border-t border-gray-700 flex gap-2">
              <button 
                className={`px-2 py-0.5 text-xs rounded ${filter === 'all' ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`px-2 py-0.5 text-xs rounded ${filter === 'database' ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setFilter('database')}
              >
                <span className="text-green-500">●</span> Database
              </button>
              <button 
                className={`px-2 py-0.5 text-xs rounded ${filter === 'cached' ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setFilter('cached')}
              >
                <span className="text-blue-500">●</span> Cached
              </button>
              <button 
                className={`px-2 py-0.5 text-xs rounded ${filter === 'mock' ? 'bg-gray-700' : 'bg-gray-800'}`}
                onClick={() => setFilter('mock')}
              >
                <span className="text-yellow-500">●</span> Mock
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto border-t border-gray-700">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-900">
                  <tr className="border-b border-gray-700">
                    <th className="p-2 text-left">Hook</th>
                    <th className="p-2 text-right">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSources.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-gray-500">
                        No hooks with data sources registered
                      </td>
                    </tr>
                  ) : (
                    filteredSources.map(([name, source]) => (
                      <tr key={name} className="border-b border-gray-800">
                        <td className="p-2">{name}</td>
                        <td className={`p-2 text-right ${getSourceClassName(source)}`}>
                          {source}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 