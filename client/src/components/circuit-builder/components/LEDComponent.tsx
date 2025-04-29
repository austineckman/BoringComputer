import React from 'react';
import BaseComponent from '../components/BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';

const LEDComponent: React.FC<ComponentProps> = ({
  componentData,
  onPinClicked,
  isActive,
  handleMouseDown,
  handleDeleteComponent
}) => {
  const { id, attrs } = componentData;
  const { rotate, top, left, color = 'red', brightness = 100 } = attrs;
  
  // Calculate pin positions based on rotation
  const pinPositions = {
    0: { // Default orientation (LED pointing up)
      pin1: { x: 0, y: -20 }, // Top pin (anode)
      pin2: { x: 0, y: 20 },  // Bottom pin (cathode)
    },
    90: { // Rotated 90 degrees clockwise
      pin1: { x: 20, y: 0 },  // Right pin
      pin2: { x: -20, y: 0 }, // Left pin
    },
    180: { // Rotated 180 degrees
      pin1: { x: 0, y: 20 },  // Bottom pin
      pin2: { x: 0, y: -20 }, // Top pin
    },
    270: { // Rotated 270 degrees
      pin1: { x: -20, y: 0 }, // Left pin
      pin2: { x: 20, y: 0 },  // Right pin
    }
  };
  
  // Get current rotation's pin positions
  const currentPins = pinPositions[rotate as keyof typeof pinPositions] || pinPositions[0];
  
  // Calculate brightness opacity (0.2 to 1.0)
  const ledOpacity = 0.2 + (brightness / 100) * 0.8;
  
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
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        {/* LED Body */}
        <circle cx="20" cy="20" r="10" fill="#333" />
        <circle 
          cx="20" 
          cy="20" 
          r="8" 
          fill={color} 
          opacity={ledOpacity} 
        />
        <circle 
          cx="20" 
          cy="20" 
          r="3" 
          fill="#fff" 
          opacity={ledOpacity * 0.8} 
        />
        
        {/* Leads */}
        <line 
          x1="20" 
          y1="10" 
          x2="20" 
          y2="0" 
          stroke="#ccc" 
          strokeWidth="2" 
        />
        <line 
          x1="20" 
          y1="30" 
          x2="20" 
          y2="40" 
          stroke="#ccc" 
          strokeWidth="2" 
        />
        
        {/* Polarity indicator (flat side on cathode) */}
        <path 
          d="M15,30 H25" 
          stroke="#333" 
          strokeWidth="1.5" 
        />
      </svg>

      {/* Pin connections */}
      <CircuitPin
        id={`${id}-pin1`}
        x={20 + currentPins.pin1.x}
        y={20 + currentPins.pin1.y}
        onClick={() => onPinClicked(`${id}-pin1`)}
      />
      <CircuitPin
        id={`${id}-pin2`}
        x={20 + currentPins.pin2.x}
        y={20 + currentPins.pin2.y}
        onClick={() => onPinClicked(`${id}-pin2`)}
      />
    </BaseComponent>
  );
};

export default LEDComponent;