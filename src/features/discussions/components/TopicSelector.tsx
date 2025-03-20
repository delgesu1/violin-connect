import React from 'react';
import TopicBadge from './TopicBadge';
import { cn } from '@/lib/utils';

export interface TopicSelectorProps {
  topics: string[];
  selectedTopics: string[];
  onToggleTopic: (topic: string) => void;
  className?: string;
  title?: string;
}

const TopicSelector = ({
  topics,
  selectedTopics,
  onToggleTopic,
  className,
  title = 'Filter by Topic'
}: TopicSelectorProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
      )}
      
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <TopicBadge
            key={topic}
            topic={topic}
            selected={selectedTopics.includes(topic)}
            onClick={onToggleTopic}
          />
        ))}
      </div>
    </div>
  );
};

export default TopicSelector; 