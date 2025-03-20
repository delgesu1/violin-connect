import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface UserProfileInfo {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  role?: 'teacher' | 'student' | 'admin';
  roleLabel?: string;
  badge?: string;
}

export interface ProfileCardProps {
  user: UserProfileInfo;
  className?: string;
  additionalFields?: {
    label: string;
    value: string;
  }[];
}

const ProfileCard = ({
  user,
  className,
  additionalFields = []
}: ProfileCardProps) => {
  // Get initials for avatar fallback
  const getInitials = () => {
    if (user.fullName) {
      return user.fullName.split(' ').map(n => n[0]).join('');
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user.firstName) {
      return user.firstName[0];
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  };

  // Format date string
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get role label
  const getRoleLabel = () => {
    if (user.roleLabel) return user.roleLabel;
    
    switch (user.role) {
      case 'teacher': return 'Violin Instructor';
      case 'student': return 'Student';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="text-center pt-8 pb-4">
        <Avatar className="h-28 w-28 mx-auto border-4 border-background shadow-lg">
          <AvatarImage src={user.imageUrl} alt={user.fullName || "Profile"} />
          <AvatarFallback className="text-2xl">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="mt-4 px-6">
          <h2 className="text-2xl font-bold">
            {user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Anonymous User'}
          </h2>
          <p className="text-muted-foreground">{getRoleLabel()}</p>
          {user.badge && (
            <Badge variant="outline" className="mt-2">{user.badge}</Badge>
          )}
        </div>
      </div>
      
      <Separator />
      
      <CardContent className="pt-4">
        <div className="space-y-3">
          {user.email && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Email</span>
              <span className="text-sm font-medium truncate max-w-[180px]">{user.email}</span>
            </div>
          )}
          
          {user.phone && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Phone</span>
              <span className="text-sm font-medium">{user.phone}</span>
            </div>
          )}
          
          {user.createdAt && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Member since</span>
              <span className="text-sm font-medium">{formatDate(user.createdAt)}</span>
            </div>
          )}
          
          {additionalFields.map((field, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-muted-foreground">{field.label}</span>
              <span className="text-sm font-medium">{field.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard; 