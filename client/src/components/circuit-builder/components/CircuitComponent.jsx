import React, { useRef, useEffect, useState } from 'react';

/**
 * Base component for circuit elements
 * Renders a component image with connection pins
 * Handles drag and rotation
 */
const CircuitComponent = ({
  id,
  type,
  image,
  x,
  y,
  rotation = 0,
  width = 100,
  height = 100,
  pins = [],
  onSelect,
  isSelected,
  onMove,
  onRotate,
  onPinConnect,
  canvasRef
}) => {
  const [position, setPosition] = useState({ x, y });
  const [currentRotation, setCurrentRotation] = useState(rotation);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const componentRef = useRef(null);
  
  // Handle component selection and deletion
  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(id);
  };
  
  // Start dragging the component
  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(id);
    
    // Calculate drag offset (where in the component the user clicked)
    if (componentRef.current) {
      const rect = componentRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      setDragOffset({ x: offsetX, y: offsetY });
      setIsDragging(true);
    }
  };
  
  // Handle pin click for wire creation
  const handlePinClick = (pinId, pinType, e) => {
    e.stopPropagation();
    if (onPinConnect) {
      onPinConnect(`${id}-${pinId}`, pinType, id);
    }
  };
  
  // Handle component rotation on right-click
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newRotation = (currentRotation + 90) % 360;
    setCurrentRotation(newRotation);
    
    if (onRotate) {
      onRotate(id, newRotation);
    }
  };
  
  // Calculate the position of pins based on component rotation
  const getPinPosition = (pinConfig) => {
    // For components with no explicit position, generate one based on the pin ID
    const pinPosition = pinConfig.position || generatePinPosition(pinConfig.id, type.toLowerCase());
    const normalizedPosition = { ...pinPosition };
    
    // Adjust for rotation - this involves some trigonometry
    // For simplicity, we'll just handle 90-degree rotations
    switch (currentRotation) {
      case 90:
        normalizedPosition.x = 1 - pinPosition.y;
        normalizedPosition.y = pinPosition.x;
        break;
      case 180:
        normalizedPosition.x = 1 - pinPosition.x;
        normalizedPosition.y = 1 - pinPosition.y;
        break;
      case 270:
        normalizedPosition.x = pinPosition.y;
        normalizedPosition.y = 1 - pinPosition.x;
        break;
      default: // 0 degrees, no change
        break;
    }
    
    return {
      x: position.x + normalizedPosition.x * width,
      y: position.y + normalizedPosition.y * height
    };
  };
  
  // Generate a pin position based on its ID and component type
  const generatePinPosition = (pinId, componentType) => {
    // Default position (center)
    let x = 0.5; 
    let y = 0.5;
    
    // LED component
    if (componentType === 'led') {
      if (pinId === 'anode') {
        x = 0.3; 
        y = 0;
      } else if (pinId === 'cathode') {
        x = 0.7; 
        y = 1;
      }
    }
    // Resistor component
    else if (componentType === 'resistor') {
      if (pinId === 'pin1') {
        x = 0; 
        y = 0.5;
      } else if (pinId === 'pin2') {
        x = 1; 
        y = 0.5;
      }
    }
    // RGB LED component
    else if (componentType === 'rgb led') {
      if (pinId === 'common') {
        x = 0.5; 
        y = 0;
      } else if (pinId === 'red') {
        x = 0.2; 
        y = 1;
      } else if (pinId === 'green') {
        x = 0.5; 
        y = 1;
      } else if (pinId === 'blue') {
        x = 0.8; 
        y = 1;
      }
    }
    // Photoresistor
    else if (componentType === 'photoresistor') {
      if (pinId === 'pin1') {
        x = 0; 
        y = 0.5;
      } else if (pinId === 'pin2') {
        x = 1; 
        y = 0.5;
      }
    }
    // HeroBoard - arrange pins around the board
    else if (componentType === 'heroboard') {
      if (pinId.startsWith('d')) {
        // Digital pins on right side
        const pinNumber = parseInt(pinId.substring(1), 10);
        x = 1;
        y = 0.2 + (pinNumber / 14) * 0.6;
      } else if (pinId.startsWith('a')) {
        // Analog pins on left side
        const pinNumber = parseInt(pinId.substring(1), 10);
        x = 0;
        y = 0.3 + (pinNumber / 6) * 0.4;
      } else if (pinId === '5v' || pinId === '3v3') {
        // Power pins at top
        x = pinId === '5v' ? 0.3 : 0.7;
        y = 0;
      } else if (pinId === 'gnd') {
        // Ground pin at bottom
        x = 0.5;
        y = 1;
      } else if (pinId === 'rst') {
        // Reset pin at top right
        x = 0.9;
        y = 0;
      }
    }
    // Default positions for other components
    else {
      // For any other component, distribute pins around the perimeter
      if (pinId.includes('vcc') || pinId.includes('v') || pinId.includes('power')) {
        x = 0.5; 
        y = 0;
      } else if (pinId.includes('gnd') || pinId.includes('g') || pinId.includes('ground')) {
        x = 0.5; 
        y = 1;
      } else if (pinId.includes('in') || pinId.includes('input')) {
        x = 0; 
        y = 0.5;
      } else if (pinId.includes('out') || pinId.includes('output')) {
        x = 1; 
        y = 0.5;
      } else if (pinId.includes('clk') || pinId.includes('clock')) {
        x = 0; 
        y = 0.3;
      } else if (pinId.includes('data') || pinId.includes('dt') || pinId.includes('din')) {
        x = 0; 
        y = 0.7;
      } else if (pinId.includes('cs') || pinId.includes('select')) {
        x = 1; 
        y = 0.3;
      } else if (pinId.includes('sw') || pinId.includes('switch')) {
        x = 1; 
        y = 0.7;
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
  }, [id, pins, position, currentRotation]);
  
  // Handle global mouse events for dragging
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
      
      // Notify wire manager to redraw wires
      document.dispatchEvent(new CustomEvent('redrawWires'));
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
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
      className={`circuit-component absolute select-none ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${currentRotation}deg)`,
        transformOrigin: 'center center',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
    >
      {/* Component image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src={image} 
          alt={type} 
          className="max-w-full max-h-full"
          draggable="false"
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
            className={`circuit-pin absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair border-2 ${
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
        style={{ rotate: `-${currentRotation}deg` }} // Keep label readable regardless of component rotation
      >
        {type}
      </div>
    </div>
  );
};

export default CircuitComponent;