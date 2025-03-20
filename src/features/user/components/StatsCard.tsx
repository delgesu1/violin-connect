import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
}

export interface StatsCardProps {
  title: string;
  description?: string;
  titleIcon?: LucideIcon;
  stats: StatItem[];
  className?: string;
  statClassName?: string;
}

const StatsCard = ({
  title,
  description,
  titleIcon: TitleIcon,
  stats,
  className,
  statClassName
}: StatsCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          {TitleIcon && <TitleIcon className="mr-2 h-5 w-5 text-primary" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <div 
                key={index} 
                className={cn(
                  "bg-secondary/30 p-4 rounded-lg flex items-center",
                  statClassName
                )}
              >
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Icon className={cn("h-5 w-5 text-primary", stat.iconColor)} />
                </div>
                <div>
                  <p className="text-lg font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard; 