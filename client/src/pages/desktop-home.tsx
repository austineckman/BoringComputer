import React from "react";
import RetroDesktop from "@/components/retro-ui/RetroDesktop";
import { useSimpleAuth as useAuth } from "@/hooks/use-simple-auth";
import { MatrixLoading } from "@/components/ui/matrix-loading";
import "@/components/retro-ui/retro-ui.css";

const DesktopHome: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  // When auth is loading, show Matrix loading screen
  if (isLoading) {
    return <MatrixLoading message="Initializing Desktop..." />;
  }
  
  // Go directly to the desktop
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <RetroDesktop />
    </div>
  );
};

export default DesktopHome;