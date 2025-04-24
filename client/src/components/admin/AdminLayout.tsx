import React from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  BarChart2,
  Box,
  ChevronRight,
  Home,
  ListPlus,
  LogOut,
  Package,
  ScrollText,
  Settings,
  ShieldAlert,
  Users,
  Hammer,
  ArrowLeftCircle,
  Layout,
  Grid,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location] = useLocation();

  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching user: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return {};
      }
    },
  });

  // Check if user is admin
  const isAdmin = user?.roles?.includes('admin');

  // Navigation items
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: <Home className="h-5 w-5" /> },
    { name: 'Items', href: '/admin-items', icon: <Package className="h-5 w-5" /> },
    { name: 'Recipes', href: '/admin-recipes', icon: <Hammer className="h-5 w-5" /> },
    { name: 'Quests', href: '/admin-quests', icon: <ScrollText className="h-5 w-5" /> },
    { name: 'Loot Boxes', href: '/admin-lootboxes', icon: <ListPlus className="h-5 w-5" /> },
    { name: 'Component Kits', href: '/admin-kits', icon: <Grid className="h-5 w-5" /> },
    { name: 'Users', href: '/admin-users', icon: <Users className="h-5 w-5" /> },
    { name: 'Stats', href: '/admin-stats', icon: <BarChart2 className="h-5 w-5" /> },
    { name: 'Settings', href: '/admin-settings', icon: <Settings className="h-5 w-5" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-t-2 border-primary"></div>
          <p className="text-lg text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <ShieldAlert className="mb-4 h-16 w-16 text-destructive" />
        <h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
        <p className="mb-6 text-muted-foreground">
          You don't have permission to access the admin panel.
        </p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link href="/admin" className="mr-6 flex items-center">
            <Box className="mr-2 h-6 w-6" />
            <span className="text-lg font-bold">Quest Giver Admin</span>
          </Link>
          
          {/* Return to Game button */}
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span>Return to Game</span>
            </Button>
          </Link>
          
          <div className="ml-auto flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium">{user?.username}</span>
            </div>
            <Link href="/logout">
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card/50 pb-12">
          <div className="py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold">Admin Panel</h2>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={location === item.href ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                    >
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                      {location === item.href && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;