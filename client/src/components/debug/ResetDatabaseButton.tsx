import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useLocation } from "wouter";

export default function ResetDatabaseButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [_, setLocation] = useLocation();

  const handleReset = async () => {
    try {
      setIsLoading(true);
      await apiRequest("POST", "/api/debug/reset-database");
      
      toast({
        title: "Database Reset",
        description: "Database has been reset successfully. You will be logged out.",
        variant: "default",
      });
      
      // Wait a moment to show the toast
      setTimeout(() => {
        // Clear session and redirect to login
        document.cookie = "sessionToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setLocation("/auth");
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error resetting database:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset database. See console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      onClick={handleReset}
      disabled={isLoading}
      className="w-full mt-4"
    >
      {isLoading ? "Resetting..." : "Reset Database"}
    </Button>
  );
}