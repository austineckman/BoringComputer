import { useRef, useEffect, useState } from 'react';
import WireState from '../utils/WireState';

/**
 * CircuitPin component represents a connection point for components
 * It supports:
 * - Connecting wires between components
 * - Precise positioning for accurate connections
 * - Improved visualization with hover effects
 * - Color coding based on pin type (input/output/bidirectional)
 * 
 * This implementation follows Wokwi's approach to component pins
 */
const CircuitPin = ({
  id,
  parentId,
  pinType, // 'input', 'output', or 'bidirectional'
  label,
  position, // {x, y} exact position within parent component
  color = '#ffcc00',
  size = 8,
  onPinClick,
  onPinHover,
  parentRef,
  isConnected = false
}) => {
  const pinRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Register pin with global wire management system
  useEffect(() => {
    if (parentRef?.current && pinRef.current) {
      const customEvent = new CustomEvent('registerPin', {
        detail: {
          id,
          parentId,
          pinType,
          label,
          element: pinRef.current
        }
      });
      document.dispatchEvent(customEvent);
      
      // Clean up on unmount
      return () => {
        const cleanup = new CustomEvent('unregisterPin', {
          detail: { id }
        });
        document.dispatchEvent(cleanup);
      };
    }
  }, [id, parentId, pinType, label, parentRef]);
  
  // Handle pin click for wiring - Exactly like Wokwi behavior
  const handlePinClick = (e) => {
    e.stopPropagation();
    // Don't prevent default as we need the click to bubble to WireManager
    
    // Apply visual feedback
    const pinElement = e.currentTarget;
    pinElement.style.transform = 'scale(1.3) translate(-50%, -50%)';
    pinElement.style.boxShadow = '0 0 8px rgba(255, 0, 0, 0.9)';
    setTimeout(() => {
      pinElement.style.transform = 'translate(-50%, -50%)';
    }, 150);
    
    console.log(`Pin clicked: ${id} (${pinType})`);
    
    // Handle internal pin click callback if provided
    if (onPinClick) {
      onPinClick(id, pinType, parentId);
    }
    
    // The click event will bubble up to the document and be handled by WireManager
    // No need to do anything else here
  };
  
  // Handle mouse hover
  const handleMouseEnter = (e) => {
    setIsHovered(true);
    
    // Call onPinHover if provided
    if (onPinHover) {
      onPinHover(id, pinType, parentId);
    }
    
    // Dispatch custom event for global tooltip handling
    const pinHoverEvent = new CustomEvent('pinHover', {
      detail: {
        id,
        pinId: id,
        parentId,
        componentId: parentId,
        label,
        type: pinType,
        pinType,
        x: e.clientX,
        y: e.clientY,
        description: getPinDescription(pinType, label)
      }
    });
    document.dispatchEvent(pinHoverEvent);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    
    // Call onPinHover with null to indicate hover end
    if (onPinHover) {
      onPinHover(null);
    }
    
    // Dispatch custom event for global tooltip handling
    const pinLeaveEvent = new CustomEvent('pinLeave');
    document.dispatchEvent(pinLeaveEvent);
  };
  
  // Generate helpful descriptions for pins based on type and label
  const getPinDescription = (type, label) => {
    if (label?.includes('GND')) return 'Ground connection (0V)';
    if (label?.includes('VCC') || label?.includes('5V') || label?.includes('3.3V')) 
      return `Power ${label?.includes('3.3') ? '3.3V' : '5V'} connection`;
    
    if (label?.includes('A') && label?.match(/A\d+/)) 
      return `Analog input pin ${label}`;
    
    if (label?.includes('SCL')) return 'I²C clock line';
    if (label?.includes('SDA')) return 'I²C data line';
    if (label?.includes('TX')) return 'Serial transmit pin';
    if (label?.includes('RX')) return 'Serial receive pin';
    
    if (label?.includes('PWM') || label?.match(/~D\d+/)) 
      return 'PWM capable digital pin';
    
    switch (type) {
      case 'input': return 'Digital input connection';
      case 'output': return 'Digital output connection';
      case 'bidirectional': return 'Bidirectional I/O connection';
      default: return 'Component connection pin';
    }
  };
  
  // Get border color based on pin type
  const getBorderColor = () => {
    if (pinType === 'input') return '#006400'; // Dark green for inputs
    if (pinType === 'output') return '#8B0000'; // Dark red for outputs  
    return '#00008B'; // Dark blue for bidirectional
  };
  
  // Get styles for label based on position
  const getLabelStyle = () => {
    // Calculate if pin is on left or right side of component
    const isLeftSide = position.x < 60;
    const isRightSide = position.x > 180;
    
    if (isLeftSide) {
      return {
        right: '130%',
        textAlign: 'right',
        transform: 'translateY(-50%)',
        top: '50%'
      };
    }
    
    if (isRightSide) {
      return {
        left: '130%',
        textAlign: 'left',
        transform: 'translateY(-50%)',
        top: '50%'
      };
    }
    
    // If pin is on top or bottom
    const isTop = position.y < 40;
    
    if (isTop) {
      return {
        bottom: '130%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center'
      };
    }
    
    // Default to bottom
    return {
      top: '130%', 
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center'
    };
  };
  
  return (
    <div
      ref={pinRef}
      className="absolute rounded-full flex items-center justify-center pin-connection-point"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: isConnected ? '#4caf50' : (isHovered ? '#ff9800' : color),
        border: `1.5px solid ${getBorderColor()}`,
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        cursor: 'crosshair',
        zIndex: 15,
        boxShadow: isConnected || isHovered ? '0 0 4px rgba(0, 0, 0, 0.5)' : '0 1px 2px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.1s ease'
      }}
      onClick={handlePinClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-pin-id={id}
      data-pin-type={pinType}
      data-parent-id={parentId}
      data-testid={`pin-${id}`}
    >
      {/* Pin dot center */}
      <div 
        className="absolute rounded-full" 
        style={{
          width: `${size/2}px`,
          height: `${size/2}px`,
          backgroundColor: isHovered ? '#fff' : getBorderColor(),
          opacity: 0.6
        }}
      />
      
      {/* Label shown on hover */}
      {(isHovered || label?.includes('PWM') || label?.includes('SDA') || label?.includes('SCL')) && (
        <div 
          className="absolute bg-gray-800 text-white text-xs px-1 py-0.5 rounded z-20 whitespace-nowrap"
          style={{
            ...getLabelStyle(),
            pointerEvents: 'none',
            opacity: 0.9
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default CircuitPin;