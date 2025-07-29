/**
 * SimulatedLED.tsx - LED component that responds to real Arduino simulation
 * 
 * This component integrates with the AVR8JS simulator to show realistic LED behavior
 * based on actual Arduino code execution.
 */

import React, { useState, useEffect, useRef } from 'react';

interface SimulatedLEDProps {
  id: string;
  x: number;
  y: number;
  arduinoPin: number;
  color?: string;
  onConnectionChange?: (componentId: string, pin: number, callback: (isHigh: boolean) => void) => void;
  onDisconnect?: (componentId: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

export const SimulatedLED: React.FC<SimulatedLEDProps> = ({
  id,
  x,
  y,
  arduinoPin,
  color = '#ff0000',
  onConnectionChange,
  onDisconnect,
  selected = false,
  onSelect
}) => {
  const [isOn, setIsOn] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const mountedRef = useRef(true);

  // Handle pin state changes from the simulator
  const handlePinChange = (isHigh: boolean) => {
    if (mountedRef.current) {
      setIsOn(isHigh);
      setIntensity(isHigh ? 1.0 : 0.0);
      console.log(`LED ${id} on pin ${arduinoPin}: ${isHigh ? 'ON' : 'OFF'}`);
    }
  };

  // Register with the simulator when component mounts
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(id, arduinoPin, handlePinChange);
    }

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (onDisconnect) {
        onDisconnect(id);
      }
    };
  }, [id, arduinoPin, onConnectionChange, onDisconnect]);

  // Handle component selection
  const handleClick = () => {
    if (onSelect) {
      onSelect(id);
    }
  };

  // Calculate LED appearance based on state
  const getLEDStyle = () => {
    const brightness = isOn ? 1.0 : 0.2;
    const glowIntensity = isOn ? 0.8 : 0;
    
    return {
      fill: color,
      opacity: brightness,
      filter: isOn ? `drop-shadow(0 0 6px ${color})` : 'none',
      transition: 'all 0.1s ease-out'
    };
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        cursor: 'pointer',
        transform: 'translate(-50%, -50%)'
      }}
      onClick={handleClick}
    >
      {/* LED component as SVG */}
      <svg width="40" height="60" viewBox="0 0 40 60">
        {/* LED body */}
        <rect
          x="10"
          y="20"
          width="20"
          height="30"
          rx="10"
          ry="10"
          fill="#333"
          stroke={selected ? '#00ff00' : '#666'}
          strokeWidth={selected ? 2 : 1}
        />
        
        {/* LED dome */}
        <circle
          cx="20"
          cy="25"
          r="8"
          style={getLEDStyle()}
        />
        
        {/* LED legs */}
        <rect x="8" y="48" width="2" height="8" fill="#888" />
        <rect x="30" y="48" width="2" height="8" fill="#888" />
        
        {/* Pin labels */}
        <text x="5" y="58" fontSize="8" fill="#666">+</text>
        <text x="32" y="58" fontSize="8" fill="#666">-</text>
        
        {/* Arduino pin label */}
        <text 
          x="20" 
          y="15" 
          fontSize="10" 
          fill="#fff" 
          textAnchor="middle"
          fontFamily="monospace"
        >
          {arduinoPin}
        </text>
      </svg>
      
      {/* Status indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: isOn ? '#00ff00' : '#666',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '2px 6px',
            borderRadius: '3px'
          }}
        >
          {isOn ? 'HIGH' : 'LOW'}
        </div>
      )}
    </div>
  );
};

export default SimulatedLED;