import React from "react";
import RetroDesktop from "@/components/retro-ui/RetroDesktop";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import "@/components/retro-ui/retro-ui.css";

const DesktopHome: React.FC = () => {
  const { user, isLoading, isGuest } = useAuth();
  
  console.log("DesktopHome: Auth state:", { user, isLoading, isGuest });
  
  // When auth is loading, show a simple spinner
  if (isLoading) {
    console.log("DesktopHome: Showing loading spinner");
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <div style={{color: 'white', marginLeft: '20px'}}>Loading auth...</div>
      </div>
    );
  }
  
  console.log("DesktopHome: Rendering desktop");
  
  // Go directly to the desktop
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <div style={{position: 'fixed', top: '30px', left: 0, background: 'blue', color: 'white', padding: '5px', zIndex: 9999}}>
        Desktop Rendered - User: {user?.username || 'None'} - Guest: {isGuest ? 'Yes' : 'No'}
      </div>
      <RetroDesktop />
    </div>
  );
};

export default DesktopHome;