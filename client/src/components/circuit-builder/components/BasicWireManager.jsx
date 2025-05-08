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
  
  // Utility function to calculate true element position (for both SVG and HTML)
  const getTrueElementPosition = (element) => {
    if (!element) return null;
    
    try {
      // Check if this is an SVG element
      const isSvgElement = element instanceof SVGElement;
      
      if (isSvgElement) {
        // Handle SVG elements with proper transformation
        const svgRoot = element.ownerSVGElement || document.querySelector('svg');
        if (svgRoot) {
          // Get bounding box in SVG coordinate system
          const bbox = element.getBBox();
          // Create a point at the center of the bounding box
          const svgPoint = svgRoot.createSVGPoint();
          svgPoint.x = bbox.x + bbox.width / 2;
          svgPoint.y = bbox.y + bbox.height / 2;
          
          // Convert to screen coordinates using the element's transform matrix
          const matrix = element.getScreenCTM();
          const screenPoint = svgPoint.matrixTransform(matrix);
          
          return {
            x: screenPoint.x,
            y: screenPoint.y
          };
        }
      }
      
      // For HTML elements or fallback
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    } catch (error) {
      console.error('Error calculating element position:', error);
      return null;
    }
  };

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
      
      // Find the actual pin element in the DOM to get its position
      // Try multiple selectors to increase our chances of finding the pin
      let pinElement = document.getElementById(pinId);
      
      // If not found by ID, try by data-pin-id attribute or custom attributes
      if (!pinElement) {
        pinElement = document.querySelector(`[data-pin-id="${pinName}"][data-parent-id="${parentComponentId}"]`);
      }
      
      // Try by partial class or attribute match
      if (!pinElement) {
        const possiblePins = document.querySelectorAll(`[class*="pin"][class*="${pinName}"], [id*="${pinName}"]`);
        if (possiblePins.length > 0) {
          // Find the closest pin to where the click happened
          if (detail.clientX && detail.clientY) {
            let closestDistance = Infinity;
            Array.from(possiblePins).forEach(element => {
              const rect = element.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const distance = Math.hypot(detail.clientX - centerX, detail.clientY - centerY);
              if (distance < closestDistance) {
                closestDistance = distance;
                pinElement = element;
              }
            });
          } else {
            // Just use the first one if we don't have coordinates
            pinElement = possiblePins[0];
          }
        }
      }
      
      // If we found a pin element, use our utility to get its true position
      if (pinElement) {
        const elementPos = getTrueElementPosition(pinElement);
        if (elementPos && canvasRect) {
          pinPosition = {
            x: elementPos.x - canvasRect.left,
            y: elementPos.y - canvasRect.top
          };
          console.log(`Found pin element using enhanced search, position: (${pinPosition.x}, ${pinPosition.y})`);
        }
      }
      // Priority 1: Detail has the pinPosition object directly
      else if (detail.pinPosition && typeof detail.pinPosition.x === 'number') {
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
    
    // Update wires based on moved components - use a more accurate pin position approach
    setWires(prevWires => {
      return prevWires.map(wire => {
        const newWire = { ...wire };
        
        // Handle source component updates
        if (wire.sourceComponent === componentId) {
          // Try to find the source pin element in the DOM by its ID
          const sourcePinElement = document.getElementById(wire.sourceId);
          if (sourcePinElement && canvasRef.current) {
            // Use our utility to get the true position
            const elementPos = getTrueElementPosition(sourcePinElement);
            if (elementPos) {
              const canvasRect = canvasRef.current.getBoundingClientRect();
              newWire.sourcePos = {
                x: elementPos.x - canvasRect.left,
                y: elementPos.y - canvasRect.top
              };
              console.log(`Updated source wire position from element: (${newWire.sourcePos.x}, ${newWire.sourcePos.y})`);
            }
          } 
          // If pin element not found, use the movement delta approach
          else if (event.detail?.x !== undefined && event.detail?.y !== undefined) {
            const movedX = event.detail.x;
            const movedY = event.detail.y;
            
            // Calculate movement delta
            const deltaX = movedX - (wire._lastKnownSourceX || 0);
            const deltaY = movedY - (wire._lastKnownSourceY || 0);
            
            if (deltaX !== 0 || deltaY !== 0) {
              newWire.sourcePos = { 
                x: wire.sourcePos.x + deltaX, 
                y: wire.sourcePos.y + deltaY 
              };
              newWire._lastKnownSourceX = movedX;
              newWire._lastKnownSourceY = movedY;
              console.log(`Updated source wire position from delta: (${newWire.sourcePos.x}, ${newWire.sourcePos.y})`);
            }
          }
        }
        
        // Handle target component updates
        if (wire.targetComponent === componentId) {
          // Try to find the target pin element in the DOM by its ID
          const targetPinElement = document.getElementById(wire.targetId);
          if (targetPinElement && canvasRef.current) {
            // Use our utility to get the true position
            const elementPos = getTrueElementPosition(targetPinElement);
            if (elementPos) {
              const canvasRect = canvasRef.current.getBoundingClientRect();
              newWire.targetPos = {
                x: elementPos.x - canvasRect.left,
                y: elementPos.y - canvasRect.top
              };
              console.log(`Updated target wire position from element: (${newWire.targetPos.x}, ${newWire.targetPos.y})`);
            }
          } 
          // If pin element not found, use the movement delta approach
          else if (event.detail?.x !== undefined && event.detail?.y !== undefined) {
            const movedX = event.detail.x;
            const movedY = event.detail.y;
            
            // Calculate movement delta
            const deltaX = movedX - (wire._lastKnownTargetX || 0);
            const deltaY = movedY - (wire._lastKnownTargetY || 0);
            
            if (deltaX !== 0 || deltaY !== 0) {
              newWire.targetPos = { 
                x: wire.targetPos.x + deltaX, 
                y: wire.targetPos.y + deltaY 
              };
              newWire._lastKnownTargetX = movedX;
              newWire._lastKnownTargetY = movedY;
              console.log(`Updated target wire position from delta: (${newWire.targetPos.x}, ${newWire.targetPos.y})`);
            }
          }
        }
        
        return newWire;
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