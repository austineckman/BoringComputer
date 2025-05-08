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
  pinName, // Short name for the pin (R, G, B, COM, etc.)
  label,
  position, // {x, y} exact position within parent component
  color = '#ffcc00',
  size = 8,
  onPinClick,
  onPinHover,
  parentRef,
  isConnected = false,
  dataAttributes = {} // Custom data attributes for better DOM querying
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
    
    // Apply a quick visual feedback that pin was clicked
    const pinElement = e.currentTarget;
    pinElement.style.transform = 'scale(1.3) translate(-50%, -50%)';
    setTimeout(() => {
      pinElement.style.transform = 'translate(-50%, -50%)';
    }, 150);
    
    // Get pin position for wire connection
    const pinClientRect = pinElement.getBoundingClientRect();
    const pinPositionObj = {
      x: pinClientRect.left + pinClientRect.width / 2,
      y: pinClientRect.top + pinClientRect.height / 2
    };
    
    // Create a data object that contains pin information for simulation
    // This includes the actual pin specs from component library if available
    const pinData = (e.currentTarget.dataset.pinData) 
      ? e.currentTarget.dataset.pinData 
      : JSON.stringify({
          name: pinName || id, 
          x: position?.x || 0, 
          y: position?.y || 0, 
          signals: []
      });
    
    // Create a formatted pin ID that will be consistent across the application
    const formattedPinId = `pt-${parentId?.toLowerCase().split('-')[0]}-${parentId}-${id}`;
    
    // Create enhanced event detail for more accurate pin identification
    const enhancedDetail = {
      id: formattedPinId,
      pinId: formattedPinId,
      pinName: pinName || id,
      pinType,
      parentId,
      parentComponentId: parentId,
      data: pinData,
      clientX: e.clientX,
      clientY: e.clientY,
      pinPosition: {
        x: e.clientX,
        y: e.clientY
      }
    };
    
    // First handle internal pin click handler if provided
    if (onPinClick) {
      onPinClick(id, pinType, parentId, pinPositionObj, enhancedDetail);
    }
    
    // Dispatch a global event for the WireManager to handle
    const clickEvent = new CustomEvent('pinClicked', {
      detail: enhancedDetail
    });
    document.dispatchEvent(clickEvent);
    
    console.log('Pin clicked on component:', clickEvent.detail);
    
    // Ensure the WireManager always focuses on pin clicks more than other events
    e.stopImmediatePropagation();
    
    console.log(`Pin clicked: ${pinName || id} (${pinType})`);
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
  
  // Create a formatted pin ID that will be consistent across the application
  const formattedPinId = `pt-${parentId?.toLowerCase().split('-')[0]}-${parentId}-${id}`;
  
  // Create pin data object for simulation
  const pinDataObj = {
    name: id,
    x: position?.x || 0,
    y: position?.y || 0,
    signals: [],
    description: getPinDescription(pinType, label)
  };
  
  // Generate additional data attributes object for DOM
  const allDataAttributes = {
    'data-pin-id': id,
    'data-pin-name': pinName || id,
    'data-pin-type': pinType,
    'data-parent-id': parentId,
    'data-formatted-id': formattedPinId,
    'data-pin-data': JSON.stringify(pinDataObj),
    'data-testid': `pin-${id}`,
    ...dataAttributes // Merge in any custom data attributes
  };

  return (
    <div
      id={formattedPinId}
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
      {...allDataAttributes} 
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