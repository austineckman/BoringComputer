import React, { useState, useEffect } from 'react';
import questsImage from '@assets/quests.png';

interface QuestLoadingScreenProps {
  onLoadingComplete: () => void;
  loadingTime?: number; // in milliseconds, default to 4000 (4 seconds)
}

const QuestLoadingScreen: React.FC<QuestLoadingScreenProps> = ({ 
  onLoadingComplete,
  loadingTime = 4000 
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + loadingTime;
    
    const updateProgress = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const newProgress = Math.min(100, (elapsed / loadingTime) * 100);
      
      setProgress(newProgress);
      
      if (currentTime < endTime) {
        requestAnimationFrame(updateProgress);
      } else {
        // Loading complete
        onLoadingComplete();
      }
    };
    
    // Start the animation
    requestAnimationFrame(updateProgress);
    
    // Cleanup function (in case component unmounts before loading completes)
    return () => {
      // Nothing specific to clean up with requestAnimationFrame
    };
  }, [loadingTime, onLoadingComplete]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
      <div className="relative w-[500px] bg-black border-2 border-amber-500 rounded-md overflow-hidden">
        {/* Main Image */}
        <div className="p-4">
          <img 
            src={questsImage} 
            alt="Loading Quests..." 
            className="w-full"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        
        {/* Loading Bar */}
        <div className="h-6 bg-gray-900 border-t-2 border-amber-700 relative">
          <div 
            className="h-full bg-amber-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
          
          {/* Pixel art loading bar decoration - optional tiny squares at the edge */}
          <div 
            className="absolute top-0 h-full bg-amber-400"
            style={{ 
              width: '3px', 
              left: `${progress}%`,
              display: progress > 0 && progress < 100 ? 'block' : 'none' 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestLoadingScreen;