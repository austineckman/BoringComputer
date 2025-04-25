import React, { useEffect, useState } from 'react';
// Import the loading image
import questsLoadingImage from '../../assets/quests_loading.png';

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onComplete, 
  duration = 3000 
}) => {
  const [dots, setDots] = useState('.');
  const [opacity, setOpacity] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // Handle loading dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

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
      onComplete();
    }, duration);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90
        ${fadeOut ? 'opacity-0' : `opacity-${opacity}`} transition-opacity duration-500`}
    >
      <div className="max-w-md relative">
        <img 
          src={questsLoadingImage} 
          alt="Loading Quests" 
          className="w-full h-auto"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="absolute bottom-10 left-0 right-0 text-center text-amber-500 text-2xl font-bold">
          LOADING{dots}
        </div>
      </div>
      
      <div className="mt-8 text-amber-500 text-sm font-mono animate-pulse">
        Booting Quests Engine v1.0.4
      </div>
    </div>
  );
};

export default LoadingScreen;