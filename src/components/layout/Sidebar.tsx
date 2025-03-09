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
  LogOut,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { 
    name: 'Dashboard', 
    path: '/', 
    icon: Home,
    description: 'View your overview'
  },
  { 
    name: 'Repertoire', 
    path: '/repertoire', 
    icon: Music,
    description: 'Manage your music'
  },
  { 
    name: 'Files', 
    path: '/files', 
    icon: FileText,
    description: 'Access documents'
  },
  { 
    name: 'Messages', 
    path: '/messages', 
    icon: MessageSquare,
    description: 'Chat with students',
    badge: 3
  },
  { 
    name: 'Discussions', 
    path: '/discussions', 
    icon: MessageSquare,
    description: 'Join conversations'
  },
  { 
    name: 'Calendar', 
    path: '/calendar', 
    icon: Calendar,
    description: 'Schedule lessons'
  },
  { 
    name: 'Students', 
    path: '/students', 
    icon: Users,
    description: 'Manage your students'
  },
];

// Bottom nav items
const bottomNavItems = [
  { 
    name: 'Help & Support', 
    path: '/help', 
    icon: HelpCircle,
    description: 'Get assistance'
  },
  { 
    name: 'Settings', 
    path: '/settings', 
    icon: Settings,
    description: 'Configure app'
  },
];

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Check for previously saved sidebar state
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsedState !== null) {
      setIsCollapsed(savedCollapsedState === 'true');
    }
  }, []);

  // Handle resize and collapse based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200 && !isMobile) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  const showSidebarText = !isCollapsed || isMobile;

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm shadow-sm"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      )}
      
      {/* Sidebar */}
      <AnimatePresence>
        <motion.div 
          className={cn(
            "bg-sidebar-background flex flex-col justify-between border-r border-sidebar-border/50 transition-all z-40",
            isCollapsed && !isMobile ? "w-[4.5rem]" : "w-64",
            isOpen ? "translate-x-0" : "-translate-x-full",
            isMobile ? "fixed h-full" : "relative h-screen",
            "overflow-hidden shadow-md"
          )}
          initial={isMobile ? { x: -320 } : false}
          animate={isMobile ? { x: isOpen ? 0 : -320 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Collapse/expand button for desktop */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="absolute top-4 right-4 h-6 w-6 rounded-full bg-sidebar-accent/20 hover:bg-sidebar-accent/30 z-20"
            >
              <ChevronRight className={cn(
                "h-3.5 w-3.5 text-sidebar-foreground/70 transition-transform duration-200",
                isCollapsed ? "" : "rotate-180"
              )} />
            </Button>
          )}

          {/* Logo and title */}
          <div className={cn(
            "p-6 flex items-center gap-3 transition-all",
            isCollapsed && !isMobile ? "justify-center" : "px-6"
          )}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm shrink-0">
              <Music className="h-4 w-4 text-white" />
            </div>
            {showSidebarText && (
              <motion.h1 
                className="text-xl font-medium text-sidebar-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                Violin Connect
              </motion.h1>
            )}
          </div>
          
          {/* Navigation */}
          <div className="mt-1 overflow-y-auto flex-1 py-2">
            <TooltipProvider delayDuration={0}>
              <ul className={cn(
                "space-y-1.5",
                isCollapsed && !isMobile ? "px-2" : "px-3"
              )}>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.name}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-center gap-3 py-2 rounded-md transition-all relative group",
                              isCollapsed && !isMobile ? "px-2 justify-center" : "px-3",
                              isActive 
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                                : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
                            )}
                            onClick={() => isMobile && setIsOpen(false)}
                            onMouseEnter={() => setHoveredItem(item.name)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <div className="relative">
                              <Icon className={cn(
                                "transition-all",
                                isActive ? "h-5 w-5" : "h-4.5 w-4.5 opacity-70 group-hover:opacity-100"
                              )} />
                              
                              {item.badge && (
                                <Badge variant="destructive" className="absolute -top-1.5 -right-1.5 h-4 min-w-4 flex items-center justify-center p-0 text-[10px]">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            
                            {showSidebarText && (
                              <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1"
                              >
                                {item.name}
                              </motion.span>
                            )}

                            {/* Active indicator */}
                            {isActive && (
                              <motion.div 
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full"
                                layoutId="activeIndicator"
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30
                                }}
                              />
                            )}
                          </Link>
                        </TooltipTrigger>
                        {isCollapsed && !isMobile && (
                          <TooltipContent side="right" className="font-medium">
                            {item.name}
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </li>
                  );
                })}
              </ul>
            </TooltipProvider>
          </div>

          {/* Bottom nav items (help, settings) */}
          <div className="mt-auto">
            <TooltipProvider delayDuration={0}>
              <ul className={cn(
                "space-y-1.5",
                isCollapsed && !isMobile ? "px-2" : "px-3"
              )}>
                {bottomNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.name}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-center gap-3 py-2 rounded-md transition-all relative group",
                              isCollapsed && !isMobile ? "px-2 justify-center" : "px-3",
                              isActive 
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
                            )}
                            onClick={() => isMobile && setIsOpen(false)}
                          >
                            <Icon className={cn(
                              "transition-all",
                              isActive ? "h-5 w-5" : "h-4.5 w-4.5 opacity-70 group-hover:opacity-100"
                            )} />
                            
                            {showSidebarText && (
                              <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1"
                              >
                                {item.name}
                              </motion.span>
                            )}

                            {/* Active indicator */}
                            {isActive && (
                              <motion.div 
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full"
                                layoutId="activeIndicatorBottom"
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30
                                }}
                              />
                            )}
                          </Link>
                        </TooltipTrigger>
                        {isCollapsed && !isMobile && (
                          <TooltipContent side="right">
                            {item.name}
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </li>
                  );
                })}
              </ul>
            </TooltipProvider>
          </div>
          
          {/* User profile at bottom */}
          <div className={cn(
            "p-4 border-t border-sidebar-border/50",
            isCollapsed && !isMobile ? "justify-center" : ""
          )}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center transition-all cursor-pointer rounded-lg p-2 hover:bg-sidebar-accent/20",
                  isCollapsed && !isMobile ? "justify-center" : "gap-3"
                )}>
                  <Avatar className="h-9 w-9 ring-2 ring-sidebar-background shadow-md">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-blue-600 text-white">TC</AvatarFallback>
                  </Avatar>
                  
                  {showSidebarText && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1"
                    >
                      <p className="text-sm font-medium text-sidebar-foreground">Teacher Name</p>
                      <p className="text-xs text-sidebar-foreground/60">Violin Instructor</p>
                    </motion.div>
                  )}
                </div>
              </TooltipTrigger>
              {isCollapsed && !isMobile && (
                <TooltipContent side="right" className="p-2">
                  <div className="flex flex-col">
                    <span className="font-medium">Teacher Name</span>
                    <span className="text-xs text-muted-foreground">Violin Instructor</span>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
