import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Wire Color Options based on Wokwi's palette
const wireColorOptions = [
  { value: '#000000' }, // Black
  { value: '#563831' }, // Brown
  { value: '#26b297' }, // Teal
  { value: '#00ff00' }, // Bright Green
  { value: '#1f5e1f' }, // Dark Green
  { value: '#852583' }, // Purple
  { value: '#3c61e3' }, // Blue
  { value: '#ff6600' }, // Orange
  { value: '#ff3333' }, // Red
  { value: '#dada32' }, // Yellow
  { value: '#b925c9' }  // Pink
];

/**
 * Generate a path string from a series of points
 * This creates a nice curve between the segments for better appearance
 */
const generatePathFromPoints = (points, radius = 15) => {
  if (!points || points.length < 2) return '';
  
  let pathString = `M ${points[0].x} ${points[0].y} `;
  
  for (let i = 1; i < points.length; i++) {
    const curr = points[i];
    const prev = points[i-1];
    
    // Simple straight line if it's just two points
    if (points.length === 2) {
      return `M ${prev.x} ${prev.y} L ${curr.x} ${curr.y}`;
    }
    
    // If this is the last point or we only have 2 points, just draw a line
    if (i === points.length - 1 || points.length === 2) {
      pathString += `L ${curr.x} ${curr.y} `;
      continue;
    }
    
    const next = points[i+1];
    
    // Check if the points are collinear (in a straight line)
    const isCollinear = (p1, p2, p3) => {
      const area = Math.abs(
        (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2
      );
      return area < 0.1; // Threshold for collinearity
    };
    
    if (!isCollinear(prev, curr, next)) {
      // Calculate control points for a smooth curve
      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;
      
      // Calculate distance from curr to prev/next (up to a limit)
      const dist1 = Math.min(Math.sqrt(dx1*dx1 + dy1*dy1) / 3, radius);
      const dist2 = Math.min(Math.sqrt(dx2*dx2 + dy2*dy2) / 3, radius);
      
      // Calculate control points before and after the current point
      const angle1 = Math.atan2(dy1, dx1);
      const angle2 = Math.atan2(dy2, dx2);
      
      const beforeX = curr.x - Math.cos(angle1) * dist1;
      const beforeY = curr.y - Math.sin(angle1) * dist1;
      
      const afterX = curr.x + Math.cos(angle2) * dist2;
      const afterY = curr.y + Math.sin(angle2) * dist2;
      
      // Use curved segments instead of straight lines
      pathString += `L ${beforeX} ${beforeY} S ${curr.x} ${curr.y} ${afterX} ${afterY} `;
    } else {
      // If points are collinear, just use a straight line
      pathString += `L ${curr.x} ${curr.y} `;
    }
  }
  
  return pathString;
};

/**
 * WireManager component handles the creation and rendering of wires
 * between component pins with support for segmented paths
 * 
 * @param {Object} props
 * @param {RefObject} props.canvasRef - Reference to the canvas element
 */
const WireManager = ({ canvasRef }) => {
  // State for pin and wire management
  const [registeredPins, setRegisteredPins] = useState({});
  const [wires, setWires] = useState([]);
  const [pendingWire, setPendingWire] = useState(null);
  const [editingWire, setEditingWire] = useState(null);
  const [selectedWire, setSelectedWire] = useState(null);
  
  // Color management for wires
  const [wireColorMenu, setWireColorMenu] = useState({ visible: false, wireId: null, position: { x: 0, y: 0 } });
  
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
  
  // Handle pin clicks - create or finish a wire
  const handlePinClick = useCallback((pinId) => {
    console.log(`Pin clicked: ${pinId}`);
    
    // Get the pin information - this could be undefined or null in some cases
    const pin = registeredPins[pinId];
    if (!pin) {
      // For debugging only - this happens when the pin is not registered yet
      console.warn(`Pin ${pinId} not found in registered pins - this is normal during initialization`);
      return;
    }
    
    console.log("Pin info for click:", pin);
    
    if (!pendingWire) {
      // Start a new wire from this pin
      console.log(`Starting new wire from pin ${pinId} (${pin.type})`);
      setPendingWire({
        sourceId: pinId,
        sourceType: pin.type || 'bidirectional', // Default to bidirectional if type is missing
        sourceParentId: pin.parentId,
        points: []  // Store the wire points for segmented routing, though direct connections won't use intermediate points
      });
    } else {
      // Finishing a wire - connecting from source to target DIRECTLY without intermediate points
      const { sourceId, sourceType, sourceParentId } = pendingWire;
      console.log(`Finishing wire: ${sourceId} -> ${pinId}`);
      
      // Prevent connecting a pin to itself
      if (sourceId === pinId) {
        console.warn('Cannot connect a pin to itself');
        setPendingWire(null);
        
        // Clear any pending wire visualization
        const svg = svgRef.current;
        if (svg) {
          const pendingPath = svg.querySelector('.pending-wire');
          if (pendingPath) {
            pendingPath.setAttribute('d', '');
          }
        }
        return;
      }
      
      // Prevent connecting pins of the same component
      if (sourceParentId === pin.parentId) {
        console.warn('Cannot connect pins on the same component');
        setPendingWire(null);
        
        // Clear any pending wire visualization
        const svg = svgRef.current;
        if (svg) {
          const pendingPath = svg.querySelector('.pending-wire');
          if (pendingPath) {
            pendingPath.setAttribute('d', '');
          }
        }
        return;
      }
      
      // Set default pin type if not available
      const targetType = pin.type || 'bidirectional';
      
      // Check compatibility (input to output or bidirectional)
      const isCompatible = (
        (sourceType === 'output' && targetType === 'input') ||
        (sourceType === 'input' && targetType === 'output') ||
        sourceType === 'bidirectional' ||
        targetType === 'bidirectional'
      );
      
      if (!isCompatible) {
        console.warn(`Cannot connect ${sourceType} to ${targetType}`);
        setPendingWire(null);
        return;
      }
      
      // Get the source and target positions
      const sourceElement = registeredPins[sourceId]?.element;
      const targetElement = pin.element;
      
      if (!sourceElement || !targetElement) {
        console.warn('Source or target element is missing');
        setPendingWire(null);
        return;
      }
      
      const sourcePos = getElementPosition(sourceElement);
      const targetPos = getElementPosition(targetElement);
      
      // Filter out redundant intermediate points that are too close to source or target
      const minDistance = 20; // Minimum distance between points
      let filteredPoints = points.filter(point => {
        const distToSource = Math.hypot(point.x - sourcePos.x, point.y - sourcePos.y);
        const distToTarget = Math.hypot(point.x - targetPos.x, point.y - targetPos.y);
        return distToSource > minDistance && distToTarget > minDistance;
      });
      
      // Create a direct connection from source to target without any intermediate points
      // For Wokwi compatibility - intermediate points are only added when editing after creation
      const allPoints = [
        sourcePos,
        targetPos
      ];
      
      // Generate a wire color based on type
      const wireColor = getWireColor(sourceType, targetType);
      
      // Add the new wire
      const newWire = {
        id: `wire-${Date.now()}`,
        sourceId,
        targetId: pinId,
        sourceType,
        targetType,
        points: allPoints,
        color: wireColor
      };
      
      console.log(`Creating new wire:`, newWire);
      // Add the wire to the wires array and clear the pending wire state
      setWires(prev => [...prev, newWire]);
      setPendingWire(null);
      
      // Also clear any pending UI state
      const svg = svgRef.current;
      if (svg) {
        const pendingPath = svg.querySelector('.pending-wire');
        if (pendingPath) {
          pendingPath.setAttribute('d', '');
        }
      }
    }
  }, [pendingWire, registeredPins, getElementPosition]);
  
  // Handle clicks on the canvas for wire editing
  const handleCanvasClick = useCallback((e) => {
    // Close color menu if it's open and click is outside of it
    if (wireColorMenu.visible) {
      const menuElement = document.getElementById('wire-color-menu');
      if (menuElement && !menuElement.contains(e.target)) {
        setWireColorMenu({ visible: false, wireId: null, position: { x: 0, y: 0 } });
      }
      return;
    }
    
    // If click wasn't on a pin and wasn't handled by a pin, it's a canvas click
    if (e.target.classList.contains('circuit-pin') || 
        e.target.closest('.pin-connection-point') ||
        e.target.dataset.pinId) {
      return; // Do nothing, let the pin click handler handle it
    }
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - canvasRect.left;
    const clickY = e.clientY - canvasRect.top;
    
    // IMPORTANT: Do NOT add intermediate points during wire creation
    // Only allow direct connections from pin to pin
    if (pendingWire) {
      // Ignore canvas clicks during wire creation - require pin to pin connections
      return;
    }
    
    // If a wire is being edited, add a point to it at the clicked position
    // This allows adding bend points AFTER the wire is already connected
    if (editingWire) {
      setWires(prev => {
        return prev.map(wire => {
          if (wire.id === editingWire) {
            // Insert the new point at the appropriate position
            const newPoint = { x: clickX, y: clickY };
            
            // Find the closest segment to insert the point
            let bestDistance = Infinity;
            let bestIndex = 0;
            
            for (let i = 0; i < wire.points.length - 1; i++) {
              const p1 = wire.points[i];
              const p2 = wire.points[i + 1];
              
              // Calculate distance from the point to the line segment
              const dist = distanceToSegment(newPoint, p1, p2);
              if (dist < bestDistance) {
                bestDistance = dist;
                bestIndex = i + 1; // Insert after p1
              }
            }
            
            if (bestDistance < 30) { // Only insert if it's close to a segment
              const newPoints = [...wire.points];
              newPoints.splice(bestIndex, 0, newPoint);
              return { ...wire, points: newPoints };
            }
          }
          return wire;
        });
      });
      return;
    }
    
    // Deselect any selected wire
    setSelectedWire(null);
  }, [pendingWire, editingWire, wireColorMenu, canvasRef]);
  
  // Calculate the distance from a point to a line segment
  const distanceToSegment = (p, v, w) => {
    const squaredLength = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (squaredLength === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / squaredLength;
    t = Math.max(0, Math.min(1, t));
    
    const projX = v.x + t * (w.x - v.x);
    const projY = v.y + t * (w.y - v.y);
    
    return Math.hypot(p.x - projX, p.y - projY);
  };
  
  // Handle double click on wire midpoints for deletion
  const handleWirePointDoubleClick = (wireId, pointIndex, e) => {
    e.stopPropagation();
    
    // Don't delete first or last point (source/target pin connections)
    if (pointIndex === 0 || pointIndex === wires.find(w => w.id === wireId)?.points.length - 1) {
      return;
    }
    
    // Remove the point from the wire
    setWires(prev => {
      return prev.map(wire => {
        if (wire.id === wireId) {
          const newPoints = [...wire.points];
          newPoints.splice(pointIndex, 1);
          return { ...wire, points: newPoints };
        }
        return wire;
      });
    });
  };
  
  // Start editing a wire
  const handleStartEditWire = (wireId, e) => {
    e.stopPropagation();
    setSelectedWire(wireId);
    setEditingWire(wireId);
  };
  
  // Finish editing a wire
  const handleFinishEditWire = () => {
    setEditingWire(null);
  };
  
  // Handle wire deletion
  const handleWireDelete = (wireId, e) => {
    e.stopPropagation();
    setWires(prev => prev.filter(wire => wire.id !== wireId));
    setSelectedWire(null);
    setEditingWire(null);
    setWireColorMenu({ visible: false, wireId: null, position: { x: 0, y: 0 } });
  };
  
  // Open the wire color menu
  const handleOpenColorMenu = (wireId, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top
    };
    
    setWireColorMenu({
      visible: true,
      wireId,
      position
    });
  };
  
  // Change the color of a wire
  const handleWireColorChange = (wireId, color) => {
    setWires(prev => 
      prev.map(wire => 
        wire.id === wireId 
          ? { ...wire, color } 
          : wire
      )
    );
    setWireColorMenu({ visible: false, wireId: null, position: { x: 0, y: 0 } });
  };
  
  // Register event listeners for pin registration and wire drawing
  useEffect(() => {
    // Handler for pin registration
    const handleRegisterPin = (e) => {
      const { id, parentId, pinType, label, element } = e.detail;
      console.log(`Pin registered: ${id}, type: ${pinType}`, element);
      
      setRegisteredPins(prev => ({
        ...prev,
        [id]: { id, parentId, type: pinType, label, element }
      }));
    };
    
    // Handler for pin unregistration
    const handleUnregisterPin = (e) => {
      const { id } = e.detail;
      console.log(`Pin unregistered: ${id}`);
      
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
      console.log(`Received pinClicked event for ${id || 'unknown pin'}`, e.detail);
      
      // If the ID is not provided, try to extract it from the element's data-pin-id attribute
      let pinId = id;
      if (!pinId && e.detail.element) {
        // Try to extract the pin ID from the element
        const element = e.detail.element;
        pinId = element.dataset?.pinId || element.getAttribute('data-pin-id');
        console.log(`Extracted pin ID from element: ${pinId}`);
      }
      
      if (pinId) {
        // Register the pin if it's not already registered
        if (!registeredPins[pinId] && e.detail.element) {
          console.log(`Auto-registering pin ${pinId} from click event`);
          
          // First register the pin so it's available for handlePinClick
          setRegisteredPins(prev => {
            const newPins = {
              ...prev,
              [pinId]: { 
                id: pinId, 
                parentId: e.detail.parentId, 
                type: e.detail.pinType || 'bidirectional', 
                label: e.detail.label || 'Pin', 
                element: e.detail.element 
              }
            };
            
            // If there's a pending wire, immediately connect to this newly registered pin
            if (pendingWire) {
              console.log(`Connecting pending wire to newly registered pin ${pinId}`);
              setTimeout(() => {
                handlePinClick(pinId);
              }, 0);
            } else {
              // If no pending wire, just start a new wire from this pin
              setTimeout(() => {
                handlePinClick(pinId);
              }, 0);
            }
            
            return newPins;
          });
        } else {
          // Pin is already registered, proceed with click handling
          handlePinClick(pinId);
        }
      } else {
        console.warn("Could not determine pin ID from event:", e.detail);
      }
    };
    
    // Handler for wire redrawing (e.g., when components move)
    const handleRedrawWires = () => {
      console.log("Redrawing wires");
      // Force redraw by creating a new array reference
      setWires(prev => {
        return prev.map(wire => {
          // Update source and target positions
          const sourceElement = registeredPins[wire.sourceId]?.element;
          const targetElement = registeredPins[wire.targetId]?.element;
          
          if (!sourceElement || !targetElement) {
            return wire;
          }
          
          const sourcePos = getElementPosition(sourceElement);
          const targetPos = getElementPosition(targetElement);
          
          // Keep any intermediate points but update the source and target
          const newPoints = wire.points?.length > 2 
            ? [sourcePos, ...wire.points.slice(1, -1), targetPos]
            : [sourcePos, targetPos];
          
          return { ...wire, points: newPoints };
        });
      });
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
    
    // Keyboard events for canceling wire creation/editing
    const handleKeyDown = (e) => {
      // Escape key to cancel pending wire or editing mode
      if (e.key === 'Escape') {
        if (pendingWire) {
          setPendingWire(null);
        }
        if (editingWire) {
          setEditingWire(null);
        }
        if (wireColorMenu.visible) {
          setWireColorMenu({ visible: false, wireId: null, position: { x: 0, y: 0 } });
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function to remove all event listeners
    return () => {
      document.removeEventListener('registerPin', handleRegisterPin);
      document.removeEventListener('unregisterPin', handleUnregisterPin);
      document.removeEventListener('pinClicked', handlePinClickEvent);
      document.removeEventListener('redrawWires', handleRedrawWires);
      document.removeEventListener('keydown', handleKeyDown);
      
      if (canvasElement) {
        canvasElement.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [canvasRef, handlePinClick, handleCanvasClick, pendingWire, editingWire, wireColorMenu, registeredPins, getElementPosition]);
  
  // Add mouse move handler for pending wire visualization
  useEffect(() => {
    if (!canvasRef?.current || !svgRef?.current) return;
    
    const canvasElement = canvasRef.current;
    
    const handlePendingWireMouseMove = (e) => {
      const svg = svgRef.current;
      if (!svg || !pendingWire) {
        // No pending wire, ensure the path is cleared
        const pendingPath = svg.querySelector('.pending-wire');
        if (pendingPath) {
          pendingPath.setAttribute('d', '');
        }
        return;
      }
      
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
          
          // Create the path with all intermediate points plus the current mouse position
          const allPoints = [
            sourcePos,
            ...(pendingWire.points || []),
            { x: mouseX, y: mouseY }
          ];
          
          // Generate the path from all points
          const pathString = generatePathFromPoints(allPoints);
          pendingPath.setAttribute('d', pathString);
        }
      }
    };
    
    // When pendingWire is null, immediately clear any lingering wire visualization
    if (!pendingWire) {
      const svg = svgRef.current;
      if (svg) {
        const pendingPath = svg.querySelector('.pending-wire');
        if (pendingPath) {
          pendingPath.setAttribute('d', ''); // Clear the path
        }
      }
    }
    
    canvasElement.addEventListener('mousemove', handlePendingWireMouseMove);
    
    // Cleanup function
    return () => {
      canvasElement.removeEventListener('mousemove', handlePendingWireMouseMove);
      
      // Also clean up when unmounting or updating
      if (svgRef.current) {
        const pendingPath = svgRef.current.querySelector('.pending-wire');
        if (pendingPath) {
          pendingPath.setAttribute('d', '');
        }
      }
    };
  }, [canvasRef, pendingWire, registeredPins, getElementPosition]);
  
  // Get wire color based on connection types
  const getWireColor = (sourceType, targetType) => {
    // Power connections (VCC, GND, etc.)
    if (
      (sourceType === 'output' && targetType === 'input') ||
      (sourceType === 'input' && targetType === 'output')
    ) {
      return '#ff3333'; // Red - power connections
    }
    
    // Signal connections
    if (sourceType === 'bidirectional' || targetType === 'bidirectional') {
      return '#3c61e3'; // Blue - bidirectional signals
    }
    
    // Default color
    return '#26b297'; // Teal - general signal
  };
  
  // Get wire style based on connection types - Wokwi style
  const getWireStyle = (sourceType, targetType, isSelected = false) => {
    // Common styles for all wires
    const commonStyle = {
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeMiterlimit: 10,
      fill: 'none',
      transition: 'stroke-width 0.2s, opacity 0.2s, filter 0.2s'
    };
    
    // Enhanced style for selected wires
    if (isSelected) {
      return {
        ...commonStyle,
        strokeWidth: 5,
        filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.6))',
        opacity: 1
      };
    }
    
    // Power connections - typically from outputs to inputs
    if (
      (sourceType === 'output' && targetType === 'input') ||
      (sourceType === 'input' && targetType === 'output')
    ) {
      // For power connections (typical LED to resistor, or board to LED)
      return {
        ...commonStyle,
        strokeWidth: 4, // Thicker for power connections
        filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.5))',
        opacity: 0.95
      };
    }
    
    // Bidirectional connections - typically for data or I/O pins
    if (sourceType === 'bidirectional' || targetType === 'bidirectional') {
      return {
        ...commonStyle,
        strokeWidth: 3.5,
        filter: 'drop-shadow(0px 1.5px 2px rgba(0, 0, 0, 0.3))',
        opacity: 0.9
      };
    }
    
    // Default style for other connections
    return {
      ...commonStyle,
      strokeWidth: 3.5,
      filter: 'drop-shadow(0px 1.5px 2px rgba(0, 0, 0, 0.25))',
      opacity: 0.85
    };
  };
  
  return (
    <>
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
          
          // Generate path from all points
          const pathString = generatePathFromPoints(wire.points || [
            getElementPosition(sourceElement),
            getElementPosition(targetElement)
          ]);
          
          // Determine if this wire is selected
          const isSelected = selectedWire === wire.id || editingWire === wire.id;
          
          // Get wire style
          const wireStyle = getWireStyle(wire.sourceType, wire.targetType, isSelected);
          
          return (
            <g key={wire.id} className="wire-group">
              {/* Main wire path */}
              <path
                d={pathString}
                stroke={wire.color || getWireColor(wire.sourceType, wire.targetType)}
                {...wireStyle}
                className={`wire ${isSelected ? 'selected-wire' : ''}`}
                data-wire-id={wire.id}
                onDoubleClick={(e) => handleWireDelete(wire.id, e)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWire(wire.id);
                }}
                onContextMenu={(e) => handleOpenColorMenu(wire.id, e)}
                style={{ pointerEvents: 'auto', cursor: isSelected ? 'crosshair' : 'pointer' }}
              />
              
              {/* Show wire control points when selected */}
              {isSelected && (wire.points || []).map((point, index) => (
                <circle
                  key={`${wire.id}-point-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={index === 0 || index === (wire.points || []).length - 1 ? 5 : 6}
                  fill={index === 0 || index === (wire.points || []).length - 1 ? wire.color : '#ffffff'}
                  stroke={wire.color}
                  strokeWidth={2}
                  style={{ 
                    pointerEvents: 'auto', 
                    cursor: index === 0 || index === (wire.points || []).length - 1 ? 'default' : 'pointer',
                    filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3))'
                  }}
                  onDoubleClick={(e) => handleWirePointDoubleClick(wire.id, index, e)}
                />
              ))}
            </g>
          );
        })}
        
        {/* Draw pending wire */}
        {pendingWire && (
          (() => {
            // Get source element
            const sourceElement = registeredPins[pendingWire.sourceId]?.element;
            if (!sourceElement) return null;
            
            // Get source position
            const sourcePos = getElementPosition(sourceElement);
            
            // Create the path with all intermediate points
            // The last point will be the current mouse position, handled by mousemove
            const allPoints = [
              sourcePos,
              ...(pendingWire.points || [])
            ];
            
            // Add an empty point for the current mouse position
            allPoints.push({ x: sourcePos.x, y: sourcePos.y });
            
            // Generate the path from all points
            const pathString = generatePathFromPoints(allPoints);
            
            // Define wire style for pending wire
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
              <>
                <path
                  className="pending-wire"
                  d={pathString}
                  {...wireStyle}
                  pointerEvents="none"
                />
                
                {/* Show intermediate points */}
                {pendingWire.points && pendingWire.points.map((point, index) => (
                  <circle
                    key={`pending-point-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={5}
                    fill="#ffffff"
                    stroke={wireStyle.stroke}
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                ))}
                
                {/* Source point */}
                <circle
                  cx={sourcePos.x}
                  cy={sourcePos.y}
                  r={5}
                  fill={wireStyle.stroke}
                  pointerEvents="none"
                />
              </>
            );
          })()
        )}
      </svg>
      
      {/* Wire editing toolbar with enhanced instructions */}
      {editingWire && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-3 rounded-md z-20 flex gap-3 shadow-lg border-2 border-blue-500">
          <div className="text-sm text-white flex flex-col gap-1">
            <div className="font-semibold">Wire Edit Mode</div>
            <div className="text-xs text-gray-300">
              • Click near wire to add bend points<br/>
              • Double-click points to remove them<br/>
              • Press ESC to cancel editing
            </div>
          </div>
          <button 
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 my-auto"
            onClick={handleFinishEditWire}
          >
            Done Editing
          </button>
        </div>
      )}
      
      {/* Selected wire controls with improved visual guidance */}
      {selectedWire && !editingWire && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-2 rounded-md z-20 flex gap-2 shadow-lg">
          <div className="text-xs text-gray-300 flex items-center mr-1">
            Wire selected:
          </div>
          <button 
            className="bg-blue-600 text-white px-2.5 py-1.5 rounded text-xs hover:bg-blue-700 flex items-center gap-1"
            onClick={(e) => handleStartEditWire(selectedWire, e)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Add Bends
          </button>
          <button 
            className="bg-purple-600 text-white px-2.5 py-1.5 rounded text-xs hover:bg-purple-700 flex items-center gap-1"
            onClick={(e) => handleOpenColorMenu(selectedWire, e)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Change Color
          </button>
          <button 
            className="bg-red-600 text-white px-2.5 py-1.5 rounded text-xs hover:bg-red-700 flex items-center gap-1"
            onClick={(e) => handleWireDelete(selectedWire, e)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
      
      {/* Wire color menu */}
      {wireColorMenu.visible && createPortal(
        <div 
          id="wire-color-menu"
          className="absolute bg-gray-800 rounded shadow-lg p-2 text-white z-30"
          style={{ 
            left: `${wireColorMenu.position.x}px`, 
            top: `${wireColorMenu.position.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px'
          }}
        >
          <div className="flex flex-wrap gap-1 justify-center mb-2 max-w-[180px]">
            {wireColorOptions.map((color, index) => (
              <button
                key={`color-${index}`}
                onClick={() => handleWireColorChange(wireColorMenu.wireId, color.value)}
                className="w-6 h-6 rounded-full hover:ring-2 hover:ring-white"
                style={{ 
                  backgroundColor: color.value,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
                aria-label={`Set wire color to ${color.value}`}
              />
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default WireManager;