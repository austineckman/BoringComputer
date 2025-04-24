import React, { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import wallpaper from "@assets/wallbg.png";
import characterImage from "@assets/basecharacter.png";

// Auth validation schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be 20 characters or less")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/login", values);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      // Successfully logged in
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Redirect to home page using window.location for a full page reload
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/register", values);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      // Successfully registered and logged in
      toast({
        title: "Registration successful",
        description: "Welcome to Quest Giver!",
      });
      
      // Redirect to home page using window.location for a full page reload
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left column: Auth forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-2 border-primary/20 bg-background/95 backdrop-blur">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome to Quest Giver</CardTitle>
            <CardDescription>
              Begin your adventure with us!
            </CardDescription>
          </CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <CardContent className="pt-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
            <TabsContent value="register">
              <CardContent className="pt-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Choose a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="text-sm text-muted-foreground text-center mt-4">
              <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Right column: Hero section */}
      <div 
        className="hidden md:flex md:w-1/2 bg-cover bg-center flex-col justify-center items-center" 
        style={{ backgroundImage: `url(${wallpaper})` }}
      >
        <div className="p-8 text-center">
          <img 
            src={characterImage} 
            alt="Character" 
            className="w-64 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
          />
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Craft. Quest. Conquer.
          </h1>
          <p className="text-xl text-white mb-6 max-w-md mx-auto drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">
            Embark on adventures, learn real-world skills, and join a community of makers and explorers.
          </p>
          <div className="flex gap-4 justify-center">
            <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg text-white text-center w-24">
              <div className="text-2xl font-bold">100+</div>
              <div className="text-xs">Quests</div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg text-white text-center w-24">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-xs">Projects</div>
            </div>
            <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg text-white text-center w-24">
              <div className="text-2xl font-bold">5K+</div>
              <div className="text-xs">Adventurers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}