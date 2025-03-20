/**
 * Environment utility functions for determining application environment
 */

/**
 * Check if the application is running in development mode
 * Uses Vite's environment variable for development mode
 * 
 * @returns boolean indicating if the app is in development mode
 */
export const isDevelopment = (): boolean => {
  // Use Vite's import.meta.env to check for development mode
  return import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV === true;
};

/**
 * Check if the application is running in production mode
 * 
 * @returns boolean indicating if the app is in production mode
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD === true && import.meta.env.VITE_DEV_MODE !== 'true';
};

/**
 * Check if the application is running in test mode
 * 
 * @returns boolean indicating if the app is in test mode
 */
export const isTest = (): boolean => {
  return import.meta.env.MODE === 'test';
};

/**
 * Get the current environment name
 * 
 * @returns string representing the current environment
 */
export const getEnvironment = (): 'development' | 'production' | 'test' => {
  if (isTest()) return 'test';
  if (isDevelopment()) return 'development';
  return 'production';
};

/**
 * Enable mock data for development or feature flagged testing
 * 
 * @returns boolean indicating if mock data should be used
 */
export const useMockData = (): boolean => {
  return isDevelopment() || import.meta.env.VITE_USE_MOCK_DATA === 'true';
};

/**
 * Get the backend API URL based on environment
 * 
 * @returns string with the backend API base URL
 */
export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (isDevelopment()) {
    return 'http://localhost:3000/api';
  }
  
  return '/api';
}; 