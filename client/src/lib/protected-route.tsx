import { ReactNode } from "react";
import { Redirect, Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      ) : user ? (
        <Component />
      ) : (
        <Redirect to="/auth" />
      )}
    </Route>
  );
}

export function AdminRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const isAdmin = user?.roles?.includes("admin");

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      ) : isAdmin ? (
        <Component />
      ) : (
        <Redirect to={user ? "/" : "/auth"} />
      )}
    </Route>
  );
}