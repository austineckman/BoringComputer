import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import wallpaper from "@assets/wallbg.png";
import characterImage from "@assets/basecharacter.png";
import bagImage from "@assets/506_Gold_Bag_Leather_B.png";

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

  // Get current time for the login screen
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-center items-center"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    >
      {/* Retro Windows Login Dialog */}
      <div className="w-full max-w-lg mx-auto">
        <div className="border-2 border-gray-400 rounded-md bg-gray-200 shadow-xl overflow-hidden">
          {/* Title Bar */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-1.5 px-2 flex justify-between items-center">
            <div className="flex items-center">
              <span className="mr-2 text-lg">💻</span>
              <span className="font-bold">CraftingTableOS Login</span>
            </div>
          </div>
          
          {/* Login Content */}
          <div className="p-6">
            {/* Login Banner */}
            <div className="flex items-center mb-6">
              <img 
                src={characterImage} 
                alt="Character" 
                className="w-32 h-32 rounded-full border-4 border-blue-600 mr-4 bg-blue-100 p-1 object-contain" 
              />
              <div>
                <h1 className="text-2xl font-bold text-blue-800 mb-1">
                  Welcome to CraftingTableOS
                </h1>
                <p className="text-gray-700">
                  Craft. Quest. Conquer. Begin your adventure today!
                </p>
                <div className="text-sm text-gray-500 mt-2">
                  {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            {/* Login Tabs */}
            <div className="border border-gray-400 mb-6">
              <div className="flex">
                <button 
                  className={`px-4 py-2 font-medium ${activeTab === 'login' 
                    ? 'bg-white border-b-0 border-r border-gray-400' 
                    : 'bg-gray-300 border-b border-r border-gray-400'}`}
                  onClick={() => setActiveTab('login')}
                >
                  Login
                </button>
                <button 
                  className={`px-4 py-2 font-medium ${activeTab === 'register' 
                    ? 'bg-white border-b-0 border-l border-gray-400' 
                    : 'bg-gray-300 border-b border-l border-gray-400'}`}
                  onClick={() => setActiveTab('register')}
                >
                  Register
                </button>
                <div className="flex-1 border-b border-gray-400 bg-gray-300"></div>
              </div>
              
              <div className="bg-white p-4">
                {activeTab === 'login' ? (
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <img src={bagImage} alt="User" className="w-12 h-12 mr-3" />
                          <div className="flex-1 space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium">Username:</label>
                                    <FormMessage className="text-xs text-red-600" />
                                  </div>
                                  <FormControl>
                                    <input
                                      {...field}
                                      placeholder="Enter your username"
                                      className="w-full border border-gray-500 px-2 py-1 text-sm bg-white focus:border-blue-500 focus:outline-none"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium">Password:</label>
                                    <FormMessage className="text-xs text-red-600" />
                                  </div>
                                  <FormControl>
                                    <input
                                      {...field}
                                      type="password"
                                      placeholder="Enter your password"
                                      className="w-full border border-gray-500 px-2 py-1 text-sm bg-white focus:border-blue-500 focus:outline-none"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-6">
                          <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm border-2 border-gray-300 shadow-[2px_2px_2px_rgba(0,0,0,0.3)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                          >
                            {isLoading ? "Logging in..." : "OK"}
                          </button>
                          <button 
                            type="button" 
                            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-medium text-sm border-2 border-gray-300 shadow-[2px_2px_2px_rgba(0,0,0,0.3)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            onClick={() => {
                              loginForm.reset();
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <img src={bagImage} alt="User" className="w-12 h-12 mr-3" />
                          <div className="flex-1 space-y-4">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium">New Username:</label>
                                    <FormMessage className="text-xs text-red-600" />
                                  </div>
                                  <FormControl>
                                    <input
                                      {...field}
                                      placeholder="Choose a username"
                                      className="w-full border border-gray-500 px-2 py-1 text-sm bg-white focus:border-blue-500 focus:outline-none"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex justify-between mb-1">
                                    <label className="text-sm font-medium">New Password:</label>
                                    <FormMessage className="text-xs text-red-600" />
                                  </div>
                                  <FormControl>
                                    <input
                                      {...field}
                                      type="password"
                                      placeholder="Choose a password"
                                      className="w-full border border-gray-500 px-2 py-1 text-sm bg-white focus:border-blue-500 focus:outline-none"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-6">
                          <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm border-2 border-gray-300 shadow-[2px_2px_2px_rgba(0,0,0,0.3)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                          >
                            {isLoading ? "Creating..." : "Create Account"}
                          </button>
                          <button 
                            type="button" 
                            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-medium text-sm border-2 border-gray-300 shadow-[2px_2px_2px_rgba(0,0,0,0.3)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            onClick={() => {
                              registerForm.reset();
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-sm text-gray-600 text-center">
              <p>CraftingTableOS, © 2025 CraftingTable LLC.</p>
              <p className="mt-1 text-xs">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stat Blocks - Only visible on larger screens */}
      <div className="hidden lg:flex gap-4 justify-center mt-6">
        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg text-white text-center w-32 border border-white/20">
          <div className="text-2xl font-bold">100+</div>
          <div className="text-xs">Quests</div>
        </div>
        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg text-white text-center w-32 border border-white/20">
          <div className="text-2xl font-bold">50+</div>
          <div className="text-xs">Projects</div>
        </div>
        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg text-white text-center w-32 border border-white/20">
          <div className="text-2xl font-bold">5K+</div>
          <div className="text-xs">Adventurers</div>
        </div>
      </div>
    </div>
  );
}