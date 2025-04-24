import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Login credentials type
type LoginCredentials = {
  username: string;
  password: string;
};

// Registration credentials type
type RegisterCredentials = {
  username: string;
  password: string;
};

// Auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

// Create context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component that wraps our app and makes auth object available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Get current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        if (!response.ok) {
          if (response.status === 401) {
            return null; // Not authenticated, but not an error
          }
          throw new Error("Failed to fetch user data");
        }
        return await response.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unknown error occurred");
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      return await response.json();
    },
    onSuccess: (data: User) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiRequest("POST", "/api/auth/register", credentials);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      return await response.json();
    },
    onSuccess: (data: User) => {
      queryClient.setQueryData(["/api/auth/me"], data);
      toast({
        title: "Registration successful",
        description: "Welcome to Quest Giver!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      if (!response.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Login function
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    await registerMutation.mutateAsync(credentials);
  };

  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Value object that will be available in the context
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}