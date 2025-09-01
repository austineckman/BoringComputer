import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useCallback, useEffect, useRef } from "react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface User {
  id: string;
  username: string;
  email?: string;
  discordId?: string;  // Added missing discordId field
  avatar?: string;
  roles?: string[];
  level: number;
  inventory: Record<string, number>;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export const useAuth = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  const previousLevel = useRef<number>(0);

  // Get current user
  const { data: user, isLoading: loading, refetch } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    retry: false,
    initialData: null,
    refetchOnWindowFocus: true
  });

  // Function to safely play sounds
  const playSoundSafely = useCallback((soundType: string) => {
    try {
      switch (soundType) {
        case "success":
        case "loginSuccess":
          sounds.success?.();
          break;
        case "error":
          sounds.error?.();
          break;
        case "powerUp":
          sounds.success?.();
          break;
        case "levelUp":
          sounds.levelUp?.();
          break;
        case "fanfare":
        case "reward":
          sounds.reward?.();
          break;
        case "click":
          sounds.click?.();
          break;
        case "hover":
          sounds.hover?.();
          break;
        default:
          console.warn(`No sound mapping for: ${soundType}`);
      }
    } catch (e) {
      console.warn(`Could not play ${soundType} sound:`, e);
    }
  }, [sounds]);

  // Login with Discord
  const login = useCallback(() => {
    setIsLoggingIn(true);
    
    // Redirect to Discord OAuth
    window.location.href = '/api/auth/discord';
  }, []);

  // Login with username and password
  const loginWithCredentialsMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: async (data) => {
      setIsLoggingIn(false);
      // Set the cache and force a refetch to ensure we're synchronized
      queryClient.setQueryData(['/api/auth/me'], data);
      
      try {
        await refetch();
        
        // Play login success sound
        playSoundSafely("success");
        
        // Success notification
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.username}!`,
        });
        
        // Redirect with a full page refresh to ensure cookies are applied
        console.log("Redirecting to home page...");
        setTimeout(() => {
          window.location.replace('/');
        }, 1500);
      } catch (error) {
        console.error("Error refreshing user data:", error);
        toast({
          title: "Login Issue",
          description: "Logged in, but encountered an issue. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setIsLoggingIn(false);
      
      // Play error sound
      playSoundSafely("error");
      
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      });
    }
  });

  const loginWithCredentials = useCallback((credentials: LoginCredentials) => {
    setIsLoggingIn(true);
    loginWithCredentialsMutation.mutate(credentials);
  }, [loginWithCredentialsMutation]);

  // Authenticate with token from Discord
  const authenticateMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/auth/discord', { token });
      return response.json();
    },
    onSuccess: async (data) => {
      setIsLoggingIn(false);
      queryClient.setQueryData(['/api/auth/me'], data);
      
      try {
        await refetch();
        
        // Play success sound
        playSoundSafely("success");
        
        // Success notification
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.username}!`,
        });
        
        // Redirect with a full page refresh to ensure cookies are applied
        console.log("Redirecting to home page...");
        setTimeout(() => {
          window.location.replace('/');
        }, 1500);
      } catch (error) {
        console.error("Error refreshing user data:", error);
        toast({
          title: "Login Issue",
          description: "Logged in, but encountered an issue. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setIsLoggingIn(false);
      
      // Play error sound
      playSoundSafely("error");
      
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
    }
  });

  const authenticate = useCallback((token: string) => {
    authenticateMutation.mutate(token);
  }, [authenticateMutation]);

  // Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries();
      
      // Play logout sound
      playSoundSafely("powerUp");
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      
      // Redirect to login page after logout
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
    }
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // Admin login for development/testing
  const adminLogin = useCallback(async (password: string) => {
    try {
      // Use the actual adminLogin API instead of a local mock
      const response = await apiRequest('POST', '/api/auth/login', {
        username: 'admin',
        password: password
      });
      const data = await response.json();
      
      // Update the cache with admin user data
      queryClient.setQueryData(['/api/auth/me'], data);
      
      try {
        await refetch();
        
        // Play success sound
        playSoundSafely("success");
        
        toast({
          title: "Admin Login",
          description: "Logged in with admin account",
        });
        
        // Redirect with a full page refresh to ensure cookies are applied
        console.log("Admin login successful, redirecting to home page...");
        setTimeout(() => {
          window.location.replace('/');
        }, 1500);
      } catch (error) {
        console.error("Error refreshing admin user data:", error);
        toast({
          title: "Login Issue",
          description: "Logged in, but encountered an issue. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      
      // Play error sound
      playSoundSafely("error");
      
      toast({
        title: "Admin Login Failed",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    }
  }, [toast, refetch, playSoundSafely]);
  
  // Check for level changes and play level up sound
  useEffect(() => {
    if (user && previousLevel.current > 0 && user.level > previousLevel.current) {
      // User has leveled up!
      playSoundSafely("levelUp");
      
      // Play fanfare after a short delay
      setTimeout(() => {
        playSoundSafely("fanfare");
      }, 500);
      
      toast({
        title: "Level Up!",
        description: `You've reached level ${user.level}!`,
        variant: "default",
      });
    }
    
    // Update previous level reference
    if (user) {
      previousLevel.current = user.level;
    }
  }, [user, playSoundSafely, toast]);

  return {
    user,
    loading: loading || isLoggingIn,
    login,
    loginWithCredentials,
    authenticate,
    logout,
    adminLogin,
    playSoundSafely // Export this so other components can use it
  };
};
