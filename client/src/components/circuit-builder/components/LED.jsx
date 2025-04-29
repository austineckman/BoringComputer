import { useState, useRef } from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from './CircuitPin';

// Import LED image directly
import ledImg from '@assets/led.icon.png';

/**
 * LED Component
 * 
 * An electronic LED component with:
 * - Anode (+) input pin
 * - Cathode (-) output pin
 * - Visual feedback when powered
 * - Accurate pin positioning for consistent connections
 */
const LED = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  color = 'red'
}) => {
  const componentRef = useRef(null);
  const [powered, setPowered] = useState(false);
  
  // Component dimensions - matches the image aspect ratio
  const width = 50;
  const height = 70;
  
  // Handle receiving power
  const updatePowerState = (isOn) => {
    setPowered(isOn);
  };
  
  // Pin positions with specific coordinates that match the LED image
  const pins = [
    // Anode at top
    { 
      id: `${id}-anode`, 
      label: 'Anode (+)', 
      pinType: 'input',
      x: width / 2,
      y: 5 // Position at top of LED
    },
    // Cathode at bottom
    { 
      id: `${id}-cathode`, 
      label: 'Cathode (-)', 
      pinType: 'output',
      x: width / 2,
      y: height - 5 // Position at bottom of LED
    }
  ];
  
  return (
    <BaseComponent
      id={id}
      type="LED"
      initialX={initialX}
      initialY={initialY}
      initialRotation={initialRotation}
      width={width}
      height={height}
      onSelect={onSelect}
      isSelected={isSelected}
      canvasRef={canvasRef}
    >
      <div
        ref={componentRef}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* LED body */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <img 
            src={ledImg} 
            alt="LED" 
            className="max-w-full max-h-full object-contain"
            style={{
              filter: powered ? `drop-shadow(0 0 8px ${color}) brightness(1.2)` : 'none',
              transition: 'filter 0.1s ease',
              pointerEvents: 'none'
            }}
          />
        </div>
        
        {/* Pins */}
        {pins.map(pin => (
          <CircuitPin
            key={pin.id}
            id={pin.id}
            parentId={id}
            pinType={pin.pinType}
            label={pin.label}
            position={pin}
            parentRef={componentRef}
            onPinClick={onPinConnect}
            color={pin.pinType === 'input' ? '#ff5252' : '#333'} // Red for anode, dark for cathode
            size={6} // Smaller pin size for LED component
          />
        ))}
      </div>
    </BaseComponent>
  );
};

export default LED;