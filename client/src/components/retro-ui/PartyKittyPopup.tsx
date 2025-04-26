import React, { useEffect, useState } from 'react';
import partyKittyPath from '@assets/partykitty.png';

interface PartyKittyPopupProps {
  onClose: () => void;
  position: {
    x: number;
    y: number;
  };
}

const PartyKittyPopup: React.FC<PartyKittyPopupProps> = ({ onClose, position }) => {
  // Random rotation between -15 and 15 degrees
  const rotation = Math.random() * 30 - 15;
  
  // Random size between 200 and 300px
  const size = Math.random() * 100 + 200;
  
  useEffect(() => {
    // Auto-close after a random time between 4 and 8 seconds
    const timeout = setTimeout(() => {
      onClose();
    }, Math.random() * 4000 + 4000);
    
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div 
      className="fixed z-50 shadow-lg cursor-pointer"
      onClick={onClose}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <div className="bg-white p-2 rounded-lg border-2 border-pink-500 overflow-hidden">
        <img 
          src={partyKittyPath} 
          alt="Party Kitty" 
          className="pointer-events-none"
          style={{ width: `${size}px`, height: `${size}px`, objectFit: 'cover' }}
        />
        <div className="text-center font-bold text-pink-500 mt-1">PARTY KITTY!!!</div>
      </div>
    </div>
  );
};

export default PartyKittyPopup;