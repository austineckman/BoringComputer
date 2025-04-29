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
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Use real RGB LED image */}
        <img
          src="/assets/components/rgb-led.icon.png"
          alt="RGB LED Component"
          className="w-full h-full object-contain"
          style={{
            filter: (ledRed > 0.1 || ledGreen > 0.1 || ledBlue > 0.1) ? 
              `drop-shadow(0 0 5px ${rgbColor})` : 'none',
          }}
        />
        
        {/* Add colored overlay when LED is on */}
        {(ledRed > 0.1 || ledGreen > 0.1 || ledBlue > 0.1) && (
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              backgroundColor: rgbColor,
              opacity: (ledRed + ledGreen + ledBlue) * brightnessScale * 0.2,
              mixBlendMode: 'screen',
            }}
          />
        )}
        
        {/* RGB labels */}
        <div className="absolute bottom-1 left-2 text-xs text-red-500" style={{ fontSize: '7px' }}>R</div>
        <div className="absolute bottom-1 left-3 text-xs text-green-500" style={{ fontSize: '7px' }}>G</div>
        <div className="absolute bottom-1 right-3 text-xs text-blue-500" style={{ fontSize: '7px' }}>B</div>
        <div className="absolute bottom-1 right-2 text-xs text-gray-500" style={{ fontSize: '7px' }}>C</div>
      </div>

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