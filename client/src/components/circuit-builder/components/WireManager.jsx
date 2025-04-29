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
  const getElementPosition = useCallback((element) => {
    if (!element || !canvasRef?.current) return { x: 0, y: 0 };
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    return {
      x: elementRect.left - canvasRect.left + elementRect.width / 2,
      y: elementRect.top - canvasRect.top + elementRect.height / 2
    };
  }, [canvasRef]);
  
  // Get wire color based on connection types - Use red as default as per Wokwi
  const getWireColor = useCallback((sourceType, targetType) => {
    // Always return red for all wires as per requirement
    return '#ef4444'; // Red - for all wires like Wokwi
  }, []);
  
  // Get wire style based on connection types - Wokwi style
  const getWireStyle = useCallback((sourceType, targetType) => {
    // Power connections - typically from outputs to inputs
    if (
      (sourceType === 'output' && targetType === 'input') ||
      (sourceType === 'input' && targetType === 'output')
    ) {
      // For power connections (typical LED to resistor, or board to LED)
      return {
        stroke: getWireColor(sourceType, targetType),
        strokeWidth: 4, // Thicker for power connections
        strokeLinecap: 'round',
        strokeMiterlimit: 10, // Better path corner rendering
        filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.5))',
        fill: 'none',
        opacity: 0.95
      };
    }
    
    // Bidirectional connections - typically for data or I/O pins
    if (sourceType === 'bidirectional' || targetType === 'bidirectional') {
      return {
        stroke: getWireColor(sourceType, targetType),
        strokeWidth: 3.5,
        strokeLinecap: 'round',
        strokeMiterlimit: 10,
        filter: 'drop-shadow(0px 1.5px 2px rgba(0, 0, 0, 0.3))',
        fill: 'none',
        opacity: 0.9
      };
    }
    
    // Default style for other connections
    return {
      stroke: getWireColor(sourceType, targetType),
      strokeWidth: 3.5,
      strokeLinecap: 'round',
      strokeMiterlimit: 10,
      filter: 'drop-shadow(0px 1.5px 2px rgba(0, 0, 0, 0.25))',
      fill: 'none',
      opacity: 0.85
    };
  }, [getWireColor]);
  
  // Generate a straight wire path like Wokwi
  const getWirePath = useCallback((sourcePos, targetPos) => {
    // Ensure we have valid positions
    if (!sourcePos || !targetPos) {
      console.warn('Invalid positions for wire path:', sourcePos, targetPos);
      return `M 0,0`;
    }
    
    // Simple straight line from source pin to target pin - exactly like Wokwi
    return `M${sourcePos.x},${sourcePos.y} L${targetPos.x},${targetPos.y}`;
  }, []);
  
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
    
    // Handler for direct pin click events - has highest priority
    const handlePinClickEvent = (e) => {
      const { id, position } = e.detail;
      console.log(`Received pinClicked event for ${id}`);
      
      // First cancel any click about to bubble to the canvas
      if (e.stopPropagation) e.stopPropagation();
      
      // Make sure this event has priority
      e.preventDefault && e.preventDefault();
      
      // Handle the pin click - this will start or finish a wire
      handlePinClick(id);
      
      // If we're creating a wire, highlight this connection in some way
      if (pendingWire && pendingWire.sourceId === id) {
        // Apply visual feedback that source pin is now active
        const element = registeredPins[id]?.element;
        if (element) {
          element.classList.add('wire-source-pin');
        }
      }
    };
    
    // Handler for wire redrawing (e.g., when components move)
    const handleRedrawWires = () => {
      // Force redraw by creating a new array reference
      setWires(prev => [...prev]);
    };
    
    // Register event listeners with high priority for wiring
    document.addEventListener('registerPin', handleRegisterPin);
    document.addEventListener('unregisterPin', handleUnregisterPin);
    document.addEventListener('pinClicked', handlePinClickEvent, { capture: true });
    document.addEventListener('redrawWires', handleRedrawWires);
    
    // Add click handler to the canvas for wire interactions
    const canvasElement = canvasRef?.current;
    if (canvasElement) {
      canvasElement.addEventListener('click', handleCanvasClick);
      
      // Also listen for mouseup events to cancel wiring if needed
      canvasElement.addEventListener('mouseup', (e) => {
        if (pendingWire && e.button === 2) { // Right click
          console.log('Canceling wire on right click');
          setPendingWire(null);
        }
      });
      
      // Add double-click support for wire management
      canvasElement.addEventListener('dblclick', (e) => {
        // If we double-click on the canvas while making a wire, cancel it
        if (pendingWire) {
          console.log('Canceling wire on double click');
          setPendingWire(null);
        }
      });
    }
    
    // Cleanup function to remove all event listeners
    return () => {
      document.removeEventListener('registerPin', handleRegisterPin);
      document.removeEventListener('unregisterPin', handleUnregisterPin);
      document.removeEventListener('pinClicked', handlePinClickEvent, { capture: true });
      document.removeEventListener('redrawWires', handleRedrawWires);
      
      if (canvasElement) {
        canvasElement.removeEventListener('click', handleCanvasClick);
        canvasElement.removeEventListener('mouseup', () => {});
        canvasElement.removeEventListener('dblclick', () => {});
      }
    };
  }, [canvasRef, handlePinClick, handleCanvasClick, pendingWire, registeredPins]);
  
  // Add mouse move handler for pending wire visualization
  useEffect(() => {
    if (!pendingWire || !canvasRef?.current || !svgRef?.current) return;
    
    const canvasElement = canvasRef.current;
    const sourcePinElement = registeredPins[pendingWire.sourceId]?.element;
    
    // Check if we have a valid source element
    if (!sourcePinElement) return;
    
    // Add a visual indicator to the source pin
    sourcePinElement.classList.add('wire-source-pin');
    
    // Create a function to handle mouse movement for the pending wire
    const handleMouseMove = (e) => {
      const svg = svgRef.current;
      if (!svg) return;
      
      // Get mouse position relative to canvas
      const canvasRect = canvasElement.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      // Update the pending wire path
      const pendingPath = svg.querySelector('.pending-wire');
      if (pendingPath && sourcePinElement) {
        const sourcePos = getElementPosition(sourcePinElement);
        const pathString = getWirePath(sourcePos, { x: mouseX, y: mouseY });
        pendingPath.setAttribute('d', pathString);
      }
    };
    
    // Immediately draw the initial wire path with a slight offset
    const svg = svgRef.current;
    if (svg && sourcePinElement) {
      const sourcePos = getElementPosition(sourcePinElement);
      // Start wire with slight offset from source
      const initialTarget = { 
        x: sourcePos.x + 20,
        y: sourcePos.y + 20
      };
      const initialPath = getWirePath(sourcePos, initialTarget);
      
      // Find and update the pending wire path element
      const pendingWireEl = svg.querySelector('.pending-wire');
      if (pendingWireEl) {
        pendingWireEl.setAttribute('d', initialPath);
      }
    }
    
    // Add the mouse move event listener
    canvasElement.addEventListener('mousemove', handleMouseMove);
    
    // Clean up the event listener and visual indicators
    return () => {
      canvasElement.removeEventListener('mousemove', handleMouseMove);
      sourcePinElement.classList.remove('wire-source-pin');
    };
  }, [canvasRef, svgRef, pendingWire, registeredPins, getElementPosition, getWirePath]);
  
  // Handle wire deletion
  const handleWireDelete = (wireId, e) => {
    e.stopPropagation();
    setWires(prev => prev.filter(wire => wire.id !== wireId));
  };
  
  // Render the wire manager component
  return (
    <svg 
      ref={svgRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Draw existing wires */}
      {wires.map(wire => {
        // Get source and target elements from registered pins
        const sourcePinEl = registeredPins[wire.sourceId]?.element;
        const targetPinEl = registeredPins[wire.targetId]?.element;
        
        if (!sourcePinEl || !targetPinEl) {
          // Remove wires with missing pins
          setTimeout(() => {
            setWires(prev => prev.filter(w => w.id !== wire.id));
          }, 0);
          return null;
        }
        
        // Get positions
        const sourcePos = getElementPosition(sourcePinEl);
        const targetPos = getElementPosition(targetPinEl);
        
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
          const pendingPinEl = registeredPins[pendingWire.sourceId]?.element;
          if (!pendingPinEl) return null;
          
          const sourcePos = getElementPosition(pendingPinEl);
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