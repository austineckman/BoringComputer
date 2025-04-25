import React, { useState, useEffect } from "react";
import RetroDesktop from "@/components/retro-ui/RetroDesktop";
import LoadingScreen from "@/components/retro-ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import "@/components/retro-ui/retro-ui.css";

const DesktopHome: React.FC = () => {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isBootAnimation, setIsBootAnimation] = useState(true);
  
  // Simulate initial app loading
  useEffect(() => {
    // If authentication is still loading, we'll wait for that first
    if (!loading) {
      // Once auth is done, show boot animation for at least 1.5 seconds
      // This ensures users see the loading screen even if app loads quickly
      const minLoadingTime = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      
      return () => clearTimeout(minLoadingTime);
    }
  }, [loading]);
  
  // When auth is loading, show a simple spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }
  
  // When initial loading is done but boot animation is still active
  if (isLoading) {
    return <LoadingScreen onLoadComplete={() => setIsBootAnimation(false)} />;
  }
  
  // When boot animation is done, transition to the desktop
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <RetroDesktop />
      
      {/* Overlay the boot animation until it completes */}
      {isBootAnimation && <LoadingScreen onLoadComplete={() => setIsBootAnimation(false)} />}
    </div>
  );
};

export default DesktopHome;