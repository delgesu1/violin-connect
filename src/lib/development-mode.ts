/**
 * Utility functions for working with development mode
 */

/**
 * Check if the application is running in development mode
 * This checks the VITE_DEV_MODE environment variable
 */
export const isDevMode = (): boolean => {
  return import.meta.env.VITE_DEV_MODE === 'true';
};

/**
 * Utility to conditionally execute code in development mode
 * @param devFn Function to execute in development mode
 * @param prodFn Function to execute in production mode
 * @returns Result of the executed function
 */
export const withDevMode = <T>(devFn: () => T, prodFn: () => T): T => {
  return isDevMode() ? devFn() : prodFn();
};

/**
 * Execute code only in development mode
 * @param fn Function to execute in development mode
 */
export const devOnly = (fn: () => void): void => {
  if (isDevMode()) {
    fn();
  }
};

/**
 * Execute code only in production mode
 * @param fn Function to execute in production mode
 */
export const prodOnly = (fn: () => void): void => {
  if (!isDevMode()) {
    fn();
  }
};

/**
 * Log a message only in development mode
 * @param message Message to log
 * @param args Additional arguments to log
 */
export const devLog = (message: string, ...args: any[]): void => {
  if (isDevMode()) {
    console.log(`[DEV MODE] ${message}`, ...args);
  }
};

/**
 * Log a message only in production mode
 * @param message Message to log
 * @param args Additional arguments to log
 */
export const prodLog = (message: string, ...args: any[]): void => {
  if (!isDevMode()) {
    console.log(`[PRODUCTION] ${message}`, ...args);
  }
}; 