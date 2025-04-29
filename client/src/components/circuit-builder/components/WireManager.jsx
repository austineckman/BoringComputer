import React, { useState, useEffect, useRef } from 'react';

/**
 * WireManager - A simplified wire manager that implements
 * the exact Wokwi wiring behavior:
 * 1. Click on pin 1
 * 2. Red wire follows mouse
 * 3. Click on pin 2 to complete
 * 4. Click on non-pin to cancel
 */
const WireManager = ({ canvasRef }) => {
  // State for wire management
  const [wires, setWires] = useState([]);
  const [startPin, setStartPin] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 100, y: 100 });
  const [registeredPins, setRegisteredPins] = useState({});
  
  // Ref for the SVG element
  const svgRef = useRef(null);
  
  // Initialize the global pin click handler
  useEffect(() => {
    console.log("Setting up global pin click handler");
    
    // Create a global function to receive pin clicks
    window.CIRCUIT_PIN_CLICKED = (pinId, pinType, parentId, position) => {
      console.log("GLOBAL PIN CLICK:", pinId, pinType, parentId);
      handlePinClick(pinId, pinType, parentId);
    };
    
    // Setup mousemove listener for the entire document
    const handleMouseMove = (e) => {
      if (!canvasRef?.current) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;
      
      setMousePos({ x, y });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Setup canvas click to cancel wire
    const handleCanvasClick = (e) => {
      // Only cancel if click wasn't on a pin
      if (e.target.classList.contains('pin-connection-point') || 
          e.target.closest('.pin-connection-point')) {
        return;
      }
      
      if (startPin) {
        console.log("Canceling wire (canvas click)");
        startPin.element?.classList.remove('wire-source-pin');
        setStartPin(null);
      }
    };
    
    if (canvasRef?.current) {
      canvasRef.current.addEventListener('click', handleCanvasClick);
    }
    
    // Register for pin events
    const handleRegisterPin = (e) => {
      const { id, parentId, pinType, label, element } = e.detail;
      
      setRegisteredPins(prev => ({
        ...prev,
        [id]: { id, parentId, type: pinType, label, element }
      }));
    };
    
    // Handle pin unregistration
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
    
    // Plain DOM event listeners
    document.addEventListener('registerPin', handleRegisterPin);
    document.addEventListener('unregisterPin', handleUnregisterPin);
    
    // Cleanup
    return () => {
      window.CIRCUIT_PIN_CLICKED = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('registerPin', handleRegisterPin);
      document.removeEventListener('unregisterPin', handleUnregisterPin);
      
      if (canvasRef?.current) {
        canvasRef.current.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [canvasRef, startPin]);
  
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
  
  // Handle pin click for wiring (simple implementation)
  const handlePinClick = (pinId, pinType, parentId) => {
    console.log(`Pin clicked: ${pinId}, type: ${pinType}`);
    
    const pin = registeredPins[pinId];
    if (!pin) {
      console.warn(`Pin not found: ${pinId}`);
      return;
    }
    
    if (!startPin) {
      // Start a new wire
      console.log(`Starting wire from pin ${pinId}`);
      setStartPin({
        id: pinId,
        type: pinType,
        parentId: parentId,
        element: pin.element
      });
      
      // Apply visual feedback to the pin
      pin.element?.classList.add('wire-source-pin');
    } else {
      // Complete the wire if it's not the same pin or component
      if (startPin.id === pinId) {
        console.log("Cannot connect pin to itself");
        startPin.element?.classList.remove('wire-source-pin');
        setStartPin(null);
        return;
      }
      
      if (startPin.parentId === parentId) {
        console.log("Cannot connect pins on same component");
        startPin.element?.classList.remove('wire-source-pin');
        setStartPin(null);
        return;
      }
      
      // Create a new wire
      const newWire = {
        id: `wire-${Date.now()}`,
        sourceId: startPin.id,
        targetId: pinId,
        sourceType: startPin.type,
        targetType: pinType
      };
      
      console.log("Creating wire:", newWire);
      setWires([...wires, newWire]);
      
      // Reset the start pin
      startPin.element?.classList.remove('wire-source-pin');
      setStartPin(null);
    }
  };
  
  // Handle double-click on wires to delete them
  const handleWireDelete = (wireId, e) => {
    if (e) e.stopPropagation();
    console.log("Deleting wire:", wireId);
    setWires(prev => prev.filter(wire => wire.id !== wireId));
  };
  
  // Render the WireManager component
  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 overflow-visible"
      style={{
        width: '100%',
        height: '100%',
        zIndex: 50,
        pointerEvents: 'none'
      }}
    >
      {/* Render existing wires */}
      {wires.map(wire => {
        const sourcePinEl = registeredPins[wire.sourceId]?.element;
        const targetPinEl = registeredPins[wire.targetId]?.element;
        
        if (!sourcePinEl || !targetPinEl) {
          return null;
        }
        
        const sourcePos = getElementPosition(sourcePinEl);
        const targetPos = getElementPosition(targetPinEl);
        
        return (
          <g key={wire.id} className="wire-group">
            <line
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              strokeWidth={2.8}
              stroke="#ff0000"
              strokeLinecap="round"
              className="wire"
              data-wire-id={wire.id}
              style={{ pointerEvents: 'auto', cursor: 'crosshair' }}
              onDoubleClick={(e) => handleWireDelete(wire.id, e)}
            />
            
            {/* Wire endpoints */}
            <circle
              cx={sourcePos.x}
              cy={sourcePos.y}
              r={4}
              fill="#ff0000"
              pointerEvents="none"
            />
            <circle
              cx={targetPos.x}
              cy={targetPos.y}
              r={4}
              fill="#ff0000"
              pointerEvents="none"
            />
          </g>
        );
      })}
      
      {/* Render pending wire (while dragging) */}
      {startPin && (
        <g className="pending-wire-group">
          <line
            className="pending-wire"
            x1={getElementPosition(startPin.element).x}
            y1={getElementPosition(startPin.element).y}
            x2={mousePos.x}
            y2={mousePos.y}
            strokeWidth={2.8}
            stroke="#ff0000"
            strokeLinecap="round"
            strokeDasharray="5,2"
            pointerEvents="none"
          />
          <circle
            cx={getElementPosition(startPin.element).x}
            cy={getElementPosition(startPin.element).y}
            r={4}
            fill="#ff0000"
            pointerEvents="none"
          />
          <circle
            cx={mousePos.x}
            cy={mousePos.y}
            r={4}
            fill="#ff0000"
            opacity={0.5}
            pointerEvents="none"
          />
        </g>
      )}
      
      {/* Invisible click handlers for pins */}
      {Object.values(registeredPins).map(pin => {
        const pos = getElementPosition(pin.element);
        return (
          <circle
            key={pin.id}
            cx={pos.x}
            cy={pos.y}
            r={8}
            fill="transparent"
            style={{ pointerEvents: 'auto', cursor: 'crosshair' }}
            onClick={() => handlePinClick(pin.id, pin.type, pin.parentId)}
            data-pin-id={pin.id}
          />
        );
      })}
    </svg>
  );
};

export default WireManager;