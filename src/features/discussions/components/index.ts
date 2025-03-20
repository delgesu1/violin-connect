/**
 * Discussions Components
 *
 * These components are used in the Discussions feature to display and interact
 * with discussion threads and topics.
 */

// Re-export the original DiscussionCard
export { default as DiscussionCard } from '@/components/common/DiscussionCard';
export * from '@/components/common/DiscussionCard';

// Export new components
export { default as TopicBadge } from './TopicBadge';
export * from './TopicBadge';

export { default as PinnedInfoCard } from './PinnedInfoCard';
export * from './PinnedInfoCard';

export { default as TopicSelector } from './TopicSelector';
export * from './TopicSelector';

export { default as DiscussionList } from './DiscussionList';
export * from './DiscussionList'; 