import React from 'react';
import { Link } from 'wouter';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Hammer,
  ScrollText,
  Users,
  BarChart2,
  Trophy,
  Settings,
  ArrowRight,
  Grid,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const AdminDashboard: React.FC = () => {
  // Get stats for the dashboard
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/stats', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching stats: ${response.status}`);
        }
        
        const data = await response.json();
        return data || { 
          userCount: 0, 
          itemCount: 0, 
          recipeCount: 0, 
          questCount: 0 
        };
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        return { 
          userCount: 0, 
          itemCount: 0, 
          recipeCount: 0, 
          questCount: 0 
        };
      }
    },
    staleTime: 60000 // Cache for 1 minute
  });

  // Admin sections
  const adminSections = [
    {
      title: 'Item Management',
      description: 'Create, edit, and manage game items and resources',
      icon: <Package className="h-12 w-12 text-primary" />,
      link: '/admin-items',
      stats: `${stats?.itemCount || 0} items`,
    },
    {
      title: 'Recipe Management',
      description: 'Design and manage crafting recipes for users',
      icon: <Hammer className="h-12 w-12 text-primary" />,
      link: '/admin-recipes',
      stats: `${stats?.recipeCount || 0} recipes`,
    },
    {
      title: 'Quest Management',
      description: 'Create and publish quests and adventures',
      icon: <ScrollText className="h-12 w-12 text-primary" />,
      link: '/admin-quests',
      stats: `${stats?.questCount || 0} quests`,
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and roles',
      icon: <Users className="h-12 w-12 text-primary" />,
      link: '/admin-users',
      stats: `${stats?.userCount || 0} users`,
    },
    {
      title: 'Statistics',
      description: 'View game analytics and metrics',
      icon: <BarChart2 className="h-12 w-12 text-primary" />,
      link: '/admin-stats',
      stats: 'Analytics',
    },
    {
      title: 'Achievements',
      description: 'Create and manage achievement badges',
      icon: <Trophy className="h-12 w-12 text-primary" />,
      link: '/admin-achievements',
      stats: 'Coming soon',
    },
    {
      title: 'Component Kits',
      description: 'Manage educational kits and their components',
      icon: <Grid className="h-12 w-12 text-primary" />,
      link: '/admin-kits',
      stats: 'Educational Resources',
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Quest Giver admin panel. Manage your game content from here.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => (
            <Card key={section.title} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  {section.icon}
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {section.stats}
                  </div>
                </div>
                <CardTitle className="mt-4 text-xl">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={section.link}>
                  <Button className="w-full">
                    Access {section.title.split(' ')[0]}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <Card>
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Configure Game Settings</CardTitle>
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <p className="text-sm text-muted-foreground">
                  Update global game settings, difficulty levels, and reward rates.
                </p>
                <Link href="/admin-settings">
                  <Button variant="outline" className="mt-4 w-full">
                    Open Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;