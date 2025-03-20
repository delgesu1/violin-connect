import { useState } from 'react';
import { useInvitations, useDeleteInvitation, useResendInvitation } from '@/hooks/useInvitations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Mail, Trash2, Clock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export function InvitationsList() {
  const { data: invitations, isLoading, isError } = useInvitations();
  const deleteInvitation = useDeleteInvitation();
  const resendInvitation = useResendInvitation();
  const { toast } = useToast();
  const [invitationToDelete, setInvitationToDelete] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<string | null>(null);
  
  const handleDeleteInvitation = async () => {
    if (!invitationToDelete) return;
    
    try {
      await deleteInvitation.mutateAsync(invitationToDelete);
      toast({
        title: 'Invitation deleted',
        description: 'The invitation has been successfully deleted.',
      });
      setInvitationToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was a problem deleting the invitation.',
        variant: 'destructive',
      });
      console.error('Error deleting invitation:', error);
    }
  };
  
  const handleResendInvitation = async (invitationId: string) => {
    setIsResending(invitationId);
    
    try {
      await resendInvitation.mutateAsync(invitationId);
      toast({
        title: 'Invitation resent',
        description: 'A reminder email has been sent to the student.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was a problem resending the invitation.',
        variant: 'destructive',
      });
      console.error('Error resending invitation:', error);
    } finally {
      setIsResending(null);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading invitations...</div>;
  }
  
  if (isError) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-center">
        <p className="text-destructive">Error loading invitations. Please try again.</p>
      </div>
    );
  }
  
  if (!invitations || invitations.length === 0) {
    return (
      <EmptyState
        title="No invitations sent"
        description="You haven't sent any invitations yet."
        icon={<Mail className="h-6 w-6" />}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Sent Invitations</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {invitations.map((invitation) => (
          <Card key={invitation.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">
                  {(invitation.metadata as { student_name?: string })?.student_name || 'Student'}
                </CardTitle>
                <StatusBadge status={invitation.status} />
              </div>
              <CardDescription className="truncate">{invitation.email}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              {/* Resend button - only show for pending invitations */}
              {invitation.status === 'pending' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleResendInvitation(invitation.id)}
                  disabled={isResending === invitation.id}
                >
                  {isResending === invitation.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend
                    </>
                  )}
                </Button>
              )}
              
              {/* Delete button */}
              <AlertDialog open={invitationToDelete === invitation.id} onOpenChange={(open) => {
                if (!open) setInvitationToDelete(null);
              }}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setInvitationToDelete(invitation.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this invitation? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteInvitation}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
    case 'accepted':
      return <Badge variant="outline" className="text-green-500 border-green-500">Accepted</Badge>;
    case 'expired':
      return <Badge variant="outline" className="text-destructive border-destructive">Expired</Badge>;
    default:
      return null;
  }
} 