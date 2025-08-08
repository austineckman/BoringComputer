import React, { useState, useEffect, useCallback } from "react";
import { Redirect, useLocation } from "wouter";
import PixelButton from "@/components/ui/pixel-button";
import { FaDiscord, FaUser, FaLock, FaUserFriends } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StarBackground from "@/components/layout/StarBackground";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

const Login = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sounds } = useSoundEffects();
  const { loginAsGuest, user, isLoading } = useAuth();
  
  // State declarations - keep all state hooks together at the top
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Remove local user query since we're using useAuth hook
  
  // Login with credentials mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error('Invalid username or password');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data);
      
      // Play the login success sound
      try {
        sounds.success?.();
      } catch (e) {
        console.warn('Could not play success sound', e);
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.username}!`,
      });
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
    onError: (error) => {
      // Play error sound
      try {
        sounds.error?.();
      } catch (e) {
        console.warn('Could not play error sound', e);
      }
      
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
      setIsLoggingIn(false);
    },
  });
  
  // Admin login mutation
  const adminLoginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password }),
      });
      
      if (!response.ok) {
        throw new Error('Invalid admin credentials');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data);
      
      // Play login success sound
      try {
        sounds.success?.();
      } catch (e) {
        console.warn('Could not play success sound', e);
      }
      
      toast({
        title: "Admin Login Successful",
        description: "Logged in with admin account",
      });
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
    onError: (error) => {
      // Play error sound
      try {
        sounds.error?.();
      } catch (e) {
        console.warn('Could not play error sound', e);
      }
      
      toast({
        title: "Admin Login Failed",
        description: error instanceof Error ? error.message : "Invalid admin credentials",
        variant: "destructive",
      });
      setIsLoggingIn(false);
    },
  });
  
  // Callback functions - All useCallback declarations together
  const handleLoginClick = useCallback(() => {
    try {
      sounds.click?.();
    } catch (e) {
      console.warn('Could not play click sound', e);
    }
    
    toast({
      title: 'Discord Login',
      description: 'Discord login is not available in the demo version.',
    });
  }, [sounds, toast]);
  
  const handleCredentialLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      sounds.click?.();
    } catch (e) {
      console.warn('Could not play click sound', e);
    }
    
    setIsLoggingIn(true);
    loginMutation.mutate({ username, password });
  }, [sounds, loginMutation, username, password]);
  
  const handleAdminLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      sounds.click?.();
    } catch (e) {
      console.warn('Could not play click sound', e);
    }
    
    setIsLoggingIn(true);
    adminLoginMutation.mutate(adminPassword);
  }, [sounds, adminLoginMutation, adminPassword]);

  const handleGuestLogin = useCallback(async () => {
    try {
      sounds.click?.();
    } catch (e) {
      console.warn('Could not play click sound', e);
    }
    
    await loginAsGuest();
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }, [sounds, loginAsGuest]);

  // Handle tab click sounds
  const handleTabClick = useCallback(() => {
    try {
      sounds.click?.();
    } catch (e) {
      console.warn('Could not play click sound', e);
    }
  }, [sounds]);

  if (isLoading || isLoggingIn || loginMutation.isPending || adminLoginMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <StarBackground starCount={150} />
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <svg className="h-24 w-24 mx-auto mb-4">
            <use href="#logo" />
          </svg>
          <h1 className="font-pixel text-2xl text-brand-orange mb-2">THE QUEST GIVER</h1>
          <p className="text-brand-light/70">CraftingTable Academy</p>
        </div>
        
        <Card className="bg-space-mid border-brand-orange/30 pixel-border">
          <CardHeader>
            <CardTitle className="text-center text-xl">Mission Login</CardTitle>
            <CardDescription className="text-center">
              Begin your adventure with the Quest Giver
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-4 bg-space-dark">
                <TabsTrigger value="login" onClick={handleTabClick}>Login</TabsTrigger>
                <TabsTrigger value="guest" onClick={handleTabClick}>Guest</TabsTrigger>
                <TabsTrigger value="discord" onClick={handleTabClick}>Discord</TabsTrigger>
                <TabsTrigger value="admin" onClick={handleTabClick}>Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleCredentialLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaUser className="text-brand-orange/70" />
                      </div>
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="Enter your username"
                        className="bg-space-dark pl-10 text-brand-light"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaLock className="text-brand-orange/70" />
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Enter your password"
                        className="bg-space-dark pl-10 text-brand-light"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <PixelButton type="submit" className="w-full">LOGIN</PixelButton>
                  
                  <div className="text-xs text-center text-brand-light/50">
                    <p>Demo login: username "demo" / password "demo123"</p>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="discord" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <p className="text-sm text-center text-brand-light/80">
                    Login with your Discord account to sync progress across devices
                  </p>
                  
                  <PixelButton
                    onClick={handleLoginClick}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FaDiscord className="h-5 w-5" />
                    <span>LOGIN WITH DISCORD</span>
                  </PixelButton>
                </div>
              </TabsContent>

              <TabsContent value="guest" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <p className="text-sm text-center text-brand-light/80">
                    Explore the desktop as a guest user. Your progress won't be saved, but you can see all the features.
                  </p>
                  
                  <PixelButton
                    onClick={handleGuestLogin}
                    className="w-full flex items-center justify-center gap-2"
                    variant="secondary"
                  >
                    <FaUserFriends className="h-5 w-5" />
                    <span>CONTINUE AS GUEST</span>
                  </PixelButton>
                  
                  <div className="text-xs text-center text-brand-light/50">
                    <p>No registration required • No progress saved • Full feature access</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-4 mt-4">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaLock className="text-brand-orange/70" />
                      </div>
                      <Input 
                        id="admin-password" 
                        type="password" 
                        placeholder="Enter admin password"
                        className="bg-space-dark pl-10 text-brand-light"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <PixelButton type="submit" variant="secondary" className="w-full">
                    ADMIN LOGIN
                  </PixelButton>
                  
                  <div className="text-xs text-center text-brand-light/50">
                    <p>For admins and content managers only</p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-xs text-center text-brand-light/50">
              By logging in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center text-sm text-brand-light/50">
          <p>Need help? <a href="#" className="text-brand-orange hover:text-brand-yellow">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
