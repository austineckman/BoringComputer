import React from 'react';
import BaseComponent from '../components/BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';

const RGBLEDComponent: React.FC<ComponentProps> = ({
  componentData,
  onPinClicked,
  isActive,
  handleMouseDown,
  handleDeleteComponent
}) => {
  const { id, attrs } = componentData;
  const {
    rotate = 0,
    top,
    left,
    ledRed = 0.5,
    ledGreen = 0.5,
    ledBlue = 0.5,
    brightness = 100
  } = attrs;
  
  // Calculate pin positions based on rotation
  const pinPositions = {
    0: { // Default orientation (LED pointing up)
      r: { x: -10, y: -20 },  // Red pin
      g: { x: 0, y: -20 },    // Green pin
      b: { x: 10, y: -20 },   // Blue pin
      c: { x: 0, y: 20 },     // Common pin
    },
    90: { // Rotated 90 degrees clockwise
      r: { x: 20, y: -10 },
      g: { x: 20, y: 0 },
      b: { x: 20, y: 10 },
      c: { x: -20, y: 0 },
    },
    180: { // Rotated 180 degrees
      r: { x: 10, y: 20 },
      g: { x: 0, y: 20 },
      b: { x: -10, y: 20 },
      c: { x: 0, y: -20 },
    },
    270: { // Rotated 270 degrees
      r: { x: -20, y: 10 },
      g: { x: -20, y: 0 },
      b: { x: -20, y: -10 },
      c: { x: 20, y: 0 },
    }
  };
  
  // Get current rotation's pin positions
  const currentPins = pinPositions[rotate as keyof typeof pinPositions] || pinPositions[0];
  
  // Calculate brightness factor (0.2 to 1.0)
  const brightnessScale = 0.2 + (brightness / 100) * 0.8;
  
  // Convert RGB values (0-1) to CSS color values
  const redComponent = Math.round(ledRed * 255 * brightnessScale);
  const greenComponent = Math.round(ledGreen * 255 * brightnessScale);
  const blueComponent = Math.round(ledBlue * 255 * brightnessScale);
  const rgbColor = `rgb(${redComponent}, ${greenComponent}, ${blueComponent})`;

  // Calculate glow effect based on brightness
  const glowRadius = Math.max(1, Math.round(brightness / 20)); // 1-5px
  const glowOpacity = Math.min(0.8, brightness / 120); // 0-0.8
  
  return (
    <BaseComponent
      id={id}
      left={left}
      top={top}
      rotate={rotate}
      width={60}
      height={60}
      isActive={isActive}
      handleMouseDown={handleMouseDown}
      handleDelete={() => handleDeleteComponent(id)}
    >
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        {/* LED Body */}
        <circle cx="30" cy="30" r="13" fill="#333" />
        
        {/* RGB LED main light */}
        <circle 
          cx="30" 
          cy="30" 
          r="10" 
          fill={rgbColor} 
          filter={`drop-shadow(0 0 ${glowRadius}px ${rgbColor})`}
          opacity={glowOpacity + 0.2} 
        />
        
        {/* RGB sections */}
        <path 
          d="M30,30 L30,20 A10,10 0 0,1 40,30 z"
          fill="#ff0000"
          opacity={ledRed * brightnessScale * 0.4}
        />
        <path 
          d="M30,30 L40,30 A10,10 0 0,1 30,40 z"
          fill="#00ff00"
          opacity={ledGreen * brightnessScale * 0.4}
        />
        <path 
          d="M30,30 L30,40 A10,10 0 0,1 20,30 z"
          fill="#0000ff"
          opacity={ledBlue * brightnessScale * 0.4}
        />
        
        {/* Center highlight */}
        <circle 
          cx="30" 
          cy="30" 
          r="4" 
          fill="#ffffff" 
          opacity={brightnessScale * 0.6} 
        />
        
        {/* Leads */}
        <line 
          x1="20" 
          y1="30" 
          x2="10" 
          y2="30" 
          stroke="#ccc" 
          strokeWidth="1.5" 
        />
        <line 
          x1="30" 
          y1="43" 
          x2="30" 
          y2="50" 
          stroke="#ccc" 
          strokeWidth="1.5" 
        />
        <line 
          x1="25" 
          y1="15" 
          x2="25" 
          y2="10" 
          stroke="#ccc" 
          strokeWidth="1.5" 
        />
        <line 
          x1="30" 
          y1="15" 
          x2="30" 
          y2="10" 
          stroke="#ccc" 
          strokeWidth="1.5" 
        />
        <line 
          x1="35" 
          y1="15" 
          x2="35" 
          y2="10" 
          stroke="#ccc" 
          strokeWidth="1.5" 
        />
        
        {/* RGB labels */}
        <text x="23" y="16" fill="#ff0000" fontSize="6" textAnchor="middle">R</text>
        <text x="30" y="16" fill="#00ff00" fontSize="6" textAnchor="middle">G</text>
        <text x="37" y="16" fill="#0000ff" fontSize="6" textAnchor="middle">B</text>
        <text x="30" y="45" fill="#ccc" fontSize="6" textAnchor="middle">C</text>
      </svg>

      {/* Connection pins */}
      <CircuitPin
        id={`${id}-pin-r`}
        x={30 + currentPins.r.x}
        y={30 + currentPins.r.y}
        onClick={() => onPinClicked(`${id}-pin-r`)}
        color="#ff6666"
      />
      <CircuitPin
        id={`${id}-pin-g`}
        x={30 + currentPins.g.x}
        y={30 + currentPins.g.y}
        onClick={() => onPinClicked(`${id}-pin-g`)}
        color="#66ff66"
      />
      <CircuitPin
        id={`${id}-pin-b`}
        x={30 + currentPins.b.x}
        y={30 + currentPins.b.y}
        onClick={() => onPinClicked(`${id}-pin-b`)}
        color="#6666ff"
      />
      <CircuitPin
        id={`${id}-pin-c`}
        x={30 + currentPins.c.x}
        y={30 + currentPins.c.y}
        onClick={() => onPinClicked(`${id}-pin-c`)}
        color="#aaaaaa"
      />
    </BaseComponent>
  );
};

export default RGBLEDComponent;