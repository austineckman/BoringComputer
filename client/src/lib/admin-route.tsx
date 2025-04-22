import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface AdminRouteProps {
  path: string;
  children: React.ReactNode;
}

export function AdminRoute({ path, children }: AdminRouteProps) {
  const { user, isLoading } = useAuth();

  // If still loading auth state, show loader
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
        </div>
      </Route>
    );
  }

  // Check if user exists and has admin role
  const isAdmin = user && Array.isArray(user.roles) && user.roles.includes('admin');

  return (
    <Route path={path}>
      {isAdmin ? children : <Redirect to="/" />}
    </Route>
  );
}