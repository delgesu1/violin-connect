import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AttachmentEntityType, 
  AttachmentType, 
  AttachmentContent, 
  AttachmentAssociation,
  getAttachmentsForEntity,
  createAttachmentId,
  createAttachmentAssociation
} from '@/lib/attachment-utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isDevelopment } from '@/lib/environment';

export { 
  AttachmentEntityType, 
  AttachmentType,
  type AttachmentContent,
  type AttachmentAssociation 
};

// Mock database for development
let mockAttachments: Record<string, AttachmentContent> = {};
let mockAttachmentAssociations: AttachmentAssociation[] = [];

// Initialize with empty data if not already set
if (Object.keys(mockAttachments).length === 0) {
  mockAttachments = {};
  mockAttachmentAssociations = [];
}

export interface UseAttachmentsOptions {
  entityType: AttachmentEntityType;
  entityId: string;
  enabled?: boolean;
}

// Attachment response with data source tracking
export interface AttachmentsResponse {
  attachments: AttachmentContent[];
  source: 'api' | 'cache' | 'mock';
}

/**
 * Hook to fetch attachments for a specific entity using hybrid caching approach
 */
export function useAttachments(options: UseAttachmentsOptions) {
  const { entityType, entityId, enabled = true } = options;
  const cacheKey = `attachments-${entityType}-${entityId}`;
  const [cachedData, setCachedData] = useLocalStorage<AttachmentContent[]>(cacheKey, []);
  
  return useQuery({
    queryKey: ['attachments', entityType, entityId],
    queryFn: async (): Promise<AttachmentsResponse> => {
      // STEP 1: Try to fetch from API first
      try {
        const response = await fetch(`/api/attachments?entityType=${entityType}&entityId=${entityId}`);
        
        // If we get a successful response, cache it and return
        if (response.ok) {
          const apiData = await response.json();
          setCachedData(apiData);
          return {
            attachments: apiData,
            source: 'api'
          };
        }
        
        // If we're here, the API call failed
        console.warn(`API call failed for attachments (${entityType}, ${entityId}). Falling back to cache.`);
        
        // STEP 2: Fall back to cached data if available
        if (cachedData && cachedData.length > 0) {
          return {
            attachments: cachedData,
            source: 'cache'
          };
        }
        
        // STEP 3: Fall back to mock data in development environment
        if (isDevelopment()) {
          const mockData = getAttachmentsForEntity(
            entityType, 
            entityId, 
            mockAttachmentAssociations, 
            mockAttachments
          );
          
          return {
            attachments: mockData,
            source: 'mock'
          };
        }
        
        // If nothing worked, return empty array
        return {
          attachments: [],
          source: 'api' // Empty from API
        };
      } catch (error) {
        console.error('Error fetching attachments:', error);
        
        // STEP 2: Fall back to cached data if available
        if (cachedData && cachedData.length > 0) {
          return {
            attachments: cachedData,
            source: 'cache'
          };
        }
        
        // STEP 3: Fall back to mock data in development environment
        if (isDevelopment()) {
          const mockData = getAttachmentsForEntity(
            entityType, 
            entityId, 
            mockAttachmentAssociations, 
            mockAttachments
          );
          
          return {
            attachments: mockData,
            source: 'mock'
          };
        }
        
        // If nothing worked, return empty array
        throw error;
      }
    },
    enabled: !!entityId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to add a file attachment to an entity
 */
export function useAddFileAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId, 
      file 
    }: { 
      entityType: AttachmentEntityType; 
      entityId: string; 
      file: { 
        name: string; 
        type: string; 
        size: number; 
        url: string;
        description?: string;
      } 
    }) => {
      try {
        // Try to call the API first
        const response = await fetch(`/api/attachments/file`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ entityType, entityId, file })
        });
        
        if (response.ok) {
          return await response.json();
        }
        
        // If API fails and we're in development, fall back to mock data
        if (isDevelopment()) {
          console.warn('API call failed, using mock data for file attachment');
          
          // Create a new attachment id
          const attachmentId = createAttachmentId(false);
          
          // Create the file attachment
          const fileAttachment: AttachmentContent = {
            id: attachmentId,
            type: AttachmentType.FILE,
            name: file.name,
            fileType: file.type,
            size: file.size,
            url: file.url,
            description: file.description,
            createdAt: new Date().toISOString(),
          };
          
          // Create an association
          const association = createAttachmentAssociation(
            attachmentId,
            entityType,
            entityId
          );
          
          // Add to mock data
          mockAttachments[attachmentId] = fileAttachment;
          mockAttachmentAssociations.push(association);
          
          return fileAttachment;
        }
        
        throw new Error('Failed to add file attachment');
      } catch (error) {
        console.error('Error adding file attachment:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['attachments', variables.entityType, variables.entityId] 
      });
    },
  });
}

