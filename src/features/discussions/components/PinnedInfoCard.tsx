import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface PinnedInfoCardProps {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color?: string;
  onClick?: (id: string) => void;
  className?: string;
}

const PinnedInfoCard = ({
  id,
  title,
  description,
  icon,
  color = 'bg-blue-50/50 dark:bg-blue-900/10',
  onClick,
  className
}: PinnedInfoCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all border-0 shadow-sm",
        "hover:shadow hover:translate-y-[-2px] overflow-hidden group",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className={cn("p-4 flex items-start gap-3", color)}>
        <div className="pt-0.5 text-blue-600 group-hover:text-blue-700 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-sm mb-1 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PinnedInfoCard; 