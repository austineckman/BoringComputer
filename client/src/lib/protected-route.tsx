import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  path: string;
  children: React.ReactNode;
};

export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

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