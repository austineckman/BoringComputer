import React, { useRef, useState, useEffect } from 'react';

/**
 * CircuitComponent represents a draggable electronic component with pins
 * on the circuit builder canvas
 * 
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the component
 * @param {string} props.type - Type of component (LED, resistor, etc.)
 * @param {string} props.image - URL to the component image
 * @param {number} props.x - Initial X position
 * @param {number} props.y - Initial Y position
 * @param {number} props.rotation - Initial rotation in degrees
 * @param {Array} props.pins - Array of pin configurations
 * @param {Function} props.onSelect - Callback when component is selected
 * @param {boolean} props.isSelected - Whether this component is currently selected
 * @param {Function} props.onPinConnect - Callback when a pin is clicked for connection
 * @param {RefObject} props.canvasRef - Reference to the parent canvas element
 * @param {number} props.width - Component width in pixels
 * @param {number} props.height - Component height in pixels
 */
const CircuitComponent = ({
  id,
  type,
  image,
  x,
  y,
  rotation = 0,
  pins = [],
  onSelect,
  isSelected,
  onPinConnect,
  canvasRef,
  width = 100,
  height = 100,
  onMove,
  onRotate
}) => {
  // State for component position and interaction
  const [position, setPosition] = useState({ x: x || 0, y: y || 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // No rotation tracking needed per user request
  
  // Refs
  const componentRef = useRef(null);
  
  // Handle click on component
  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(id);
    }
  };
  
  // Handle mouse down on component for dragging
  const handleMouseDown = (e) => {
    e.stopPropagation();
    if (e.button === 0) { // Left mouse button
      const rect = componentRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };
  
  // Handle pin click - FIXED for improved position stability
  const handlePinClick = (pinId, pinType, e) => {
    e.stopPropagation();
    
    if (onPinConnect) {
      // Calculate exact pin position
      const pinPosition = getPinPosition({ id: pinId });
      
      // Create pin ID with consistent format
      const formattedPinId = `pt-${type.toLowerCase().replace(/ /g, '')}-${id.replace(/ /g, '')}-${pinId}`;
      
      // Initialize the global pin position cache if it doesn't exist
      if (!window.pinPositionCache) {
        window.pinPositionCache = new Map();
      }
      
      // Store the exact pin position in the global cache with additional metadata
      const pinPositionData = {
        x: pinPosition.x,
        y: pinPosition.y,
        origComponentX: position.x,
        origComponentY: position.y,
        pinId: pinId,
        componentId: id,
        formattedId: formattedPinId,
        type: pinType
      };
      
      // Save to global cache for future reference
      window.pinPositionCache.set(formattedPinId, pinPositionData);
      
      // Create a detailed event with stable position data from our cache
      const clickEvent = new CustomEvent('pinClicked', {
        detail: {
          id: formattedPinId,
          pinId,
          componentId: id,
          pinType,
          clientX: pinPosition.x,
          clientY: pinPosition.y,
          componentType: type.toLowerCase(),
          // Include full position data to ensure consistency
          pinData: JSON.stringify(pinPositionData)
        },
        bubbles: true
      });
      
      // Dispatch the detailed event
      document.dispatchEvent(clickEvent);
      
      // Call the original callback with our stable position
      onPinConnect(pinId, pinType, id, pinPosition);
    }
  };
  
  // Handle context menu (right-click) - rotation removed per user request
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Calculate the position of pins with stable positioning
  const getPinPosition = (pinConfig) => {
    // Check if this pin already has a position in our stable cache
    const componentType = type.toLowerCase().replace(/ /g, '');
    const pinId = pinConfig.id;
    const formattedPinId = `pt-${componentType}-${id.replace(/ /g, '')}-${pinId}`;
    
    // Check for an existing stable position in the cache
    if (window.pinPositionCache && window.pinPositionCache.has(formattedPinId)) {
      const cachedPos = window.pinPositionCache.get(formattedPinId);
      
      // If component hasn't moved, use the cached position exactly
      if (cachedPos.origComponentX === position.x && cachedPos.origComponentY === position.y) {
        return {
          x: cachedPos.x,
          y: cachedPos.y
        };
      }
      
      // If component has moved, adjust the pin position by the same delta
      if (cachedPos.origComponentX !== undefined && cachedPos.origComponentY !== undefined) {
        const deltaX = position.x - cachedPos.origComponentX;
        const deltaY = position.y - cachedPos.origComponentY;
        
        return {
          x: cachedPos.x + deltaX,
          y: cachedPos.y + deltaY
        };
      }
    }
    
    // Otherwise calculate a new position based on the pin ID and component type
    const pinPosition = pinConfig.position || generatePinPosition(pinConfig.id, type.toLowerCase());
    
    // Calculate position without any rotation adjustment
    const newPosition = {
      x: position.x + pinPosition.x * width,
      y: position.y + pinPosition.y * height
    };
    
    // Store this position in our cache for future reference
    if (!window.pinPositionCache) {
      window.pinPositionCache = new Map();
    }
    
    window.pinPositionCache.set(formattedPinId, {
      x: newPosition.x,
      y: newPosition.y,
      origComponentX: position.x,
      origComponentY: position.y,
      component: id,
      pin: pinConfig.id
    });
    
    return newPosition;
  };
  
  // Generate a pin position based on its ID and component type
  const generatePinPosition = (pinId, componentType) => {
    // Default position (center)
    let x = 0.5; 
    let y = 0.5;
    
    // Convert component type to lowercase for easier matching
    componentType = componentType.toLowerCase();
    
    // LED component
    if (componentType === 'led') {
      if (pinId === 'anode') {
        x = 0.5; 
        y = 0.1;
      } else if (pinId === 'cathode') {
        x = 0.5; 
        y = 0.9;
      }
    }
    // Resistor component
    else if (componentType === 'resistor') {
      if (pinId === 'pin1') {
        x = 0.1; 
        y = 0.5;
      } else if (pinId === 'pin2') {
        x = 0.9; 
        y = 0.5;
      }
    }
    // RGB LED component
    else if (componentType === 'rgb led') {
      if (pinId === 'common') {
        x = 0.5; 
        y = 0.1;
      } else if (pinId === 'red') {
        x = 0.3; 
        y = 0.9;
      } else if (pinId === 'green') {
        x = 0.5; 
        y = 0.9;
      } else if (pinId === 'blue') {
        x = 0.7; 
        y = 0.9;
      }
    }
    // Photoresistor
    else if (componentType === 'photoresistor') {
      if (pinId === 'pin1') {
        x = 0.1; 
        y = 0.5;
      } else if (pinId === 'pin2') {
        x = 0.9; 
        y = 0.5;
      }
    }
    // OLED Display
    else if (componentType === 'oled display') {
      if (pinId === 'sda') {
        x = 0.3;
        y = 0.1;
      } else if (pinId === 'scl') {
        x = 0.5;
        y = 0.1;
      } else if (pinId === 'vcc') {
        x = 0.7;
        y = 0.1;
      } else if (pinId === 'gnd') {
        x = 0.9;
        y = 0.1;
      }
    }
    // 7-Segment Display
    else if (componentType === '7-segment display') {
      // Position pins along bottom edge
      const segments = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp', 'common'];
      const index = segments.indexOf(pinId);
      if (index >= 0) {
        x = 0.1 + (index * 0.1);
        y = 0.9;
      }
    }
    // Custom Keypad
    else if (componentType === 'custom keypad') {
      if (pinId.startsWith('row')) {
        // Position row pins along left edge
        const rowNum = parseInt(pinId.replace('row', ''), 10);
        x = 0.1;
        y = 0.2 + ((rowNum - 1) * 0.2);
      } else if (pinId.startsWith('col')) {
        // Position column pins along right edge
        const colNum = parseInt(pinId.replace('col', ''), 10);
        x = 0.9;
        y = 0.2 + ((colNum - 1) * 0.2);
      }
    }
    // Rotary Encoder
    else if (componentType === 'rotary encoder') {
      if (pinId === 'clk') {
        x = 0.3;
        y = 0.1;
      } else if (pinId === 'dt') {
        x = 0.5;
        y = 0.1;
      } else if (pinId === 'sw') {
        x = 0.7;
        y = 0.1;
      } else if (pinId === 'vcc') {
        x = 0.3;
        y = 0.9;
      } else if (pinId === 'gnd') {
        x = 0.7;
        y = 0.9;
      }
    }
    // DIP Switch
    else if (componentType === 'dip switch (3)') {
      if (pinId === 'in1') {
        x = 0.2;
        y = 0.1;
      } else if (pinId === 'out1') {
        x = 0.2;
        y = 0.9;
      } else if (pinId === 'in2') {
        x = 0.5;
        y = 0.1;
      } else if (pinId === 'out2') {
        x = 0.5;
        y = 0.9;
      } else if (pinId === 'in3') {
        x = 0.8;
        y = 0.1;
      } else if (pinId === 'out3') {
        x = 0.8;
        y = 0.9;
      }
    }
    // HeroBoard - arrange pins around the board to match Arduino UNO R3 layout
    else if (componentType === 'hero board') {
      if (pinId.startsWith('d')) {
        // Digital pins (D0-D13) along the right side (blue headers in the reference image)
        const pinNumber = parseInt(pinId.substring(1), 10);
        x = 0.95;
        y = 0.3 + (pinNumber / 13) * 0.6;
      } else if (pinId.startsWith('a')) {
        // Analog pins (A0-A5) along the left side (green headers in the reference image)
        const pinNumber = parseInt(pinId.substring(1), 10);
        x = 0.05;
        y = 0.3 + (pinNumber / 5) * 0.4;
      } else if (pinId === '5v' || pinId === 'vin') {
        // Power pins at bottom
        x = pinId === '5v' ? 0.4 : 0.55;
        y = 0.95;
      } else if (pinId === '3v3' || pinId === 'aref') {
        // 3.3V and Analog Reference pins bottom
        x = pinId === '3v3' ? 0.25 : 0.7;
        y = 0.95;
      } else if (pinId === 'gnd') {
        // Ground pin at bottom middle
        x = 0.5;
        y = 0.95;
      } else if (pinId === 'rst') {
        // Reset pin at top
        x = 0.2;
        y = 0.05;
      } else if (pinId === 'ioref') {
        // IO Reference pin at top
        x = 0.8;
        y = 0.05;
      }
    }
    // Default positions for other components
    else {
      // For any other component, distribute pins around the perimeter
      if (pinId.includes('vcc') || pinId.includes('v') || pinId.includes('power')) {
        x = 0.5; 
        y = 0.1;
      } else if (pinId.includes('gnd') || pinId.includes('g') || pinId.includes('ground')) {
        x = 0.5; 
        y = 0.9;
      } else if (pinId.includes('in') || pinId.includes('input')) {
        x = 0.1; 
        y = 0.5;
      } else if (pinId.includes('out') || pinId.includes('output')) {
        x = 0.9; 
        y = 0.5;
      } else if (pinId.includes('clk') || pinId.includes('clock')) {
        x = 0.2; 
        y = 0.1;
      } else if (pinId.includes('data') || pinId.includes('dt') || pinId.includes('din')) {
        x = 0.4; 
        y = 0.1;
      } else if (pinId.includes('cs') || pinId.includes('select')) {
        x = 0.6; 
        y = 0.1;
      } else if (pinId.includes('sw') || pinId.includes('switch')) {
        x = 0.8; 
        y = 0.1;
      }
    }
    
    return { x, y };
  };
  
  // Register pins in the global pin registry
  useEffect(() => {
    pins.forEach(pin => {
      const pinPosition = getPinPosition(pin);
      const pinElement = document.getElementById(`${id}-${pin.id}`);
      
      if (pinElement) {
        // Dispatch event to register this pin for wire connections
        const event = new CustomEvent('registerPin', {
          detail: {
            id: `${id}-${pin.id}`,
            parentId: id,
            pinType: pin.type,
            label: pin.label || pin.id,
            element: pinElement
          }
        });
        
        document.dispatchEvent(event);
      }
    });
    
    return () => {
      // Unregister pins when component is removed or rerendered
      pins.forEach(pin => {
        const event = new CustomEvent('unregisterPin', {
          detail: {
            id: `${id}-${pin.id}`
          }
        });
        
        document.dispatchEvent(event);
      });
    };
  }, [id, pins, position]);
  
  // Enhanced handle global mouse events for dragging with pin movement tracking
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e) => {
      if (!canvasRef?.current) return;
      
      // Get canvas position
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Calculate new position relative to canvas
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;
      
      // Update position
      setPosition({ x: newX, y: newY });
      
      // Notify parent component
      if (onMove) {
        onMove(id, newX, newY);
      }
      
      // WOKWI APPROACH: Notify directly that component was moved with its ID
      // Allowing wire manager to directly lookup pins from this component
      document.dispatchEvent(new CustomEvent('componentMoved', {
        detail: {
          componentId: id,
          newPosition: { x: newX, y: newY }
        }
      }));
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      
      // Final dispatch to ensure wire positions are updated
      // This helps with performance by reducing updates during dragging
      document.dispatchEvent(new CustomEvent('componentMovedFinal', {
        detail: { componentId: id }
      }));
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, canvasRef, id, onMove]);
  
  return (
    <div
      ref={componentRef}
      id={`component-${id}`}
      className="circuit-component absolute select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {/* Component image */}
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <img 
          src={image} 
          alt={type} 
          className="max-w-full max-h-full object-contain"
          draggable="false"
          style={{ 
            width: '80%', 
            height: '80%',
            objectFit: 'contain' 
          }}
          onError={(e) => {
            console.error(`Failed to load image: ${image}`, e);
            // Try alternative paths
            if (image && image.startsWith('/@fs/')) {
              // For direct file paths - strip the /@fs prefix
              const alternativePath = image.replace('/@fs/home/runner/workspace/', '/');
              console.log(`Trying alternative path: ${alternativePath}`);
              e.target.src = alternativePath;
            } else {
              // Fallback placeholder
              e.target.src = '/placeholder-component.png';
            }
          }}
        />
      </div>
      
      {/* Component pins */}
      {pins.map(pin => {
        const pinPos = getPinPosition(pin);
        const pinRelativeX = (pinPos.x - position.x) / width;
        const pinRelativeY = (pinPos.y - position.y) / height;
        
        return (
          <div
            key={pin.id}
            id={`${id}-${pin.id}`}
            className={`circuit-pin absolute w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair border-2 shadow-md ${
              pin.type === 'input' ? 'bg-green-500 border-green-700' : 
              pin.type === 'output' ? 'bg-red-500 border-red-700' : 
              'bg-blue-500 border-blue-700' // bidirectional
            }`}
            style={{
              left: `${pinRelativeX * 100}%`,
              top: `${pinRelativeY * 100}%`,
              zIndex: 20
            }}
            onClick={(e) => handlePinClick(pin.id, pin.type, e)}
            title={pin.label || pin.id}
          >
            {/* Pin hover tooltip */}
            <div className="pin-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {pin.label || pin.id}
            </div>
          </div>
        );
      })}
      
      {/* Component label */}
      <div 
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center whitespace-nowrap bg-gray-800 text-white px-1 rounded"
      >
        {type}
      </div>
    </div>
  );
};

export default CircuitComponent;