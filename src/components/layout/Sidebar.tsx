import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Music, 
  FileText, 
  MessageSquare, 
  Calendar, 
  Users, 
  Settings, 
  Menu,
  X,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Repertoire', path: '/repertoire', icon: Music },
  { name: 'Files', path: '/files', icon: FileText },
  { name: 'Messages', path: '/messages', icon: MessageSquare },
  { name: 'Discussions', path: '/discussions', icon: MessageSquare },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Students', path: '/students', icon: Users },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-sidebar text-sidebar-foreground w-64 shrink-0 border-r border-sidebar-border transition-all duration-300 ease-in-out transform z-40",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isMobile && "fixed h-full"
        )}
      >
        {/* Logo and title */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Music className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Violin Connect</h1>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User profile at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Teacher Name</p>
              <p className="text-xs text-sidebar-foreground/70">Violin Instructor</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
