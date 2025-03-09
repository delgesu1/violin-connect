import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp, BookmarkIcon, Share2, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface DiscussionData {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  commentCount: number;
  likeCount: number;
  excerpt: string;
  tags?: string[];
  isPinned?: boolean;
}

interface DiscussionCardProps {
  discussion: DiscussionData;
  className?: string;
}

const DiscussionCard: React.FC<DiscussionCardProps> = ({ discussion, className }) => {
  // Randomly assign some tags if not provided in the discussion object
  const defaultTags = ['Technique', 'Performance', 'Equipment', 'Repertoire'];
  const displayTags = discussion.tags || 
    defaultTags.slice(0, Math.floor(Math.random() * 3) + 1);
  
  return (
    <Card 
      className={cn(
        "h-full transition-all duration-300 overflow-hidden border shadow-sm",
        "hover:shadow hover:border-gray-300/50 dark:hover:border-gray-700/50",
        discussion.isPinned ? "border-l-[3px] border-l-blue-500" : "",
        className
      )}
    >
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex justify-between items-start gap-1">
          <Link 
            to={`/discussions/${discussion.id}`}
            className="group"
          >
            <div className="flex items-center gap-1.5">
              {discussion.isPinned && <Pin className="h-3 w-3 text-blue-500 shrink-0" />}
              <h3 className="font-medium text-base leading-tight group-hover:text-blue-600 transition-colors">
                {discussion.title}
              </h3>
            </div>
          </Link>
          
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-500 -mt-0.5 -mr-1.5">
            <BookmarkIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {displayTags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="px-1.5 py-0 text-xs font-normal bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3 leading-relaxed">{discussion.excerpt}</p>
        
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 ring-1 ring-gray-200 dark:ring-gray-700">
            <AvatarImage src={discussion.author.avatarUrl || "/placeholder.svg"} alt={discussion.author.name} />
            <AvatarFallback className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {discussion.author.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{discussion.author.name}</span>
            <span className="text-xs text-gray-500">{discussion.createdAt}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 px-4 border-t bg-gray-50/50 dark:bg-gray-900/30 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{discussion.commentCount}</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{discussion.likeCount}</span>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-500">
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DiscussionCard;
