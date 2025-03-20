import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@core/utils';
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
  Book,
  GraduationCap
} from 'lucide-react';
import { Button } from '@core/components/ui';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@core/components/ui';
import { useUserRoles } from '@/hooks/useUserRoles';

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const { isTeacher, isStudent } = useUserRoles();
  
  // Dynamic navigation items based on user role
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: Home,
      show: true  // Show to everyone
    },
    ...(isStudent ? [
      { 
        name: 'My Dashboard', 
        path: '/student-dashboard', 
        icon: GraduationCap,
        show: true
      }
    ] : []),
    { 
      name: 'Students', 
      path: '/students', 
      icon: Users,
      show: import.meta.env.DEV || isTeacher  // Always show in development mode
    },
    { 
      name: 'Calendar', 
      path: '/calendar', 
      icon: Calendar,
      show: true  // Show to everyone
    },
    { 
      name: 'Repertoire', 
      path: '/repertoire', 
      icon: Music,
      show: true  // Show to everyone
    },
    { 
      name: 'Messages', 
      path: '/messages', 
      icon: MessageSquare,
      badge: 3,
      show: true  // Show to everyone
    },
    { 
      name: 'Discussions', 
      path: '/discussions', 
      icon: MessageSquare,
      show: true  // Show to everyone
    },
    { 
      name: 'Journal', 
      path: '/journal', 
      icon: Book,
      show: true  // Show to everyone
    },
    { 
      name: 'Files', 
      path: '/files', 
      icon: FileText,
      show: true  // Show to everyone
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings,
      show: true  // Show to everyone
    },
  ];
  
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
            {navItems.filter(item => item.show).map((item) => {
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
        
        {/* Role Debug Info - only in development */}
        {isOpen && import.meta.env.DEV && (
          <div className="px-4 py-3 border-t border-gray-800 text-xs">
            <div className="text-gray-400 mb-1">Role Debug:</div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className={cn("w-3 h-3 rounded-full mr-2", isTeacher ? "bg-green-500" : "bg-red-500")}></span>
                <span>Teacher: {isTeacher ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center mt-1">
                <span className={cn("w-3 h-3 rounded-full mr-2", isStudent ? "bg-green-500" : "bg-red-500")}></span>
                <span>Student: {isStudent ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        )}
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
