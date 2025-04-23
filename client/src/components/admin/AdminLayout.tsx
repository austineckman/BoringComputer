import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HomeIcon, 
  Settings, 
  Users, 
  Package,
  Award, 
  Calendar, 
  FileText,
  Database, 
  Box, 
  Gift, 
  PanelLeft, 
  UploadCloud,
  Hammer,
  AlertCircle
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  
  // Check if the user is an admin
  const { data: authData, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });
  
  const isAdmin = authData && authData.roles?.includes('admin');
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-4">You don't have admin privileges</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  // Admin navigation items
  const navItems = [
    { 
      label: 'Dashboard', 
      href: '/admin', 
      icon: <HomeIcon className="h-4 w-4 mr-2" />
    },
    { 
      label: 'Users', 
      href: '/admin/users', 
      icon: <Users className="h-4 w-4 mr-2" /> 
    },
    { 
      label: 'Items', 
      href: '/admin-basic', 
      icon: <Package className="h-4 w-4 mr-2" /> 
    },
    { 
      label: 'Recipes', 
      href: '/admin-recipes', 
      icon: <Hammer className="h-4 w-4 mr-2" /> 
    },
    { 
      label: 'Quests', 
      href: '/admin/quests', 
      icon: <FileText className="h-4 w-4 mr-2" /> 
    },
    { 
      label: 'Calendar', 
      href: '/admin/calendar', 
      icon: <Calendar className="h-4 w-4 mr-2" /> 
    },
    { 
      label: 'Achievements', 
      href: '/admin/achievements', 
      icon: <Award className="h-4 w-4 mr-2" /> 
    },
    { 
      label: 'Loot Boxes', 
      href: '/admin/loot-boxes', 
      icon: <Gift className="h-4 w-4 mr-2" /> 
    },
    { 
      label: 'Craftables', 
      href: '/admin/craftables', 
      icon: <Box className="h-4 w-4 mr-2" /> 
    },
    { 
      label: 'Media Library', 
      href: '/admin/media', 
      icon: <UploadCloud className="h-4 w-4 mr-2" /> 
    },
    { 
      label: 'Data Explorer', 
      href: '/admin/data', 
      icon: <Database className="h-4 w-4 mr-2" /> 
    },
    { 
      label: 'Settings', 
      href: '/admin/settings', 
      icon: <Settings className="h-4 w-4 mr-2" /> 
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-card border-r">
        <div className="flex h-16 items-center px-4 border-b">
          <Link href="/admin">
            <h2 className="text-lg font-bold flex items-center">
              <PanelLeft className="h-5 w-5 mr-2" />
              Admin Panel
            </h2>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent cursor-pointer",
                    location === item.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="ml-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="w-full">
                  Exit Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b bg-card fixed top-0 left-0 right-0 z-30">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        {/* Mobile menu button would go here */}
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <main className="flex-1 pt-16 md:pt-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;