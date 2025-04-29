import { useRef, useEffect, useState } from 'react';

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
  color = '#dddddd', // Light gray for Tinkercad pins
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
  
  // Handle pin click
  const handlePinClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // First handle internal pin click handler
    if (onPinClick) {
      onPinClick(id, pinType, parentId);
    }
    
    // Dispatch a global event for the WireManager to handle
    const clickEvent = new CustomEvent('pinClicked', {
      detail: { id, pinType, parentId }
    });
    document.dispatchEvent(clickEvent);
    
    console.log(`Pin clicked: ${id}`);
  };
  
  // Handle mouse hover
  const handleMouseEnter = (e) => {
    setIsHovered(true);
    if (onPinHover) {
      onPinHover(id, pinType, parentId);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onPinHover) {
      onPinHover(null);
    }
  };
  
  // Get border color based on pin type
  // In Tinkercad, pins are all black with consistent appearance
  const getBorderColor = () => {
    return '#000000'; // Black border for all pins
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
      className="absolute rounded-full flex items-center justify-center pin-connection-point circuit-pin"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: isConnected ? '#cc0000' : (isHovered ? '#ff9800' : color),
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
      data-tooltip={label || id || 'Pin'}
      title={label || id || 'Pin'}
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
    </div>
  );
};

export default CircuitPin;