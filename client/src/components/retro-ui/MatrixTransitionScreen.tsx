import React, { useState, useEffect, useRef } from "react";
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
  const animationFrameRef = useRef<number>();
  
  // Initialize and manage the animation
  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + transitionTime;
    
    // Initialize the matrix rain animation
    const canvas = document.getElementById('matrix-transition-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Matrix characters - use more code-like symbols
    const chars = '01アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン[]{}+-*/=0123456789ABCDEF';
    const columns = Math.floor(canvas.width / 14); // Character width
    const drops: number[] = [];
    
    // Initialize drops at random positions
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
    
    const drawMatrix = () => {
      // Semi-transparent black to create trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0F0'; // Green text
      ctx.font = '14px monospace';
      
      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        // x coordinate dependent on column, y on drop position
        ctx.fillText(text, i * 14, drops[i] * 14);
        
        // Move drops down faster as time progresses
        const dropSpeed = 1 + (progress / 100) * 2; // Speed increases with progress
        drops[i] += dropSpeed;
        
        // Reset drop when it reaches the bottom with some randomness
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -20;
        }
      }
      
      // Update progress
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const newProgress = Math.min(100, (elapsed / transitionTime) * 100);
      setProgress(newProgress);
      
      // Continue animation if not complete
      if (currentTime < endTime) {
        animationFrameRef.current = requestAnimationFrame(drawMatrix);
      } else {
        // Transition complete
        setTimeout(() => {
          onTransitionComplete();
        }, 500); // Small delay for visual effect
      }
    };
    
    // Start the animation
    drawMatrix();
    
    // Clean up on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Matrix-like background - fill entire screen */}
      <canvas id="matrix-transition-canvas" className="absolute inset-0"></canvas>
      
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

      {/* No inline style - using external CSS file */}
    </div>
  );
};

export default MatrixTransitionScreen;
