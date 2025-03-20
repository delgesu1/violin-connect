import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nanoid } from 'nanoid';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import type { Database } from '@/types/supabase';
import { clerkIdToUuid } from '@/lib/auth-utils';
import { TablesInsert } from '@/types/supabase';
import { useDevFallbackUser } from './useDevFallbackUser';

// Check if we're in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
// For development, use a consistent UUID that works with RLS policies
const DEV_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Custom hook that provides a fallback for useAuth in development mode
const useDevelopmentAuth = () => {
  // In development mode, return mock auth data
  if (isDevelopmentMode) {
    return { 
      userId: DEV_UUID, 
      isLoaded: true, 
      isSignedIn: true, 
      getToken: async () => "mock-token-for-development" 
    };
  }
  
  // In production, use the real Clerk useAuth
  return useAuth();
};

// Type definitions
export type Invitation = Database['public']['Tables']['invitations']['Row'];
export type NewInvitation = {
  email: string;
  student_name?: string;
};

/**
 * Hook for fetching all invitations sent by the current teacher
 */
export function useInvitations() {
  const { userId } = useDevelopmentAuth();
  
  return useQuery({
    queryKey: ['invitations', userId],
    queryFn: async () => {
      if (!userId && !isDevelopmentMode) {
        return [];
      }
      
      // In development mode, use the dev UUID directly
      const supabaseUserId = isDevelopmentMode ? DEV_UUID : await clerkIdToUuid(userId!);
      
      if (!supabaseUserId) {
        console.error('Could not convert Clerk ID to Supabase UUID');
        return [];
      }
      
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('teacher_id', supabaseUserId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching invitations:', error);
        return [];
      }
      
      return data as Invitation[];
    },
    enabled: !!userId || isDevelopmentMode,
  });
}

/**
 * Hook for fetching a specific invitation by token
 */
export function useInvitationByToken(token: string) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      if (!token) return null;
      
      // First get the invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single();
      
      if (invitationError || !invitation) {
        console.error('Error fetching invitation:', invitationError);
        return null;
      }
      
      // Then get the teacher info from students table since profiles doesn't have all the info we need
      const { data: teacher, error: teacherError } = await supabase
        .from('students')
        .select('name, email')
        .eq('user_id', invitation.teacher_id)
        .single();
      
      if (teacherError) {
        console.error('Error fetching teacher details:', teacherError);
        // Return invitation without teacher info if there's an error
        return invitation;
      }
      
      // Combine invitation with teacher info
      return {
        ...invitation,
        teacher: {
          name: teacher.name || 'Unknown Teacher',
          email: teacher.email || invitation.email
        }
      };
    },
    enabled: !!token,
  });
}

/**
 * Function to send an invitation email notification
 * This would normally use a backend email service - this is a placeholder
 */
async function sendInvitationEmail(invitation: Invitation): Promise<void> {
  // In a real app, this would send an actual email via your backend
  // For now, let's log that we would send the email
  console.log(`[EMAIL SERVICE] Would send invitation email to: ${invitation.email}`);
  console.log(`[EMAIL SERVICE] Invitation token: ${invitation.token}`);
  
  // The actual implementation would call an API endpoint that triggers an email
  // For example:
  // await fetch('/api/send-invitation-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     email: invitation.email,
  //     token: invitation.token,
  //     expiresAt: invitation.expires_at,
  //   }),
  // });
}

/**
 * Function to send a reminder email for a pending invitation
 * This would normally use a backend email service - this is a placeholder
 */
async function sendReminderEmail(invitation: Invitation): Promise<void> {
  console.log(`[EMAIL SERVICE] Would send reminder email to: ${invitation.email}`);
  console.log(`[EMAIL SERVICE] Invitation token: ${invitation.token}`);
  console.log(`[EMAIL SERVICE] Expires at: ${invitation.expires_at}`);
}

/**
 * Hook for creating a new invitation
 */
export function useCreateInvitation() {
  const queryClient = useQueryClient();
  const { userId } = useDevelopmentAuth();
  
  return useMutation({
    mutationFn: async (data: NewInvitation): Promise<Invitation> => {
      if (!userId && !isDevelopmentMode) {
        throw new Error('User not authenticated');
      }
      
      // In development mode, use the dev UUID directly
      const supabaseUserId = isDevelopmentMode ? DEV_UUID : await clerkIdToUuid(userId!);
      
      if (!supabaseUserId) {
        throw new Error('Could not convert Clerk ID to Supabase UUID');
      }
      
      // Generate token and expiration date
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire in 7 days
      
      const newInvitation: TablesInsert<'invitations'> = {
        email: data.email,
        teacher_id: supabaseUserId,
        token,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        student_name: data.student_name
      };
      
      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert(newInvitation)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating invitation:', error);
        throw error;
      }
      
      // Send email notification
      await sendInvitationEmail(invitation);
      
      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

/**
 * Hook for resending an invitation email
 */
export function useResendInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invitationId: string): Promise<Invitation> => {
      // Get the invitation
      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single();
      
      if (error || !invitation) {
        console.error('Error fetching invitation:', error);
        throw new Error('Invitation not found');
      }
      
      // Send a reminder email
      await sendReminderEmail(invitation);
      
      return invitation;
    },
    onSuccess: () => {
      // No need to invalidate since we're not changing data
    },
  });
}

/**
 * Hook for deleting an invitation
 */
export function useDeleteInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);
        
      if (error) {
        console.error('Error deleting invitation:', error);
        throw error;
      }
      
      return invitationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

/**
 * Hook for accepting an invitation
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  const { userId } = useDevelopmentAuth();
  const { user } = useDevFallbackUser();
  
  return useMutation({
    mutationFn: async (token: string) => {
      if (!userId && !isDevelopmentMode) {
        throw new Error('User not authenticated');
      }
      
      // In development mode, use the dev UUID directly
      const supabaseUserId = isDevelopmentMode ? DEV_UUID : await clerkIdToUuid(userId!);
      
      if (!supabaseUserId) {
        throw new Error('Could not convert Clerk ID to Supabase UUID');
      }
      
      // First check if invitation is valid
      const { data: invitation, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();
        
      if (fetchError || !invitation) {
        console.error('Error fetching invitation:', fetchError);
        throw new Error('Invitation not found or already used');
      }
      
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }
      
      // Instead of creating a student-teacher relationship, update the user's student record
      // First check if student record exists
      const { data: existingStudent, error: findError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', supabaseUserId)
        .single();
        
      if (findError && findError.code !== 'PGRST116') { // Not found error is okay
        console.error('Error checking for existing student:', findError);
        throw findError;
      }
      
      if (existingStudent) {
        // Student record already exists, just make sure it's linked to the teacher
        const { error: updateError } = await supabase
          .from('students')
          .update({ user_id: invitation.teacher_id })
          .eq('id', existingStudent.id);
          
        if (updateError) {
          console.error('Error updating student record:', updateError);
          throw updateError;
        }
      } else {
        // Create a new student record for this user
        const { error: createError } = await supabase
          .from('students')
          .insert({
            name: user?.fullName || 'New Student',
            email: user?.emailAddresses[0]?.emailAddress,
            user_id: invitation.teacher_id
          });
          
        if (createError) {
          console.error('Error creating student record:', createError);
          throw createError;
        }
      }
      
      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
} 