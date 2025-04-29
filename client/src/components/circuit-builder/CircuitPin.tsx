import React from 'react';

// Pin position interface for wire connections
export interface PinPosition {
  id: string;
  x: number;
  y: number;
}

export interface CircuitPinProps {
  id: string;
  x: number;
  y: number;
  onClick: (id: string) => void;
  color?: string;
  size?: number;
  isConnected?: boolean;
  label?: string; // Make label optional
}

const CircuitPin: React.FC<CircuitPinProps> = ({
  id,
  x,
  y,
  onClick,
  color = '#ffcc00',
  size = 6,
  isConnected = false,
  label
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(id);
  };

  return (
    <div
      id={id}
      className="absolute cursor-pointer hover:ring-2 hover:ring-white hover:ring-opacity-70 rounded-full transition-all"
      style={{
        left: `${x - size/2}px`,
        top: `${y - size/2}px`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex: 20
      }}
      onClick={handleClick}
      title={label} // Show label as tooltip
    >
      <div
        className="w-full h-full rounded-full transition-all"
        style={{
          backgroundColor: color,
          border: isConnected ? '1px solid white' : 'none',
          boxShadow: isConnected ? `0 0 3px ${color}` : 'none'
        }}
      ></div>
      {/* Optional label display */}
      {label && (
        <div 
          className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 pointer-events-none"
          style={{ fontSize: '8px', whiteSpace: 'nowrap' }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default CircuitPin;