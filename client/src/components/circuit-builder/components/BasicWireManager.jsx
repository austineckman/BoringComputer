import React, { useState, useRef, useEffect } from 'react';
import { useSimulator } from '../simulator/SimulatorContext';
import { WireRouter } from '../utils/WireRouter';

/**
 * BasicWireManager - A simplified wire manager component that handles
 * connecting pins between circuit components.
 */
const BasicWireManager = ({ canvasRef, onWireSelection, onWireColorChange }) => {
  // Access the simulator context to share wire information
  const { setWires: setSimulatorWires } = useSimulator();
  
  // State for managing wires and selections
  const [wires, setWires] = useState([]);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [pendingWireWaypoints, setPendingWireWaypoints] = useState([]); // For storing clicks during wire creation
  const [selectedWireId, setSelectedWireId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  // Wire color palette
  const wireColors = [
    '#ff0000', // Red
    '#00ff00', // Green  
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff8800', // Orange
    '#8800ff', // Purple
    '#00ffff', // Cyan
    '#ff00ff', // Magenta
    '#ffffff', // White
    '#000000', // Black
    '#808080', // Gray
    '#8B4513'  // Brown
  ];
  
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
  
  // Apply HERO board pin position corrections
  const adjustHeroboardPosition = (pinId, position, componentId) => {
    // Only apply to heroboard pins
    if (position && (
      pinId?.includes('heroboard') || 
      (componentId && componentId.includes('heroboard'))
    )) {
      // Extract the pin number from the ID
      let pinNumber;
      
      // Try different formats to extract pin number
      if (pinId.includes('-D')) {
        pinNumber = pinId.split('-D')[1];
      } else if (pinId.includes('-A')) {
        pinNumber = 'A' + pinId.split('-A')[1];
      } else {
        // Last resort - try to get the last part after the last hyphen
        const parts = pinId.split('-');
        pinNumber = parts[parts.length - 1];
      }
      
      // Return position unmodified - don't apply any transformations
      // The clicked position from the HeroBoard component is already correct
      return position;
    }
    
    return position;
  };
  
  // RGB LED specific position correction
  const adjustRgbLedPosition = (pinId, position, componentId) => {
    // Only apply to RGB LED pins and if we have valid positions
    if (position && (
      pinId?.includes('rgb-led') || 
      pinId?.includes('rgbled') || 
      (componentId && (componentId.includes('rgb-led') || componentId.includes('rgbled')))
    )) {
      // Extract the pin name from the ID - different formats possible
      let pinName;
      
      if (pinId.includes('-red') || pinId.includes('-green') || pinId.includes('-blue') || pinId.includes('-common')) {
        pinName = pinId.split('-').pop();
      } else {
        // Try to get it from the last part of the ID
        pinName = pinId.split('-').pop();
      }
      
      // Default offset - experimentally determined
      let OFFSET_X = 0;
      let OFFSET_Y = 0;
      
      // Pin-specific adjustments based on which color pin it is
      if (pinName === 'red' || pinName.includes('red')) {
        // Red pin is on the left side
        OFFSET_X = -15;
        OFFSET_Y = 0;
      } else if (pinName === 'green' || pinName.includes('green')) {
        // Green pin is on the top
        OFFSET_X = 0;
        OFFSET_Y = -15;
      } else if (pinName === 'blue' || pinName.includes('blue')) {
        // Blue pin is on the right side
        OFFSET_X = 15;
        OFFSET_Y = 0;
      } else if (pinName === 'common' || pinName.includes('common') || pinName.includes('anode') || pinName.includes('cathode')) {
        // Common pin is on the bottom
        OFFSET_X = 0;
        OFFSET_Y = 15;
      }
      
      console.log(`Adjusting RGB LED pin position for ${pinName}:`, { 
        before: position,
        after: {
          x: position.x + OFFSET_X,
          y: position.y + OFFSET_Y
        }
      });
      
      // Apply the offset to fix the position
      return {
        x: position.x + OFFSET_X,
        y: position.y + OFFSET_Y
      };
    }
    
    return position;
  };

  // Create smooth, organic wire paths that look hand-drawn
  const createSmoothCurvePath = (points) => {
    if (points.length < 2) return '';
    if (points.length === 2) {
      return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
    }
    
    // Use quadratic Bezier curves to create smooth, flowing paths
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Create control point for smooth curve
      const controlX = current.x;
      const controlY = current.y;
      const endX = (current.x + next.x) / 2;
      const endY = (current.y + next.y) / 2;
      
      path += ` Q ${controlX},${controlY} ${endX},${endY}`;
    }
    
    // Final segment to last point
    const lastPoint = points[points.length - 1];
    const secondLast = points[points.length - 2];
    const controlX = (secondLast.x + lastPoint.x) / 2;
    const controlY = (secondLast.y + lastPoint.y) / 2;
    path += ` Q ${controlX},${controlY} ${lastPoint.x},${lastPoint.y}`;
    
    return path;
  };

  // Generate a natural-looking path that follows user's drawing intent
  const getWirePath = (start, end, waypoints = [], optimizedPath = null, useRawPath = false) => {
    // If this wire was drawn continuously, use smooth curves for natural appearance
    if (useRawPath && optimizedPath && optimizedPath.length > 0) {
      const smoothPath = createSmoothCurvePath(optimizedPath);
      console.log('Rendering smooth continuous path with', optimizedPath.length, 'points');
      return smoothPath;
    }
    
    // Use optimized path if available, otherwise fall back to waypoints or direct path
    if (optimizedPath && optimizedPath.length > 0) {
      return WireRouter.generateSVGPath(optimizedPath);
    }
    if (!start || !end) return '';
    
    // If there are no waypoints, return a direct line (can be diagonal)
    if (!waypoints || waypoints.length === 0) {
      return `M ${start.x},${start.y} L ${end.x},${end.y}`;
    }
    
    // Build path that follows user's drawing naturally
    let path = `M ${start.x},${start.y}`;
    
    // Connect through waypoints naturally (preserve user's intended path)
    waypoints.forEach((point) => {
      path += ` L ${point.x},${point.y}`;
    });
    
    // Connect to end point
    path += ` L ${end.x},${end.y}`;
    
    return path;
  };
  
  // Handle pin click events
  const handlePinClick = (event) => {
    try {
      const detail = event.detail;
      if (!detail) return;
      
      // Extract basic pin data - support both LED and other component formats
      // LED format has "id", other components use "pinId"
      const pinId = detail.id || detail.pinId;
      const pinType = detail.pinType || 'bidirectional';
      
      // Support both LED format (parentId) and HeroBoard format (parentComponentId)
      const parentComponentId = detail.parentId || detail.parentComponentId;
      
      // Get the actual pin name - LED component passes this in pinData
      // Other components may use pinName or we extract from pinId
      let pinName;
      
      // If we have pinData (LED format), extract the name from there
      if (detail.pinData) {
        try {
          const pinData = JSON.parse(detail.pinData);
          pinName = pinData.name;
        } catch (e) {
          // Fallback to extracting from pinId if parsing fails
          pinName = detail.pinName || (pinId ? pinId.split('-').pop() : '');
        }
      } else {
        // Use the explicit pinName or extract from pinId
        pinName = detail.pinName || (pinId ? pinId.split('-').pop() : '');
      }
      
      // Get canvas element to calculate relative position
      const canvas = canvasRef?.current;
      const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
      
      // Get pin position directly from the click event - this is what works for LED
      let pinPosition;
      
      // Use clientX/Y directly (LED approach) which works
      if (detail.clientX !== undefined && detail.clientY !== undefined) {
        // Get the position directly from the click event
        if (canvasRect) {
          pinPosition = {
            x: detail.clientX - canvasRect.left,
            y: detail.clientY - canvasRect.top
          };
        } else {
          // Fallback to raw client coordinates
          pinPosition = {
            x: detail.clientX,
            y: detail.clientY
          };
        }
      } 
      // Use coordinates if provided (HeroBoard format)
      else if (detail.coordinates) {
        pinPosition = detail.coordinates;
      } 
      // If no position is available, fall back to mouse position
      else {
        console.log(`No position data for pin ${pinId}, using mouse position`);
        pinPosition = mousePosition;
      }
      
      // Log the event for debugging
      console.log('Pin click event:', {
        pinId,
        pinName,
        pinType,
        parentComponentId,
        coordinates: pinPosition
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
      
      // Use smooth curves for click-drawn wires with waypoints  
      const drawnPath = [...pendingWireWaypoints];
      let optimizedPath;
      let useRawPath = false;
      
      if (drawnPath.length > 0) {
        // Use smooth curves for wires with waypoints
        optimizedPath = [pendingConnection.sourcePos, ...drawnPath, pinPosition];
        useRawPath = true;
        console.log('Using smooth curved path with', optimizedPath.length, 'points');
      } else {
        // Simple direct connection
        optimizedPath = [pendingConnection.sourcePos, pinPosition];
        useRawPath = true;
        console.log('Using direct smooth connection');
      }
      
      // Create a new wire connection with smart routing
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
        waypoints: drawnPath, // Store original drawn path for reference
        optimizedPath: optimizedPath, // Store either raw or optimized path
        useRawPath: useRawPath, // Flag to indicate which path type to use
        color: '#ff0000' // Default red color, can be changed later
      };
      
      // Add the new wire and reset pending connection and waypoints
      setWires([...wires, newWire]);
      setPendingConnection(null);
      setPendingWireWaypoints([]); // Reset waypoints
      
      console.log(`Created wire from ${pendingConnection.sourceName} to ${pinName} with ${pendingWireWaypoints.length} waypoints`, {
        originalWaypoints: drawnPath,
        optimizedPath: optimizedPath
      });
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
  
  // Handle canvas clicks to add waypoints during wire drawing
  const handleCanvasClick = (e) => {
    // Only respond if clicking directly on the canvas (not a component)
    if (e.target === canvasRef.current && pendingConnection) {
      // Get the click position relative to the canvas
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const clickPosition = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
      };
      
      // Add a waypoint at the click position
      setPendingWireWaypoints([...pendingWireWaypoints, clickPosition]);
      console.log('Added waypoint for wire at:', clickPosition);
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
    console.log(`Deleting wire with ID: ${wireId}`);
    setWires(wires.filter(wire => wire.id !== wireId));
    setSelectedWireId(null);
    // Notify parent component that wire was deleted
    if (onWireSelection) {
      onWireSelection(null, null);
    }
  };
  
  // Change wire color
  const changeWireColor = (wireId, newColor) => {
    console.log(`Changing wire ${wireId} color to ${newColor}`);
    setWires(wires.map(wire => 
      wire.id === wireId ? { ...wire, color: newColor } : wire
    ));
    // Notify parent component about color change
    if (onWireColorChange) {
      onWireColorChange(wireId, newColor);
    }
  };
  
  // Handle wire selection
  const handleWireClick = (wireId, e) => {
    e.stopPropagation();
    const newSelectedId = wireId === selectedWireId ? null : wireId;
    setSelectedWireId(newSelectedId);
    // Notify parent component about wire selection
    if (onWireSelection) {
      onWireSelection(newSelectedId, newSelectedId ? wires.find(w => w.id === newSelectedId) : null);
    }
  };
  
  // Track mouse movement for simple wire preview only
  const handleMouseMove = (e) => {
    if (!canvasRef?.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const currentMousePos = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top
    };
    
    setMousePosition(currentMousePos);
    // No continuous drawing - just show simple preview line
  };

  // Handle mouse down events - no longer needed for click-based drawing
  const handleMouseDown = (e) => {
    // No continuous drawing mode
  };

  // Handle mouse up events - no longer needed for click-based drawing
  const handleMouseUp = (e) => {
    // No continuous drawing mode
  };

  // Handle component movement events to update wire positions
  const handleComponentMoved = (event) => {
    const componentId = event.detail?.componentId;
    if (!componentId) return;
    
    console.log(`Component ${componentId} moved, updating wire positions`);
    
    // Update all wire positions for this component
    setWires(wires => {
      return wires.map(wire => {
        const newWire = { ...wire };
        
        // Update source position if it's from the moved component
        if (wire.sourceComponent === componentId) {
          // Find position using component cache when available
          const pinCacheKey = `${componentId}-${wire.sourceName}`;
          const cachedPosition = window.pinPositionCache?.get(pinCacheKey);
          
          if (cachedPosition && cachedPosition.x !== undefined && cachedPosition.y !== undefined) {
            newWire.sourcePos = { 
              x: cachedPosition.x, 
              y: cachedPosition.y 
            };
            console.log(`Updated source wire position from cache: (${newWire.sourcePos.x}, ${newWire.sourcePos.y})`);
          } else {
            // If no cached position, try to find the pin element
            const pinId = `pt-${componentId.split('-')[0]}-${componentId}-${wire.sourceName}`;
            const pinElement = document.getElementById(pinId);
            
            if (pinElement) {
              const pos = getTrueElementPosition(pinElement);
              if (pos) {
                // Apply component-specific adjustments
                let adjustedPos = adjustHeroboardPosition(pinId, pos, componentId);
                adjustedPos = adjustRgbLedPosition(pinId, adjustedPos, componentId);
                
                newWire.sourcePos = adjustedPos;
                console.log(`Updated source wire position from element: (${newWire.sourcePos.x}, ${newWire.sourcePos.y})`);
              }
            } else {
              // Handle element not found - track component movement delta if we have previous positions
              const movedX = event.detail.x;
              const movedY = event.detail.y;
              
              if (movedX !== undefined && movedY !== undefined) {
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
          }
        }
        
        // Update target position if it's from the moved component
        if (wire.targetComponent === componentId) {
          // Find position using component cache when available
          const pinCacheKey = `${componentId}-${wire.targetName}`;
          const cachedPosition = window.pinPositionCache?.get(pinCacheKey);
          
          if (cachedPosition && cachedPosition.x !== undefined && cachedPosition.y !== undefined) {
            newWire.targetPos = { 
              x: cachedPosition.x, 
              y: cachedPosition.y 
            };
            console.log(`Updated target wire position from cache: (${newWire.targetPos.x}, ${newWire.targetPos.y})`);
          } else {
            // If no cached position, try to find the pin element
            const pinId = `pt-${componentId.split('-')[0]}-${componentId}-${wire.targetName}`;
            const pinElement = document.getElementById(pinId);
            
            if (pinElement) {
              const pos = getTrueElementPosition(pinElement);
              if (pos) {
                // Apply component-specific adjustments
                let adjustedPos = adjustHeroboardPosition(pinId, pos, componentId);
                adjustedPos = adjustRgbLedPosition(pinId, adjustedPos, componentId);
                
                newWire.targetPos = adjustedPos;
                console.log(`Updated target wire position from element: (${newWire.targetPos.x}, ${newWire.targetPos.y})`);
              }
            } else {
              // Handle element not found - track component movement delta if we have previous positions
              const movedX = event.detail.x;
              const movedY = event.detail.y;
              
              if (movedX !== undefined && movedY !== undefined) {
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
          }
        }
        
        return newWire;
      });
    });
  };

  // Handle wire color change events from properties panel
  const handleWireColorChangeEvent = (event) => {
    const { wireId, newColor } = event.detail;
    changeWireColor(wireId, newColor);
  };

  // Setup event listeners
  useEffect(() => {
    // Listen for pin clicks from components
    document.addEventListener('pinClicked', handlePinClick);
    
    // Listen for component move events
    document.addEventListener('componentMoved', handleComponentMoved);
    document.addEventListener('componentMovedFinal', handleComponentMoved);
    
    // Listen for wire color change events from properties panel
    document.addEventListener('wireColorChange', handleWireColorChangeEvent);
    
    // Add canvas event handlers
    const canvas = canvasRef?.current;
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
      canvas.addEventListener('mousemove', handleMouseMove);
      // No longer needed for click-based drawing
    }

    // No longer needed for click-based drawing
    
    // Add keyboard handler for deletion
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup event listeners
    return () => {
      document.removeEventListener('pinClicked', handlePinClick);
      document.removeEventListener('componentMoved', handleComponentMoved);
      document.removeEventListener('componentMovedFinal', handleComponentMoved);
      document.removeEventListener('wireColorChange', handleWireColorChangeEvent);
      
      if (canvas) {
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('mousemove', handleMouseMove);
        // No longer needed for click-based drawing
      }
      // No longer needed for click-based drawing
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasRef, pendingConnection, pendingWireWaypoints, selectedWireId, wires]);
  
  // Share wires with the simulator through context
  useEffect(() => {
    try {
      console.log(`Wire manager has ${wires?.length || 0} wires:`, wires);
      
      // Ensure wires is always an array
      const safeWires = Array.isArray(wires) ? wires : [];
      
      // Share the wires with the simulator via context
      if (typeof setSimulatorWires === 'function') {
        // Add extra debug information to each wire to help with debugging
        const wiresWithDebug = safeWires.map(wire => ({
          ...wire,
          _debug: {
            timestamp: Date.now(),
            sourceValid: Boolean(wire.sourceId && wire.sourcePos),
            targetValid: Boolean(wire.targetId && wire.targetPos)
          }
        }));
        
        setSimulatorWires(wiresWithDebug);
        
        // Also share with the global window.simulatorContext for non-React components
        if (window.simulatorContext) {
          window.simulatorContext.wires = wiresWithDebug;
          console.log("Shared wires with global simulator context:", wiresWithDebug.length);
        }
        
        console.log("Shared wires with simulator context:", wiresWithDebug.length);
      } else {
        console.warn("Could not share wires with simulator: setSimulatorWires not available");
        
        // Even if React context is not available, try to share with global object
        if (window.simulatorContext) {
          window.simulatorContext.wires = safeWires;
          console.log("Shared wires with global simulator context only:", safeWires.length);
        }
      }
    } catch (error) {
      console.error("Error sharing wires with simulator:", error);
    }
  }, [wires, setSimulatorWires]);

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
        {Array.isArray(wires) ? wires.map(wire => {
          // Safety check to prevent rendering invalid wires
          if (!wire || !wire.id || !wire.sourcePos || !wire.targetPos) {
            return null; // Skip invalid wires
          }
          
          return (
            <g key={wire.id} className="wire-connection" style={{ pointerEvents: 'auto' }}>
              {/* Highlight path to make it more visible */}
              <path
                d={getWirePath(wire.sourcePos, wire.targetPos, wire.waypoints, wire.optimizedPath, wire.useRawPath)}
                stroke="#000000" 
                strokeWidth={selectedWireId === wire.id ? 5 : 4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.5}
              />
              
              {/* Actual colored wire */}
              <path
                d={getWirePath(wire.sourcePos, wire.targetPos, wire.waypoints, wire.optimizedPath, wire.useRawPath)}
                stroke={wire.color || '#ff0000'} // Default to bright red for high visibility
                strokeWidth={selectedWireId === wire.id ? 3 : 2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                onClick={(e) => handleWireClick(wire.id, e)}
                className="cursor-pointer"
                title="Click to select wire, Delete key to remove"
              />
              
              {/* Delete button for the wire - only shown when wire is selected */}
              {selectedWireId === wire.id && (
                <g 
                  className="wire-delete-button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWire(wire.id);
                  }}
                  style={{ cursor: 'pointer' }}
                  transform={`translate(${(wire.sourcePos.x + wire.targetPos.x) / 2 - 10}, ${(wire.sourcePos.y + wire.targetPos.y) / 2 - 10})`}
                >
                  <rect
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    rx="4"
                    fill="#ff3333"
                    stroke="#000000"
                    strokeWidth="1"
                  />
                  <line
                    x1="5"
                    y1="5"
                    x2="15"
                    y2="15"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <line
                    x1="15"
                    y1="5"
                    x2="5"
                    y2="15"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <title>Delete wire</title>
                </g>
              )}
              
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
              
              {/* No waypoint markers - clean wire appearance */}
              
              {/* Pin labels positioned to avoid overlap */}
              <text 
                x={wire.sourcePos.x + 15} 
                y={wire.sourcePos.y - 15} 
                fill="black" 
                stroke="white" 
                strokeWidth={0.5} 
                fontSize="9px"
                pointerEvents="none"
                opacity="0.8"
              >
                {wire.sourceName}
              </text>
              <text 
                x={wire.targetPos.x + 15} 
                y={wire.targetPos.y - 15} 
                fill="black" 
                stroke="white" 
                strokeWidth={0.5} 
                fontSize="9px"
                pointerEvents="none"
                opacity="0.8"
              >
                {wire.targetName}
              </text>
            </g>
          );
        }) : null}
        
        {/* Pending connection wire with smart routing preview */}
        {pendingConnection && pendingConnection.sourcePos && (
          <>
            {/* Show raw continuous drawing preview or optimized routing for click mode */}
            {(() => {
              let pathString;
              
              // Simple click-based preview - straight line with curves based on waypoints
              if (pendingWireWaypoints.length > 0) {
                // Show curved path through waypoints to mouse position
                const rawPath = [pendingConnection.sourcePos, ...pendingWireWaypoints, { x: mousePosition.x, y: mousePosition.y }];
                pathString = createSmoothCurvePath(rawPath);
              } else {
                // Simple straight line preview
                pathString = `M ${pendingConnection.sourcePos.x},${pendingConnection.sourcePos.y} L ${mousePosition.x},${mousePosition.y}`;
              }
              
              return (
                <>
                  <path
                    d={pathString}
                    stroke="#000000"
                    strokeWidth={4}
                    strokeDasharray="5,5"
                    fill="none"
                    strokeOpacity={0.3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={pathString}
                    stroke="#ff5500"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              );
            })()}
            
            {/* No waypoint markers - cleaner appearance */}
            <text 
              x={pendingConnection.sourcePos.x + 15} 
              y={pendingConnection.sourcePos.y - 15} 
              fill="black" 
              stroke="white" 
              strokeWidth={0.5} 
              fontSize="9px"
              pointerEvents="none"
              opacity="0.8"
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