import React, { useState, useEffect } from 'react';
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
  Home,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { 
    name: 'Dashboard', 
    path: '/', 
    icon: Home,
  },
  { 
    name: 'Repertoire', 
    path: '/repertoire', 
    icon: Music,
  },
  { 
    name: 'Files', 
    path: '/files', 
    icon: FileText,
  },
  { 
    name: 'Messages', 
    path: '/messages', 
    icon: MessageSquare,
    badge: 3
  },
  { 
    name: 'Discussions', 
    path: '/discussions', 
    icon: MessageSquare,
  },
  { 
    name: 'Calendar', 
    path: '/calendar', 
    icon: Calendar,
  },
  { 
    name: 'Students', 
    path: '/students', 
    icon: Users,
  },
  { 
    name: 'Settings', 
    path: '/settings', 
    icon: Settings,
  },
];

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  
  // Handle mobile sidebar
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

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
          className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm shadow-sm border rounded-md h-9 w-9"
          onClick={toggleSidebar}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed md:relative h-screen bg-gray-900 text-gray-100 border-r border-gray-800 transition-all duration-300 z-40 flex flex-col",
          isOpen ? "translate-x-0 w-60" : "-translate-x-full md:translate-x-0 md:w-16",
        )}
      >
        {/* Logo and title */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
            <img src="/F-Hole-Logo.png" alt="Arco Connect Logo" className="h-8 w-8 object-contain" />
          </div>
          {isOpen && (
            <h1 className="text-lg font-medium text-white">Arco Connect</h1>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="mt-2 px-3 flex-1 overflow-y-auto">
          <ul className="space-y-2.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 py-2.5 px-3 rounded-md transition-colors relative",
                      isActive 
                        ? "bg-blue-600/20 text-blue-300 font-medium" 
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    )}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5" />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    
                    {isOpen && (
                      <span>{item.name}</span>
                    )}
                    
                    {isActive && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User profile at bottom */}
        <div className="p-5 border-t border-gray-800 mt-auto">
          <div className={cn(
            "flex items-center transition-all",
            isOpen ? "gap-3" : "justify-center"
          )}>
            <Avatar className="h-9 w-9 border-2 border-gray-800">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-blue-600 text-white">TC</AvatarFallback>
            </Avatar>
            
            {isOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Teacher Name</p>
                <p className="text-xs text-gray-400">Violin Instructor</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
