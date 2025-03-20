import React, { useState, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, PaperclipIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onAttachFile?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showAttachmentButton?: boolean;
  autoFocus?: boolean;
}

const MessageInput = ({
  onSendMessage,
  onAttachFile,
  disabled = false,
  placeholder = 'Type a message...',
  className = '',
  showAttachmentButton = true,
  autoFocus = false
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      
      // Focus the input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-4 bg-card border-t",
        className
      )}
    >
      {showAttachmentButton && onAttachFile && (
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          onClick={onAttachFile}
          disabled={disabled}
          className="flex-shrink-0"
        >
          <PaperclipIcon className="h-5 w-5 text-muted-foreground" />
        </Button>
      )}
      
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        className="flex-1"
      />
      
      <Button 
        type="button" 
        size="icon" 
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="flex-shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MessageInput; 