import React, { useState, useEffect } from "react";
import "./matrix-transition.css";

interface MatrixTransitionScreenProps {
  onTransitionComplete: () => void;
  transitionTime?: number; // in milliseconds, default to 4000 (4 seconds)
}

const MatrixTransitionScreen: React.FC<MatrixTransitionScreenProps> = ({
  onTransitionComplete,
  transitionTime = 4000
}) => {
  const [progress, setProgress] = useState(0);
  
  // Handle the transition timing
  useEffect(() => {
    const timer = setTimeout(() => {
      onTransitionComplete();
    }, transitionTime);
    
    // Update progress for the progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (transitionTime / 100));
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100);
    
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [transitionTime, onTransitionComplete]);
  
  // Display messages based on progress
  const getMessage = () => {
    if (progress < 25) {
      return "AUTHENTICATING USER CREDENTIALS...";
    } else if (progress < 50) {
      return "ESTABLISHING SECURE CONNECTION...";
    } else if (progress < 75) {
      return "LOADING USER PROFILE DATA...";
    } else {
      return "INITIALIZING DESKTOP ENVIRONMENT...";
    }
  };
  
  // Create a simplified version of the matrix transition screen
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Matrix background */}
      <div className="absolute inset-0 matrix-background"></div>
      
      {/* Center text */}
      <div className="relative z-10 text-center">
        <h1 className="text-green-500 font-mono text-4xl mb-8 glitch-text">
          ACCESS GRANTED
        </h1>
        
        {/* Message that changes based on progress */}
        <p className="text-green-400 font-mono text-xl mb-12">
          {getMessage()}
        </p>
        
        {/* Progress bar */}
        <div className="w-[300px] h-2 bg-black border border-green-500 mb-4 mx-auto">
          <div 
            className="h-full bg-green-500 transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Progress percentage */}
        <p className="text-green-400 font-mono text-sm">
          SYSTEM INITIALIZATION: {Math.floor(progress)}% COMPLETE
        </p>
      </div>
    </div>
  );
};

export default MatrixTransitionScreen;
