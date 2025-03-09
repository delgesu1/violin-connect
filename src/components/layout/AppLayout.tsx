import React from 'react';
import Sidebar from './Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="max-w-7xl mx-auto p-4 lg:p-6 animate-appear">
          {children}
        </div>
        
        {/* Subtle gradient at top of content */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background/80 to-transparent pointer-events-none z-10"></div>
      </main>
      <Toaster />
      <Sonner />
    </div>
  );
};

export default AppLayout;
