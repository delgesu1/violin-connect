import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

// Check if in development mode
const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

// A simple mock UserButton for development mode
const DevUserButton = ({ afterSignOutUrl }: { afterSignOutUrl: string }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-full bg-primary text-primary-foreground"
      onClick={() => console.log(`Would navigate to ${afterSignOutUrl} after sign out`)}
    >
      <span>U</span>
    </Button>
  );
};

const AppLayout: React.FC = () => {
  // Use appropriate UserButton based on mode
  const UserButtonComponent = isDevelopmentMode ? DevUserButton : UserButton;

  return (
    <div className="min-h-screen h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 pl-0 md:pl-8 overflow-y-auto h-screen w-full">
        <header className="flex justify-between items-center p-4 border-b">
          <h1 className="text-xl font-bold">Violin Connect</h1>
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User size={16} />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
            <UserButtonComponent afterSignOutUrl="/sign-in" />
          </div>
        </header>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 pt-10 md:pt-6 pl-14 sm:pl-14 md:pl-3">
          <Outlet />
        </div>
      </main>
      <Toaster />
      <Sonner />
    </div>
  );
};

export default AppLayout;
