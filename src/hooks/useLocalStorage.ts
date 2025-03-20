import { useState, useEffect } from 'react';

/**
 * A hook for storing and retrieving data from localStorage with type safety
 * @param key The localStorage key to use
 * @param initialValue The initial value to use if no value is found in localStorage
 * @returns A stateful value and a function to update it, which also updates localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error retrieving ${key} from localStorage:`, error);
      return initialValue;
    }
  });
  
  // Listen for changes to the localStorage key from other components
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          // Update state with new value
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.error(`Error parsing ${key} from storage event:`, error);
        }
      }
    };
    
    // Listen for storage events to keep multiple tabs/windows in sync
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);
  
  // Return a wrapped version of useState's setter function that 
  // persists the new value to localStorage.
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Handle errors here
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };
  
  return [storedValue, setValue];
} 