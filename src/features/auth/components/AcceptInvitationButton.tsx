import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Icons } from '@/components/ui/icons';

export interface AcceptInvitationButtonProps {
  isAccepted: boolean;
  isAccepting: boolean;
  isExpired: boolean;
  onClick: () => void;
  className?: string;
}

const AcceptInvitationButton = ({
  isAccepted,
  isAccepting,
  isExpired,
  onClick,
  className = 'w-full'
}: AcceptInvitationButtonProps) => {
  return (
    <Button 
      className={className}
      onClick={onClick}
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
  );
};

export default AcceptInvitationButton; 