import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 pl-0 md:pl-8 overflow-y-auto h-screen w-full">
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
