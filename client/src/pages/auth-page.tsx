import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MatrixTransitionScreen from "@/components/retro-ui/MatrixTransitionScreen";
import wallpaper from "@assets/wallbg.png";
import matrixWallBg from "@assets/bg.png";
import hoodedFigureImg from "@assets/hooded-figure.png";
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
  
  // Loading screen state
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  
  // Hide loading screen after it completes
  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

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
    <div className="w-full min-h-screen flex justify-center items-center" 
      style={{
        backgroundColor: '#121212', // Dark background color
        backgroundImage: `url(${matrixWallBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
      }}>
      {showLoadingScreen && <LoadingScreen onLoadComplete={handleLoadingComplete} />}
      
      {/* Windows 95-style Login Window */}
      <div className="w-full max-w-md mx-auto">
        {/* Main Window */}
        <div className="border-[3px] border-t-gray-300 border-l-gray-300 border-r-gray-800 border-b-gray-800 bg-gray-200 shadow-2xl overflow-hidden">
          {/* Title Bar */}
          <div className="matrix-title-bar text-white py-1.5 px-3 flex justify-between items-center select-none">
            <div className="flex items-center">
              <span className="mr-2 text-lg">🔐</span>
              <span className="font-bold tracking-tight">Login Page</span>
            </div>
            <div className="flex items-center space-x-1">
              <button className="w-6 h-5 bg-gray-200 border-[1px] border-gray-500 flex items-center justify-center text-black font-bold">?</button>
              <button className="w-6 h-5 bg-gray-200 border-[1px] border-gray-500 flex items-center justify-center text-black font-bold">✕</button>
            </div>
          </div>
          
          {/* Windows 95 Login Box */}
          <div className="p-5">
            <div className="flex mb-5 justify-center">
              <div className="relative w-16 h-16 mr-3 overflow-hidden border-2 border-gray-600 bg-white p-1 shadow-inner">
                <img 
                  src={hoodedFigureImg} 
                  alt="User Icon" 
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-xl font-bold text-black">
                  Welcome to CraftingTableOS
                </h1>
                <p className="text-sm text-black">
                  Please enter your credentials
                </p>
              </div>
            </div>
            
            {/* Windows 95-style Tabs */}
            <div className="flex border-b border-gray-500 mb-6">
              <button 
                className={`px-4 py-1 text-sm font-bold ${activeTab === 'login' 
                  ? 'bg-gray-200 border-t border-l border-r border-gray-500 text-black relative top-[1px]' 
                  : 'bg-gray-300 text-black'}`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
              <button 
                className={`px-4 py-1 text-sm font-bold ${activeTab === 'register' 
                  ? 'bg-gray-200 border-t border-l border-r border-gray-500 text-black relative top-[1px]' 
                  : 'bg-gray-300 text-black'}`}
                onClick={() => setActiveTab('register')}
              >
                Register
              </button>
            </div>

            {activeTab === "login" ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                
                <div className="mb-4">
                  <label htmlFor="username" className="block mb-2 text-sm font-bold text-black">Username:</label>
                  <input
                    id="username"
                    type="text"
                    {...loginForm.register("username")}
                    className="w-full px-2 py-1 border-2 border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-white shadow-inner text-black"
                    placeholder="Enter username"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="password" className="block mb-2 text-sm font-bold text-black">Password:</label>
                  <input
                    id="password"
                    type="password"
                    {...loginForm.register("password")}
                    className="w-full px-2 py-1 border-2 border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-white shadow-inner text-black"
                    placeholder="Enter password"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="min-w-[100px] px-6 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-normal text-sm border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white"
                  >
                    {isLoading ? "Logging in..." : "OK"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <div className="mb-4 p-3 border border-amber-500 bg-amber-50 rounded text-black text-sm">
                  <p className="font-bold mb-1">⚠️ DEMO APPLICATION DISCLAIMER:</p>
                  <p>This project was created entirely by AI and is for demonstration purposes only. None of the art, code, music, or other assets were created by humans.</p>
                  <p className="mt-1">⚠️ <span className="font-bold">SECURITY WARNING</span>: Do not use real usernames or passwords as this application's security has not been verified.</p>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="register-username" className="block mb-2 text-sm font-bold text-black">Create username:</label>
                  <input
                    id="register-username"
                    type="text"
                    {...registerForm.register("username")}
                    className="w-full px-2 py-1 border-2 border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-white shadow-inner text-black"
                    placeholder="Choose username"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.username.message}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="register-password" className="block mb-2 text-sm font-bold text-black">Create password:</label>
                  <input
                    id="register-password"
                    type="password"
                    {...registerForm.register("password")}
                    className="w-full px-2 py-1 border-2 border-t-gray-600 border-l-gray-600 border-r-white border-b-white bg-white shadow-inner text-black"
                    placeholder="Choose password"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="min-w-[100px] px-6 py-1.5 bg-gray-200 hover:bg-gray-300 text-black font-normal text-sm border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white"
                  >
                    {isLoading ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Footer Status Bar */}
          <div className="px-2 py-1 bg-gray-200 border-t border-gray-400 flex justify-between items-center text-xs">
            <div>
              <span className="font-mono text-black">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div>
              <span className="text-black">CraftingTableOS, © 1996</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}