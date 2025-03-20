import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDevFallbackUser } from '@/hooks/useDevFallbackUser';

/**
 * Interface for an author
 */
export interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Interface for a discussion
 */
export interface Discussion {
  id: string;
  title: string;
  author: Author;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  excerpt: string;
  tags?: string[];
  isPinned?: boolean;
  content?: string;
}

/**
 * Interface for a comment on a discussion
 */
export interface DiscussionComment {
  id: string;
  discussionId: string;
  author: Author;
  content: string;
  createdAt: string;
  likes: number;
  hasLiked?: boolean;
}

// Mock data for discussions
const mockDiscussions: Discussion[] = [
  {
    id: 'kreutzer',
    title: 'Kreutzer Etude Challenge',
    author: {
      id: '1',
      name: 'Teacher',
    },
    createdAt: '1 day ago',
    commentCount: 15,
    likeCount: 24,
    excerpt: 'Whoever can play No.8 at dotted quarter=90 tempo gets a special prize! Post your recordings in the comments.',
    tags: ['Technique', 'Challenge', 'Etudes'],
    isPinned: true,
    content: `
# Kreutzer Etude Challenge!

Hello everyone! As we discussed in our masterclass last week, I think it would be fun to do a challenge based on Kreutzer Etude No. 8.

## The Challenge
- **Goal**: Play Kreutzer Etude No. 8 at dotted quarter = 90 BPM with clean, even tone
- **Due Date**: Two weeks from today
- **How to Submit**: Post a video in the comments section
- **Prize**: The winner gets to choose what we focus on in our next group masterclass!

## Tips for Success
1. Start slow and gradually increase the tempo
2. Focus on even bow distribution
3. Watch your intonation in the highest positions
4. Keep your left hand relaxed

Good luck everyone! I can't wait to see your progress.
    `
  },
  {
    id: 'paganini',
    title: 'Paganini Caprices Project',
    author: {
      id: '1',
      name: 'Teacher',
    },
    createdAt: '2 days ago',
    commentCount: 12,
    likeCount: 18,
    excerpt: 'Everyone pick your favorite Paganini caprice and we will schedule a concert to showcase them all. Comment below with your selection!',
    tags: ['Performance', 'Repertoire', 'Paganini'],
    content: `
# Paganini Caprices Showcase

As we discussed in our last studio class, I think it would be fantastic to organize a Paganini Caprices showcase concert at the end of the semester.

## How it works:
1. Each student will select one Paganini Caprice to perform
2. You'll have the semester to prepare it
3. We'll organize a special recital where everyone performs their selected caprice
4. We'll invite other studios to attend!

## Please comment below with:
- Which caprice you'd like to perform
- Why you selected it
- Any questions or concerns you have about the piece

This is an exciting opportunity to challenge yourselves and showcase your technical abilities. I'm looking forward to helping each of you master these incredibly demanding pieces!
    `
  },
  {
    id: '1',
    title: 'Tips for practicing Bach\'s Partitas?',
    author: {
      id: '2',
      name: 'Emma Thompson',
      avatarUrl: '/images/girl1.jpg'
    },
    createdAt: '4 days ago',
    commentCount: 8,
    likeCount: 12,
    excerpt: 'I\'m struggling with the Chaconne from Partita No. 2. Any advice on how to approach the arpeggios and double stops?',
    tags: ['Technique', 'Repertoire', 'Practice Tips'],
    isPinned: true,
    content: `
# Advice for Bach's Chaconne

I'm currently working on the Chaconne from Bach's Partita No. 2 in D minor, and I'm finding it quite challenging, especially the arpeggiated sections and some of the double stops.

## My specific challenges:
1. The arpeggios in the middle section - my hand gets tired very quickly
2. Maintaining good intonation in the double-stop passages
3. Finding the right balance between voices
4. Developing a clear interpretation of the piece

Does anyone have advice or practice techniques that have worked well for these challenges? I'm practicing about 1-2 hours per day on this piece, but feel like I'm hitting a wall.

Thanks in advance for any tips!
    `
  }
];

// Mock data for comments
const mockComments: Record<string, DiscussionComment[]> = {
  'kreutzer': [
    {
      id: 'comment-1',
      discussionId: 'kreutzer',
      author: {
        id: '2',
        name: 'Emma Thompson',
        avatarUrl: '/images/girl1.jpg'
      },
      content: 'This sounds like a great challenge! I\'ve been practicing this etude for a while now and I\'m excited to see how close I can get to the target tempo.',
      createdAt: '1 day ago',
      likes: 3
    },
    {
      id: 'comment-2',
      discussionId: 'kreutzer',
      author: {
        id: '3',
        name: 'Sophia Chen',
        avatarUrl: '/images/girl2.jpg'
      },
      content: 'Could you share some tips for handling the string crossings in measures 15-20? That\'s where I always struggle with maintaining an even tone.',
      createdAt: '20 hours ago',
      likes: 2
    }
  ],
  'paganini': [
    {
      id: 'comment-3',
      discussionId: 'paganini',
      author: {
        id: '4',
        name: 'Michael Brown',
        avatarUrl: '/images/boy2.jpg'
      },
      content: 'I\'d like to perform Caprice No. 5. It\'s always been one of my favorites, and I think the ricochet bowing would be a good technical challenge for me.',
      createdAt: '2 days ago',
      likes: 5
    }
  ],
  '1': [
    {
      id: 'comment-4',
      discussionId: '1',
      author: {
        id: '1',
        name: 'Teacher',
      },
      content: 'Great question! For the arpeggiated sections, I recommend breaking them down into smaller groups and practicing them as block chords first. This helps with understanding the harmony and ensuring good intonation before adding the arpeggiation.',
      createdAt: '3 days ago',
      likes: 4
    }
  ]
};

