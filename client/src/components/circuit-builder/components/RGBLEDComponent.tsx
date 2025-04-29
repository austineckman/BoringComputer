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
        {/* Define gradients and filters for glows */}
        <defs>
          <radialGradient id={`rgb-glow-${id}`} cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop offset="0%" stopColor={rgbColor} stopOpacity={glowOpacity * 1.5} />
            <stop offset="40%" stopColor={rgbColor} stopOpacity={glowOpacity} />
            <stop offset="80%" stopColor={rgbColor} stopOpacity={glowOpacity * 0.3} />
            <stop offset="100%" stopColor={rgbColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* LED Package - 5mm diffused style */}
        <circle cx="30" cy="30" r="15" fill="#e0e0e0" opacity="0.3" />
        <circle cx="30" cy="30" r="12" fill="#f8f8f8" opacity="0.7" />
        
        {/* LED Body - the plastic housing */}
        <circle cx="30" cy="30" r="10" fill="#eaeaea" stroke="#d8d8d8" strokeWidth="0.5" />
        
        {/* Internal RGB die */}
        <circle 
          cx="30" 
          cy="30" 
          r="8" 
          fill="#222"
        />
        
        {/* RGB internal elements - visible when not illuminated */}
        <circle cx="27" cy="27" r="2" fill="#331111" stroke="#440000" strokeWidth="0.3" opacity="0.7" />
        <circle cx="33" cy="27" r="2" fill="#113311" stroke="#004400" strokeWidth="0.3" opacity="0.7" />
        <circle cx="30" cy="33" r="2" fill="#111133" stroke="#000044" strokeWidth="0.3" opacity="0.7" />
        
        {/* RGB color sections when illuminated */}
        <circle
          cx="27" 
          cy="27" 
          r="2.5"
          fill="#ff0000"
          opacity={ledRed * brightnessScale * 0.8}
        />
        <circle
          cx="33" 
          cy="27" 
          r="2.5"
          fill="#00ff00"
          opacity={ledGreen * brightnessScale * 0.8}
        />
        <circle
          cx="30" 
          cy="33" 
          r="2.5"
          fill="#0000ff"
          opacity={ledBlue * brightnessScale * 0.8}
        />
        
        {/* Combined RGB glow effect */}
        {(ledRed > 0.1 || ledGreen > 0.1 || ledBlue > 0.1) && (
          <circle
            cx="30" 
            cy="30" 
            r="20" 
            fill={`url(#rgb-glow-${id})`}
          />
        )}
        
        {/* Light refraction on plastic case */}
        <ellipse
          cx="27" 
          cy="27" 
          rx="4" 
          ry="2"
          fill="#ffffff"
          opacity="0.25"
          transform="rotate(-15 27 27)"
        />
        
        {/* Package base */}
        <rect x="20" y="40" width="20" height="3" rx="1" fill="#222" />
        
        {/* Leads - four pins in common cathode/anode configuration */}
        <line x1="22" y1="43" x2="22" y2="55" stroke="#aaa" strokeWidth="1" />
        <line x1="26" y1="43" x2="26" y2="55" stroke="#aaa" strokeWidth="1" />
        <line x1="34" y1="43" x2="34" y2="55" stroke="#aaa" strokeWidth="1" />
        <line x1="38" y1="43" x2="38" y2="55" stroke="#aaa" strokeWidth="1" />
        
        {/* RGB pin labels */}
        <text x="22" y="52" fill="#f33" fontSize="4" textAnchor="middle">R</text>
        <text x="26" y="52" fill="#3f3" fontSize="4" textAnchor="middle">G</text>
        <text x="34" y="52" fill="#33f" fontSize="4" textAnchor="middle">B</text>
        <text x="38" y="52" fill="#ccc" fontSize="4" textAnchor="middle">C</text>
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