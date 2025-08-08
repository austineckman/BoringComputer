import React from "react";
import RetroDesktop from "@/components/retro-ui/RetroDesktop";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Login from "@/pages/login";
import "@/components/retro-ui/retro-ui.css";

const DesktopHome: React.FC = () => {
  const { user, isLoading, isGuest } = useAuth();
  
  // When auth is loading, show a simple spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }
  
  // If no user and not a guest, show login
  if (!user && !isGuest) {
    return <Login />;
  }
  
  // Otherwise show the desktop
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <RetroDesktop />
    </div>
  );
};

export default DesktopHome;