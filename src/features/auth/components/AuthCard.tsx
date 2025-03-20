import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

const AuthCard = ({
  title,
  description,
  children,
  className = '',
  icon
}: AuthCardProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className={`w-full max-w-md p-6 space-y-6 bg-card ${className}`}>
        <CardHeader className="text-center p-0 space-y-2">
          {icon && (
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {icon}
            </div>
          )}
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCard; 