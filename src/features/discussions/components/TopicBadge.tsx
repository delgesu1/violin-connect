import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TopicBadgeProps {
  topic: string;
  selected?: boolean;
  onClick?: (topic: string) => void;
  className?: string;
  disabled?: boolean;
}

const TopicBadge = ({
  topic,
  selected = false,
  onClick,
  className,
  disabled = false
}: TopicBadgeProps) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(topic);
    }
  };

  return (
    <Badge 
      variant={selected ? "default" : "secondary"}
      className={cn(
        "px-2 py-0.5 text-xs font-medium transition-colors",
        onClick ? "cursor-pointer" : "",
        selected 
          ? "bg-blue-600 hover:bg-blue-700 text-white" 
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300",
        disabled && "opacity-60 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800",
        className
      )}
      onClick={handleClick}
    >
      {topic}
    </Badge>
  );
};

export default TopicBadge; 