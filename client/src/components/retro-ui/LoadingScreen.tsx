import React, { useEffect, useState } from 'react';
// Import the loading image
import questsLoadingImage from '../../assets/quests_loading.png';

interface LoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onComplete, 
  duration = 3000 
}) => {
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // Handle progress bar animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Calculate progress as a percentage of elapsed time
        const newProgress = prev + (100 / (duration / 100));
        return Math.min(newProgress, 100);
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [duration]);

  // Handle fade in
  useEffect(() => {
    setTimeout(() => {
      setOpacity(1);
    }, 100);
  }, []);

  // Handle duration and completion
  useEffect(() => {
    // Start fade out before the duration is complete
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 500);

    // Execute onComplete at the end of duration
    const completeTimer = setTimeout(() => {
      if (onComplete && typeof onComplete === 'function') {
        onComplete();
      }
    }, duration);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90
        ${fadeOut ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
    >
      <div className="max-w-md relative">
        <img 
          src={questsLoadingImage} 
          alt="Loading Quests" 
          className="w-full h-auto"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Progress bar */}
        <div className="absolute bottom-4 left-0 right-0 mx-auto w-4/5">
          <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden border border-amber-600">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;