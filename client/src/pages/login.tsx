import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import PixelButton from "@/components/ui/pixel-button";
import { FaDiscord } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StarBackground from "@/components/layout/StarBackground";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Login = () => {
  const { user, loading, login, mockLogin } = useAuth();
  const { playSound } = useSoundEffects();

  useEffect(() => {
    // Create stars animation
    const starField = document.createElement('div');
    starField.className = 'star-field';
    document.body.appendChild(starField);

    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      star.style.width = `${Math.random() * 2 + 1}px`;
      star.style.height = star.style.width;
      starField.appendChild(star);
    }

    return () => {
      document.body.removeChild(starField);
    };
  }, []);

  const handleLoginClick = () => {
    playSound("click");
    login();
  };

  const handleDevLoginClick = () => {
    playSound("click");
    mockLogin();
  };

  if (loading) {
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
              Connect with your Discord account to begin your adventure
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <PixelButton
              onClick={handleLoginClick}
              className="w-full flex items-center justify-center gap-2"
            >
              <FaDiscord className="h-5 w-5" />
              <span>LOGIN WITH DISCORD</span>
            </PixelButton>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-brand-orange/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-space-mid px-2 text-brand-light/50">or</span>
              </div>
            </div>
            
            <PixelButton
              variant="accent"
              onClick={handleDevLoginClick}
              className="w-full"
            >
              DEVELOPMENT LOGIN
            </PixelButton>
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
