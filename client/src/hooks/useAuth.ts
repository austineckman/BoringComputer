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
  const { playSound } = useSoundEffects();
  const previousLevel = useRef<number>(0);

  // Get current user
  const { data: user, isLoading: loading, refetch } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    retry: false,
    initialData: null,
    refetchOnWindowFocus: true
  });

  // Login with Discord
  const login = useCallback(() => {
    setIsLoggingIn(true);
    
    // For demo purposes only - this would be replaced with actual Discord OAuth flow
    toast({
      title: "Discord Login",
      description: "Discord authentication is not available in demo mode. Please use username/password login.",
      variant: "destructive",
    });
    setIsLoggingIn(false);
  }, [toast]);

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
        playSound("success");
        
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
      playSound("error");
      
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
        playSound("success");
        
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
      playSound("error");
      
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
      playSound("powerUp");
      
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
        playSound("success");
        
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
      playSound("error");
      
      toast({
        title: "Admin Login Failed",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
    }
  }, [toast, refetch, playSound]);
  
  // Check for level changes and play level up sound
  useEffect(() => {
    if (user && previousLevel.current > 0 && user.level > previousLevel.current) {
      // User has leveled up!
      playSound("levelUp");
      setTimeout(() => playSound("fanfare"), 500);
      
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
  }, [user, playSound, toast]);

  return {
    user,
    loading: loading || isLoggingIn,
    login,
    loginWithCredentials,
    authenticate,
    logout,
    adminLogin,
  };
};
