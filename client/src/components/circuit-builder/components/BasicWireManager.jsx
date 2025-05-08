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
      
      // Extract basic pin data
      const pinId = detail.id;
      const pinType = detail.pinType || 'bidirectional';
      const parentComponentId = detail.parentId;
      
      // Get pin position from the event
      const pinPosition = {
        x: detail.clientX,
        y: detail.clientY
      };
      
      // Get the pin name for display
      const pinName = pinId.split('-').pop() || '';
      
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
  
  return (
    <svg 
      className="wire-layer absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {/* Render all wire connections */}
      {wires.map(wire => (
        <g key={wire.id} className="wire-connection" style={{ pointerEvents: 'auto' }}>
          <path
            d={getWirePath(wire.sourcePos, wire.targetPos)}
            stroke={wire.color || '#aaaaaa'}
            strokeWidth={selectedWireId === wire.id ? 3 : 2}
            fill="none"
            strokeLinecap="round"
            onClick={(e) => handleWireClick(wire.id, e)}
            className="cursor-pointer"
          />
          {/* Wire endpoint circles for better visibility */}
          <circle 
            cx={wire.sourcePos.x} 
            cy={wire.sourcePos.y} 
            r={4} 
            fill={wire.color || '#aaaaaa'} 
          />
          <circle 
            cx={wire.targetPos.x} 
            cy={wire.targetPos.y} 
            r={4} 
            fill={wire.color || '#aaaaaa'} 
          />
        </g>
      ))}
      
      {/* Pending connection wire */}
      {pendingConnection && (
        <path
          d={getWirePath(
            pendingConnection.sourcePos,
            { x: mousePosition.x, y: mousePosition.y }
          )}
          stroke="#aaaaaa"
          strokeWidth={2}
          strokeDasharray="5,5"
          fill="none"
          strokeLinecap="square" // Changed to square to match 90-degree corners
          strokeLinejoin="miter" // Added for sharp corners
        />
      )}
    </svg>
  );
};

export default BasicWireManager;