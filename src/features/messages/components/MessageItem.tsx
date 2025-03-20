import React from 'react';
import { cn } from '@/lib/utils';

export interface MessageItemProps {
  id: string;
  content: string;
  timestamp: string;
  isSentByMe: boolean;
  isRead?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  className?: string;
  showTime?: boolean;
}

const MessageItem = ({
  id,
  content,
  timestamp,
  isSentByMe,
  isRead = true,
  status = 'sent',
  className = '',
  showTime = true,
}: MessageItemProps) => {
  // Format timestamp to display time
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div 
      className={cn(
        'flex',
        isSentByMe ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-2 shadow-sm",
          isSentByMe 
            ? "bg-primary text-primary-foreground rounded-br-none" 
            : "bg-muted rounded-bl-none",
        )}
      >
        <div className="break-words whitespace-pre-wrap">{content}</div>
        
        {showTime && (
          <div className={cn(
            "text-xs mt-1 flex justify-end space-x-1 select-none",
            isSentByMe ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            <span>{formatMessageTime(timestamp)}</span>
            
            {isSentByMe && (
              <span>
                {status === 'error' && '⚠️'}
                {status === 'sending' && '⋯'}
                {status === 'sent' && '✓'}
                {status === 'delivered' && '✓✓'}
                {status === 'read' && '✓✓'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem; 