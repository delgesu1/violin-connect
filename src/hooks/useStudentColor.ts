import React from 'react';
import { useMemo } from 'react';

/**
 * Modern color palette with 10 distinct colors
 * Each color has a default shade, light shade (for backgrounds), and a foreground/text color
 */
const colorPalette = [
  // Indigo - Soft purple/blue
  {
    background: 'bg-indigo-100',
    color: 'bg-indigo-500',
    border: 'border-indigo-300',
    hoverBg: 'hover:bg-indigo-200',
    text: 'text-indigo-700',
    dark: {
      background: 'dark:bg-indigo-900/20',
      color: 'dark:bg-indigo-600',
      border: 'dark:border-indigo-700',
      hoverBg: 'dark:hover:bg-indigo-800/40',
      text: 'dark:text-indigo-300'
    }
  },
  // Emerald - Rich teal green
  {
    background: 'bg-emerald-100',
    color: 'bg-emerald-500',
    border: 'border-emerald-300',
    hoverBg: 'hover:bg-emerald-200',
    text: 'text-emerald-700',
    dark: {
      background: 'dark:bg-emerald-900/20',
      color: 'dark:bg-emerald-600',
      border: 'dark:border-emerald-700',
      hoverBg: 'dark:hover:bg-emerald-800/40',
      text: 'dark:text-emerald-300'
    }
  },
  // Amber - Warm gold
  {
    background: 'bg-amber-100',
    color: 'bg-amber-500',
    border: 'border-amber-300',
    hoverBg: 'hover:bg-amber-200',
    text: 'text-amber-700',
    dark: {
      background: 'dark:bg-amber-900/20',
      color: 'dark:bg-amber-600',
      border: 'dark:border-amber-700',
      hoverBg: 'dark:hover:bg-amber-800/40',
      text: 'dark:text-amber-300'
    }
  },
  // Rose - Soft pink/red
  {
    background: 'bg-rose-100',
    color: 'bg-rose-500',
    border: 'border-rose-300',
    hoverBg: 'hover:bg-rose-200',
    text: 'text-rose-700',
    dark: {
      background: 'dark:bg-rose-900/20',
      color: 'dark:bg-rose-600',
      border: 'dark:border-rose-700',
      hoverBg: 'dark:hover:bg-rose-800/40',
      text: 'dark:text-rose-300'
    }
  },
  // Sky - Light blue
  {
    background: 'bg-sky-100',
    color: 'bg-sky-500',
    border: 'border-sky-300',
    hoverBg: 'hover:bg-sky-200',
    text: 'text-sky-700',
    dark: {
      background: 'dark:bg-sky-900/20',
      color: 'dark:bg-sky-600',
      border: 'dark:border-sky-700',
      hoverBg: 'dark:hover:bg-sky-800/40',
      text: 'dark:text-sky-300'
    }
  },
  // Lime - Bright yellow-green
  {
    background: 'bg-lime-100',
    color: 'bg-lime-500',
    border: 'border-lime-300',
    hoverBg: 'hover:bg-lime-200',
    text: 'text-lime-700',
    dark: {
      background: 'dark:bg-lime-900/20',
      color: 'dark:bg-lime-600',
      border: 'dark:border-lime-700',
      hoverBg: 'dark:hover:bg-lime-800/40',
      text: 'dark:text-lime-300'
    }
  },
  // Fuchsia - Vibrant pink/purple
  {
    background: 'bg-fuchsia-100',
    color: 'bg-fuchsia-500',
    border: 'border-fuchsia-300',
    hoverBg: 'hover:bg-fuchsia-200',
    text: 'text-fuchsia-700',
    dark: {
      background: 'dark:bg-fuchsia-900/20',
      color: 'dark:bg-fuchsia-600',
      border: 'dark:border-fuchsia-700',
      hoverBg: 'dark:hover:bg-fuchsia-800/40',
      text: 'dark:text-fuchsia-300'
    }
  },
  // Cyan - Light teal
  {
    background: 'bg-cyan-100',
    color: 'bg-cyan-500',
    border: 'border-cyan-300',
    hoverBg: 'hover:bg-cyan-200',
    text: 'text-cyan-700',
    dark: {
      background: 'dark:bg-cyan-900/20',
      color: 'dark:bg-cyan-600',
      border: 'dark:border-cyan-700',
      hoverBg: 'dark:hover:bg-cyan-800/40',
      text: 'dark:text-cyan-300'
    }
  },
  // Orange - Bright orange
  {
    background: 'bg-orange-100',
    color: 'bg-orange-500',
    border: 'border-orange-300',
    hoverBg: 'hover:bg-orange-200',
    text: 'text-orange-700',
    dark: {
      background: 'dark:bg-orange-900/20',
      color: 'dark:bg-orange-600',
      border: 'dark:border-orange-700',
      hoverBg: 'dark:hover:bg-orange-800/40',
      text: 'dark:text-orange-300'
    }
  },
  // Teal - Blue-green
  {
    background: 'bg-teal-100',
    color: 'bg-teal-500',
    border: 'border-teal-300',
    hoverBg: 'hover:bg-teal-200',
    text: 'text-teal-700',
    dark: {
      background: 'dark:bg-teal-900/20',
      color: 'dark:bg-teal-600',
      border: 'dark:border-teal-700',
      hoverBg: 'dark:hover:bg-teal-800/40',
      text: 'dark:text-teal-300'
    }
  }
];

