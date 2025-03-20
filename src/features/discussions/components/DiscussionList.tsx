import React from 'react';
import { DiscussionData } from '@/components/common/DiscussionCard';
import DiscussionCard from '@/components/common/DiscussionCard';
import { cn } from '@/lib/utils';

export interface DiscussionListProps {
  discussions: DiscussionData[];
  className?: string;
  emptyStateMessage?: React.ReactNode;
  columns?: 1 | 2 | 3;
  onDiscussionClick?: (discussionId: string) => void;
}

const DiscussionList = ({
  discussions,
  className,
  emptyStateMessage = 'No discussions found',
  columns = 1,
  onDiscussionClick
}: DiscussionListProps) => {
  // Apply sorting - pinned discussions first, then by date
  const sortedDiscussions = [...discussions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; // In a real app, would also sort by date
  });

  if (discussions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        {emptyStateMessage}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {sortedDiscussions.map((discussion, index) => (
        <div 
          key={discussion.id}
          className={cn(
            "transition-all duration-300 cursor-pointer",
            `animate-fade-in animate-delay-${(index % 5) + 1}`
          )}
          onClick={() => onDiscussionClick && onDiscussionClick(discussion.id)}
        >
          <DiscussionCard discussion={discussion} />
        </div>
      ))}
    </div>
  );
};

export default DiscussionList; 