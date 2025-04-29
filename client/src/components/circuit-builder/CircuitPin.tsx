import React from 'react';

export interface PinPosition {
  x: number;
  y: number;
  id: string; // Format: "component-id-pin-name"
}

interface CircuitPinProps {
  id: string;
  x: number;
  y: number;
  color?: string;
  radius?: number;
  label?: string;
  isConnected?: boolean;
  onPinClick: (id: string) => void;
}

const CircuitPin: React.FC<CircuitPinProps> = ({
  id,
  x,
  y,
  color = '#ffc107',
  radius = 4,
  label,
  isConnected = false,
  onPinClick
}) => {
  return (
    <div 
      className="absolute cursor-pointer group"
      style={{ 
        left: `${x - radius}px`, 
        top: `${y - radius}px`,
        zIndex: 20
      }}
      onClick={() => onPinClick(id)}
    >
      <div 
        className={`
          rounded-full transition-all duration-200 
          ${isConnected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-yellow-400'}
        `}
        style={{ 
          width: `${radius * 2}px`, 
          height: `${radius * 2}px`, 
          backgroundColor: color
        }}
      />
      
      {label && (
        <div 
          className="absolute whitespace-nowrap text-[8px] font-mono opacity-0 group-hover:opacity-100 bg-gray-800 text-white px-1 py-0.5 rounded"
          style={{ 
            bottom: `${radius * 2 + 2}px`, 
            left: '50%', 
            transform: 'translateX(-50%)',
            transition: 'opacity 0.2s ease'
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default CircuitPin;