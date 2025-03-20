import React from 'react';
import { Badge } from '@core/components/ui/data-display';
import { type Student } from '@features/students/hooks';
import { cn } from '@core/utils';

interface StudentBadgeProps {
  student: Student;
  className?: string;
}

/**
 * StudentBadge component displaying student level or difficulty
 * with appropriate color coding based on level
 */
export function StudentBadge({ student, className }: StudentBadgeProps) {
  const level = student.level || student.difficulty_level || 'Beginner';
  
  const getVariant = () => {
    // Determine badge variant based on level/difficulty
    if (level.toLowerCase().includes('advanced')) return 'destructive';
    if (level.toLowerCase().includes('intermediate')) return 'default';
    return 'outline'; // Beginner or default
  };
  
  return (
    <Badge 
      variant={getVariant()}
      className={cn('font-normal', className)}
    >
      {level}
    </Badge>
  );
} 