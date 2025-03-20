import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  className?: string;
  compactMode?: boolean;
  searchPlaceholder?: string;
}

const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  className = '',
  compactMode = false,
  searchPlaceholder = 'Search conversations...'
}: ConversationListProps) => {
  // Format timestamp to display time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card 
      className={cn(
        "h-full shadow-sm border overflow-hidden",
        className
      )}
    >
      <div className={cn(
        "p-4 border-b border-gray-100",
        compactMode && "flex justify-center p-3"
      )}>
        <div className={cn(
          "relative w-full",
          compactMode && "w-auto"
        )}>
          <Search 
            className={cn(
              "absolute left-3 top-2.5 h-4 w-4 text-gray-400",
              compactMode && "hidden"
            )} 
          />
          <Input 
            placeholder={searchPlaceholder}
            className={cn(
              "pl-9 bg-gray-50",
              compactMode && "hidden"
            )}
          />
          <div className={cn(
            "hidden",
            compactMode && "flex items-center justify-center"
          )}>
            <Search className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100%-73px)]">
        <div className={cn(
          "p-2",
          compactMode && "flex flex-col items-center p-1"
        )}>
          {conversations.map(conversation => (
            <div 
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200",
                compactMode && "p-2 my-1 w-auto",
                selectedConversationId === conversation.id 
                  ? 'bg-primary/10' 
                  : 'hover:bg-gray-50'
              )}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={conversation.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(conversation.name)}
                  </AvatarFallback>
                </Avatar>
                
                {conversation.unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 flex items-center gap-1 bg-red-500 rounded-full px-1.5 py-0.5 border-2 border-white"
                  >
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
              
              <div className={cn(
                "flex-1 min-w-0",
                compactMode && "hidden"
              )}>
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-800 truncate">
                    {conversation.name}
                  </p>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(conversation.lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 truncate">
                  {conversation.lastMessage 
                    ? `${conversation.lastMessage.senderId === 'teacher' ? 'You: ' : ''}${conversation.lastMessage.content}`
                    : 'No messages yet'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ConversationList; 