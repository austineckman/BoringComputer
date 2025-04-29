import { useRef } from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from './CircuitPin';

// Import Photoresistor image directly
import photoresistorImg from '@assets/photoresistor.icon.png';

/**
 * Photoresistor Component
 * 
 * A light-sensitive resistor (LDR) with:
 * - Two connection pins
 * - Variable resistance based on light intensity
 * - Works with analog input pins
 */
const Photoresistor = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  lightLevel = 50 // Default light level (0-100)
}) => {
  const componentRef = useRef(null);
  
  // Component dimensions
  const width = 80;
  const height = 40;
  
  // Calculate resistance based on light level (simplified for simulation)
  // Lower light = higher resistance
  const resistance = Math.round((100 - lightLevel) * 10); // 0-1000 Ohms
  
  // Pin positions with specific coordinates
  const pins = [
    // Left pin
    { 
      id: `${id}-pin1`, 
      label: 'Pin 1', 
      pinType: 'bidirectional',
      x: 5,
      y: height / 2
    },
    // Right pin
    { 
      id: `${id}-pin2`, 
      label: 'Pin 2', 
      pinType: 'bidirectional',
      x: width - 5,
      y: height / 2
    }
  ];
  
  return (
    <BaseComponent
      id={id}
      type="Photoresistor"
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
        {/* Photoresistor body */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <img 
            src={photoresistorImg} 
            alt="Photoresistor" 
            className="max-w-full max-h-full object-contain"
            style={{ pointerEvents: 'none' }}
          />
        </div>
        
        {/* Resistance value display */}
        <div className="absolute bottom-0 inset-x-0 flex items-center justify-center">
          <div className="text-xs font-mono bg-white bg-opacity-70 px-1 rounded">
            {resistance}Ω
          </div>
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
            color="#4a9d5e" // Green for photoresistor pins
            size={6}
          />
        ))}
      </div>
    </BaseComponent>
  );
};

export default Photoresistor;