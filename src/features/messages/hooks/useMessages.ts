import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDevFallbackUser } from '@/hooks/useDevFallbackUser';

/**
 * Message type interface
 */
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: string[];
}

/**
 * Interface for conversation summary
 */
export interface Conversation {
  id: string; // Usually the ID of the other user
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

// Mock data for development
let mockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'msg-1', senderId: '1', recipientId: 'teacher', content: 'Hi teacher, I have a question about the Bach Partita', timestamp: '2023-12-10T14:30:00', isRead: false },
    { id: 'msg-2', senderId: 'teacher', recipientId: '1', content: 'Sure, what is your question?', timestamp: '2023-12-10T14:35:00', isRead: true },
    { id: 'msg-3', senderId: '1', recipientId: 'teacher', content: 'Should I use more bow in the Allemande?', timestamp: '2023-12-10T14:40:00', isRead: false },
  ],
  '3': [
    { id: 'msg-4', senderId: '3', recipientId: 'teacher', content: 'Hello, could we reschedule Friday\'s lesson?', timestamp: '2023-12-11T09:15:00', isRead: false },
  ]
};

/**
 * Hook to get all conversations for the current user
 */
export function useConversations(options?: { enabled?: boolean }) {
  const { user, isLoaded } = useDevFallbackUser();
  const userId = user?.id || 'teacher'; // Default to 'teacher' for development
  
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      // In a real app, this would be a database or API call
      
      // Determine the list of people the user has conversations with
      const conversations: Conversation[] = [];
      const conversationIds = Object.keys(mockMessages);
      
      // For each conversation, create a summary
      for (const id of conversationIds) {
        const messages = mockMessages[id] || [];
        
        // Skip if no messages
        if (messages.length === 0) continue;
        
        // Find the most recent message
        const lastMessage = messages.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        
        // Count unread messages
        const unreadCount = messages.filter(
          msg => !msg.isRead && msg.recipientId === userId
        ).length;
        
        // In a real app, we'd fetch the user details from a database
        const conversation: Conversation = {
          id,
          name: `Student ${id}`,
          avatarUrl: `/images/${id === '1' ? 'girl1.jpg' : id === '3' ? 'girl2.jpg' : 'student.jpg'}`,
          lastMessage: {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
            senderId: lastMessage.senderId,
            isRead: lastMessage.isRead
          },
          unreadCount
        };
        
        conversations.push(conversation);
      }
      
      return conversations;
    },
    enabled: isLoaded && (options?.enabled !== false),
  });
}

/**
 * Hook to get messages for a specific conversation
 */
export function useMessages(conversationId: string, options?: { enabled?: boolean }) {
  const { user, isLoaded } = useDevFallbackUser();
  const userId = user?.id || 'teacher'; // Default to 'teacher' for development
  
  return useQuery({
    queryKey: ['messages', userId, conversationId],
    queryFn: async () => {
      // In a real app, this would be a database or API call
      
      // Get the messages for this conversation
      const messages = mockMessages[conversationId] || [];
      
      // Sort by timestamp
      return [...messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    },
    enabled: isLoaded && !!conversationId && (options?.enabled !== false),
  });
}

/**
 * Hook to mark messages as read
 */
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient();
  const { user } = useDevFallbackUser();
  const userId = user?.id || 'teacher'; // Default to 'teacher' for development
  
  return useMutation({
    mutationFn: async ({ conversationId }: { conversationId: string }) => {
      // In a real app, this would be a database update
      
      // Get the messages for this conversation
      const messages = mockMessages[conversationId] || [];
      
      // Update the messages where the user is the recipient
      const updatedMessages = messages.map(msg => {
        if (msg.recipientId === userId && !msg.isRead) {
          return { ...msg, isRead: true };
        }
        return msg;
      });
      
      // Update the mock data
      mockMessages[conversationId] = updatedMessages;
      
      return { conversationId };
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['messages', userId, data.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
    },
  });
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useDevFallbackUser();
  const userId = user?.id || 'teacher'; // Default to 'teacher' for development
  
  return useMutation({
    mutationFn: async ({ 
      recipientId, 
      content 
    }: { 
      recipientId: string; 
      content: string;
    }) => {
      // In a real app, this would be a database insert
      
      // Create a new message
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: userId,
        recipientId,
        content,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      // Add the message to the mock data
      const conversationId = recipientId;
      mockMessages[conversationId] = [
        ...(mockMessages[conversationId] || []),
        newMessage
      ];
      
      return { conversationId, message: newMessage };
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['messages', userId, data.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
    },
  });
} 