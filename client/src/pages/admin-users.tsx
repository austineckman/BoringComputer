import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Shield, ShieldCheck, ShieldX, User, Package, Star, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
// Import admin layout component
import AdminLayout from '@/components/admin/AdminLayout';

// UI components from shadcn
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// User type for this specific view
interface UserData {
  id: number;
  username: string;
  roles: string[] | null;
  level: number;
  xp: number;
  totalItems: number;
  createdAt: string;
  lastLogin: string | null;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  
  // Fetch users data from the admin API endpoint
  const { data: users, isLoading, error, refetch } = useQuery<UserData[]>({
    queryKey: ['/api/admin/users'],
    retry: 1,
  });

  // Toggle admin access mutation
  const toggleAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/toggle-admin`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user role');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Role Updated',
        description: data.message,
        variant: 'default',
      });
      // Refresh the users list
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading users...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-destructive/20 border border-destructive text-destructive p-4 rounded-md">
          <p className="font-semibold">Error loading users</p>
          <p>{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
        </div>
      </AdminLayout>
    );
  }

  // Stats calculation
  const totalUsers = users?.length || 0;
  const adminCount = users?.filter(user => user.roles?.includes('admin')).length || 0;
  const totalItems = users?.reduce((sum, user) => sum + user.totalItems, 0) || 0;
  const avgLevel = users && users.length > 0
    ? (users.reduce((sum, user) => sum + user.level, 0) / users.length).toFixed(1)
    : '0';

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all users in the Quest Giver platform
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex flex-row items-center pt-6">
              <Users className="h-8 w-8 text-primary mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold">{totalUsers}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-row items-center pt-6">
              <Shield className="h-8 w-8 text-indigo-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin Users</p>
                <h3 className="text-2xl font-bold">{adminCount}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-row items-center pt-6">
              <Package className="h-8 w-8 text-amber-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <h3 className="text-2xl font-bold">{totalItems.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-row items-center pt-6">
              <Star className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Level</p>
                <h3 className="text-2xl font-bold">{avgLevel}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users table */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {totalUsers} user{totalUsers !== 1 ? 's' : ''} registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>List of all registered users</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">{user.id}</TableCell>
                    <TableCell className="font-semibold">{user.username}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles?.map((role) => (
                          <Badge 
                            key={role} 
                            variant={role === 'admin' ? 'destructive' : 'default'}
                            className="capitalize"
                          >
                            {role}
                          </Badge>
                        )) || 'None'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {user.level}
                      </div>
                    </TableCell>
                    <TableCell>{user.xp.toLocaleString()}</TableCell>
                    <TableCell>{user.totalItems.toLocaleString()}</TableCell>
                    <TableCell>
                      {user.createdAt ? format(new Date(user.createdAt), 'PP') : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {user.lastLogin 
                        ? format(new Date(user.lastLogin), 'PP') 
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {/* Don't show toggle button for own account */}
                      {user.username !== "admin" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAdminMutation.mutate(user.id)}
                          disabled={toggleAdminMutation.isPending}
                          className={`flex items-center gap-1 ${user.roles?.includes('admin') ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'}`}
                        >
                          {user.roles?.includes('admin') ? (
                            <>
                              <ShieldX className="h-4 w-4" />
                              <span>Revoke Admin</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4" />
                              <span>Grant Admin</span>
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!users || users.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center h-32 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}