/**
 * Utility for caching and retrieving mock data in development mode
 * This allows us to use real data schemas in development even when
 * Supabase is unavailable.
 */

// Check if we're in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

// Define the types of data that can be cached
type CacheKey = string;

/**
 * Set mock data in the cache
 */
export const setCachedMockData = <T>(key: CacheKey, data: T): void => {
  if (!isDevelopmentMode) return;
  
  try {
    const cacheData = {
      timestamp: new Date().getTime(),
      data
    };
    
    localStorage.setItem(`mock_${key}`, JSON.stringify(cacheData));
    console.log(`✅ Mock data for ${key} cached successfully (${Array.isArray(data) ? data.length : 1} items)`);
  } catch (error) {
    console.error(`Error caching mock data for ${key}:`, error);
  }
};

// Legacy function name for compatibility
export const cacheMockData = setCachedMockData;

/**
 * Get cached data for a specific key, with fallback to default data
 */
export const getCachedMockData = <T>(key: string, defaultData: T): T => {
  if (!isDevelopmentMode) return defaultData;
  
  try {
    const cached = localStorage.getItem(`mock_${key}`);
    if (!cached) return defaultData;
    
    const parsed = JSON.parse(cached);
    
    // Validate the cache structure
    if (!parsed.timestamp || !parsed.data) {
      console.warn(`Invalid cache format for "${key}", using default data`);
      return defaultData;
    }
    
    // Check if cache is less than 1 day old
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp < oneDayMs) {
      console.log(`Using cached data for "${key}" (${Array.isArray(parsed.data) ? parsed.data.length : 1} items)`);
      return parsed.data as T;
    } else {
      console.log(`Cached data for "${key}" is more than 1 day old, using default data`);
      return defaultData;
    }
  } catch (error) {
    console.warn(`Error reading cached mock data for "${key}":`, error);
    return defaultData;
  }
};

/**
 * Clear all cached mock data (useful for testing)
 */
export const clearAllCachedMockData = (): void => {
  if (!isDevelopmentMode) return;
  
  try {
    const keysToRemove: string[] = [];
    
    // Find all localStorage keys that start with "mock_"
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mock_')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} cached mock data items`);
  } catch (error) {
    console.warn('Failed to clear cached mock data:', error);
  }
}; 