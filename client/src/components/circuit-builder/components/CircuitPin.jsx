import { useRef, useEffect } from 'react';
import { getRelativePosition, calculatePinPosition } from '../utils/Utils';

/**
 * CircuitPin component represents a connection point for components
 * It supports:
 * - Connecting wires between components
 * - Calculating position relative to the parent component
 * - Handling click/drag events for wire creation
 */
const CircuitPin = ({
  id,
  parentId,
  pinType, // 'input' or 'output'
  label,
  position, // {x, y} relative to component center
  rotation = 0,
  color = '#ffcc00',
  size = 8,
  onPinClick,
  onPinHover,
  parentRef,
  isConnected = false
}) => {
  const pinRef = useRef(null);
  
  // Register pin position for wire drawing
  useEffect(() => {
    if (parentRef?.current && pinRef.current) {
      // For a global wire management system to use
      const customEvent = new CustomEvent('registerPin', {
        detail: {
          id,
          parentId,
          pinType,
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
  }, [id, parentId, pinType, parentRef]);
  
  // Handle clicks on pins
  const handlePinClick = (e) => {
    e.stopPropagation();
    if (onPinClick) {
      onPinClick(id, pinType, parentId);
    }
  };
  
  // Handle pin hover effects
  const handlePinHover = (e) => {
    e.stopPropagation();
    if (onPinHover) {
      onPinHover(id, pinType, parentId);
    }
  };
  
  return (
    <div
      ref={pinRef}
      className="absolute rounded-full flex items-center justify-center"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: isConnected ? '#4caf50' : color,
        border: '1px solid #333',
        transform: `translate(${position.x - size/2}px, ${position.y - size/2}px)`,
        cursor: 'pointer',
        zIndex: 5,
        boxShadow: isConnected ? '0 0 3px #4caf50' : 'none'
      }}
      onClick={handlePinClick}
      onMouseEnter={handlePinHover}
      onMouseLeave={() => onPinHover && onPinHover(null)}
      data-pin-id={id}
      data-pin-type={pinType}
      data-parent-id={parentId}
    >
      {label && (
        <span className="absolute text-xs whitespace-nowrap" style={{
          [pinType === 'input' ? 'right' : 'left']: '100%',
          marginLeft: pinType === 'output' ? '4px' : '0',
          marginRight: pinType === 'input' ? '4px' : '0',
        }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default CircuitPin;