import { useAuth } from '@/hooks/use-auth';
import { Route, Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';

export function AdminRoute({ path, children }: { path: string, children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Check if user is authenticated and has admin role
  if (!user || !user.roles.includes('admin')) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      {children}
    </Route>
  );
}