import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PenSquare, 
  Search,
  TrendingUp,
  Clock,
  Pin,
  User,
  Calendar,
  FileText,
  InfoIcon,
  Phone,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import DiscussionCard, { DiscussionData } from '@/components/common/DiscussionCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Mock pinned items data
const pinnedItems = [
  {
    id: 'p1',
    title: 'Studio Information & Policies',
    description: 'Essential information about studio policies, expectations, and guidelines for all students.',
    icon: <FileText className="h-5 w-5 text-blue-600" />,
    color: 'bg-blue-50/50 dark:bg-blue-900/10',
  },
  {
    id: 'p2',
    title: 'Recital Scheduling',
    description: 'How to schedule your recital time, reserve spaces, and prepare for performances.',
    icon: <Calendar className="h-5 w-5 text-blue-600" />,
    color: 'bg-blue-50/50 dark:bg-blue-900/10',
  },
  {
    id: 'p3',
    title: 'Pianist Contact Information',
    description: 'Contact details for recommended accompanists available for lessons and performances.',
    icon: <Phone className="h-5 w-5 text-blue-600" />,
    color: 'bg-blue-50/50 dark:bg-blue-900/10',
  },
  {
    id: 'p4',
    title: 'Performance Opportunities',
    description: 'Upcoming competitions, masterclasses, and performance opportunities for students.',
    icon: <Sparkles className="h-5 w-5 text-blue-600" />,
    color: 'bg-blue-50/50 dark:bg-blue-900/10',
  }
];

// Mock discussion data
const discussions: DiscussionData[] = [
  {
    id: '1',
    title: 'Tips for practicing Bach\'s Partitas?',
    author: {
      id: '1',
      name: 'Emma Thompson',
      avatarUrl: '/src/images/girl1.jpg'
    },
    createdAt: '2 days ago',
    commentCount: 8,
    likeCount: 12,
    excerpt: 'I\'m struggling with the Chaconne from Partita No. 2. Any advice on how to approach the arpeggios and double stops?',
    tags: ['Technique', 'Repertoire', 'Practice Tips'],
    isPinned: true
  },
  {
    id: '2',
    title: 'Recommended strings for Tchaikovsky Concerto?',
    author: {
      id: '3',
      name: 'Sophia Chen',
      avatarUrl: '/src/images/girl2.jpg'
    },
    createdAt: '3 days ago',
    commentCount: 15,
    likeCount: 9,
    excerpt: 'I\'m preparing for a performance of the Tchaikovsky Violin Concerto. Which strings would you recommend for the best projection and warmth?',
    tags: ['Equipment', 'Performance']
  },
  {
    id: '3',
    title: 'Left-hand technique for fast passages',
    author: {
      id: '2',
      name: 'James Wilson',
      avatarUrl: '/src/images/boy1.jpg'
    },
    createdAt: '1 week ago',
    commentCount: 22,
    likeCount: 31,
    excerpt: 'I\'m working on Paganini Caprice No. 24 and struggling with the left-hand technique for the fast passages. Any exercises or tips?',
    tags: ['Technique', 'Practice Tips']
  },
  {
    id: '4',
    title: 'Advice for performance anxiety',
    author: {
      id: '4',
      name: 'Michael Brown',
      avatarUrl: '/src/images/boy2.jpg'
    },
    createdAt: '1 week ago',
    commentCount: 27,
    likeCount: 35,
    excerpt: 'I have a recital coming up and always get very nervous. What are your strategies for managing performance anxiety?',
    tags: ['Performance']
  },
  {
    id: '5',
    title: 'Mozart vs Beethoven: Interpretation differences',
    author: {
      id: '1',
      name: 'Teacher',
    },
    createdAt: '2 weeks ago',
    commentCount: 19,
    likeCount: 23,
    excerpt: 'Let\'s discuss the different approaches to interpreting Mozart and Beethoven violin sonatas. What are the key stylistic differences to consider?',
    tags: ['Interpretation', 'History']
  },
  {
    id: '6',
    title: 'Best shoulder rest for small-framed players?',
    author: {
      id: '5',
      name: 'Olivia Garcia',
      avatarUrl: '/src/images/girl3.jpg'
    },
    createdAt: '3 weeks ago',
    commentCount: 12,
    likeCount: 8,
    excerpt: 'I have a smaller frame and I\'m struggling to find a comfortable shoulder rest. Any recommendations from other small-framed violinists?',
    tags: ['Equipment']
  }
];

const topics = [
  'Technique', 'Performance', 'Equipment', 'Repertoire', 
  'Practice Tips', 'Theory', 'Interpretation', 'History'
];

const DiscussionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Toggle topic selection
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };
  
  // Filter discussions based on search query and selected topics
  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTopics = 
      selectedTopics.length === 0 || // If no topics selected, show all
      discussion.tags?.some(tag => selectedTopics.includes(tag));
    
    return matchesSearch && matchesTopics;
  });
  
  // Sort discussions - pinned discussions first, then by date
  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; // In a real app, would also sort by date
  });
  
  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <PageHeader 
        title="Discussions" 
        description="Join the conversation with fellow students and teachers"
      >
        <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
          <PenSquare className="mr-1.5 h-4 w-4" />
          New Discussion
        </Button>
      </PageHeader>
      
      {/* Pinned Items Section */}
      <div className="mb-10 animate-slide-up animate-stagger-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Pin className="h-4 w-4 text-blue-600" />
            Important Information
          </h2>
          <Button variant="ghost" size="sm" className="text-xs font-normal hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
            Manage Pinned Content
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pinnedItems.map((item, index) => (
            <Card 
              key={item.id} 
              className={cn(
                "cursor-pointer transition-all border-0 shadow-sm",
                "hover:shadow hover:translate-y-[-2px] overflow-hidden group",
                `animate-slide-up animate-delay-${(index % 4) + 1}`
              )}
            >
              <CardContent className={cn("p-4 flex items-start gap-3", item.color)}>
                <div className="pt-0.5 text-blue-600 group-hover:text-blue-700 transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className={cn(
        "sticky top-0 z-10 pt-4 pb-4 border-b mb-6 transition-all duration-300",
        isSearchFocused 
          ? "bg-background shadow-sm"
          : "bg-background/95 backdrop-blur-sm"
      )}>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1 animate-slide-up animate-stagger-1">
            <Search className={cn(
              "absolute left-3 top-2.5 h-4 w-4 transition-colors duration-200",
              isSearchFocused ? "text-blue-600" : "text-gray-400"
            )} />
            <Input
              type="search"
              placeholder="Search discussions..."
              className={cn(
                "pl-9 h-9 transition-all duration-200",
                isSearchFocused 
                  ? "border-blue-200 ring-1 ring-blue-100" 
                  : "shadow-sm"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
          
          <div className="shrink-0 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-xs font-medium border-gray-200 shadow-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
            >
              <InfoIcon className="mr-1.5 h-3.5 w-3.5" />
              Filter Options
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-xs font-medium border-gray-200 shadow-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
            >
              <User className="mr-1.5 h-3.5 w-3.5" />
              Following
            </Button>
          </div>
        </div>
        
        <div className="flex gap-1.5 flex-wrap animate-slide-up animate-stagger-2">
          {topics.map((topic, index) => (
            <Badge
              key={topic}
              variant={selectedTopics.includes(topic) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all text-xs font-normal",
                selectedTopics.includes(topic) 
                  ? "bg-blue-100 hover:bg-blue-200 text-blue-700 border-0" 
                  : "hover:border-blue-300 text-gray-600 dark:text-gray-300",
                `animate-slide-up animate-delay-${(index % 8) + 1}`
              )}
              onClick={() => toggleTopic(topic)}
            >
              {topic}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Discussion Tabs */}
      <Tabs defaultValue="recent" className="animate-slide-up animate-stagger-3">
        <TabsList className="mb-6 p-0.5 bg-gray-100/50 dark:bg-gray-800/50">
          <TabsTrigger 
            value="recent" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400 text-xs"
          >
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Recent
          </TabsTrigger>
          <TabsTrigger 
            value="trending" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400 text-xs"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            Trending
          </TabsTrigger>
          <TabsTrigger 
            value="my-discussions" 
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400 text-xs"
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            My Discussions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDiscussions.map((discussion, index) => (
              <div 
                key={discussion.id} 
                className={cn(
                  "transition-all duration-300",
                  `animate-slide-up animate-delay-${index % 5}`
                )}
              >
                <DiscussionCard discussion={discussion} />
              </div>
            ))}
          </div>
          
          {filteredDiscussions.length === 0 && (
            <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 dark:bg-gray-900/30 dark:border-gray-700">
              <MessageCircle className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-base font-medium text-gray-600 dark:text-gray-300 mb-1">No discussions found</p>
              <p className="text-gray-500 mb-5 text-sm">Try adjusting your search or filter criteria</p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                <PenSquare className="mr-2 h-4 w-4" />
                Start a New Discussion
              </Button>
            </div>
          )}
          
          {filteredDiscussions.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="text-xs px-4 border-gray-200 hover:bg-gray-50">
                Load More Discussions
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="trending" className="mt-0">
          <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 dark:bg-gray-900/30 dark:border-gray-700">
            <TrendingUp className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <p className="text-base font-medium text-gray-600 dark:text-gray-300 mb-1">Trending discussions</p>
            <p className="text-gray-500 mb-5 text-sm">Popular topics and conversations will appear here</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
              <PenSquare className="mr-2 h-4 w-4" />
              Start a New Discussion
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="my-discussions" className="mt-0">
          <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 dark:bg-gray-900/30 dark:border-gray-700">
            <User className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <p className="text-base font-medium text-gray-600 dark:text-gray-300 mb-1">Your discussions</p>
            <p className="text-gray-500 mb-5 text-sm">Discussions you've created or participated in will appear here</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
              <PenSquare className="mr-2 h-4 w-4" />
              Start Your First Discussion
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiscussionsPage;
