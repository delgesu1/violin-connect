
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp } from 'lucide-react';

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
}

interface DiscussionCardProps {
  discussion: DiscussionData;
  className?: string;
}

const DiscussionCard: React.FC<DiscussionCardProps> = ({ discussion, className }) => {
  return (
    <Link to={`/discussions/${discussion.id}`}>
      <Card className={cn("transition-all duration-300 card-hover overflow-hidden", className)}>
        <CardContent className="p-5">
          <h3 className="font-medium text-lg mb-2">{discussion.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{discussion.excerpt}</p>
          
          <div className="mt-4 flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={discussion.author.avatarUrl || "/placeholder.svg"} alt={discussion.author.name} />
              <AvatarFallback>{discussion.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{discussion.author.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">{discussion.createdAt}</span>
          </div>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 border-t bg-muted/30 justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{discussion.commentCount}</span>
            </div>
            
            <div className="flex items-center gap-1 text-xs">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{discussion.likeCount}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default DiscussionCard;
