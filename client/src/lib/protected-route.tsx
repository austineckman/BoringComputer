import React from 'react';
import { Route, Redirect, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  path: string;
  children: React.ReactNode;
};

export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  // Query to get the current user
  const { 
    data: user, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <Route path={path}>
      {(params) => {
        if (loading) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
            </div>
          );
        }

        return user ? children : <Redirect to="/auth" />;
      }}
    </Route>
  );
}

type WrappedComponentProps = {
  component: React.ComponentType;
  path: string;
};

export function ProtectedComponent({ component: Component, path }: WrappedComponentProps) {
  return (
    <ProtectedRoute path={path}>
      <Component />
    </ProtectedRoute>
  );
}