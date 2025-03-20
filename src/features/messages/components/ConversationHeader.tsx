import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, Video, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConversationHeaderProps {
  name: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  onToggleSidebar?: () => void;
  onAudioCall?: () => void;
  onVideoCall?: () => void;
  onViewProfile?: () => void;
  className?: string;
  showActions?: boolean;
  showMobileMenuButton?: boolean;
}

const ConversationHeader = ({
  name,
  avatarUrl,
  status,
  onToggleSidebar,
  onAudioCall,
  onVideoCall,
  onViewProfile,
  className = '',
  showActions = true,
  showMobileMenuButton = true
}: ConversationHeaderProps) => {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  // Get status indicator class
  const getStatusClass = (status?: string) => {
    if (!status) return '';
    
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 border-b",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showMobileMenuButton && onToggleSidebar && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="relative">
          <Avatar>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          
          {status && (
            <div 
              className={cn(
                "absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white",
                getStatusClass(status)
              )}
            />
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-base">{name}</h3>
          {status && (
            <p className="text-xs text-muted-foreground">
              {status === 'online' ? 'Online' : status === 'away' ? 'Away' : status === 'busy' ? 'Do not disturb' : 'Offline'}
            </p>
          )}
        </div>
      </div>
      
      {showActions && (
        <div className="flex items-center gap-1">
          {onAudioCall && (
            <Button variant="ghost" size="icon" onClick={onAudioCall}>
              <Phone className="h-4 w-4" />
            </Button>
          )}
          
          {onVideoCall && (
            <Button variant="ghost" size="icon" onClick={onVideoCall}>
              <Video className="h-4 w-4" />
            </Button>
          )}
          
          {onViewProfile && (
            <Button variant="ghost" size="icon" onClick={onViewProfile}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationHeader; 