// Hex values for the same colors, for non-Tailwind usage
const hexPalette = [
  { light: '#e0e7ff', medium: '#6366f1', dark: '#4338ca' }, // Indigo
  { light: '#d1fae5', medium: '#10b981', dark: '#065f46' }, // Emerald
  { light: '#fef3c7', medium: '#f59e0b', dark: '#b45309' }, // Amber
  { light: '#ffe4e6', medium: '#f43f5e', dark: '#be123c' }, // Rose
  { light: '#e0f2fe', medium: '#0ea5e9', dark: '#0369a1' }, // Sky
  { light: '#ecfccb', medium: '#84cc16', dark: '#4d7c0f' }, // Lime
  { light: '#f5d0fe', medium: '#d946ef', dark: '#a21caf' }, // Fuchsia
  { light: '#cffafe', medium: '#06b6d4', dark: '#0e7490' }, // Cyan
  { light: '#ffedd5', medium: '#f97316', dark: '#c2410c' }, // Orange
  { light: '#ccfbf1', medium: '#14b8a6', dark: '#0f766e' }  // Teal
];

/**
 * Type for the student color object returned by the hook
 */
export interface StudentColor {
  background: string;
  color: string;
  border: string;
  hoverBg: string;
  text: string;
  dark: {
    background: string;
    color: string;
    border: string;
    hoverBg: string;
    text: string;
  };
  hex: {
    light: string;
    medium: string;
    dark: string;
  };
  index: number;
}

/**
 * Generates a simple hash code from a string
 * @param str The string to hash (typically a user_id)
 * @returns A number representing the hash of the string
 */
function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Make sure hash is positive
  return Math.abs(hash);
}

/**
 * Hook to get consistent colors for a student based on their ID
 * @param userId The user ID to generate colors for
 * @returns A StudentColor object with various color formats
 */
export function useStudentColor(userId: string | null | undefined): StudentColor | null {
  return useMemo(() => {
    if (!userId) return null;
    
    // Generate a hash from the userId
    const hash = hashString(userId);
    // Map the hash to one of our color palette entries
    const colorIndex = hash % colorPalette.length;
    
    // Return the color with its associated hex values
    return {
      ...colorPalette[colorIndex],
      hex: hexPalette[colorIndex],
      index: colorIndex
    };
  }, [userId]);
}

/**
 * Get student color without using React hooks
 * Useful for non-component code
 * @param userId The user ID to generate colors for
 * @returns A StudentColor object with various color formats
 */
export function getStudentColor(userId: string | null | undefined): StudentColor | null {
  if (!userId) return null;
  
  // Generate a hash from the userId
  const hash = hashString(userId);
  // Map the hash to one of our color palette entries
  const colorIndex = hash % colorPalette.length;
  
  // Return the color with its associated hex values
  return {
    ...colorPalette[colorIndex],
    hex: hexPalette[colorIndex],
    index: colorIndex
  };
}

/**
 * Component to display a student color badge/indicator
 */
export function StudentColorDot({
  userId,
  size = 'md',
  className = ''
}: {
  userId: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}): React.ReactNode {
  const studentColor = useStudentColor(userId);
  
  if (!studentColor) return null;
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  return React.createElement('div', {
    className: `${studentColor.color} ${sizeClasses[size]} rounded-full border border-gray-200 dark:border-gray-700 ${className}`
  });
}

export default useStudentColor; 