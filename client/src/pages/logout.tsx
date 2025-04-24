import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // Redirect to auth page after logout
        setLocation("/auth");
      } catch (error) {
        console.error("Logout failed:", error);
        // Still redirect to auth page if logout fails
        setLocation("/auth");
      }
    };

    performLogout();
  }, [logout, setLocation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Logging out...</h1>
        <p className="text-muted-foreground">Please wait while we log you out.</p>
      </div>
    </div>
  );
}