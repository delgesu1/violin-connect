import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Send, PaperclipIcon, Menu, X } from 'lucide-react';
import { IdGenerator } from '@/lib/id-utils';
import { cn } from '@/lib/utils';

// Import the Student interface
import { Student } from '@/components/common/StudentCard';

// Mock data - in a real app, this would come from an API
const students: Student[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    avatarUrl: '/images/girl1.jpg',
    currentRepertoire: [
      { id: '101', title: 'Bach Partita No. 2', composer: 'J.S. Bach', startDate: '2023-10-01', status: 'current' }
    ],
    nextLesson: 'Today, 4:00 PM',
    unreadMessages: 2,
  },
  {
    id: '2',
    name: 'James Wilson',
    avatarUrl: '/images/boy1.jpg',
    currentRepertoire: [
      { id: '201', title: 'Paganini Caprice No. 24', composer: 'N. Paganini', startDate: '2023-09-10', status: 'current' }
    ],
    nextLesson: 'Tomorrow, 3:30 PM',
  },
  {
    id: '3',
    name: 'Sophia Chen',
    avatarUrl: '/images/girl2.jpg',
    currentRepertoire: [
      { id: '301', title: 'Tchaikovsky Violin Concerto', composer: 'P.I. Tchaikovsky', startDate: '2023-09-05', status: 'current' }
    ],
    nextLesson: 'Friday, 5:00 PM',
    unreadMessages: 1,
  },
  {
    id: '4',
    name: 'Michael Brown',
    avatarUrl: '/images/boy2.jpg',
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
    { id: IdGenerator.message('1'), senderId: '1', recipientId: 'teacher', content: 'Hi teacher, I have a question about the Bach Partita', timestamp: '2023-12-10T14:30:00', isRead: false },
    { id: IdGenerator.message('2'), senderId: 'teacher', recipientId: '1', content: 'Sure, what is your question?', timestamp: '2023-12-10T14:35:00', isRead: true },
    { id: IdGenerator.message('3'), senderId: '1', recipientId: 'teacher', content: 'Should I use more bow in the Allemande?', timestamp: '2023-12-10T14:40:00', isRead: false },
  ],
  '3': [
    { id: IdGenerator.message('4'), senderId: '3', recipientId: 'teacher', content: 'Hello, could we reschedule Friday\'s lesson?', timestamp: '2023-12-11T09:15:00', isRead: false },
  ]
};

const MessagesPage: React.FC = () => {
  const { studentId } = useParams<{ studentId?: string }>();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messageText, setMessageText] = useState('');
  const [conversations, setConversations] = useState(mockMessages);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Handle selecting a student
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsSidebarOpen(false);
    
    // Mark student's messages as read
    if (conversations[student.id]) {
      const updatedMessages = conversations[student.id].map(msg => ({
        ...msg,
        isRead: true
      }));
      
      setConversations({
        ...conversations,
        [student.id]: updatedMessages
      });
    }
    
    // Update URL
    navigate(`/messages/${student.id}`);
  };

  // Get unread message count
  const getUnreadCount = (studentId: string) => {
    if (!conversations[studentId]) return 0;
    return conversations[studentId].filter(msg => !msg.isRead && msg.senderId !== 'teacher').length;
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (!selectedStudent || !messageText.trim()) return;
    
    const newMessage: Message = {
      id: IdGenerator.message(`${Math.random().toString(36).substring(2, 11)}`),
      senderId: 'teacher',
      recipientId: selectedStudent.id,
      content: messageText,
      timestamp: new Date().toISOString(),
      isRead: true
    };
    
    // Add new message to conversation
    const studentConversation = conversations[selectedStudent.id] || [];
    const updatedConversations = {
      ...conversations,
      [selectedStudent.id]: [...studentConversation, newMessage]
    };
    
    setConversations(updatedConversations);
    setMessageText('');

    // Scroll to bottom of messages
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Format timestamp to display time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      <PageHeader 
        title="Messages" 
        description="Chat with your students"
      />
      
      <div className="relative flex flex-col md:flex-row gap-6 mt-6 w-full min-w-fit">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Conversations List - Progressively shrink as viewport narrows */}
        <div className={cn(
          "w-full transition-all duration-300 ease-in-out",
          "md:w-[180px] min-[850px]:w-[220px] min-[900px]:w-[250px] min-[1000px]:w-[300px] lg:w-[350px]",
          "max-[768px]:fixed md:relative inset-y-0 left-0 z-50 md:z-auto flex-shrink-0",
          "max-[768px]:w-[280px]",
          "min-[768px]:max-[850px]:w-[80px]", // Avatar-only mode between 768px and 850px
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <Card className="h-full md:h-[80vh] shadow-sm border overflow-hidden">
            <div className="p-4 border-b border-gray-100 min-[768px]:max-[850px]:flex min-[768px]:max-[850px]:justify-center min-[768px]:max-[850px]:p-3">
              <div className="relative w-full min-[768px]:max-[850px]:w-auto">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 min-[768px]:max-[850px]:hidden" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-9 bg-gray-50 min-[768px]:max-[850px]:hidden"
                />
                <div className="hidden min-[768px]:max-[850px]:flex min-[768px]:max-[850px]:items-center min-[768px]:max-[850px]:justify-center">
                  <Search className="h-5 w-5 text-gray-500" />
                </div>
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100%-73px)]">
              <div className="p-2 min-[768px]:max-[850px]:flex min-[768px]:max-[850px]:flex-col min-[768px]:max-[850px]:items-center min-[768px]:max-[850px]:p-1">
                {students.map(student => (
                  <div 
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 min-[768px]:max-[850px]:p-2 min-[768px]:max-[850px]:my-1 min-[768px]:max-[850px]:w-auto ${selectedStudent?.id === student.id ? 'bg-primary/10' : 'hover:bg-gray-50'}`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={student.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {student.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      {getUnreadCount(student.id) > 0 && (
                        <Badge className="absolute -top-1 -right-1 flex items-center gap-1 bg-red-500 rounded-full px-1.5 py-0.5 border-2 border-white">
                          {getUnreadCount(student.id)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 min-[768px]:max-[850px]:hidden">
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
        </div>
        
        {/* Main Chat Area - Ensure it doesn't shrink below 330px */}
        <div className="flex-1 min-w-[330px]">
          <Card className="h-[80vh] shadow-sm border overflow-hidden flex flex-col">
            {selectedStudent ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden"
                    onClick={toggleSidebar}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  
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
                    <div ref={messagesEndRef} />
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 left-4 md:hidden"
                  onClick={toggleSidebar}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="text-center text-gray-500">
                  <p className="mb-2">Select a conversation to start messaging</p>
                  <p className="text-sm">You can chat with any of your students</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 