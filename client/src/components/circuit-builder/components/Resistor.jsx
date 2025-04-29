import { useRef } from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from './CircuitPin';

// Import Resistor image directly
import resistorImg from '@assets/resistor.icon.png';

/**
 * Resistor Component
 * 
 * An electronic resistor component with:
 * - Two connection pins for circuit integration
 * - Configurable resistance value
 * - Visual representation that matches standard electronic symbols
 */
const Resistor = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  value = '220Ω' // Default resistance value
}) => {
  const componentRef = useRef(null);
  
  // Component dimensions
  const width = 80;
  const height = 40;
  
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
      type="Resistor"
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
        {/* Resistor body */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <img 
            src={resistorImg} 
            alt="Resistor" 
            className="max-w-full max-h-full object-contain"
            style={{ pointerEvents: 'none' }}
          />
        </div>
        
        {/* Resistance value display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs font-mono bg-white bg-opacity-70 px-1 rounded">
            {value}
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
            color="#8866cc" // Purple for resistor pins
            size={6}
          />
        ))}
      </div>
    </BaseComponent>
  );
};

export default Resistor;