import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Lightbulb, 
  Plus, 
  Play, 
  Link as LinkIcon, 
  MoreVertical, 
  Calendar, 
  X, 
  ThumbsUp, 
  Youtube, 
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Type definitions
interface InspirationItem {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'video' | 'article';
  submittedBy: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: 'student' | 'teacher';
  };
  date: string;
  approved: boolean;
  likes: number;
  featured?: boolean;
}

// Mock data for inspiration queue
const mockInspirationQueue: InspirationItem[] = [
  {
    id: '1',
    title: 'Bach - Violin Partita no. 2 in D minor BWV 1004 - Sato',
    description: 'Shrouded in wistfulness, all the movements of this Partita no. 2, here performed by Shunske Sato for All of Bach, are in a minor key.',
    url: 'https://www.youtube.com/watch?v=44Wz92zQe04',
    type: 'video',
    submittedBy: {
      id: '1',
      name: 'Teacher',
      role: 'teacher'
    },
    date: '2023-06-15',
    approved: true,
    likes: 15,
    featured: true
  },
  {
    id: '2',
    title: 'Ray Chen\'s Practice Tips',
    description: 'Ray Chen shares his practice routine and tips for effective violin practice.',
    url: 'https://www.youtube.com/watch?v=I03RVJKxNEU',
    type: 'video',
    submittedBy: {
      id: '2',
      name: 'Emma Thompson',
      avatarUrl: '/images/girl1.jpg',
      role: 'student'
    },
    date: '2023-06-18',
    approved: true,
    likes: 8
  },
  {
    id: '3',
    title: 'The Science of Practice',
    description: 'A fascinating article about the neuroscience behind effective practice techniques.',
    url: 'https://www.thestrad.com/playing-and-teaching/7-mental-techniques-to-improve-your-practice/7781.article',
    type: 'article',
    submittedBy: {
      id: '3',
      name: 'James Wilson',
      avatarUrl: '/images/boy1.jpg',
      role: 'student'
    },
    date: '2023-06-20',
    approved: true,
    likes: 12
  },
  {
    id: '4',
    title: 'Tchaikovsky Violin Concerto by Janine Jansen',
    description: 'A beautiful interpretation of Tchaikovsky\'s Violin Concerto by Janine Jansen.',
    url: 'https://www.youtube.com/watch?v=cbJZeNWroso',
    type: 'video',
    submittedBy: {
      id: '4',
      name: 'Sophia Chen',
      avatarUrl: '/images/girl2.jpg',
      role: 'student'
    },
    date: '2023-06-25',
    approved: false,
    likes: 0
  }
];

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Helper function to check if a URL is a YouTube URL
const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Component for displaying the current inspiration item
const InspirationOfTheDay: React.FC = () => {
  // State variables
  const [inspirationQueue, setInspirationQueue] = useState<InspirationItem[]>(mockInspirationQueue);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isQueueDialogOpen, setIsQueueDialogOpen] = useState(false);
  const [newInspiration, setNewInspiration] = useState({
    title: '',
    description: '',
    url: '',
    type: 'video' as 'video' | 'article'
  });

  // Get today's featured inspiration
  const getTodayInspiration = (): InspirationItem | undefined => {
    return inspirationQueue.find(item => item.featured) || 
           inspirationQueue.filter(item => item.approved)[0];
  };

  // Get approved items for the queue
  const getApprovedItems = (): InspirationItem[] => {
    return inspirationQueue
      .filter(item => item.approved && !item.featured)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get pending items that need approval
  const getPendingItems = (): InspirationItem[] => {
    return inspirationQueue
      .filter(item => !item.approved)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Handle approval of an item
  const handleApproveItem = (id: string) => {
    setInspirationQueue(inspirationQueue.map(item => 
      item.id === id ? { ...item, approved: true } : item
    ));
  };

  // Handle deletion of an item
  const handleDeleteItem = (id: string) => {
    setInspirationQueue(inspirationQueue.filter(item => item.id !== id));
  };

  // Handle featuring an item for today
  const handleFeatureItem = (id: string) => {
    setInspirationQueue(inspirationQueue.map(item => 
      item.id === id ? { ...item, featured: true } : { ...item, featured: false }
    ));
  };

  // Handle submission of a new inspiration item
  const handleSubmitInspiration = () => {
    const type = isYouTubeUrl(newInspiration.url) ? 'video' : 'article';
    
    const newItem: InspirationItem = {
      id: `${inspirationQueue.length + 1}`,
      title: newInspiration.title,
      description: newInspiration.description,
      url: newInspiration.url,
      type,
      submittedBy: {
        id: '1', // In a real app, this would be the current user's ID
        name: 'Teacher', // In a real app, this would be the current user's name
        role: 'teacher' // In a real app, this would be the current user's role
      },
      date: new Date().toISOString().split('T')[0],
      approved: true, // Auto-approve for teachers, would be false for students in a real app
      likes: 0
    };
    
    setInspirationQueue([newItem, ...inspirationQueue]);
    setIsSubmitDialogOpen(false);
    setNewInspiration({
      title: '',
      description: '',
      url: '',
      type: 'video'
    });
  };

  const todayInspiration = getTodayInspiration();
  const youtubeId = todayInspiration?.type === 'video' ? getYouTubeVideoId(todayInspiration.url) : null;

  return (
    <Card className="animate-slide-up animate-stagger-4 bg-white border border-gray-100 shadow-sm hover:shadow transition-all duration-200 overflow-hidden">
      <CardHeader className="pb-0 pt-4 px-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold flex items-center text-gray-800">
            <Lightbulb className="h-4 w-4 mr-1.5 text-amber-500" />
            Inspiration of the Day
          </CardTitle>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-gray-500 hover:text-primary hover:bg-blue-50"
              onClick={() => setIsQueueDialogOpen(true)}
            >
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Queue</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 px-2 text-gray-500 hover:text-primary hover:bg-blue-50"
              onClick={() => setIsSubmitDialogOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Add</span>
            </Button>
          </div>
        </div>
        <CardDescription className="mt-0.5 text-xs text-gray-500">
          Daily dose of musical inspiration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 pt-3 pb-5">
        {todayInspiration ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="outline" className={
                todayInspiration.type === 'video' 
                  ? "bg-red-50 text-red-700 border-red-200 text-xs py-0 px-1.5" 
                  : "bg-blue-50 text-blue-700 border-blue-200 text-xs py-0 px-1.5"
              }>
                {todayInspiration.type === 'video' ? (
                  <Youtube className="h-2.5 w-2.5 mr-1" />
                ) : (
                  <FileText className="h-2.5 w-2.5 mr-1" />
                )}
                {todayInspiration.type === 'video' ? 'Video' : 'Article'}
              </Badge>
              <span className="text-xs text-gray-500">
                {format(new Date(todayInspiration.date), 'MMM d, yyyy')}
              </span>
            </div>
            
            <h3 className="text-sm font-medium leading-tight text-gray-800">
              {todayInspiration.title}
            </h3>
            
            <p className="text-xs text-gray-600 line-clamp-2">
              {todayInspiration.description}
            </p>
            
            {todayInspiration.type === 'video' && youtubeId ? (
              <div className="w-full rounded-md overflow-hidden border border-gray-200 mt-2">
                <iframe 
                  width="100%" 
                  height="240" 
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={todayInspiration.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full justify-center h-8 text-xs"
                onClick={() => window.open(todayInspiration.url, '_blank')}
              >
                <LinkIcon className="h-3 w-3 mr-1.5" />
                Visit Article
              </Button>
            )}
            
            <div className="flex items-center justify-between pt-1 text-sm">
              <div className="flex items-center gap-1.5">
                <Avatar className="h-4 w-4">
                  <AvatarImage 
                    src={todayInspiration.submittedBy.avatarUrl} 
                    alt={todayInspiration.submittedBy.name} 
                  />
                  <AvatarFallback className="text-[8px]">
                    {todayInspiration.submittedBy.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-600 text-xs">
                  By <span className="font-medium">{todayInspiration.submittedBy.name}</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <ThumbsUp className="h-3 w-3" />
                <span className="text-xs">{todayInspiration.likes}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-3 text-center">
            <Sparkles className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-xs text-muted-foreground mb-2">No inspiration items yet.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7 px-3"
              onClick={() => setIsSubmitDialogOpen(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Share Inspiration
            </Button>
          </div>
        )}
      </CardContent>

      {/* Submit Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Inspiration</DialogTitle>
            <DialogDescription>
              Share a video or article that inspired you. It will be added to the queue after approval.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                placeholder="Enter a title for your inspiration" 
                value={newInspiration.title}
                onChange={(e) => setNewInspiration({...newInspiration, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input 
                placeholder="Paste a YouTube link or article URL" 
                value={newInspiration.url}
                onChange={(e) => setNewInspiration({...newInspiration, url: e.target.value})}
              />
              <p className="text-xs text-gray-500">
                {isYouTubeUrl(newInspiration.url) 
                  ? "YouTube video detected" 
                  : newInspiration.url 
                    ? "Article link detected" 
                    : "Paste a YouTube or article link"}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                placeholder="Why do you find this inspiring? What should others take away from it?" 
                value={newInspiration.description}
                onChange={(e) => setNewInspiration({...newInspiration, description: e.target.value})}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsSubmitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitInspiration}
              disabled={!newInspiration.title || !newInspiration.url || !newInspiration.description}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Queue Management Dialog */}
      <Dialog open={isQueueDialogOpen} onOpenChange={setIsQueueDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inspiration Queue</DialogTitle>
            <DialogDescription>
              Manage upcoming inspiration items and approve new submissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current featured item */}
            {todayInspiration && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-800 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" />
                  Today's Featured
                </h3>
                
                <Card className="bg-amber-50/50 border border-amber-100">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge variant="outline" className={
                          todayInspiration.type === 'video' 
                            ? "bg-red-50 text-red-700 border-red-200" 
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }>
                          {todayInspiration.type === 'video' ? 'Video' : 'Article'}
                        </Badge>
                        <h4 className="font-medium text-sm truncate">{todayInspiration.title}</h4>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteItem(todayInspiration.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="text-xs flex items-center gap-2 mt-2 text-gray-500">
                      <span>By {todayInspiration.submittedBy.name}</span>
                      <span>•</span>
                      <span>{format(new Date(todayInspiration.date), 'MMM d, yyyy')}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Approved queue */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1.5 text-green-600" />
                Coming Up ({getApprovedItems().length})
              </h3>
              
              {getApprovedItems().length > 0 ? (
                <div className="space-y-2">
                  {getApprovedItems().map(item => (
                    <Card key={item.id} className="bg-white border border-gray-100">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Badge variant="outline" className={
                              item.type === 'video' 
                                ? "bg-red-50 text-red-700 border-red-200" 
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }>
                              {item.type === 'video' ? 'Video' : 'Article'}
                            </Badge>
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleFeatureItem(item.id)}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Feature Today
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="text-xs flex items-center gap-2 mt-2 text-gray-500">
                          <span>By {item.submittedBy.name}</span>
                          <span>•</span>
                          <span>{format(new Date(item.date), 'MMM d, yyyy')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center bg-gray-50 py-6 rounded-md border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">No upcoming items in the queue</p>
                </div>
              )}
            </div>
            
            {/* Pending approval */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-800 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1.5 text-orange-500" />
                Pending Approval ({getPendingItems().length})
              </h3>
              
              {getPendingItems().length > 0 ? (
                <div className="space-y-2">
                  {getPendingItems().map(item => (
                    <Card key={item.id} className="bg-orange-50/30 border border-orange-100">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Badge variant="outline" className={
                              item.type === 'video' 
                                ? "bg-red-50 text-red-700 border-red-200" 
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }>
                              {item.type === 'video' ? 'Video' : 'Article'}
                            </Badge>
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApproveItem(item.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-xs flex items-center gap-2 mt-2 text-gray-500">
                          <span>By {item.submittedBy.name}</span>
                          <span>•</span>
                          <span>{format(new Date(item.date), 'MMM d, yyyy')}</span>
                        </div>
                        
                        <p className="text-xs mt-2 text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="flex justify-end mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 px-2 text-xs"
                            onClick={() => window.open(item.url, '_blank')}
                          >
                            <LinkIcon className="h-3 w-3 mr-1" />
                            View Link
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center bg-gray-50 py-6 rounded-md border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">No pending submissions</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsQueueDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => setIsSubmitDialogOpen(true)}
            >
              Add New
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InspirationOfTheDay; 