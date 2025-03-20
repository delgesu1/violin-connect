import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, Clock, Mail, UserPlus, AlertCircle } from 'lucide-react';

export interface InvitationDetailsProps {
  email: string;
  teacherName?: string;
  expiresAt: string;
  status?: 'pending' | 'accepted' | 'expired';
  studentName?: string;
}

const InvitationDetails = ({
  email,
  teacherName = 'Your teacher',
  expiresAt,
  status = 'pending',
  studentName
}: InvitationDetailsProps) => {
  // Check if invitation is expired
  const isExpired = status === 'expired' || new Date(expiresAt) < new Date();
  
  // Check if invitation is already accepted
  const isAccepted = status === 'accepted';
  
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Invited to: {email}</span>
          </div>
          
          <div className="flex items-center">
            <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Invited by: {teacherName}
            </span>
          </div>
          
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Expires: {new Date(expiresAt).toLocaleDateString()}
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
    </div>
  );
};

export default InvitationDetails; 