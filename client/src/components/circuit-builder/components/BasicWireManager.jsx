import React, { useState, useRef, useEffect } from 'react';

/**
 * BasicWireManager - A simplified wire manager component that handles
 * connecting pins between circuit components.
 */
const BasicWireManager = ({ canvasRef }) => {
  // State for managing wires and selections
  const [wires, setWires] = useState([]);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [selectedWireId, setSelectedWireId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Generate a path with 90-degree bends for better "cable management"
  const getWirePath = (start, end) => {
    if (!start || !end) return '';
    
    // Determine the midpoint for the horizontal segment
    const midX = start.x + (end.x - start.x) / 2;
    
    // Generate SVG path with 90-degree bends
    return `M ${start.x},${start.y} H ${midX} V ${end.y} H ${end.x}`;
  };
  
  // Handle pin click events
  const handlePinClick = (event) => {
    try {
      const detail = event.detail;
      if (!detail) return;
      
      // Extract basic pin data - prefer pinName field if available, then pinId
      const pinId = detail.id || detail.pinId;
      const pinType = detail.pinType || 'bidirectional';
      const parentComponentId = detail.parentId || detail.parentComponentId;
      
      // Get actual pin name - use the explicit pinName field if available
      // This is an important fix to handle custom component pins correctly
      const pinName = detail.pinName || (detail.pinId ? detail.pinId : pinId.split('-').pop() || '');
      
      // Get canvas element to calculate relative position
      const canvas = canvasRef?.current;
      const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
      
      // Get pin position - take the highest priority source of coordinates
      let pinPosition;
      
      // Priority 1: Detail has the pinPosition object directly
      if (detail.pinPosition && typeof detail.pinPosition.x === 'number') {
        pinPosition = detail.pinPosition;
      } 
      // Priority 2: Get position from clientX/Y with canvas offset
      else if (detail.clientX && detail.clientY && canvasRect) {
        pinPosition = {
          x: detail.clientX - canvasRect.left,
          y: detail.clientY - canvasRect.top
        };
      } 
      // Priority 3: Use the client as is (absolute coordinates)
      else if (detail.clientX && detail.clientY) {
        pinPosition = {
          x: detail.clientX,
          y: detail.clientY
        };
      }
      // Fallback: create approximate position based on component position
      else {
        // Get all components from the DOM to find position
        const componentElements = document.querySelectorAll(`[id^="${parentComponentId}"]`);
        if (componentElements.length > 0) {
          const componentRect = componentElements[0].getBoundingClientRect();
          pinPosition = {
            x: componentRect.left + (componentRect.width / 2) - (canvasRect ? canvasRect.left : 0),
            y: componentRect.top + (componentRect.height / 2) - (canvasRect ? canvasRect.top : 0)
          };
        } else {
          // Final fallback - just put it at 100,100
          pinPosition = { x: 100, y: 100 };
          console.warn("Could not determine pin position - using fallback position");
        }
      }
      
      console.log(`Pin clicked in wire manager (${new Date().toLocaleTimeString()}):`, {
        pinId,
        pinName,
        pinType,
        parentComponentId,
        pinPosition,
        pendingConnection: pendingConnection ? {
          sourceId: pendingConnection.sourceId,
          sourceName: pendingConnection.sourceName,
          sourceComponent: pendingConnection.sourceComponent
        } : null
      });
      
      // If no pending connection, start a new one
      if (!pendingConnection) {
        setPendingConnection({
          sourceId: pinId,
          sourceType: pinType,
          sourcePos: pinPosition,
          sourceComponent: parentComponentId,
          sourceName: pinName
        });
        return;
      }
      
      // If clicking on the same pin, cancel the pending connection
      if (pendingConnection.sourceId === pinId) {
        setPendingConnection(null);
        return;
      }
      
      // Create a new wire connection
      const newWire = {
        id: `wire-${Date.now()}`,
        sourceId: pendingConnection.sourceId,
        targetId: pinId,
        sourceType: pendingConnection.sourceType,
        targetType: pinType,
        sourcePos: pendingConnection.sourcePos,
        targetPos: pinPosition,
        sourceComponent: pendingConnection.sourceComponent,
        targetComponent: parentComponentId,
        sourceName: pendingConnection.sourceName,
        targetName: pinName,
        color: getWireColor(pendingConnection.sourceType, pinType)
      };
      
      // Add the new wire and reset pending connection
      setWires([...wires, newWire]);
      setPendingConnection(null);
      
      console.log(`Created wire from ${pendingConnection.sourceName} to ${pinName}`);
    } catch (error) {
      console.error('Error handling pin click:', error);
      setPendingConnection(null);
    }
  };
  
  // Determine wire color based on pin types
  const getWireColor = (sourceType, targetType) => {
    if (sourceType === 'power' || targetType === 'power') return '#ff5555'; // Power (red)
    if (sourceType === 'ground' || targetType === 'ground') return '#555555'; // Ground (dark gray)
    if (sourceType === 'input' || targetType === 'input') return '#55ff55'; // Input (green)
    if (sourceType === 'output' || targetType === 'output') return '#ffaa55'; // Output (orange)
    if (sourceType === 'analog' || targetType === 'analog') return '#5555ff'; // Analog (blue)
    if (sourceType === 'digital' || targetType === 'digital') return '#ff55ff'; // Digital (purple)
    return '#aaaaaa'; // Default (light gray)
  };
  
  // Handle canvas clicks to cancel pending connections
  const handleCanvasClick = (e) => {
    // Only respond if clicking directly on the canvas (not a component)
    if (e.target === canvasRef.current && pendingConnection) {
      setPendingConnection(null);
    }
  };
  
  // Handle delete key press to remove selected wire
  const handleKeyDown = (e) => {
    if (e.key === 'Delete' && selectedWireId) {
      deleteWire(selectedWireId);
    }
  };
  
  // Delete a wire by ID
  const deleteWire = (wireId) => {
    setWires(wires.filter(wire => wire.id !== wireId));
    setSelectedWireId(null);
  };
  
  // Handle wire selection
  const handleWireClick = (wireId, e) => {
    e.stopPropagation();
    setSelectedWireId(wireId === selectedWireId ? null : wireId);
  };
  
  // Track mouse movement for drawing pending wire
  const handleMouseMove = (e) => {
    if (!canvasRef?.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top
    });
  };

  // Handle component movement events to update wire positions
  const handleComponentMoved = (event) => {
    const componentId = event.detail?.componentId;
    if (!componentId) return;
    
    console.log(`Component moved event received for: ${componentId}`, event.detail);
    
    // Update wires even without pin positions - just adjust based on component movement
    const movedX = event.detail?.x;
    const movedY = event.detail?.y;
    
    setWires(prevWires => {
      return prevWires.map(wire => {
        // Handle source component movement
        if (wire.sourceComponent === componentId) {
          // If we have pin positions directly, use them
          if (event.detail?.pinPositions && event.detail.pinPositions[wire.sourceId]) {
            return { 
              ...wire, 
              sourcePos: event.detail.pinPositions[wire.sourceId] 
            };
          } 
          // Otherwise calculate the new position based on component movement
          else if (movedX !== undefined && movedY !== undefined) {
            // Calculate how much the component moved since the last known position
            const deltaX = movedX - (wire._lastKnownSourceX || 0);
            const deltaY = movedY - (wire._lastKnownSourceY || 0);
            
            // Only update if there's actual movement
            if (deltaX !== 0 || deltaY !== 0) {
              return { 
                ...wire, 
                sourcePos: { 
                  x: wire.sourcePos.x + deltaX, 
                  y: wire.sourcePos.y + deltaY 
                },
                _lastKnownSourceX: movedX,  // Store for next time
                _lastKnownSourceY: movedY
              };
            }
          }
        } 
        // Handle target component movement
        else if (wire.targetComponent === componentId) {
          // If we have pin positions directly, use them
          if (event.detail?.pinPositions && event.detail.pinPositions[wire.targetId]) {
            return { 
              ...wire, 
              targetPos: event.detail.pinPositions[wire.targetId] 
            };
          } 
          // Otherwise calculate the new position based on component movement
          else if (movedX !== undefined && movedY !== undefined) {
            // Calculate how much the component moved since the last known position
            const deltaX = movedX - (wire._lastKnownTargetX || 0);
            const deltaY = movedY - (wire._lastKnownTargetY || 0);
            
            // Only update if there's actual movement
            if (deltaX !== 0 || deltaY !== 0) {
              return { 
                ...wire, 
                targetPos: { 
                  x: wire.targetPos.x + deltaX, 
                  y: wire.targetPos.y + deltaY 
                },
                _lastKnownTargetX: movedX,  // Store for next time
                _lastKnownTargetY: movedY
              };
            }
          }
        }
        return wire;
      });
    });
  };

  // Setup event listeners
  useEffect(() => {
    // Listen for pin clicks from components
    document.addEventListener('pinClicked', handlePinClick);
    
    // Listen for component move events
    document.addEventListener('componentMoved', handleComponentMoved);
    document.addEventListener('componentMovedFinal', handleComponentMoved);
    
    // Add canvas click handler
    const canvas = canvasRef?.current;
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
      canvas.addEventListener('mousemove', handleMouseMove);
    }
    
    // Add keyboard handler for deletion
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup event listeners
    return () => {
      document.removeEventListener('pinClicked', handlePinClick);
      document.removeEventListener('componentMoved', handleComponentMoved);
      document.removeEventListener('componentMovedFinal', handleComponentMoved);
      
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasRef, pendingConnection, selectedWireId, wires]);
  
  // Debug information about wires for troubleshooting
  useEffect(() => {
    console.log(`Wire manager has ${wires.length} wires:`, wires);
  }, [wires]);

  return (
    <>
      {/* Debugging information - visible on screen */}
      {wires.length > 0 && (
        <div className="wire-debug fixed top-2 left-2 bg-black/80 text-green-500 p-2 rounded text-xs z-50">
          {wires.length} wire(s) created
        </div>
      )}
      
      {/* Enhanced wire layer with stronger visibility */}
      <svg 
        className="wire-layer absolute inset-0 pointer-events-none"
        style={{ 
          zIndex: 20, 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
        width="100%"
        height="100%"
      >
        {/* Render all wire connections with higher visibility */}
        {wires.map(wire => (
          <g key={wire.id} className="wire-connection" style={{ pointerEvents: 'auto' }}>
            {/* Highlight path to make it more visible */}
            <path
              d={getWirePath(wire.sourcePos, wire.targetPos)}
              stroke="#000000" 
              strokeWidth={selectedWireId === wire.id ? 5 : 4}
              fill="none"
              strokeLinecap="round"
              strokeOpacity={0.5}
            />
            
            {/* Actual colored wire */}
            <path
              d={getWirePath(wire.sourcePos, wire.targetPos)}
              stroke={wire.color || '#ff0000'} // Default to bright red for high visibility
              strokeWidth={selectedWireId === wire.id ? 3 : 2}
              fill="none"
              strokeLinecap="round"
              onClick={(e) => handleWireClick(wire.id, e)}
              className="cursor-pointer"
            />
            
            {/* Larger wire endpoint circles for better visibility */}
            <circle 
              cx={wire.sourcePos.x} 
              cy={wire.sourcePos.y} 
              r={5} 
              stroke="#000000"
              strokeWidth={1}
              fill={wire.color || '#ff0000'} 
            />
            <circle 
              cx={wire.targetPos.x} 
              cy={wire.targetPos.y} 
              r={5}
              stroke="#000000"
              strokeWidth={1} 
              fill={wire.color || '#ff0000'} 
            />
            
            {/* Pin labels for debugging */}
            <text 
              x={wire.sourcePos.x + 10} 
              y={wire.sourcePos.y - 5} 
              fill="black" 
              stroke="white" 
              strokeWidth={0.5} 
              fontSize="10px"
            >
              {wire.sourceName}
            </text>
            <text 
              x={wire.targetPos.x + 10} 
              y={wire.targetPos.y - 5} 
              fill="black" 
              stroke="white" 
              strokeWidth={0.5} 
              fontSize="10px"
            >
              {wire.targetName}
            </text>
          </g>
        ))}
        
        {/* Pending connection wire with improved visibility */}
        {pendingConnection && (
          <>
            <path
              d={getWirePath(
                pendingConnection.sourcePos,
                { x: mousePosition.x, y: mousePosition.y }
              )}
              stroke="#000000"
              strokeWidth={4}
              strokeDasharray="5,5"
              fill="none"
              strokeOpacity={0.3}
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            <path
              d={getWirePath(
                pendingConnection.sourcePos,
                { x: mousePosition.x, y: mousePosition.y }
              )}
              stroke="#ff5500"
              strokeWidth={2}
              strokeDasharray="5,5"
              fill="none"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            <text 
              x={pendingConnection.sourcePos.x + 10} 
              y={pendingConnection.sourcePos.y - 5} 
              fill="black" 
              stroke="white" 
              strokeWidth={0.5} 
              fontSize="10px"
            >
              {pendingConnection.sourceName}
            </text>
          </>
        )}
      </svg>
    </>
  );
};

export default BasicWireManager;