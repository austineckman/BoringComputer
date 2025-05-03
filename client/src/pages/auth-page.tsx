import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LoadingScreen from "@/components/retro-ui/LoadingScreen";
import wallpaper from "@assets/wallbg.png";
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
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      {showLoadingScreen && <LoadingScreen onLoadComplete={handleLoadingComplete} />}
      
      <div className="bg-gray-100 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <img src={hoodedFigureImg} alt="Logo" className="h-10 w-10 mr-2" />
            <h1 className="text-2xl font-bold text-slate-800">CraftingTableOS</h1>
          </div>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 font-medium ${activeTab === "login" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 font-medium ${activeTab === "register" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
          >
            Register
          </button>
        </div>

        {activeTab === "login" ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            <div className="mb-4">
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                type="text"
                {...loginForm.register("username")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
              />
              {loginForm.formState.errors.username && (
                <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.username.message}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                {...loginForm.register("password")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              {loginForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
            <div className="mb-4">
              <label htmlFor="register-username" className="block mb-2 text-sm font-medium text-gray-700">Username</label>
              <input
                id="register-username"
                type="text"
                {...registerForm.register("username")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Choose a username"
              />
              {registerForm.formState.errors.username && (
                <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.username.message}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="register-password" className="block mb-2 text-sm font-medium text-gray-700">Password</label>
              <input
                id="register-password"
                type="password"
                {...registerForm.register("password")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Choose a password"
              />
              {registerForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>CraftingTableOS, © 2025</p>
        </div>
      </div>
    </div>
  );
}