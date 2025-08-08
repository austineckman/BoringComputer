import { ReactNode } from "react";
import { Redirect, Route } from "wouter";
import { useSimpleAuth as useAuth } from "@/hooks/use-simple-auth";
import { MatrixLoading } from "@/components/ui/matrix-loading";

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
        <MatrixLoading message="Authenticating..." />
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
        <MatrixLoading message="Verifying Admin Access..." />
      ) : isAdmin ? (
        <Component />
      ) : (
        <Redirect to={user || isGuest ? "/" : "/auth"} />
      )}
    </Route>
  );
}