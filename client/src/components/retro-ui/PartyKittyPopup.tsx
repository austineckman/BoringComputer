import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import partyKittyImage from '@assets/partykitty.png';

interface PartyKittyPopupProps {
  onClose: () => void;
  position: {
    x: number;
    y: number;
  };
}

const PartyKittyPopup: React.FC<PartyKittyPopupProps> = ({ onClose, position }) => {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [popupPosition, setPopupPosition] = useState(position);
  const [rotation, setRotation] = useState(0);

  // Random rotation on mount for fun effect
  useEffect(() => {
    setRotation(Math.random() * 20 - 10);
  }, []);

  // Party effect - random small movements
  useEffect(() => {
    const interval = setInterval(() => {
      // Small random movement to simulate bouncing/dancing
      setPopupPosition(prev => ({
        x: prev.x + (Math.random() * 6 - 3),
        y: prev.y + (Math.random() * 6 - 3),
      }));
      
      // Small random rotation changes
      setRotation(prev => prev + (Math.random() * 4 - 2));
    }, 300);
    
    return () => clearInterval(interval);
  }, []);

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isMoving) {
        setPopupPosition({
          x: e.clientX - offsetX,
          y: e.clientY - offsetY,
        });
      }
    };

    const handleMouseUp = () => {
      setIsMoving(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMoving, offsetX, offsetY]);

  const startMoving = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMoving(true);
    setOffsetX(e.clientX - popupPosition.x);
    setOffsetY(e.clientY - popupPosition.y);
  };

  return (
    <div 
      className="absolute bg-black border border-yellow-400 rounded-md overflow-hidden shadow-lg z-50"
      style={{ 
        width: 300, 
        height: 280, 
        left: `${popupPosition.x}px`, 
        top: `${popupPosition.y}px`, 
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.2s ease'
      }}
    >
      {/* Window bar */}
      <div 
        className="bg-gradient-to-r from-yellow-500 to-yellow-400 px-2 py-1 flex justify-between items-center cursor-move"
        onMouseDown={startMoving}
      >
        <div className="text-black font-bold text-sm">PARTY KITTY!</div>
        <button 
          className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
          onClick={onClose}
        >
          <X className="text-white w-3 h-3" />
        </button>
      </div>
      
      {/* Party Kitty Image */}
      <div className="flex flex-col items-center justify-center p-2 h-[calc(100%-50px)]">
        <img 
          src={partyKittyImage}
          alt="Party Kitty" 
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="text-yellow-400 text-center mt-2 text-sm font-bold">
          🎉 PARTY TIME! 🎉
        </div>
      </div>
    </div>
  );
};

export default PartyKittyPopup;