/**
 * Hook to fetch all discussions
 */
export function useDiscussions(options?: { 
  tags?: string[]; 
  searchQuery?: string; 
  enabled?: boolean;
}) {
  const { user, isLoaded } = useDevFallbackUser();
  
  return useQuery({
    queryKey: ['discussions', options?.tags, options?.searchQuery],
    queryFn: async () => {
      // In a real app, this would be a database or API call
      
      let filteredDiscussions = [...mockDiscussions];
      
      // Filter by tags if provided
      if (options?.tags && options.tags.length > 0) {
        filteredDiscussions = filteredDiscussions.filter(discussion => 
          discussion.tags?.some(tag => options.tags?.includes(tag))
        );
      }
      
      // Filter by search query if provided
      if (options?.searchQuery) {
        const query = options.searchQuery.toLowerCase();
        filteredDiscussions = filteredDiscussions.filter(discussion => 
          discussion.title.toLowerCase().includes(query) || 
          discussion.excerpt.toLowerCase().includes(query) ||
          discussion.content?.toLowerCase().includes(query)
        );
      }
      
      return filteredDiscussions;
    },
    enabled: isLoaded && (options?.enabled !== false),
  });
}

/**
 * Hook to fetch a single discussion by ID
 */
export function useDiscussion(id: string, options?: { enabled?: boolean }) {
  const { user, isLoaded } = useDevFallbackUser();
  
  return useQuery({
    queryKey: ['discussion', id],
    queryFn: async () => {
      // In a real app, this would be a database or API call
      
      const discussion = mockDiscussions.find(d => d.id === id);
      
      if (!discussion) {
        throw new Error('Discussion not found');
      }
      
      return discussion;
    },
    enabled: isLoaded && !!id && (options?.enabled !== false),
  });
}

/**
 * Hook to fetch comments for a discussion
 */
export function useDiscussionComments(discussionId: string, options?: { enabled?: boolean }) {
  const { user, isLoaded } = useDevFallbackUser();
  
  return useQuery({
    queryKey: ['discussionComments', discussionId],
    queryFn: async () => {
      // In a real app, this would be a database or API call
      
      return mockComments[discussionId] || [];
    },
    enabled: isLoaded && !!discussionId && (options?.enabled !== false),
  });
}

/**
 * Hook to create a new discussion
 */
export function useCreateDiscussion() {
  const queryClient = useQueryClient();
  const { user } = useDevFallbackUser();
  
  return useMutation({
    mutationFn: async ({ 
      title, 
      content, 
      tags 
    }: { 
      title: string; 
      content: string; 
      tags?: string[] 
    }) => {
      // In a real app, this would be a database insert
      
      const newDiscussion: Discussion = {
        id: `discussion-${Date.now()}`,
        title,
        author: {
          id: user?.id || 'anonymous',
          name: user?.fullName || 'Anonymous User',
          avatarUrl: user?.imageUrl
        },
        createdAt: new Date().toISOString(),
        commentCount: 0,
        likeCount: 0,
        excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
        tags,
        content
      };
      
      // In a real app, this would save to a database
      mockDiscussions.unshift(newDiscussion);
      
      return newDiscussion;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
  });
}

/**
 * Hook to create a new comment on a discussion
 */
export function useCreateComment() {
  const queryClient = useQueryClient();
  const { user } = useDevFallbackUser();
  
  return useMutation({
    mutationFn: async ({ 
      discussionId, 
      content 
    }: { 
      discussionId: string; 
      content: string 
    }) => {
      // In a real app, this would be a database insert
      
      const newComment: DiscussionComment = {
        id: `comment-${Date.now()}`,
        discussionId,
        author: {
          id: user?.id || 'anonymous',
          name: user?.fullName || 'Anonymous User',
          avatarUrl: user?.imageUrl
        },
        content,
        createdAt: new Date().toISOString(),
        likes: 0
      };
      
      // Add the comment to mock data
      if (!mockComments[discussionId]) {
        mockComments[discussionId] = [];
      }
      
      mockComments[discussionId].push(newComment);
      
      // Update the comment count on the discussion
      const discussion = mockDiscussions.find(d => d.id === discussionId);
      if (discussion) {
        discussion.commentCount += 1;
      }
      
      return newComment;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['discussionComments', data.discussionId] });
      queryClient.invalidateQueries({ queryKey: ['discussion', data.discussionId] });
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
  });
}

/**
 * Hook to like/unlike a discussion
 */
export function useLikeDiscussion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      discussionId, 
      like 
    }: { 
      discussionId: string; 
      like: boolean 
    }) => {
      // In a real app, this would be a database update
      
      const discussion = mockDiscussions.find(d => d.id === discussionId);
      
      if (!discussion) {
        throw new Error('Discussion not found');
      }
      
      // Update the like count
      discussion.likeCount = like
        ? discussion.likeCount + 1
        : Math.max(0, discussion.likeCount - 1);
      
      return discussion;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['discussion', data.id] });
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
  });
} 