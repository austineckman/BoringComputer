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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-space-darkest to-space-dark">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand-orange mx-auto mb-4" />
        <h1 className="text-2xl text-brand-light font-bold mb-2">Logging out...</h1>
        <p className="text-brand-light/70">Please wait while we log you out.</p>
      </div>
    </div>
  );
}