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
import "@/components/retro-ui/retro-ui.css";

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
      className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden retro-desktop"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    >
      {/* Glitchy overlay effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/30"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIuMiIgc3Ryb2tlLXdpZHRoPSIuNSI+PHBhdGggZD0iTTEgMWgxNnYxNkgxeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-white/20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-black/40"></div>
        <div className="absolute -inset-[100px] mix-blend-overlay opacity-30" 
          style={{
            background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0) 2px)',
            backgroundSize: '4px 4px',
          }}>
        </div>
      </div>
      {/* Windows 95-style Login Box */}
      <div className="w-full max-w-md mx-auto z-10">
        {/* Main Window */}
        <div className="border-[3px] border-t-gray-300 border-l-gray-300 border-r-gray-800 border-b-gray-800 bg-gray-200 shadow-2xl overflow-hidden">
          {/* Title Bar */}
          <div className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800 text-white py-1.5 px-3 flex justify-between items-center select-none">
            <div className="flex items-center">
              <span className="mr-2 text-lg">💻</span>
              <span className="font-bold tracking-tight">CraftingTableOS</span>
            </div>
            <div className="flex items-center space-x-1">
              <button className="w-5 h-5 flex items-center justify-center bg-gray-300 hover:bg-gray-400 border-t-white border-l-white border-r-gray-500 border-b-gray-500 border text-gray-800">
                <span className="text-xs mb-1 font-bold">_</span>
              </button>
              <button className="w-5 h-5 flex items-center justify-center bg-gray-300 hover:bg-gray-400 border-t-white border-l-white border-r-gray-500 border-b-gray-500 border text-gray-800">
                <span className="text-xs">□</span>
              </button>
              <button className="w-5 h-5 flex items-center justify-center bg-gray-300 hover:bg-gray-400 border-t-white border-l-white border-r-gray-500 border-b-gray-500 border text-gray-800">
                <span className="text-xs">×</span>
              </button>
            </div>
          </div>
          
          {/* Windows 95 Login Box */}
          <div className="p-5">
            <div className="flex mb-5 justify-center">
              <div className="relative w-20 h-20 mr-3 overflow-hidden border-2 border-t-gray-400 border-l-gray-400 border-r-black border-b-black bg-white p-1">
                <img 
                  src={characterImage} 
                  alt="Character" 
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-xl font-bold text-black">
                  Welcome to CraftingTableOS
                </h1>
                <p className="text-gray-700 text-sm">
                  Type your username and password
                </p>
              </div>
            </div>
            
            {/* Login Tabs */}
            <div className="border-t border-l border-r border-gray-400 mb-4">
              <div className="flex">
                <button 
                  className={`px-4 py-1 text-sm ${activeTab === 'login' 
                    ? 'bg-gray-200' 
                    : 'bg-gray-300'}`}
                  onClick={() => setActiveTab('login')}
                >
                  Login
                </button>
                <button 
                  className={`px-4 py-1 text-sm ${activeTab === 'register' 
                    ? 'bg-gray-200' 
                    : 'bg-gray-300'}`}
                  onClick={() => setActiveTab('register')}
                >
                  Register
                </button>
              </div>
            </div>
            
            {activeTab === 'login' ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <div className="space-y-3">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <label className="w-24 text-sm">Username:</label>
                            <div className="flex-1">
                              <FormControl>
                                <input
                                  {...field}
                                  placeholder="Enter username"
                                  className="w-full border-2 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-2 py-1 text-sm bg-white focus:outline-none"
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-600 mt-1" />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <label className="w-24 text-sm">Password:</label>
                            <div className="flex-1">
                              <FormControl>
                                <input
                                  {...field}
                                  type="password"
                                  placeholder="Enter password"
                                  className="w-full border-2 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-2 py-1 text-sm bg-white focus:outline-none"
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-600 mt-1" />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2 mt-5 pt-3 border-t border-gray-400">
                      <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="min-w-24 px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-normal text-sm border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white"
                      >
                        {isLoading ? "Logging in..." : "OK"}
                      </button>
                      <button 
                        type="button" 
                        className="min-w-24 px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-normal text-sm border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white"
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
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <div className="space-y-3">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <label className="w-24 text-sm">Username:</label>
                            <div className="flex-1">
                              <FormControl>
                                <input
                                  {...field}
                                  placeholder="Choose username"
                                  className="w-full border-2 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-2 py-1 text-sm bg-white focus:outline-none"
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-600 mt-1" />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <label className="w-24 text-sm">Password:</label>
                            <div className="flex-1">
                              <FormControl>
                                <input
                                  {...field}
                                  type="password"
                                  placeholder="Choose password"
                                  className="w-full border-2 border-t-gray-600 border-l-gray-600 border-r-white border-b-white px-2 py-1 text-sm bg-white focus:outline-none"
                                />
                              </FormControl>
                              <FormMessage className="text-xs text-red-600 mt-1" />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2 mt-5 pt-3 border-t border-gray-400">
                      <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="min-w-24 px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-normal text-sm border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white"
                      >
                        {isLoading ? "Creating..." : "Create Account"}
                      </button>
                      <button 
                        type="button" 
                        className="min-w-24 px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-normal text-sm border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white"
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
          
          {/* Footer Status Bar */}
          <div className="px-2 py-1 bg-gray-200 border-t border-gray-400 flex justify-between items-center text-xs">
            <div>
              <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div>
              <span>CraftingTableOS, © 2025 CraftingTable LLC.</span>
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