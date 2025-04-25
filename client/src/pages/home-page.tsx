import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RetroDesktop from "@/components/retro-ui/RetroDesktop";
import RetroStartMenu from "@/components/retro-ui/RetroStartMenu";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import "@/components/retro-ui/retro-ui.css";

const HomePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // The RetroDesktop will be the main content of the HomePage
  // We now only need a simple wrapper around it
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <RetroDesktop />
        {isStartMenuOpen && (
          <RetroStartMenu isOpen={isStartMenuOpen} onClose={() => setIsStartMenuOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default HomePage;