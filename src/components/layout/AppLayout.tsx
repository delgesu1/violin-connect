import React from 'react';
import Sidebar from './Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 pl-0 lg:pl-16 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto p-6 pt-10 lg:pt-6">
          {children}
        </div>
      </main>
      <Toaster />
      <Sonner />
    </div>
  );
};

export default AppLayout;
