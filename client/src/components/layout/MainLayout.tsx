import React from "react";
import NavigationBar from "./NavigationBar";
import Footer from "./Footer";
import StarBackground from "./StarBackground";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, loading } = useAuth();

  // If not loading and no user, redirect to login
  if (!loading && !user) {
    return <Redirect to="/login" />;
  }

  // Show loading indicator while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StarBackground />
      <NavigationBar />
      <main className="container mx-auto px-4 py-6 flex-grow">
        {children}
      </main>
      <Footer />
      
      {/* SVG Sprites */}
      <div className="hidden">
        <svg>
          <symbol id="logo" viewBox="0 0 100 100">
            {/* Copy content from the logo SVG */}
            <rect x="10" y="10" width="80" height="80" rx="8" fill="#06090C"/>
            <path d="M20 30 L20 70 L35 70 L35 60 L30 60 L30 40 L35 40 L35 30 L20 30 Z" fill="#FF5B00"/>
            <path d="M40 30 L40 40 L45 40 L45 70 L55 70 L55 40 L60 40 L60 30 L40 30 Z" fill="#FF9300"/>
            <rect x="10" y="10" width="80" height="80" rx="8" stroke="#FFD800" strokeWidth="2" fill="none"/>
            <rect x="70" y="30" width="10" height="10" fill="#3ECDA2"/>
            <rect x="70" y="45" width="10" height="10" fill="#44A0FF"/>
            <rect x="70" y="60" width="10" height="10" fill="#9C6ADE"/>
            <path d="M25 80 L30 80 L30 85 L25 85 L25 80 Z" fill="#EFEFEF"/>
            <path d="M35 80 L40 80 L40 85 L35 85 L35 80 Z" fill="#EFEFEF"/>
            <path d="M45 80 L50 80 L50 85 L45 85 L45 80 Z" fill="#EFEFEF"/>
            <path d="M55 80 L60 80 L60 85 L55 85 L55 80 Z" fill="#EFEFEF"/>
            <path d="M65 80 L70 80 L70 85 L65 85 L65 80 Z" fill="#EFEFEF"/>
            <rect x="15" y="15" width="5" height="5" fill="#FFD800"/>
            <rect x="80" y="15" width="5" height="5" fill="#FFD800"/>
            <rect x="15" y="80" width="5" height="5" fill="#FFD800"/>
            <rect x="80" y="80" width="5" height="5" fill="#FFD800"/>
          </symbol>
        </svg>
      </div>
    </div>
  );
};

export default MainLayout;
