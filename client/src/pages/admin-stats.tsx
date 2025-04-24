import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

import {
  User,
  Package,
  BookOpen,
  Archive,
  Users,
  Award,
  Layers,
  Box,
  BarChart2,
  Database,
  Activity,
  Settings,
  RefreshCw,
  Clock
} from 'lucide-react';

import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Type definition for stats data
interface AdminStats {
  userCount: number;
  itemCount: number;
  recipeCount: number;
  questCount: number;
  dbStats: {
    tableCount: number;
    dbSizeMB: number;
    rowCounts: {
      users: number;
      items: number;
      quests: number;
      recipes: number;
    };
  };
  projectStats: {
    linesOfCode: {
      total: number;
      client: number;
      server: number;
      shared: number;
    };
    filesByType: {
      typescript: number;
      reactComponents: number;
      css: number;
      total: number;
    };
    projectSizeMB: number;
    dependencies: {
      production: number;
      development: number;
      total: number;
    };
  };
}

export default function AdminStatsPage() {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch stats data from API
  const { data: stats, isLoading, error, refetch } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    retry: 1,
  });
  
  // Function to refresh stats
  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdated(new Date());
      toast({
        title: "Statistics Updated",
        description: "Dashboard data has been refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not refresh statistics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Prepare data for charts
  const prepareContentTypeData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Users', value: stats.userCount || 0, color: COLORS[0] },
      { name: 'Items', value: stats.itemCount || 0, color: COLORS[1] },
      { name: 'Recipes', value: stats.recipeCount || 0, color: COLORS[2] },
      { name: 'Quests', value: stats.questCount || 0, color: COLORS[3] }
    ];
  };

  // Set default values for stats that might be undefined
  const projectStats = stats?.projectStats || {
    linesOfCode: { total: 0, client: 0, server: 0, shared: 0 },
    filesByType: { typescript: 0, reactComponents: 0, css: 0, total: 0 },
    projectSizeMB: 0,
    dependencies: { production: 0, development: 0, total: 0 }
  };
  
  const dbStats = stats?.dbStats || {
    tableCount: 0,
    dbSizeMB: 0,
    rowCounts: { users: 0, items: 0, quests: 0, recipes: 0 }
  };

  const contentTypeData = prepareContentTypeData();

  // Create example activity data for demonstration (will be replaced with real data)
  const activityData = [
    { name: 'Day 1', users: 4, quests: 2 },
    { name: 'Day 2', users: 5, quests: 3 },
    { name: 'Day 3', users: 6, quests: 4 },
    { name: 'Day 4', users: 7, quests: 6 },
    { name: 'Day 5', users: 8, quests: 8 },
    { name: 'Day 6', users: 9, quests: 9 },
    { name: 'Day 7', users: 10, quests: 10 },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard Statistics</h1>
              <p className="text-muted-foreground mt-2">
                Overview of key metrics and analytics
              </p>
            </div>
            
            <div className="flex flex-col items-end">
              <Skeleton className="h-10 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle>
                    <Skeleton className="h-6 w-24" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-12" />
                  <Skeleton className="h-8 w-16 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-destructive/20 border border-destructive text-destructive p-4 rounded-md">
          <p className="font-semibold">Error loading stats</p>
          <p>{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded-md">
          <p className="font-semibold">No stats data available</p>
          <p>Could not fetch statistics for the admin dashboard.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Statistics</h1>
            <p className="text-muted-foreground mt-2">
              Overview of key metrics and analytics for The Quest Giver platform
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <Button 
              onClick={refreshStats} 
              disabled={isRefreshing} 
              className="mb-2"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Stats
                </>
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last updated: {lastUpdated.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Users" 
            value={stats.userCount} 
            icon={<Users className="h-8 w-8 text-blue-500" />} 
            description="Registered users"
          />
          
          <StatCard 
            title="Items" 
            value={stats.itemCount} 
            icon={<Package className="h-8 w-8 text-green-500" />} 
            description="Available items" 
          />
          
          <StatCard 
            title="Crafting Recipes" 
            value={stats.recipeCount} 
            icon={<Layers className="h-8 w-8 text-amber-500" />} 
            description="Available recipes" 
          />
          
          <StatCard 
            title="Quests" 
            value={stats.questCount} 
            icon={<BookOpen className="h-8 w-8 text-purple-500" />} 
            description="Available quests" 
          />
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 md:w-[400px] mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Stats</TabsTrigger>
            <TabsTrigger value="content">Content Stats</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Distribution Chart */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    <span>Content Distribution</span>
                  </CardTitle>
                  <CardDescription>
                    Breakdown of content types in the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={contentTypeData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                        <Legend />
                        <Bar dataKey="value" name="Count">
                          {contentTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Content Type Distribution (Pie Chart) */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    <span>Content Type Ratio</span>
                  </CardTitle>
                  <CardDescription>
                    Proportion of different content types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contentTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {contentTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <span>Platform Activity (Last 7 Days)</span>
                </CardTitle>
                <CardDescription>
                  Recent user activity and quest completions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={activityData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" name="Active Users" />
                      <Line type="monotone" dataKey="quests" stroke="#82ca9d" name="Quest Completions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>User Statistics</span>
                </CardTitle>
                <CardDescription>
                  Detailed user metrics will be displayed here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-center text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">User analytics coming soon</h3>
                  <p>
                    We're working on gathering more detailed user statistics such as 
                    engagement metrics, activity patterns, and growth trends.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  <span>Content Metrics</span>
                </CardTitle>
                <CardDescription>
                  Detailed content metrics will be displayed here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-center text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Content analytics coming soon</h3>
                  <p>
                    We're working on gathering more detailed content statistics such as 
                    popularity, completion rates, and content creation trends.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Project Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <span>Project Statistics</span>
            </CardTitle>
            <CardDescription>
              Detailed metrics about the codebase and development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lines of Code Stats */}
              <div>
                <h3 className="text-lg font-medium mb-3">Lines of Code</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">{projectStats.linesOfCode.total.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded">
                    <div 
                      className="h-2 bg-blue-500 rounded" 
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Client</span>
                    <span className="font-bold">{projectStats.linesOfCode.client.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded">
                    <div 
                      className="h-2 bg-green-500 rounded" 
                      style={{ 
                        width: `${(projectStats.linesOfCode.client / projectStats.linesOfCode.total) * 100}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Server</span>
                    <span className="font-bold">{projectStats.linesOfCode.server.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded">
                    <div 
                      className="h-2 bg-amber-500 rounded" 
                      style={{ 
                        width: `${(projectStats.linesOfCode.server / projectStats.linesOfCode.total) * 100}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Shared</span>
                    <span className="font-bold">{projectStats.linesOfCode.shared.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded">
                    <div 
                      className="h-2 bg-purple-500 rounded" 
                      style={{ 
                        width: `${(projectStats.linesOfCode.shared / projectStats.linesOfCode.total) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* File Type Stats */}
              <div>
                <h3 className="text-lg font-medium mb-3">Files by Type</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{projectStats.filesByType.typescript}</div>
                      <div className="text-xs text-muted-foreground">TypeScript Files</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{projectStats.filesByType.reactComponents}</div>
                      <div className="text-xs text-muted-foreground">React Components</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{projectStats.filesByType.css}</div>
                      <div className="text-xs text-muted-foreground">CSS Files</div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{projectStats.filesByType.total}</div>
                      <div className="text-xs text-muted-foreground">Total Files</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Project Size</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Total Size</span>
                        <span className="text-xs font-medium">{projectStats.projectSizeMB.toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dependencies Stats */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Dependencies</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{projectStats.dependencies.production}</div>
                  <div className="text-xs text-muted-foreground">Production Dependencies</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{projectStats.dependencies.development}</div>
                  <div className="text-xs text-muted-foreground">Development Dependencies</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold">{projectStats.dependencies.total}</div>
                  <div className="text-xs text-muted-foreground">Total Dependencies</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <span>Database Statistics</span>
            </CardTitle>
            <CardDescription>
              Insights into the PostgreSQL database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{dbStats.tableCount}</div>
                <div className="text-xs text-muted-foreground">Database Tables</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{dbStats.dbSizeMB.toFixed(2)} MB</div>
                <div className="text-xs text-muted-foreground">Database Size</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">
                  {(dbStats.rowCounts.users +
                    dbStats.rowCounts.items +
                    dbStats.rowCounts.quests +
                    dbStats.rowCounts.recipes).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Rows</div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-3">Table Row Counts</h3>
            <div className="space-y-2">
              {/* Users Table Rows */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Users</span>
                <span className="font-bold">{dbStats.rowCounts.users}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded">
                <div 
                  className="h-2 bg-blue-500 rounded" 
                  style={{ 
                    width: '100%' 
                  }}
                ></div>
              </div>
              
              {/* Items Table Rows */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Items</span>
                <span className="font-bold">{dbStats.rowCounts.items}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded">
                <div 
                  className="h-2 bg-green-500 rounded" 
                  style={{ 
                    width: `${(dbStats.rowCounts.items / dbStats.rowCounts.users) * 100}%` 
                  }}
                ></div>
              </div>
              
              {/* Quests Table Rows */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Quests</span>
                <span className="font-bold">{dbStats.rowCounts.quests}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded">
                <div 
                  className="h-2 bg-amber-500 rounded" 
                  style={{ 
                    width: `${(dbStats.rowCounts.quests / dbStats.rowCounts.users) * 100}%` 
                  }}
                ></div>
              </div>
              
              {/* Recipes Table Rows */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Recipes</span>
                <span className="font-bold">{dbStats.rowCounts.recipes}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded">
                <div 
                  className="h-2 bg-purple-500 rounded" 
                  style={{ 
                    width: `${(dbStats.rowCounts.recipes / dbStats.rowCounts.users) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Environment</p>
                <p className="text-lg font-bold">{process.env.NODE_ENV || 'development'}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Version</p>
                <p className="text-lg font-bold">1.0.0</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                <p className="text-lg font-bold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

// Reusable stat card component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          {icon}
          <div className="text-right">
            <div className="text-3xl font-bold">{value.toLocaleString()}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}