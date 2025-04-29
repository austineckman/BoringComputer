import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * WireManager component handles the creation and rendering of wires
 * between component pins
 * 
 * @param {Object} props
 * @param {RefObject} props.canvasRef - Reference to the canvas element
 */
const WireManager = ({ canvasRef }) => {
  // State for pin and wire management
  const [registeredPins, setRegisteredPins] = useState({});
  const [wires, setWires] = useState([]);
  const [pendingWire, setPendingWire] = useState(null);
  
  // SVG reference
  const svgRef = useRef(null);
  
  // Get element position relative to the canvas
  const getElementPosition = (element) => {
    if (!element || !canvasRef?.current) return { x: 0, y: 0 };
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    return {
      x: elementRect.left - canvasRect.left + elementRect.width / 2,
      y: elementRect.top - canvasRect.top + elementRect.height / 2
    };
  };
  
  // Handle pin clicks - create or finish a wire - defined with useCallback to avoid recreating on every render
  const handlePinClick = useCallback((pinId) => {
    console.log(`Pin clicked: ${pinId}`);
    
    // Get the pin information
    const pin = registeredPins[pinId];
    if (!pin) {
      console.warn(`Pin ${pinId} not found in registered pins`);
      return;
    }
    
    if (!pendingWire) {
      // Start a new wire from this pin
      console.log(`Starting new wire from pin ${pinId} (${pin.type})`);
      setPendingWire({
        sourceId: pinId,
        sourceType: pin.type,
        sourceParentId: pin.parentId
      });
    } else {
      // Finishing a wire
      const { sourceId, sourceType, sourceParentId } = pendingWire;
      console.log(`Finishing wire: ${sourceId} -> ${pinId}`);
      
      // Prevent connecting a pin to itself
      if (sourceId === pinId) {
        console.warn('Cannot connect a pin to itself');
        setPendingWire(null);
        return;
      }
      
      // Prevent connecting pins of the same component
      if (sourceParentId === pin.parentId) {
        console.warn('Cannot connect pins on the same component');
        setPendingWire(null);
        return;
      }
      
      // Check compatibility (input to output or bidirectional)
      const isCompatible = (
        (sourceType === 'output' && pin.type === 'input') ||
        (sourceType === 'input' && pin.type === 'output') ||
        sourceType === 'bidirectional' ||
        pin.type === 'bidirectional'
      );
      
      if (!isCompatible) {
        console.warn(`Cannot connect ${sourceType} to ${pin.type}`);
        setPendingWire(null);
        return;
      }
      
      // Add the new wire
      const newWire = {
        id: `wire-${Date.now()}`,
        sourceId,
        targetId: pinId,
        sourceType,
        targetType: pin.type
      };
      
      console.log(`Creating new wire:`, newWire);
      setWires(prev => [...prev, newWire]);
      setPendingWire(null);
    }
  }, [pendingWire, registeredPins]);
  
  // Handle clicks on the canvas (to cancel pending wire)
  const handleCanvasClick = useCallback((e) => {
    // If click wasn't on a pin and wasn't handled by a pin, cancel any pending wire
    if (e.target.classList.contains('circuit-pin') || 
        e.target.closest('.pin-connection-point') ||
        e.target.dataset.pinId) {
      return; // Do nothing, let the pin click handler handle it
    }
    
    // Cancel the pending wire
    if (pendingWire) {
      console.log('Canceling pending wire (canvas click)');
      setPendingWire(null);
    }
  }, [pendingWire]);
  
  // Register event listeners for pin registration and wire drawing
  useEffect(() => {
    // Handler for pin registration
    const handleRegisterPin = (e) => {
      const { id, parentId, pinType, label, element } = e.detail;
      
      setRegisteredPins(prev => ({
        ...prev,
        [id]: { id, parentId, type: pinType, label, element }
      }));
    };
    
    // Handler for pin unregistration
    const handleUnregisterPin = (e) => {
      const { id } = e.detail;
      
      setRegisteredPins(prev => {
        const newPins = { ...prev };
        delete newPins[id];
        return newPins;
      });
      
      // Remove any wires connected to this pin
      setWires(prev => prev.filter(wire => 
        wire.sourceId !== id && wire.targetId !== id
      ));
    };
    
    // Handler for direct pin click events
    const handlePinClickEvent = (e) => {
      const { id } = e.detail;
      console.log(`Received pinClicked event for ${id}`);
      handlePinClick(id);
    };
    
    // Handler for wire redrawing (e.g., when components move)
    const handleRedrawWires = () => {
      // Force redraw by creating a new array reference
      setWires(prev => [...prev]);
    };
    
    // Register event listeners
    document.addEventListener('registerPin', handleRegisterPin);
    document.addEventListener('unregisterPin', handleUnregisterPin);
    document.addEventListener('pinClicked', handlePinClickEvent);
    document.addEventListener('redrawWires', handleRedrawWires);
    
    // Add click handler to the canvas for wire interactions
    const canvasElement = canvasRef?.current;
    if (canvasElement) {
      canvasElement.addEventListener('click', handleCanvasClick);
    }
    
    // Cleanup function to remove all event listeners
    return () => {
      document.removeEventListener('registerPin', handleRegisterPin);
      document.removeEventListener('unregisterPin', handleUnregisterPin);
      document.removeEventListener('pinClicked', handlePinClickEvent);
      document.removeEventListener('redrawWires', handleRedrawWires);
      
      if (canvasElement) {
        canvasElement.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [canvasRef, handlePinClick, handleCanvasClick]);
  
  // Add mouse move handler for pending wire visualization
  useEffect(() => {
    if (!pendingWire || !canvasRef?.current || !svgRef?.current) return;
    
    const canvasElement = canvasRef.current;
    
    const handlePendingWireMouseMove = (e) => {
      const svg = svgRef.current;
      if (!svg) return;
      
      // Update mouse position for wire visualization
      const canvasRect = canvasElement.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      // Get the current path element and update it
      const pendingPath = svg.querySelector('.pending-wire');
      if (pendingPath) {
        const sourceElement = registeredPins[pendingWire.sourceId]?.element;
        if (sourceElement) {
          const sourcePos = getElementPosition(sourceElement);
          const pathString = getWirePath(sourcePos, { x: mouseX, y: mouseY });
          pendingPath.setAttribute('d', pathString);
        }
      }
    };
    
    canvasElement.addEventListener('mousemove', handlePendingWireMouseMove);
    
    // Cleanup function
    return () => {
      canvasElement.removeEventListener('mousemove', handlePendingWireMouseMove);
    };
  }, [canvasRef, pendingWire, registeredPins, getElementPosition]);
  
  // Get wire color based on connection types
  const getWireColor = (sourceType, targetType) => {
    // Power connections (VCC, GND, etc.)
    if (
      (sourceType === 'output' && targetType === 'input') ||
      (sourceType === 'input' && targetType === 'output')
    ) {
      return '#ef4444'; // Red - power connections
    }
    
    // Signal connections
    if (sourceType === 'bidirectional' || targetType === 'bidirectional') {
      return '#3b82f6'; // Blue - bidirectional signals
    }
    
    // Default color
    return '#10b981'; // Green - general signal
  };
  
  // Get wire style based on connection types
  const getWireStyle = (sourceType, targetType) => {
    // Power connections - typically from outputs to inputs
    if (
      (sourceType === 'output' && targetType === 'input') ||
      (sourceType === 'input' && targetType === 'output')
    ) {
      // For power connections (typical LED to resistor, or board to LED)
      return {
        stroke: getWireColor(sourceType, targetType),
        strokeWidth: 3.5,
        strokeLinecap: 'round',
        filter: 'drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.4))',
        fill: 'none',
        opacity: 0.9
      };
    }
    
    // Bidirectional connections - typically for data or I/O pins
    if (sourceType === 'bidirectional' || targetType === 'bidirectional') {
      return {
        stroke: getWireColor(sourceType, targetType),
        strokeWidth: 3,
        strokeLinecap: 'round',
        strokeDasharray: '0',
        filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.25))',
        fill: 'none',
        opacity: 0.85
      };
    }
    
    // Default style for other connections
    return {
      stroke: getWireColor(sourceType, targetType),
      strokeWidth: 3,
      strokeLinecap: 'round',
      filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.2))',
      fill: 'none',
      opacity: 0.8
    };
  };
  
  // Calculate SVG path string for a wire
  const getWirePath = (sourcePos, targetPos) => {
    // Ensure we have valid positions
    if (!sourcePos || !targetPos) {
      console.warn('Invalid positions for wire path:', sourcePos, targetPos);
      return `M 0,0`;
    }
    
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Adjust control point offset based on distance
    // Minimum 20px, maximum 80px, or distance/4 if in between
    const controlPointOffset = Math.min(80, Math.max(20, distance / 4));
    
    // For horizontal-ish connections (width > 2x height)
    if (Math.abs(dx) > Math.abs(dy) * 2) {
      return `M${sourcePos.x},${sourcePos.y} `+
             `C${sourcePos.x + controlPointOffset},${sourcePos.y} `+
             `${targetPos.x - controlPointOffset},${targetPos.y} `+
             `${targetPos.x},${targetPos.y}`;
    }
    
    // For vertical-ish connections (height > 2x width)
    if (Math.abs(dy) > Math.abs(dx) * 2) {
      return `M${sourcePos.x},${sourcePos.y} `+
             `C${sourcePos.x},${sourcePos.y + (Math.sign(dy) * controlPointOffset)} `+
             `${targetPos.x},${targetPos.y - (Math.sign(dy) * controlPointOffset)} `+
             `${targetPos.x},${targetPos.y}`;
    }
    
    // For diagonal connections (default)
    return `M${sourcePos.x},${sourcePos.y} `+
           `C${sourcePos.x + dx/3},${sourcePos.y + dy/3} `+
           `${sourcePos.x + dx*2/3},${sourcePos.y + dy*2/3} `+
           `${targetPos.x},${targetPos.y}`;
  };
  
  // Handle wire deletion
  const handleWireDelete = (wireId, e) => {
    e.stopPropagation();
    setWires(prev => prev.filter(wire => wire.id !== wireId));
  };
  
  return (
    <svg 
      ref={svgRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Draw existing wires */}
      {wires.map(wire => {
        // Get source and target elements from registered pins
        const sourceElement = registeredPins[wire.sourceId]?.element;
        const targetElement = registeredPins[wire.targetId]?.element;
        
        if (!sourceElement || !targetElement) {
          // One of the pins is no longer available, remove this wire
          setTimeout(() => {
            setWires(prev => prev.filter(w => w.id !== wire.id));
          }, 0);
          return null;
        }
        
        // Get positions
        const sourcePos = getElementPosition(sourceElement);
        const targetPos = getElementPosition(targetElement);
        
        // Calculate path and wire style
        const pathString = getWirePath(sourcePos, targetPos);
        const wireStyle = getWireStyle(wire.sourceType, wire.targetType);
        
        return (
          <g key={wire.id} className="wire-group">
            <path
              d={pathString}
              {...wireStyle}
              className="wire"
              data-wire-id={wire.id}
              onDoubleClick={(e) => handleWireDelete(wire.id, e)}
              style={{ pointerEvents: 'auto', cursor: 'crosshair' }}
            />
            
            {/* Wire endpoints */}
            <circle
              cx={sourcePos.x}
              cy={sourcePos.y}
              r={4}
              fill={wireStyle.stroke}
              pointerEvents="none"
            />
            <circle
              cx={targetPos.x}
              cy={targetPos.y}
              r={4}
              fill={wireStyle.stroke}
              pointerEvents="none"
            />
          </g>
        );
      })}
      
      {/* Draw pending wire */}
      {pendingWire && (
        (() => {
          // Get source element
          const sourceElement = registeredPins[pendingWire.sourceId]?.element;
          if (!sourceElement) return null;
          
          // Get mouse position relative to canvas
          const handleMouseMove = (e) => {
            const svg = svgRef.current;
            if (!svg) return;
            
            // Update mouse position for wire visualization
            const canvasRect = canvasRef.current.getBoundingClientRect();
            const mouseX = e.clientX - canvasRect.left;
            const mouseY = e.clientY - canvasRect.top;
            
            // Get the current path element and update it
            const pendingPath = svg.querySelector('.pending-wire');
            if (pendingPath) {
              const sourcePos = getElementPosition(sourceElement);
              const pathString = getWirePath(sourcePos, { x: mouseX, y: mouseY });
              pendingPath.setAttribute('d', pathString);
            }
          };
          
          // Mouse movement handled in main useEffect
          
          // Render pending wire path
          const sourcePos = getElementPosition(sourceElement);
          const wireStyle = {
            stroke: getWireColor(pendingWire.sourceType, 'bidirectional'),
            strokeWidth: 3,
            strokeLinecap: 'round',
            strokeDasharray: '6,4',
            filter: 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.2))',
            fill: 'none',
            opacity: 0.7
          };
          
          return (
            <path
              className="pending-wire"
              d={`M ${sourcePos.x},${sourcePos.y}`}
              {...wireStyle}
              pointerEvents="none"
            />
          );
        })()
      )}
      
      {/* Invisible wire click handlers */}
      {Object.values(registeredPins).map(pin => {
        const position = getElementPosition(pin.element);
        return (
          <circle
            key={pin.id}
            cx={position.x}
            cy={position.y}
            r={8}
            fill="transparent"
            style={{ pointerEvents: 'auto', cursor: 'crosshair' }}
            onClick={() => handlePinClick(pin.id)}
            data-pin-id={pin.id}
          />
        );
      })}
    </svg>
  );
};

export default WireManager;