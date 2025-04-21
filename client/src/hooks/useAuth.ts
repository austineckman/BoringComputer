import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useCallback } from "react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
      await refetch();
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.username}!`,
      });
      
      // Give time for React to process the state update before redirecting
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    onError: (error) => {
      setIsLoggingIn(false);
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
      await refetch();
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.username}!`,
      });
      
      // Give time for React to process the state update before redirecting
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    onError: (error) => {
      setIsLoggingIn(false);
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
  const adminLogin = useCallback(async () => {
    const adminUser: User = {
      id: "123456789",
      username: "Admin",
      email: "admin@questgiver.com",
      avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
      roles: ["admin", "user"],
      level: 10,
      inventory: {
        "cloth": 100,
        "metal": 100,
        "tech-scrap": 100,
        "sensor-crystal": 100,
        "circuit-board": 100,
        "alchemy-ink": 100
      }
    };
    
    queryClient.setQueryData(['/api/auth/me'], adminUser);
    await refetch();
    
    toast({
      title: "Admin Login",
      description: "Logged in with admin account",
    });
    
    // Give time for React to process the state update before redirecting
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  }, [toast, refetch]);

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
