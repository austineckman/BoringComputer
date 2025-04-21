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

export const useAuth = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  // Get current user
  const { data: user, isLoading: loading } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    retry: false,
    initialData: null
  });

  // Login with Discord
  const login = useCallback(() => {
    setIsLoggingIn(true);
    
    // Discord OAuth2 parameters
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID || import.meta.env.VITE_DISCORD_CLIENT_ID || "YOUR_DISCORD_CLIENT_ID";
    const REDIRECT_URI = encodeURIComponent(window.location.origin);
    const SCOPE = encodeURIComponent('identify email');
    
    // Construct OAuth URL
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${SCOPE}`;
    
    // Redirect to Discord
    window.location.href = discordAuthUrl;
  }, []);

  // Authenticate with token from Discord
  const authenticateMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/auth/discord', { token });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoggingIn(false);
      queryClient.setQueryData(['/api/auth/me'], data);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.username}!`,
      });
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
    }
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // Mock login for development
  const mockLogin = useCallback(() => {
    const mockUser: User = {
      id: "123456789",
      username: "MockUser",
      email: "mock@example.com",
      avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
      roles: ["user"],
      level: 3,
      inventory: {
        "cloth": 5,
        "metal": 7,
        "tech-scrap": 4,
        "sensor-crystal": 3,
        "circuit-board": 2,
        "alchemy-ink": 3
      }
    };
    
    queryClient.setQueryData(['/api/auth/me'], mockUser);
    
    toast({
      title: "Development Login",
      description: "Logged in with mock user account",
    });
  }, [toast]);

  return {
    user,
    loading: loading || isLoggingIn,
    login,
    authenticate,
    logout,
    mockLogin,
  };
};
