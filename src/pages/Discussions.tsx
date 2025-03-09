
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
} from 'lucide-react';
import DiscussionCard, { DiscussionData } from '@/components/common/DiscussionCard';
import { Badge } from '@/components/ui/badge';

// Mock discussion data
const discussions: DiscussionData[] = [
  {
    id: '1',
    title: 'Tips for practicing Bach\'s Partitas?',
    author: {
      id: '1',
      name: 'Emma Thompson',
    },
    createdAt: '2 days ago',
    commentCount: 8,
    likeCount: 12,
    excerpt: 'I\'m struggling with the Chaconne from Partita No. 2. Any advice on how to approach the arpeggios and double stops?'
  },
  {
    id: '2',
    title: 'Recommended strings for Tchaikovsky Concerto?',
    author: {
      id: '3',
      name: 'Sophia Chen',
    },
    createdAt: '3 days ago',
    commentCount: 15,
    likeCount: 9,
    excerpt: 'I\'m preparing for a performance of the Tchaikovsky Violin Concerto. Which strings would you recommend for the best projection and warmth?'
  },
  {
    id: '3',
    title: 'Left-hand technique for fast passages',
    author: {
      id: '2',
      name: 'James Wilson',
    },
    createdAt: '1 week ago',
    commentCount: 22,
    likeCount: 31,
    excerpt: 'I\'m working on Paganini Caprice No. 24 and struggling with the left-hand technique for the fast passages. Any exercises or tips?'
  },
  {
    id: '4',
    title: 'Advice for performance anxiety',
    author: {
      id: '4',
      name: 'Michael Brown',
    },
    createdAt: '1 week ago',
    commentCount: 27,
    likeCount: 35,
    excerpt: 'I have a recital coming up and always get very nervous. What are your strategies for managing performance anxiety?'
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
    excerpt: 'Let\'s discuss the different approaches to interpreting Mozart and Beethoven violin sonatas. What are the key stylistic differences to consider?'
  },
  {
    id: '6',
    title: 'Best shoulder rest for small-framed players?',
    author: {
      id: '3',
      name: 'Sophia Chen',
    },
    createdAt: '3 weeks ago',
    commentCount: 12,
    likeCount: 8,
    excerpt: 'I have a smaller frame and I\'m struggling to find a comfortable shoulder rest. Any recommendations from other small-framed violinists?'
  }
];

const topics = [
  'Technique', 'Performance', 'Equipment', 'Repertoire', 
  'Practice Tips', 'Theory', 'Interpretation', 'History'
];

const DiscussionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // Toggle topic selection
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };
  
  // Filter discussions based on search query (in real app, would also filter by topics)
  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
      <PageHeader 
        title="Discussions" 
        description="Join the conversation with other students and teachers"
      >
        <Button>
          <PenSquare className="mr-2 h-4 w-4" />
          New Discussion
        </Button>
      </PageHeader>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="relative flex-1 animate-slide-up animate-stagger-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search discussions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap mb-6 animate-slide-up animate-stagger-2">
        {topics.map(topic => (
          <Badge
            key={topic}
            variant={selectedTopics.includes(topic) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleTopic(topic)}
          >
            {topic}
          </Badge>
        ))}
      </div>
      
      <Tabs defaultValue="recent" className="animate-slide-up animate-stagger-3">
        <TabsList className="mb-6">
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-2" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="my-discussions">My Discussions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDiscussions.map(discussion => (
              <DiscussionCard key={discussion.id} discussion={discussion} />
            ))}
          </div>
          
          {filteredDiscussions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No discussions match your search criteria.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="trending" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Trending discussions will appear here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="my-discussions" className="mt-0">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Discussions you've created or participated in will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default DiscussionsPage;
