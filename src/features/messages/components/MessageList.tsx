import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import MessageItem, { MessageItemProps } from './MessageItem';

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  isRead?: boolean;
  status?: MessageItemProps['status'];
}

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  emptyStateMessage?: React.ReactNode;
  className?: string;
  autoScrollToBottom?: boolean;
  groupMessages?: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

const MessageList = ({
  messages,
  currentUserId,
  emptyStateMessage = 'No messages yet',
  className = '',
  autoScrollToBottom = true,
  groupMessages = true,
  messagesEndRef: externalMessagesEndRef
}: MessageListProps) => {
  const internalMessagesEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = externalMessagesEndRef || internalMessagesEndRef;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (autoScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScrollToBottom, messagesEndRef]);

  // Group messages by senderId to avoid repeating avatar/name
  const getGroupedMessages = () => {
    if (!groupMessages) return messages.map(message => ({ message, showTime: true }));
    
    return messages.map((message, index) => {
      // Show time if it's the last message or if the next message is from a different sender
      const showTime = index === messages.length - 1 || 
                      messages[index + 1].senderId !== message.senderId;
      
      return { message, showTime };
    });
  };

  const groupedMessages = getGroupedMessages();

  return (
    <ScrollArea 
      className={cn(
        "h-full py-4",
        className
      )}
    >
      <div className="flex flex-col space-y-3 px-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-40">
            <p className="text-muted-foreground text-sm">{emptyStateMessage}</p>
          </div>
        ) : (
          groupedMessages.map(({ message, showTime }) => (
            <MessageItem
              key={message.id}
              id={message.id}
              content={message.content}
              timestamp={message.timestamp}
              isSentByMe={message.senderId === currentUserId}
              isRead={message.isRead}
              status={message.status}
              showTime={showTime}
              className="mb-1"
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList; 