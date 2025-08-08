import { ReactNode } from "react";
import { Redirect, Route } from "wouter";
import { useSimpleAuth as useAuth } from "@/hooks/use-simple-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const isGuest = user?.isGuest || false;

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      ) : (user || isGuest) ? (
        <Component />
      ) : (
        <Redirect to="/auth" />
      )}
    </Route>
  );
}

export function AdminRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const isGuest = user?.isGuest || false;
  const isAdmin = user?.roles?.includes("admin" as any) && !isGuest;

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      ) : isAdmin ? (
        <Component />
      ) : (
        <Redirect to={user || isGuest ? "/" : "/auth"} />
      )}
    </Route>
  );
}