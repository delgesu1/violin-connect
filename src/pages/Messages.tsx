import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Send, PaperclipIcon } from 'lucide-react';

// Import the Student interface
import { Student } from '@/components/common/StudentCard';

// Mock data - in a real app, this would come from an API
const students: Student[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    currentRepertoire: [
      { id: '101', title: 'Bach Partita No. 2', composer: 'J.S. Bach', startDate: '2023-10-01', status: 'current' }
    ],
    nextLesson: 'Today, 4:00 PM',
    unreadMessages: 2,
  },
  {
    id: '2',
    name: 'James Wilson',
    currentRepertoire: [
      { id: '201', title: 'Paganini Caprice No. 24', composer: 'N. Paganini', startDate: '2023-09-10', status: 'current' }
    ],
    nextLesson: 'Tomorrow, 3:30 PM',
  },
  {
    id: '3',
    name: 'Sophia Chen',
    currentRepertoire: [
      { id: '301', title: 'Tchaikovsky Violin Concerto', composer: 'P.I. Tchaikovsky', startDate: '2023-09-05', status: 'current' }
    ],
    nextLesson: 'Friday, 5:00 PM',
    unreadMessages: 1,
  },
  {
    id: '4',
    name: 'Michael Brown',
    currentRepertoire: [
      { id: '401', title: 'Mozart Violin Sonata K.304', composer: 'W.A. Mozart', startDate: '2023-09-20', status: 'current' }
    ],
    nextLesson: 'Next Monday, 4:30 PM',
  }
];

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

// Mock messages data
const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', senderId: '1', recipientId: 'teacher', content: 'Hi teacher, I have a question about the Bach Partita', timestamp: '2023-12-10T14:30:00', isRead: false },
    { id: 'm2', senderId: 'teacher', recipientId: '1', content: 'Sure, what is your question?', timestamp: '2023-12-10T14:35:00', isRead: true },
    { id: 'm3', senderId: '1', recipientId: 'teacher', content: 'Should I use more bow in the Allemande?', timestamp: '2023-12-10T14:40:00', isRead: false },
  ],
  '3': [
    { id: 'm4', senderId: '3', recipientId: 'teacher', content: 'Hello, could we reschedule Friday\'s lesson?', timestamp: '2023-12-11T09:15:00', isRead: false },
  ]
};

const MessagesPage: React.FC = () => {
  const { studentId } = useParams<{ studentId?: string }>();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messageText, setMessageText] = useState('');
  const [conversations, setConversations] = useState(mockMessages);

  // Find student by ID
  const findStudentById = (id: string) => {
    return students.find(student => student.id === id) || null;
  };

  // Effect to handle URL parameter
  useEffect(() => {
    if (studentId) {
      const student = findStudentById(studentId);
      if (student) {
        handleSelectStudent(student);
      } else {
        // If student ID is invalid, navigate to main messages page
        navigate('/messages', { replace: true });
      }
    }
  }, [studentId, navigate]);

  // Helper function to find unread messages count for a student
  const getUnreadCount = (studentId: string) => {
    const studentMessages = conversations[studentId] || [];
    return studentMessages.filter(m => m.senderId === studentId && !m.isRead).length;
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!selectedStudent || !messageText.trim()) return;
    
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: 'teacher',
      recipientId: selectedStudent.id,
      content: messageText,
      timestamp: new Date().toISOString(),
      isRead: true
    };

    setConversations(prev => {
      const updatedConversations = { ...prev };
      
      if (!updatedConversations[selectedStudent.id]) {
        updatedConversations[selectedStudent.id] = [];
      }
      
      updatedConversations[selectedStudent.id] = [
        ...updatedConversations[selectedStudent.id],
        newMessage
      ];
      
      return updatedConversations;
    });
    
    setMessageText('');
  };

  // Mark messages as read when selecting a student
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    
    // Update URL to reflect selected student
    if (studentId !== student.id) {
      navigate(`/messages/${student.id}`, { replace: true });
    }
    
    // Mark all messages from this student as read
    if (conversations[student.id]) {
      setConversations(prev => {
        const updatedConversations = { ...prev };
        updatedConversations[student.id] = updatedConversations[student.id].map(message => 
          message.senderId === student.id ? { ...message, isRead: true } : message
        );
        return updatedConversations;
      });
    }
  };

  // Format timestamp to display time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader 
        title="Messages" 
        description="Chat with your students"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        {/* Conversations List */}
        <Card className="md:col-span-1 border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-9 bg-gray-50"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(80vh-12rem)]">
            <div className="p-2">
              {students.map(student => (
                <div 
                  key={student.id}
                  onClick={() => handleSelectStudent(student)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${selectedStudent?.id === student.id ? 'bg-primary/10' : 'hover:bg-gray-50'}`}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={student.avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {student.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {getUnreadCount(student.id) > 0 && (
                      <Badge className="absolute -top-1 -right-1 flex items-center gap-1 bg-primary rounded-full px-1.5 py-0.5 border-2 border-white">
                        {getUnreadCount(student.id)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-800 truncate">{student.name}</p>
                      {conversations[student.id]?.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(conversations[student.id][conversations[student.id].length - 1].timestamp)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 truncate">
                      {conversations[student.id]?.length > 0 
                        ? `${conversations[student.id][conversations[student.id].length - 1].senderId === 'teacher' ? 'You: ' : ''}${conversations[student.id][conversations[student.id].length - 1].content}`
                        : 'No messages yet'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
        
        {/* Chat Area */}
        <Card className="md:col-span-3 border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[80vh]">
          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <Avatar>
                  <AvatarImage src={selectedStudent.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedStudent.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedStudent.name}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedStudent.currentRepertoire?.length > 0 
                      ? `Working on: ${selectedStudent.currentRepertoire[0].title}`
                      : 'No current repertoire'}
                  </p>
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {(conversations[selectedStudent.id] || []).map(message => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.senderId === 'teacher' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.senderId === 'teacher' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'teacher'
                            ? 'text-primary-foreground/80' 
                            : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!conversations[selectedStudent.id] || conversations[selectedStudent.id].length === 0) && (
                    <div className="text-center text-gray-500 py-10">
                      No messages yet. Start a conversation!
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="shrink-0">
                    <PaperclipIcon className="h-4 w-4" />
                  </Button>
                  <Input 
                    placeholder="Type a message..." 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    className="shrink-0" 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="mb-2">Select a conversation to start messaging</p>
                <p className="text-sm">You can chat with any of your students</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage; 