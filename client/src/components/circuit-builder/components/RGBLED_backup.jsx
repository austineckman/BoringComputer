import { useState, useRef } from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from './CircuitPin';

// Import RGB LED image directly
import rgbLedImg from '@assets/rgb-led.icon.png';

/**
 * RGB LED Component
 * 
 * A multi-color RGB LED with:
 * - Common anode/cathode pin
 * - Three color input pins (R, G, B)
 * - Visual feedback showing combined color
 */
const RgbLed = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  commonType = 'cathode' // 'anode' or 'cathode'
}) => {
  const componentRef = useRef(null);
  const [redValue, setRedValue] = useState(0);
  const [greenValue, setGreenValue] = useState(0);
  const [blueValue, setBlueValue] = useState(0);
  const [powered, setPowered] = useState(false);
  
  // Component dimensions
  const width = 70;
  const height = 70;
  
  // Combined RGB color for the LED
  const combinedColor = `rgb(${redValue}, ${greenValue}, ${blueValue})`;
  
  // Pin positions with specific coordinates
  const pins = [
    // Common pin at bottom
    { 
      id: `${id}-common`, 
      label: commonType === 'anode' ? 'Common Anode (+)' : 'Common Cathode (-)', 
      pinType: commonType === 'anode' ? 'input' : 'output',
      x: width / 2,
      y: height - 5
    },
    // Red pin at left
    { 
      id: `${id}-red`, 
      label: 'Red', 
      pinType: commonType === 'anode' ? 'output' : 'input',
      x: 5,
      y: height / 2
    },
    // Green pin at top
    { 
      id: `${id}-green`, 
      label: 'Green', 
      pinType: commonType === 'anode' ? 'output' : 'input',
      x: width / 2,
      y: 5
    },
    // Blue pin at right
    { 
      id: `${id}-blue`, 
      label: 'Blue', 
      pinType: commonType === 'anode' ? 'output' : 'input',
      x: width - 5,
      y: height / 2
    }
  ];
  
  return (
    <BaseComponent
      id={id}
      type="RGB LED"
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
        {/* RGB LED body */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <img 
            src={rgbLedImg} 
            alt="RGB LED" 
            className="max-w-full max-h-full object-contain"
            style={{ 
              pointerEvents: 'none',
              filter: powered ? `drop-shadow(0 0 8px ${combinedColor}) brightness(1.2)` : 'none',
              transition: 'filter 0.1s ease'
            }}
          />
        </div>
        
        {/* Current color display */}
        {powered && (
          <div 
            className="absolute w-6 h-6 rounded-full" 
            style={{ 
              backgroundColor: combinedColor,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 10px ${combinedColor}`,
              opacity: 0.7
            }}
          />
        )}
        
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
            color={
              pin.id.includes('red') ? '#ff5252' : 
              pin.id.includes('green') ? '#4caf50' : 
              pin.id.includes('blue') ? '#2196f3' : 
              '#aaa'
            }
            size={6}
          />
        ))}
      </div>
    </BaseComponent>
  );
};

export default RgbLed;