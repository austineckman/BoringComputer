
import React, { useState, useEffect } from "react";
import wallpaper from "@assets/wallbg.png";
import hoodedFigureImg from "@assets/hooded-figure.png";
import "@/components/retro-ui/retro-ui.css";
import { useSimpleAuth as useAuth } from "@/hooks/use-simple-auth";

export default function AuthPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { loginAsGuest } = useAuth();
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleDiscordLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  const handleGuestLogin = () => {
    // Simple guest login - just redirect with a guest parameter
    window.location.href = '/?guest=true';
  };
  
  return (
    <div>
      {/* Main login UI */}
      <div 
        className="min-h-screen w-full flex flex-col justify-center items-center relative overflow-hidden retro-desktop"
        style={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          pointerEvents: 'auto'
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
            <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white py-1.5 px-3 flex items-center select-none">
              <div className="flex items-center">
                <span className="mr-2 text-lg">💻</span>
                <span className="font-bold tracking-tight">BoringComputer OS</span>
              </div>
            </div>
            
            {/* Windows 95 Login Box */}
            <div className="p-5">
              <div className="flex mb-5 justify-center">
                <div className="relative w-20 h-20 mr-3 overflow-hidden border-2 border-t-gray-400 border-l-gray-400 border-r-black border-b-black bg-white p-1">
                  <img 
                    src={hoodedFigureImg} 
                    alt="Hooded Figure" 
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-xl font-bold text-black">
                    Welcome To BoringComputer
                  </h1>
                  <p className="text-gray-700 text-sm">
                    Please authenticate to continue
                  </p>
                </div>
              </div>
              
              {/* Discord Login Button */}
              <div className="flex justify-center">
                <button 
                  onClick={handleDiscordLogin}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  <span>Login with Discord</span>
                </button>
              </div>

              {/* Guest Login Button */}
              <div className="flex justify-center mt-3">
                <button 
                  onClick={handleGuestLogin}
                  className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-normal text-sm border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-r-white active:border-b-white flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span>Continue as Guest</span>
                </button>
              </div>
              
              <div className="mt-2 text-center text-xs text-gray-600">
                <p>Guest account - No progress will be saved</p>
              </div>
              
              <div className="mt-4 text-center text-xs text-gray-600">
                <p>By logging in, you agree to our Terms of Service</p>
              </div>
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
      </div>
    </div>
  );
}
