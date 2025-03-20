import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useInvitationByToken, useAcceptInvitation, Invitation } from '@/hooks/useInvitations';
import { useAuth, SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/ui/icons';
import { Check, Clock, Mail, UserPlus, AlertCircle, XCircle } from 'lucide-react';

// Define a comprehensive type for the invitation with teacher info
type InvitationWithTeacher = Invitation & {
  student_name?: string;
  teacher?: {
    name: string;
    email: string;
  };
};

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId, isSignedIn, isLoaded } = useAuth();
  const { openSignUp } = useClerk();
  const [isAccepting, setIsAccepting] = useState(false);
  
  // Fetch invitation details
  const { 
    data: invitation, 
    isLoading, 
    isError, 
    error 
  } = useInvitationByToken(token || '');
  
  // Get the accept invitation mutation
  const acceptInvitation = useAcceptInvitation();
  
  // Cast the invitation to the combined type
  const invitationWithDetails = invitation as InvitationWithTeacher | null;
  
  // Check if invitation is expired
  const isExpired = invitationWithDetails && new Date(invitationWithDetails.expires_at) < new Date();
  
  // Check if invitation is already accepted
  const isAccepted = invitationWithDetails && invitationWithDetails.status === 'accepted';
  
  // Handle accept invitation button click
  const handleAcceptInvitation = async () => {
    if (!token || !isSignedIn) return;
    
    setIsAccepting(true);
    
    try {
      await acceptInvitation.mutateAsync(token);
      
      toast({
        title: 'Invitation accepted',
        description: 'You have successfully joined as a student.',
        duration: 5000,
      });
      
      // Redirect to student dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept invitation',
        variant: 'destructive',
      });
    } finally {
      setIsAccepting(false);
    }
  };
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Loading Invitation</CardTitle>
            <CardDescription>Please wait while we retrieve your invitation details...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin h-12 w-12 text-primary">
              <Icons.spinner className="h-12 w-12" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If error, show error state
  if (isError || !invitationWithDetails) {
    return (
      <div className="container mx-auto py-12">
        <Card className="mx-auto max-w-md border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : "We couldn't find this invitation. It may have been deleted or the link is incorrect."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-6">
            <Button asChild variant="outline">
              <Link to="/">Return Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Render invitation details
  return (
    <div className="container mx-auto py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center text-xl">You've Been Invited!</CardTitle>
          <CardDescription className="text-center">
            {invitationWithDetails.student_name 
              ? `${invitationWithDetails.student_name}, you've been invited to join Violin Connect`
              : "You've been invited to join Violin Connect"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Invited to: {invitationWithDetails.email}</span>
              </div>
              
              <div className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Invited by: {invitationWithDetails.teacher?.name || 'Your teacher'}
                </span>
              </div>
              
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Expires: {new Date(invitationWithDetails.expires_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {isExpired && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Expired Invitation</AlertTitle>
              <AlertDescription>
                This invitation has expired. Please contact your teacher for a new invitation.
              </AlertDescription>
            </Alert>
          )}
          
          {isAccepted && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertTitle>Already Accepted</AlertTitle>
              <AlertDescription>
                You've already accepted this invitation. You can now access your dashboard.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <SignedIn>
            <Button 
              className="w-full" 
              onClick={handleAcceptInvitation}
              disabled={isExpired || isAccepted || isAccepting}
            >
              {isAccepting ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Accepting invitation...
                </>
              ) : isAccepted ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Already accepted
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Accept Invitation
                </>
              )}
            </Button>
            
            {isAccepted && (
              <Button variant="outline" className="w-full mt-2" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </SignedIn>
          
          <SignedOut>
            <Alert>
              <AlertTitle>Sign in required</AlertTitle>
              <AlertDescription>
                You need to sign in or create an account to accept this invitation.
              </AlertDescription>
            </Alert>
            
            <Button 
              className="w-full mt-4" 
              onClick={() => openSignUp({
                redirectUrl: window.location.href,
                initialValues: {
                  emailAddress: invitationWithDetails.email
                }
              })}
            >
              Create Account
            </Button>
          </SignedOut>
        </CardFooter>
      </Card>
    </div>
  );
} 