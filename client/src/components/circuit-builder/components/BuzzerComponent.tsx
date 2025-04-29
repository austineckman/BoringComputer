import React from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';

const BuzzerComponent: React.FC<ComponentProps> = ({
  componentData,
  onPinClicked,
  isActive,
  handleMouseDown,
  handleDeleteComponent
}) => {
  const { id, attrs } = componentData;
  const { rotate = 0, top, left, hasSignal = false } = attrs;
  
  // Calculate pin positions based on rotation
  const pinPositions = {
    0: { // Default horizontal orientation
      pin1: { x: -15, y: 0 }, // Left pin (positive)
      pin2: { x: 15, y: 0 },  // Right pin (negative)
    },
    90: { // Vertical orientation
      pin1: { x: 0, y: -15 }, // Top pin (positive)
      pin2: { x: 0, y: 15 },  // Bottom pin (negative)
    },
    180: { // Horizontal flipped
      pin1: { x: 15, y: 0 },  // Right pin (positive)
      pin2: { x: -15, y: 0 }, // Left pin (negative)
    },
    270: { // Vertical flipped
      pin1: { x: 0, y: 15 },  // Bottom pin (positive)
      pin2: { x: 0, y: -15 }, // Top pin (negative)
    }
  };
  
  // Get current rotation's pin positions
  const currentPins = pinPositions[rotate as keyof typeof pinPositions] || pinPositions[0];
  
  // Animation for the active buzzer
  const [animationState, setAnimationState] = React.useState(0);
  
  React.useEffect(() => {
    if (hasSignal) {
      const interval = setInterval(() => {
        setAnimationState(state => (state + 1) % 4);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setAnimationState(0);
    }
  }, [hasSignal]);
  
  // Visualization for sound waves
  const getSoundWavePath = () => {
    if (!hasSignal) return null;
    
    const waves = [];
    const baseRadius = 8 + animationState * 2;
    
    for (let i = 0; i < 3; i++) {
      const radius = baseRadius + i * 5;
      const opacity = 1 - (i * 0.25 + animationState * 0.1);
      waves.push(
        <circle 
          key={`wave-${i}`}
          cx="0" 
          cy="0" 
          r={radius} 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="1" 
          strokeDasharray="3,2"
          opacity={opacity}
        />
      );
    }
    
    return waves;
  };
  
  return (
    <BaseComponent
      id={id}
      left={left}
      top={top}
      rotate={rotate}
      width={40}
      height={40}
      isActive={isActive}
      handleMouseDown={handleMouseDown}
      handleDelete={() => handleDeleteComponent(id)}
    >
      <svg width="40" height="40" viewBox="-20 -20 40 40" xmlns="http://www.w3.org/2000/svg">
        {/* Buzzer body */}
        <circle cx="0" cy="0" r="10" fill="#333" stroke="#222" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="8" fill="#222" />
        <circle cx="0" cy="0" r="6" fill={hasSignal ? "#444" : "#333"} />
        <circle cx="0" cy="0" r="2" fill={hasSignal ? "#666" : "#444"} />
        
        {/* Sound hole pattern */}
        <path 
          d="M0,0 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0" 
          fill="none" 
          stroke="#555" 
          strokeWidth="0.5"
          strokeDasharray="2,2" 
        />
        
        {/* Sound waves animation */}
        {getSoundWavePath()}
        
        {/* Leads */}
        <line x1="-15" y1="0" x2="-10" y2="0" stroke="#999" strokeWidth="1.5" />
        <line x1="10" y1="0" x2="15" y2="0" stroke="#999" strokeWidth="1.5" />
        
        {/* Polarity indicator (positive) */}
        <circle cx="-12" cy="3" r="1" fill="#999" />
        <text x="-12" y="2" fontSize="3" textAnchor="middle" fill="#999">+</text>
      </svg>
      
      {/* Connection pins */}
      <CircuitPin
        id={`${id}-pin1`}
        x={20 + currentPins.pin1.x}
        y={20 + currentPins.pin1.y}
        onClick={() => onPinClicked(`${id}-pin1`)}
        color="#ff6666"  // red for positive terminal
      />
      <CircuitPin
        id={`${id}-pin2`}
        x={20 + currentPins.pin2.x}
        y={20 + currentPins.pin2.y}
        onClick={() => onPinClicked(`${id}-pin2`)}
        color="#aaaaaa"  // gray for negative terminal
      />
    </BaseComponent>
  );
};

export default BuzzerComponent;