/**
 * Hook to add a link attachment to an entity
 */
export function useAddLinkAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId, 
      link 
    }: { 
      entityType: AttachmentEntityType;
      entityId: string;
      link: {
        name: string;
        url: string;
        linkType: 'youtube' | 'article' | 'other';
        thumbnailUrl?: string;
        description?: string;
      }
    }) => {
      try {
        // Try to call the API first
        const response = await fetch(`/api/attachments/link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ entityType, entityId, link })
        });
        
        if (response.ok) {
          return await response.json();
        }
        
        // If API fails and we're in development, fall back to mock data
        if (isDevelopment()) {
          console.warn('API call failed, using mock data for link attachment');
          
          // Create a new attachment id
          const attachmentId = createAttachmentId(true);
          
          // Create the link attachment
          const linkAttachment: AttachmentContent = {
            id: attachmentId,
            type: AttachmentType.LINK,
            name: link.name,
            url: link.url,
            linkType: link.linkType,
            thumbnailUrl: link.thumbnailUrl,
            description: link.description,
            createdAt: new Date().toISOString(),
          };
          
          // Create an association
          const association = createAttachmentAssociation(
            attachmentId,
            entityType,
            entityId
          );
          
          // Add to mock data
          mockAttachments[attachmentId] = linkAttachment;
          mockAttachmentAssociations.push(association);
          
          return linkAttachment;
        }
        
        throw new Error('Failed to add link attachment');
      } catch (error) {
        console.error('Error adding link attachment:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['attachments', variables.entityType, variables.entityId] 
      });
    },
  });
}

/**
 * Hook to delete an attachment
 */
export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      attachmentId,
      entityType,
      entityId 
    }: { 
      attachmentId: string;
      entityType: AttachmentEntityType;
      entityId: string;
    }) => {
      try {
        // Try to call the API first
        const response = await fetch(`/api/attachments/${attachmentId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ entityType, entityId })
        });
        
        if (response.ok) {
          return await response.json();
        }
        
        // If API fails and we're in development, fall back to mock data
        if (isDevelopment()) {
          console.warn('API call failed, using mock data for attachment deletion');
          
          // Find and remove the association
          const associationIndex = mockAttachmentAssociations.findIndex(
            assoc => assoc.attachmentId === attachmentId && 
                    assoc.entityType === entityType && 
                    assoc.entityId === entityId
          );
          
          if (associationIndex === -1) {
            throw new Error('Attachment association not found');
          }
          
          mockAttachmentAssociations.splice(associationIndex, 1);
          
          // Check if this attachment is used by any other entities
          const hasOtherAssociations = mockAttachmentAssociations.some(
            assoc => assoc.attachmentId === attachmentId
          );
          
          // If not used elsewhere, remove the attachment itself
          if (!hasOtherAssociations) {
            delete mockAttachments[attachmentId];
          }
          
          return { attachmentId, entityType, entityId };
        }
        
        throw new Error('Failed to delete attachment');
      } catch (error) {
        console.error('Error deleting attachment:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['attachments', result.entityType, result.entityId] 
      });
    },
  });
} 