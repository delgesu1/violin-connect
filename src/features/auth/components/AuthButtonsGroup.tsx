import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { LogIn, LogOut, UserPlus } from 'lucide-react';

export interface AuthButtonsGroupProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showLabels?: boolean;
  className?: string;
  afterSignOutUrl?: string;
}

const AuthButtonsGroup = ({
  variant = 'default',
  size = 'default',
  showLabels = true,
  className = '',
  afterSignOutUrl = '/'
}: AuthButtonsGroupProps) => {
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut(() => {
      navigate(afterSignOutUrl);
    });
  };

  if (isSignedIn) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleSignOut}
      >
        <LogOut className={`h-4 w-4 ${showLabels ? 'mr-2' : ''}`} />
        {showLabels && 'Sign Out'}
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={variant}
        size={size}
        className={className}
        asChild
      >
        <Link to="/sign-in">
          <LogIn className={`h-4 w-4 ${showLabels ? 'mr-2' : ''}`} />
          {showLabels && 'Sign In'}
        </Link>
      </Button>

      <Button
        variant={variant === 'default' ? 'outline' : 'default'}
        size={size}
        className={className}
        asChild
      >
        <Link to="/sign-up">
          <UserPlus className={`h-4 w-4 ${showLabels ? 'mr-2' : ''}`} />
          {showLabels && 'Sign Up'}
        </Link>
      </Button>
    </div>
  );
};

export default AuthButtonsGroup; 