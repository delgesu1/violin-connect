
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
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl mx-auto p-6 animate-appear">
          {children}
        </div>
      </main>
      <Toaster />
      <Sonner />
    </div>
  );
};

export default AppLayout;
