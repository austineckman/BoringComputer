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

  // Handle pin clicks with appropriate data
  const handlePinClick = (pinId, pinType, parentId, position) => {
    // Extract the pin name from the ID
    const pinName = pinId.split('-').pop();
    
    let dataObj = {};
    
    // Create the appropriate pin data object based on the pin name
    if (pinName === 'red') {
      dataObj = { name: 'R', x: -12, y: 31, signals: [] };
    } else if (pinName === 'green') {
      dataObj = { name: 'G', x: 7.2, y: 31, signals: [] };
    } else if (pinName === 'blue') {
      dataObj = { name: 'B', x: 17, y: 31, signals: [] };
    } else if (pinName === 'common') {
      dataObj = { name: 'COM', x: -1.5, y: 38, signals: [] };
    }
    
    // Create enhanced event detail with pin-specific data
    const enhancedDetail = {
      id: pinId,
      pinId: pinId,
      pinName: pinName,
      pinType: pinType,
      parentId: parentId,
      parentComponentId: parentId,
      data: JSON.stringify(dataObj), // Include pin data for proper identification
      clientX: position.x,
      clientY: position.y,
      pinPosition: position
    };
    
    // Log the details for debugging
    console.log(`RgbLed pin clicked: ${pinName}`, enhancedDetail);
    
    // Call the original onPinConnect with enhanced data
    if (onPinConnect) {
      onPinConnect(pinId, pinType, parentId, position, enhancedDetail);
    }
  };
  
  // Pin positions with specific coordinates
  const pins = [
    // Common pin (COM) at bottom
    { 
      id: `${id}-common`, 
      name: 'COM',
      label: commonType === 'anode' ? 'Common Anode (+)' : 'Common Cathode (-)', 
      pinType: commonType === 'anode' ? 'power' : 'ground',
      x: width / 2,
      y: height - 5
    },
    // Red pin (R) at left
    { 
      id: `${id}-red`, 
      name: 'R',
      label: 'Red', 
      pinType: commonType === 'anode' ? 'output' : 'input',
      x: 5,
      y: height / 2
    },
    // Green pin (G) at top
    { 
      id: `${id}-green`, 
      name: 'G',
      label: 'Green', 
      pinType: commonType === 'anode' ? 'output' : 'input',
      x: width / 2,
      y: 5
    },
    // Blue pin (B) at right
    { 
      id: `${id}-blue`, 
      name: 'B',
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
            pinName={pin.name}
            label={pin.label}
            position={pin}
            parentRef={componentRef}
            onPinClick={(pinId, pinType, parentId, position) => 
              handlePinClick(pinId, pinType, parentId, position)
            }
            color={
              pin.id.includes('red') ? '#ff5252' : 
              pin.id.includes('green') ? '#4caf50' : 
              pin.id.includes('blue') ? '#2196f3' : 
              '#aaa'
            }
            size={6}
            // Add data attributes for better DOM querying
            dataAttributes={{
              'data-pin-name': pin.name,
              'data-pin-type': pin.pinType
            }}
          />
        ))}
      </div>
    </BaseComponent>
  );
};

export default RgbLed;