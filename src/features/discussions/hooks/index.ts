/**
 * Discussions Hooks
 * 
 * This file re-exports all discussion-related hooks for easier imports.
 * These hooks provide functionality for accessing and manipulating discussions data.
 */

export {
  useDiscussions,
  useDiscussion,
  useDiscussionComments,
  useCreateDiscussion,
  useCreateComment,
  useLikeDiscussion,
  // Type exports
  type Author,
  type Discussion,
  type DiscussionComment
} from './useDiscussions'; 