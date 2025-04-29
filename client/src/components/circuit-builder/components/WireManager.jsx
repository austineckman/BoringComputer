import React, { useState, useEffect, useRef } from 'react';

/**
 * Simplified WireManager focused ONLY on drawing wires correctly
 * Only handles drawing straight lines from point to point
 */
const WireManager = ({ canvasRef }) => {
  // State for tracking pin clicks and mouse position
  const [pendingWireStart, setPendingWireStart] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [wires, setWires] = useState([]);
  
  // Debug flag to force render SVG layer
  const [isVisible, setIsVisible] = useState(true);

  // Setup global handler for pin clicks
  useEffect(() => {
    console.log("Setting up WireManager with global handler");
    
    // Set up global handler for pin clicks
    window.CIRCUIT_PIN_CLICKED = (pinId, pinType, parentId, position, element) => {
      console.log("WIRE MANAGER: Pin clicked", { pinId, pinType, parentId, position });
      
      if (!position || (!position.x && !position.y)) {
        console.error("WIRE MANAGER: Missing position data for pin", pinId);
        return;
      }
      
      handlePinClick(pinId, pinType, parentId, position, element);
    };
    
    // Add mouse move handler to track mouse position
    const handleMouseMove = (e) => {
      if (!canvasRef?.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Log mouse move for debugging (uncomment if needed)
      // console.log("Mouse position:", { x, y });
      
      setMousePos({ x, y });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Ensure we can see the wire rendering
    setIsVisible(true);
    
    // Clean up event listeners
    return () => {
      window.CIRCUIT_PIN_CLICKED = null;
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvasRef]);
  
  // Handle pin click
  const handlePinClick = (pinId, pinType, parentId, position, element) => {
    console.log("WireManager handlePinClick", { pinId, position });
    
    // Get absolute position of the pin
    let pinPosition = position;
    
    // If we have direct access to the element, use getBoundingClientRect for accurate position
    if (element) {
      const rect = element.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      pinPosition = {
        x: rect.left + rect.width/2 - canvasRect.left,
        y: rect.top + rect.height/2 - canvasRect.top
      };
    }
    
    // If no active wire, start one
    if (!pendingWireStart) {
      console.log("Starting new wire from", pinPosition);
      setPendingWireStart({
        id: pinId,
        type: pinType,
        parentId,
        position: pinPosition
      });
    } else {
      // Complete existing wire
      console.log("Completing wire to", pinPosition);
      
      // Create a new wire
      const newWire = {
        id: `wire-${Date.now()}`,
        sourceId: pendingWireStart.id,
        targetId: pinId,
        sourcePosition: pendingWireStart.position,
        targetPosition: pinPosition,
        sourceType: pendingWireStart.type,
        targetType: pinType
      };
      
      console.log("Created new wire:", newWire);
      
      // Add the new wire to the list
      setWires(prev => [...prev, newWire]);
      
      // Reset pending wire
      setPendingWireStart(null);
    }
  };
  
  // Handle wire deletion
  const handleDeleteWire = (wireId, e) => {
    if (e) e.stopPropagation();
    console.log("Deleting wire:", wireId);
    setWires(prev => prev.filter(wire => wire.id !== wireId));
  };
  
  // Debug function to log current state
  useEffect(() => {
    console.log("WireManager state:", {
      pendingWireStart,
      mousePos,
      wires,
      isVisible
    });
  }, [pendingWireStart, mousePos, wires, isVisible]);

  // Cancel wire on background click
  useEffect(() => {
    const handleCanvasClick = (e) => {
      if (e.target === canvasRef.current && pendingWireStart) {
        console.log("Canceling wire - background click");
        setPendingWireStart(null);
      }
    };

    if (canvasRef?.current) {
      canvasRef.current.addEventListener('click', handleCanvasClick);
    }
    
    return () => {
      if (canvasRef?.current) {
        canvasRef.current.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [canvasRef, pendingWireStart]);

  return (
    <svg
      className="absolute inset-0 overflow-visible pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.01)', // Very slight background to ensure visible
      }}
    >
      {/* Debug info for visibility */}
      <text x="10" y="20" fill="black" fontSize="12px">WireManager Active</text>
      <text x="10" y="40" fill="black" fontSize="12px">
        {pendingWireStart ? 'Wire in progress' : 'No active wire'}
      </text>
      <text x="10" y="60" fill="black" fontSize="12px">
        Mouse: {Math.round(mousePos.x)}, {Math.round(mousePos.y)}
      </text>
      
      {/* Render completed wires */}
      {wires.map(wire => (
        <g key={wire.id} className="wire-group">
          <line
            x1={wire.sourcePosition.x}
            y1={wire.sourcePosition.y}
            x2={wire.targetPosition.x}
            y2={wire.targetPosition.y}
            strokeWidth={3}
            stroke="#ff0000"
            strokeLinecap="round"
            style={{ pointerEvents: 'auto', cursor: 'crosshair' }}
            onDoubleClick={(e) => handleDeleteWire(wire.id, e)}
          />
          
          {/* Wire endpoints */}
          <circle
            cx={wire.sourcePosition.x}
            cy={wire.sourcePosition.y}
            r={4}
            fill="#ff0000"
            pointerEvents="none"
          />
          <circle
            cx={wire.targetPosition.x}
            cy={wire.targetPosition.y}
            r={4}
            fill="#ff0000"
            pointerEvents="none"
          />
        </g>
      ))}
      
      {/* Render pending wire if one is in progress */}
      {pendingWireStart && (
        <g className="pending-wire-group">
          {/* Draw line from start to current mouse position */}
          <line
            x1={pendingWireStart.position.x}
            y1={pendingWireStart.position.y}
            x2={mousePos.x}
            y2={mousePos.y}
            strokeWidth={3}
            stroke="#ff0000"
            strokeLinecap="round"
            strokeDasharray="5,3"
            pointerEvents="none"
          />
          
          {/* Starting point */}
          <circle
            cx={pendingWireStart.position.x}
            cy={pendingWireStart.position.y}
            r={4}
            fill="#ff0000"
            pointerEvents="none"
          />
          
          {/* End point (follows mouse) */}
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
    </svg>
  );
};

export default WireManager;