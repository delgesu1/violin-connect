import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  children,
  className 
}) => {
  return (
    <div className={cn(
      "mb-10 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
      "border-b border-gray-100",
      className
    )}>
      <div className="space-y-1.5 animate-slide-up animate-stagger-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">{title}</h1>
        {description && (
          <p className="text-gray-500 font-normal">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 animate-slide-up animate-stagger-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
