import React, { useState, useRef, useEffect } from 'react';
import { PathLine } from 'react-svg-pathline';

/**
 * SimpleWireManager component for:
 * 1. Managing wire connections between components
 * 2. Drawing wires between pins
 * 3. Tracking connected pins
 * 4. Adding anchor points for custom wire routing
 * 5. Simplified wire deletion
 */
const SimpleWireManager = ({ canvasRef }) => {
  // State for wire connections
  const [wires, setWires] = useState([]);
  const [pendingWire, setPendingWire] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedWireId, setSelectedWireId] = useState(null);
  // New states for anchor point functionality
  const [wireAnchorPoints, setWireAnchorPoints] = useState({});
  const [activeWireForAnchors, setActiveWireForAnchors] = useState(null);
  const [showAnchorMode, setShowAnchorMode] = useState(false);
  // States for wire properties and customization
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedWireColor, setSelectedWireColor] = useState('#3b82f6');
  const [showWireProperties, setShowWireProperties] = useState(false);
  const [wireProperties, setWireProperties] = useState(null);
  const svgRef = useRef(null);

  // Function to get pin position from event with improved accuracy
  const getPinPosition = (event) => {
    if (!canvasRef?.current) return { x: 0, y: 0 };
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    return {
      x: event.clientX - canvasRect.left,
      y: event.clientY - canvasRect.top
    };
  };
  
  // Function to get mouse position relative to canvas
  const getMousePosition = () => {
    if (!canvasRef?.current) return { x: 0, y: 0 };
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    return {
      x: mousePosition.x - canvasRect.left,
      y: mousePosition.y - canvasRect.top
    };
  };
  
  // Function to get accurate pin position for a given element
  const getAccuratePinPosition = (element, pinName) => {
    if (!element || !canvasRef?.current) return null;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // For SVG elements, use precise transformations
    if (element.tagName && ['circle', 'rect', 'path'].includes(element.tagName.toLowerCase())) {
      try {
        const svgElement = svgRef?.current || document.querySelector('svg');
        if (svgElement) {
          const svgPoint = svgElement.createSVGPoint();
          const bbox = element.getBBox();
          svgPoint.x = bbox.x + bbox.width / 2;
          svgPoint.y = bbox.y + bbox.height / 2;
          
          const matrix = element.getScreenCTM();
          if (!matrix) throw new Error('No screen CTM available');
          
          const screenPoint = svgPoint.matrixTransform(matrix);
          
          return {
            x: screenPoint.x - canvasRect.left,
            y: screenPoint.y - canvasRect.top
          };
        }
      } catch (e) {
        console.warn(`SVG transform failed for pin ${pinName}:`, e);
      }
    }
    
    // Standard DOM element position calculation
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - canvasRect.left,
      y: rect.top + rect.height / 2 - canvasRect.top
    };
  };

  // Use a ref to store wire position cache to avoid unnecessary recalculations
  const wirePosCache = useRef({});
  
  // Get path for wire with direct straight lines or through anchor points
  const getWirePath = (start, end, wireId) => {
    // Validate input coordinates
    if (!start || !end || start.x === undefined || end.x === undefined) {
      console.warn('Invalid wire coordinates:', start, end);
      return ''; // Return empty path if coordinates are invalid
    }
    
    // For all wires, check if they have anchor points
    if (wireId && wireAnchorPoints[wireId] && wireAnchorPoints[wireId].length > 0) {
      // Draw path through user-defined anchor points
      const anchorPoints = wireAnchorPoints[wireId];
      let path = `M ${start.x} ${start.y}`;
      
      // Add line segments through each anchor point
      anchorPoints.forEach(point => {
        path += ` L ${point.x} ${point.y}`;
      });
      
      // Complete the path to the end point
      path += ` L ${end.x} ${end.y}`;
      
      return path;
    }
    
    // No anchor points - draw a direct straight line
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  };

  // Get style for wire based on type and color
  const getWireStyle = (sourceType, targetType, wireColor) => {
    // If a specific color is provided, use it
    let color = wireColor || '#3b82f6'; // Default blue
    
    // Determine color based on source and target types if not explicitly provided
    if (!wireColor) {
      // Power connections are red
      if (sourceType === 'power' || targetType === 'power' || 
          sourceType === 'output' && targetType === 'input') {
        color = '#ff6666'; // Red for power
      }
      // Ground connections are gray
      else if (sourceType === 'ground' || targetType === 'ground') {
        color = '#aaaaaa'; // Gray for ground
      }
      // Digital pin connections
      else if (sourceType === 'digital' || targetType === 'digital') {
        color = '#66ffff'; // Cyan for digital
      }
      // Analog pin connections
      else if (sourceType === 'analog' || targetType === 'analog') {
        color = '#ffcc66'; // Orange for analog
      }
    }
    
    // TinkerCad-style wire with double line effect
    return {
      stroke: color,
      strokeWidth: 2.5,
      fill: 'none',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3))'
    };
  };

  // Handle pin clicks from components
  const handlePinClick = (event) => {
    // Make sure the canvas reference is available
    if (!canvasRef || !canvasRef.current) {
      console.error('Canvas reference not available for wire positioning');
      return;
    }
    
    // Extract pin data
    console.log('Pin clicked on component:', event.detail);
    
    // The event now includes the pin ID
    let pinId = event.detail.id;
    if (!pinId) {
      console.error('No pin ID found in click event');
      return;
    }
    
    // Fix for duplicated component type in IDs
    // If the pin ID format has a duplicate component type (pt-componentType-componentType-componentId-pinName)
    // this fixes it to the standard format (pt-componentType-componentId-pinName)
    // Use regex pattern matching to detect duplicate segments in the ID
    if (pinId.match(/-(\w+)-\1-/)) {
      pinId = pinId.replace(/-(\w+)-\1-/, '-$1-');
      console.log('Fixed duplicated component type in ID:', pinId);
    }
    
    // Extract component ID and pin name from the pin ID format "pt-componentType-componentId-pinName"
    const parts = pinId.split('-');
    if (parts.length < 4) {
      console.error('Invalid pin ID format:', pinId);
      return;
    }
    
    const [prefix, componentType, componentId, ...pinNameParts] = parts;
    const pinName = pinNameParts.join('-'); // Handle pin names that might contain dashes
    const parentId = `${componentType}-${componentId}`;
    
    // Get pin type from data if available or default to bidirectional
    const pinType = event.detail.pinType || 'bidirectional';
    
    // Get detailed pin information if available
    let pinData = null;
    try {
      if (event.detail.pinData) {
        pinData = typeof event.detail.pinData === 'string' 
          ? JSON.parse(event.detail.pinData) 
          : event.detail.pinData;
      }
    } catch (e) {
      console.error('Error parsing pinData:', e);
    }
    
    // Calculate pin position
    let position = null;
    let pinElement = null; // Store pin element for future reference
    
    // STEP 1: Find the pin element in the DOM
    // Try multiple methods to find the pin element reliably
    
    // Method 1: Direct ID lookup
    pinElement = document.getElementById(pinId);
    
    // Method 2: Data attribute lookup
    if (!pinElement) {
      pinElement = document.querySelector(`[data-formatted-id="${pinId}"]`);
    }
    
    // Method 3: Pin name and parent component combination
    if (!pinElement) {
      pinElement = document.querySelector(`[data-pin-id="${pinName}"][data-parent-id="${parentId}"]`);
    }
    
    // Method 4: Look for elements containing both component ID and pin name
    if (!pinElement) {
      const similarElements = document.querySelectorAll(`[id*="${componentId}"][id*="${pinName}"]`);
      if (similarElements.length > 0) {
        pinElement = similarElements[0];
        console.log('Found pin element by partial match:', pinElement);
      }
    }
    
    // STEP 2: Determine the pin position
    // Priority 1: Use explicit coordinates from the event if they exist (most accurate)
    if (event.detail.clientX !== undefined && event.detail.clientY !== undefined) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      position = {
        x: event.detail.clientX - canvasRect.left,
        y: event.detail.clientY - canvasRect.top
      };
      console.log(`Using provided coordinates for pin ${pinName}:`, position);
    } 
    // Priority 2: If element was found, use its position with SVG transformations if applicable
    else if (pinElement) {
      try {
        // Check if this is an SVG element where we can use more accurate transformations
        if (pinElement.tagName && (
            pinElement.tagName.toLowerCase() === 'circle' || 
            pinElement.tagName.toLowerCase() === 'rect' || 
            pinElement.tagName.toLowerCase() === 'path')) {
          
          // Find the closest SVG element - either our wire manager SVG or another in the DOM
          const svgElement = svgRef?.current || document.querySelector('svg');
          if (svgElement) {
            // Get center point of pin in SVG coordinates
            const svgPoint = svgElement.createSVGPoint();
            const bbox = pinElement.getBBox();
            svgPoint.x = bbox.x + bbox.width / 2;
            svgPoint.y = bbox.y + bbox.height / 2;
            
            // Transform to screen coordinates
            const matrix = pinElement.getScreenCTM();
            const screenPoint = svgPoint.matrixTransform(matrix);
            
            // Calculate position relative to canvas
            const canvasRect = canvasRef.current.getBoundingClientRect();
            position = {
              x: screenPoint.x - canvasRect.left,
              y: screenPoint.y - canvasRect.top
            };
            console.log(`Using SVG transformations for pin ${pinName}:`, position);
          }
        } else {
          // Fallback to getBoundingClientRect for HTML elements
          const pinRect = pinElement.getBoundingClientRect();
          const canvasRect = canvasRef.current.getBoundingClientRect();
          position = {
            x: pinRect.left + (pinRect.width / 2) - canvasRect.left,
            y: pinRect.top + (pinRect.height / 2) - canvasRect.top
          };
          console.log(`Using DOM element position for pin ${pinName}:`, position);
        }
      } catch (error) {
        console.error('Error calculating SVG coordinates:', error);
        // Fallback to getBoundingClientRect
        const pinRect = pinElement.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        position = {
          x: pinRect.left + (pinRect.width / 2) - canvasRect.left,
          y: pinRect.top + (pinRect.height / 2) - canvasRect.top
        };
      }
    }
    // Priority 3: Use pin data coordinates if available (from component definitions)
    else if (pinData && pinData.x !== undefined && pinData.y !== undefined) {
      // Use coordinates directly from pinData - these should be already in canvas coordinates
      // but let's make sure we handle both absolute and relative coordinates
      if (typeof pinData.x === 'number' && typeof pinData.y === 'number') {
        position = {
          x: pinData.x,
          y: pinData.y
        };
        console.log(`Using pin data coordinates for ${pinName}:`, position);
      }
    }
    
    // Priority 3: Try to find the actual DOM element and use its position
    if (!position) {
      // Find the pin element - trying multiple selectors
      let pinElement = document.getElementById(pinId);
      
      // If not found by ID, try alternate selectors
      if (!pinElement) {
        // Try by data attribute
        pinElement = document.querySelector(`[data-formatted-id="${pinId}"]`);
        
        // If still not found, try by pin-id and parent-id combination
        if (!pinElement) {
          pinElement = document.querySelector(`[data-pin-id="${pinName}"][data-parent-id="${parentId}"]`);
          
          // Final attempt - try looking for similar IDs
          if (!pinElement) {
            const similarElements = document.querySelectorAll(`[id*="${componentId}"][id*="${pinName}"]`);
            if (similarElements.length > 0) {
              console.log('Found similar pin element by partial match');
              pinElement = similarElements[0];
            }
          }
        }
      }
      
      if (pinElement) {
        // Get accurate pin position relative to canvas
        const pinRect = pinElement.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        position = {
          x: pinRect.left + (pinRect.width / 2) - canvasRect.left,
          y: pinRect.top + (pinRect.height / 2) - canvasRect.top
        };
        
        console.log(`Pin position calculated from element for ${pinName}:`, position);
      }
    }
    
    // If all methods failed, use a fallback position
    if (!position) {
      console.error('Could not determine pin position accurately');
      position = getMousePosition(); // Use current mouse position as fallback
      console.warn(`Using mouse position as fallback for pin ${pinName}:`, position);
    }
    
    if (!pendingWire) {
      // Start a new wire
      setPendingWire({
        sourceId: pinId,
        sourceType: pinType,
        sourceParentId: parentId,
        sourcePos: position,
        sourceName: pinName,
        waypoints: [] // Initialize empty waypoints array
      });
      
      // Add visual indication if element exists
      if (pinElement) {
        pinElement.classList.add('wire-source-active');
        
        // Add pulsing animation to show it's active
        pinElement.style.animation = 'pulse 1.5s infinite';
      }
    } else {
      // Finish a wire
      const { sourceId, sourceType, sourceParentId, sourcePos, sourceName } = pendingWire;
      
      // Prevent connecting a pin to itself
      if (sourceId === pinId) {
        console.log('Cannot connect a pin to itself');
        setPendingWire(null);
        document.querySelectorAll('.wire-source-active').forEach(el => {
          el.classList.remove('wire-source-active');
          el.style.animation = '';
        });
        return;
      }
      
      // Prevent connecting pins on the same component
      if (sourceParentId === parentId) {
        console.log('Cannot connect pins on the same component');
        setPendingWire(null);
        document.querySelectorAll('.wire-source-active').forEach(el => {
          el.classList.remove('wire-source-active');
          el.style.animation = '';
        });
        return;
      }
      
      // Log the connection for debugging
      console.log(`Creating wire from ${sourceName} (${sourceId}) to ${pinName} (${pinId})`);
      
      // Determine proper wire color based on pin names
      let wireColor = '#3b82f6'; // Default blue
      
      // Power connections (5V, 3.3V)
      if (sourceName?.includes('5V') || sourceName?.includes('3V3') || 
          pinName?.includes('5V') || pinName?.includes('3V3')) {
        wireColor = '#ff6666'; // Red for power
      }
      // Ground connections
      else if (sourceName?.includes('GND') || pinName?.includes('GND')) {
        wireColor = '#aaaaaa'; // Gray for ground
      }
      // Digital pin connections
      else if ((sourceName?.startsWith('D') || pinName?.startsWith('D')) ||
               (!isNaN(parseInt(sourceName, 10)) || !isNaN(parseInt(pinName, 10)))) {
        wireColor = '#66ffff'; // Cyan for digital
      }
      // Analog pin connections
      else if (sourceName?.startsWith('A') || pinName?.startsWith('A')) {
        wireColor = '#ffcc66'; // Orange for analog
      }
      
      // Add the new wire
      // Use a consistent wire ID format that's the same regardless of connection direction
      // Sort the IDs alphabetically to ensure the same connection always gets the same ID
      const wireEndpoints = [sourceId, pinId].sort();
      const wireId = `wire-${wireEndpoints[0]}-${wireEndpoints[1]}`;
      
      // Check if this wire already exists (same connection)
      const wireExists = wires.some(w => w.id === wireId ||
        (w.sourceId === sourceId && w.targetId === pinId) ||
        (w.sourceId === pinId && w.targetId === sourceId));
      
      if (wireExists) {
        console.log('Wire already exists between these pins');
        setPendingWire(null);
        document.querySelectorAll('.wire-source-active').forEach(el => {
          el.classList.remove('wire-source-active');
          el.style.animation = '';
        });
        return;
      }
      
      const newWire = {
        id: wireId,
        sourceId,
        targetId: pinId,
        sourceType,
        targetType: pinType,
        sourcePos,
        targetPos: position,
        sourceName,
        targetName: pinName,
        color: wireColor
      };
      
      // Add the new wire
      setWires(prev => [...prev, newWire]);
      
      // If the pending wire has waypoints, store them as anchor points for this wire
      if (pendingWire.waypoints && pendingWire.waypoints.length > 0) {
        console.log(`Adding ${pendingWire.waypoints.length} waypoints to new wire ${wireId}`);
        setWireAnchorPoints(prev => ({
          ...prev,
          [wireId]: [...pendingWire.waypoints]
        }));
      }
      
      // Reset the pending wire
      setPendingWire(null);
      
      // Log connected pins for simulation
      const pinConnections = {};
      pinConnections[sourceId] = pinId;
      pinConnections[pinId] = sourceId;
      
      console.log('Pin connections mapped:', pinConnections);
      
      // Dispatch event for simulation
      document.dispatchEvent(new CustomEvent('pinConnectionCreated', {
        detail: {
          connection: newWire,
          pinConnections
        }
      }));
      
      // Clean up visual indication
      document.querySelectorAll('.wire-source-active').forEach(el => {
        el.classList.remove('wire-source-active');
        el.style.animation = '';
      });
    }
  };

  // Handle mouse movement for the pending wire with throttling for better performance
  const handleMouseMove = (e) => {
    if (!canvasRef?.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const currentPos = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top
    };
    
    // Update mouse position for wire drawing
    if (pendingWire) {
      // Don't process every mouse move event - this improves performance during component dragging
      if (throttlingActive) return;
      
      throttlingActive = true;
      setTimeout(() => { throttlingActive = false; }, 20); // 50fps is plenty smooth
      
      setMousePosition(currentPos);
    } else {
      // Always update mouse position for anchor mode
      setMousePosition(currentPos);
    }
    
    // If in anchor mode, check for nearby pins to provide visual feedback
    if (showAnchorMode && activeWireForAnchors) {
      // Clear previous pin highlight
      document.querySelectorAll('.pin-hover-highlight').forEach(el => {
        el.classList.remove('pin-hover-highlight');
      });
      
      // Check for nearby pin and highlight it
      const nearbyPin = findNearbyPin(currentPos);
      if (nearbyPin) {
        // Find all pins at this position and highlight them
        const pinElements = document.querySelectorAll('[class*="pin-connection-point"], [id^="pt-"]');
        for (const pinEl of pinElements) {
          try {
            const pinRect = pinEl.getBoundingClientRect();
            const pinCenter = {
              x: pinRect.left + (pinRect.width / 2) - canvasRect.left,
              y: pinRect.top + (pinRect.height / 2) - canvasRect.top
            };
            
            // If this is our nearby pin, highlight it
            const distance = Math.sqrt(
              Math.pow(pinCenter.x - nearbyPin.x, 2) + 
              Math.pow(pinCenter.y - nearbyPin.y, 2)
            );
            
            if (distance < 2) { // Very close match to the pin we found
              pinEl.classList.add('pin-hover-highlight');
            }
          } catch (error) {
            console.error('Error highlighting pin:', error);
          }
        }
      }
    }
  };
  
  // Control variable for throttling
  let throttlingActive = false;

  // Handle clicks on wires for selection
  const handleWireClick = (wireId, e) => {
    e.stopPropagation(); // Prevent canvas click handler from firing
    console.log('Wire clicked:', wireId);
    
    // If anchor mode is active and this is the active wire, add anchor point
    if (showAnchorMode && activeWireForAnchors === wireId) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const point = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
      };
      
      // Add anchor point for the active wire
      setWireAnchorPoints(prev => {
        const currentAnchors = prev[wireId] || [];
        return {
          ...prev,
          [wireId]: [...currentAnchors, point]
        };
      });
      
      console.log(`Added anchor point at (${point.x}, ${point.y}) to wire ${wireId}`);
      return; // Don't change selection when adding anchor points
    }
    
    // Toggle wire selection
    if (selectedWireId === wireId) {
      // Don't deselect when clicking the same wire again
      // This makes the toolbar more usable since it prevents accidental deselection
      return;
    } else {
      // Deselect any previously selected wire
      if (selectedWireId) {
        document.querySelectorAll('.selected-wire-highlight').forEach(el => {
          el.classList.remove('selected-wire-highlight');
        });
      }
      
      // Select the new wire
      setSelectedWireId(wireId);
      
      // Calculate and store wire properties for display
      const selectedWire = wires.find(w => w.id === wireId);
      if (selectedWire) {
        // Use the calculated length if available, otherwise calculate directly
        const wireLength = selectedWire.calculatedLength || calculateWireLength(selectedWire);
        
        // Get anchor points count
        const anchorCount = (wireAnchorPoints[wireId] || []).length;
        
        const wireInfo = {
          id: wireId,
          source: selectedWire.sourceName || 'Unknown',
          target: selectedWire.targetName || 'Unknown',
          sourceType: selectedWire.sourceType || 'Unknown',
          targetType: selectedWire.targetType || 'Unknown',
          length: wireLength.toFixed(2),
          color: selectedWire.color || getWireStyle(selectedWire.sourceType, selectedWire.targetType).stroke,
          anchorCount
        };
        
        setWireProperties(wireInfo);
        setSelectedWireColor(wireInfo.color);
        
        // Wire properties only show when info button is clicked now
        setShowWireProperties(false);
        
        console.log(`Wire properties: ${wireLength.toFixed(2)}px length, ${anchorCount} anchor points`);
      }
      
      // Add visual highlight to help user see the selected wire
      const wirePath = document.querySelector(`path[data-wire-id="${wireId}"]`);
      if (wirePath) {
        wirePath.classList.add('selected-wire-highlight');
      }
      
      // Reset anchor mode when selecting a new wire
      setShowAnchorMode(false);
      setActiveWireForAnchors(null);
      
      console.log('Wire selected. Use the toolbar to modify or delete it.');
    }
  };
  
  // Calculate the length of a wire
  const calculateWireLength = (wire) => {
    if (!wire.sourcePos || !wire.targetPos) return 0;
    
    const dx = wire.targetPos.x - wire.sourcePos.x;
    const dy = wire.targetPos.y - wire.sourcePos.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Toggle anchor mode for a wire
  const toggleAnchorMode = (wireId) => {
    const newModeState = !showAnchorMode || activeWireForAnchors !== wireId;
    setShowAnchorMode(newModeState);
    setActiveWireForAnchors(newModeState ? wireId : null);
    
    if (newModeState) {
      // When entering anchor mode, update UI to indicate it
      console.log('Anchor mode enabled. Click anywhere to add anchor points to the wire.');
    } else {
      console.log('Anchor mode disabled.');
    }
  };
  
  // Apply a new color to the selected wire
  const applyWireColor = (wireId, color) => {
    setWires(prev => prev.map(wire => {
      if (wire.id === wireId) {
        return { ...wire, color };
      }
      return wire;
    }));
    
    console.log(`Changed wire ${wireId} color to ${color}`);
  };
  
  // Remove an anchor point from a wire
  const removeAnchorPoint = (wireId, anchorIndex) => {
    setWireAnchorPoints(prev => {
      if (!prev[wireId]) return prev;
      
      const updatedAnchors = [...prev[wireId]];
      updatedAnchors.splice(anchorIndex, 1);
      
      // Update wire properties if needed
      if (wireProperties && wireProperties.id === wireId) {
        setWireProperties(prevProps => ({
          ...prevProps,
          anchorCount: updatedAnchors.length
        }));
      }
      
      return {
        ...prev,
        [wireId]: updatedAnchors
      };
    });
    
    console.log(`Removed anchor point ${anchorIndex} from wire ${wireId}`);
  };
  
  // Clear all anchor points for a wire
  const clearAnchorPoints = (wireId) => {
    setWireAnchorPoints(prev => {
      const newAnchors = {...prev};
      newAnchors[wireId] = []; // Clear but keep the entry for this wire
      return newAnchors;
    });
    
    // Update wire properties if needed
    if (wireProperties && wireProperties.id === wireId) {
      setWireProperties(prevProps => ({
        ...prevProps,
        anchorCount: 0
      }));
    }
    
    console.log(`Cleared all anchor points for wire ${wireId}`);
  };
  
  // Function to find a pin near the clicked point
  const findNearbyPin = (clickedPoint, threshold = 15) => {
    if (!canvasRef?.current) return null;
    
    // Get all pin elements on the canvas
    const pinElements = document.querySelectorAll('[class*="pin-connection-point"], [id^="pt-"]');
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Search through all pins to find one within threshold distance
    for (const pinEl of pinElements) {
      try {
        // Get pin position relative to canvas
        const pinRect = pinEl.getBoundingClientRect();
        const pinCenter = {
          x: pinRect.left + (pinRect.width / 2) - canvasRect.left,
          y: pinRect.top + (pinRect.height / 2) - canvasRect.top
        };
        
        // Calculate distance between pin and clicked point
        const distance = Math.sqrt(
          Math.pow(pinCenter.x - clickedPoint.x, 2) + 
          Math.pow(pinCenter.y - clickedPoint.y, 2)
        );
        
        // If within threshold, return this pin's position
        if (distance <= threshold) {
          console.log(`Found nearby pin ${pinEl.id} at distance ${distance.toFixed(2)}px`);
          return pinCenter;
        }
      } catch (error) {
        console.error('Error calculating pin position for nearby check:', error);
      }
    }
    
    return null; // No nearby pin found
  };
  
  // Handle clicks on canvas to add turning points to wires, deselect wires, or add anchor points
  const handleCanvasClick = (e) => {
    // Ignore if click was on a pin
    if (e.target.classList.contains('pin-connection-point')) {
      return;
    }
    
    // Get click position relative to canvas
    const canvasRect = canvasRef.current.getBoundingClientRect();
    let point = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top
    };
    
    // Check if the click is near a pin - if so, snap to the pin
    const nearbyPin = findNearbyPin(point);
    if (nearbyPin) {
      console.log(`Found nearby pin at (${nearbyPin.x}, ${nearbyPin.y}). Snapping point.`);
      point = nearbyPin;
    }
    
    // If in anchor mode, add anchor point for existing wire
    if (showAnchorMode && activeWireForAnchors) {
      // Add anchor point for the active wire
      setWireAnchorPoints(prev => {
        const currentAnchors = prev[activeWireForAnchors] || [];
        const updatedAnchors = [...currentAnchors, point];
        
        // Update wire properties if this is the selected wire
        if (wireProperties && wireProperties.id === activeWireForAnchors) {
          setWireProperties(prevProps => ({
            ...prevProps,
            anchorCount: updatedAnchors.length
          }));
        }
        
        return {
          ...prev,
          [activeWireForAnchors]: updatedAnchors
        };
      });
      
      console.log(`Added anchor point at (${point.x}, ${point.y}) to wire ${activeWireForAnchors}`);
      return;
    }
    
    // If there's a pending wire, add a waypoint to it
    if (pendingWire) {
      // Store the waypoint with the pending wire
      const waypoints = pendingWire.waypoints || [];
      setPendingWire({
        ...pendingWire,
        waypoints: [...waypoints, point]
      });
      console.log(`Added waypoint at (${point.x}, ${point.y}) to pending wire`);
      return;
    }
    
    // Deselect any selected wire
    if (selectedWireId) {
      setSelectedWireId(null);
      setShowWireProperties(false);
    }
  };

  // Handle wire deletion
  const handleDeleteWire = () => {
    if (selectedWireId) {
      // Remove the wire from the array
      setWires(prev => prev.filter(wire => wire.id !== selectedWireId));
      
      // Remove any wire highlights
      document.querySelectorAll('.selected-wire-highlight').forEach(el => {
        el.classList.remove('selected-wire-highlight');
      });
      
      // Clear anchor points for this wire
      if (wireAnchorPoints[selectedWireId]) {
        setWireAnchorPoints(prev => {
          const newPoints = {...prev};
          delete newPoints[selectedWireId];
          return newPoints;
        });
      }
      
      // Reset state
      setSelectedWireId(null);
      setShowWireProperties(false);
      setShowAnchorMode(false);
      setActiveWireForAnchors(null);
      
      // Dispatch event to notify simulation of deleted connection
      document.dispatchEvent(new CustomEvent('pinConnectionRemoved', {
        detail: { wireId: selectedWireId }
      }));
      
      console.log(`Successfully deleted wire: ${selectedWireId}`);
    } else {
      console.log('No wire selected for deletion');
    }
  };

  // Setup event listeners for pin clicks and wire drawing
  useEffect(() => {
    // Listen for pin click events
    document.addEventListener('pinClicked', handlePinClick);
    
    // Add canvas event listeners
    const canvasElement = canvasRef?.current;
    if (canvasElement) {
      canvasElement.addEventListener('mousemove', handleMouseMove);
      canvasElement.addEventListener('click', handleCanvasClick);
    }
    
    // Add keyboard event listener for delete key
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedWireId) {
        handleDeleteWire();
      }
      
      // Escape key to cancel pending wire or deselect selected wire
      if (e.key === 'Escape') {
        if (pendingWire) {
          setPendingWire(null);
          document.querySelectorAll('.wire-source-active').forEach(el => {
            el.classList.remove('wire-source-active');
            el.style.animation = '';
          });
        } else if (selectedWireId) {
          setSelectedWireId(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Debug - log any existing wires
    console.log('Current wires:', wires);
    
    // Clean up
    return () => {
      document.removeEventListener('pinClicked', handlePinClick);
      window.removeEventListener('keydown', handleKeyDown);
      
      if (canvasElement) {
        canvasElement.removeEventListener('mousemove', handleMouseMove);
        canvasElement.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [canvasRef, pendingWire, selectedWireId]);
  
  // Debug - log when wires array changes
  useEffect(() => {
    console.log('Wires updated:', wires);
  }, [wires]);
  
  // Listen for delete wire event from the Circuit Builder delete button
  useEffect(() => {
    const deleteWireListener = () => {
      if (selectedWireId) {
        handleDeleteWire();
      }
    };
    
    document.addEventListener('deleteSelectedWire', deleteWireListener);
    
    return () => {
      document.removeEventListener('deleteSelectedWire', deleteWireListener);
    };
  }, [selectedWireId]);

  // Run only once at initialization to set up a wire cleanup timer
  useEffect(() => {
    console.log('Setting up wire cleanup timer');
    
    // Create a cleanup function that runs periodically
    const cleanupInterval = setInterval(() => {
      // Only run if there are wires and not too frequently (performance optimization)
      if (wires.length > 0) {
        // Create a map to track unique wire connections
        const wiresMap = new Map();
        let hasDuplicates = false;
        
        // Process all wires to deduplicate
        wires.forEach(wire => {
          // Skip invalid wires
          if (!wire.sourceId || !wire.targetId) return;
          
          // Normalize IDs to handle duplicate component types
          const sourceId = wire.sourceId.replace(/-(\w+)-\1-/, '-$1-') || wire.sourceId;
          const targetId = wire.targetId.replace(/-(\w+)-\1-/, '-$1-') || wire.targetId;
          
          // Create a consistent key that's the same regardless of wire direction
          const endpoints = [sourceId, targetId].sort();
          const consistentId = `wire-${endpoints[0]}-${endpoints[1]}`;
          
          // Check if this wire is already in our map (a duplicate)
          if (wiresMap.has(consistentId)) {
            console.log(`Found duplicate wire: ${wire.id}`);
            hasDuplicates = true;
          } else {
            // Add this wire to the map with normalized IDs
            wiresMap.set(consistentId, {
              ...wire,
              id: consistentId,
              sourceId, 
              targetId
            });
          }
        });
        
        // If we found duplicates, update the wires array
        if (hasDuplicates) {
          console.log(`Removed ${wires.length - wiresMap.size} duplicate wires`);
          setWires(Array.from(wiresMap.values()));
        }
      }
    }, 1000); // Run cleanup every second
    
    // Clean up the interval when component unmounts
    return () => clearInterval(cleanupInterval);
  }, []); // Empty dependency array means this runs only once at initialization

  // Wokwi-style component movement handler - with throttling for better performance
  useEffect(() => {
    // Events that should trigger wire position updates
    const events = ['componentMoved', 'componentMovedFinal', 'redrawWires'];
    
    // Track last update time for throttling
    let lastUpdateTime = 0;
    const throttleInterval = 50; // Reduced from 500ms to 50ms for more responsive updates
    
    // Enhanced function to update wire positions when components move
    const handleComponentMove = (event) => {
      const currentTime = performance.now();
      
      // Extract the component ID and position from the event detail
      let movedComponentId = null;
      let newPosition = null;
      
      try {
        if (event.detail && event.detail.componentId) {
          movedComponentId = event.detail.componentId;
          newPosition = event.detail.newPosition;
          console.log(`Component moved: ${movedComponentId}`, newPosition ? `to (${newPosition.x},${newPosition.y})` : '');
        }
      } catch (e) {
        console.warn('Error extracting component ID from event:', e);
      }
      
      // Always process these events immediately for responsive UI
      const shouldUpdate = 
        event.type === 'componentMovedFinal' || 
        event.type === 'redrawWires' || 
        currentTime - lastUpdateTime > throttleInterval;
      
      if (shouldUpdate) {
        console.log(`Updating wire positions due to ${event.type} event`);
        
        // Update pin positions in global cache if component moved with position data
        if (movedComponentId && newPosition && window.pinPositionCache) {
          // Update all pins from this component in the global pin position cache
          Array.from(window.pinPositionCache.keys()).forEach(key => {
            if (key.includes(movedComponentId)) {
              const pinData = window.pinPositionCache.get(key);
              if (pinData && pinData.origComponentX !== undefined) {
                // Calculate pin's relative offset from component position
                const deltaX = pinData.x - pinData.origComponentX;
                const deltaY = pinData.y - pinData.origComponentY;
                
                // Update pin position based on new component position
                const updatedPinData = {
                  ...pinData,
                  x: newPosition.x + deltaX,
                  y: newPosition.y + deltaY,
                  origComponentX: newPosition.x,
                  origComponentY: newPosition.y,
                  timestamp: Date.now()
                };
                
                window.pinPositionCache.set(key, updatedPinData);
                console.log(`Updated pin position for ${key}:`, updatedPinData);
              }
            }
          });
        }
        
        // Force position cache clearing for affected wires
        if (movedComponentId) {
          // Clear cache for wires connected to the moved component
          Object.keys(wirePosCache.current).forEach(wireId => {
            if (wireId.includes(movedComponentId)) {
              delete wirePosCache.current[wireId];
            }
          });
        } else {
          // If we don't know which component moved, clear all caches
          wirePosCache.current = {};
        }
        
        // This triggers a re-render that will call getUpdatedWirePositions()
        // with fresh calculations since we cleared the relevant cache entries
        setWires(prevWires => {
          // Mark affected wires as needing position update
          // This makes getUpdatedWirePositions() get fresh positions from DOM
          return prevWires.map(wire => {
            // If this wire is connected to the moved component, clear its positions
            if (movedComponentId && 
                (wire.sourceId?.includes(movedComponentId) || 
                 wire.targetId?.includes(movedComponentId))) {
              return {
                ...wire,
                _positionsNeedUpdate: true // Flag to force recalculation
              };
            }
            return wire;
          });
        });
        
        lastUpdateTime = currentTime;
      }
    };
    
    // Register for all events that should update wire positions
    events.forEach(eventName => {
      document.addEventListener(eventName, handleComponentMove);
    });
    
    // Clean up
    return () => {
      events.forEach(eventName => {
        document.removeEventListener(eventName, handleComponentMove);
      });
    };
  }, []);

  // Get current wire positions - COMPLETELY REWRITTEN to prevent position drift
  const getUpdatedWirePositions = () => {
    if (!canvasRef?.current) return [];
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // First, deduplicate wires by ID to prevent duplicate keys in React
    const wireMap = new Map();
    wires.forEach(wire => {
      if (!wire) return; // Skip null/undefined wires
      
      // Use actual component and pin names to create a unique key
      const sourceId = wire.sourceId || '';
      const targetId = wire.targetId || '';
      
      // Extract actual pin names for more reliable identification
      const sourcePin = sourceId.split('-').pop() || '';
      const targetPin = targetId.split('-').pop() || '';
      
      // Extract component IDs (component type + component ID)
      const sourceComponentId = sourceId.split('-').slice(1, 3).join('-');
      const targetComponentId = targetId.split('-').slice(1, 3).join('-');
      
      // Create a consistent key by always ordering components alphabetically
      const [firstComp, firstPin, secondComp, secondPin] = 
        sourceComponentId < targetComponentId 
          ? [sourceComponentId, sourcePin, targetComponentId, targetPin]
          : [targetComponentId, targetPin, sourceComponentId, sourcePin];
          
      const wireKey = `wire-${firstComp}-${firstPin}-${secondComp}-${secondPin}`;
      
      // Only keep the most recent wire for each unique connection
      // Check if we have a wire with this key already
      if (!wireMap.has(wireKey) || 
          (wire._positionsNeedUpdate && !wireMap.get(wireKey)._positionsNeedUpdate)) {
        wireMap.set(wireKey, wire);
      }
    });
    
    // Process all dynamic wires and update positions with the deduplicated list
    return Array.from(wireMap.values())
      .map(wire => {
        // Skip invalid wires
        if (!wire.sourceId || !wire.targetId) {
          return { ...wire, invalid: true };
        }
        
        // Force position update if flagged or component moved
        const forcePosUpdate = wire._positionsNeedUpdate === true;
        
        // Only continue with position calculation for new wires
        // Fix for duplicated component type in source ID
        let sourceId = wire.sourceId;
        let targetId = wire.targetId;
        
        // Handle duplicated component types in IDs
        if (sourceId && (sourceId.includes('-heroboard-heroboard-') || 
            sourceId.includes('-led-led-') || 
            sourceId.includes('-rgb-rgb-') || 
            sourceId.includes('-rotary-rotary-'))) {
          sourceId = sourceId.replace(/-(\w+)-\1-/, '-$1-');
        }
        
        if (targetId && (targetId.includes('-heroboard-heroboard-') || 
            targetId.includes('-led-led-') || 
            targetId.includes('-rgb-rgb-') || 
            targetId.includes('-rotary-rotary-'))) {
          targetId = targetId.replace(/-(\w+)-\1-/, '-$1-');
        }
        
        // Create a unique and consistent wire ID
        // Sort source and target IDs to ensure consistency regardless of connection order
        const wireEndpoints = [sourceId, targetId].sort();
        const consistentWireId = `wire-${wireEndpoints[0]}-${wireEndpoints[1]}`;
        
        // Update wire ID if needed
        if (consistentWireId !== wire.id) {
          console.log(`Normalized wire ID from ${wire.id} to ${consistentWireId}`);
          wire.id = consistentWireId; // Update the ID to avoid duplicates
        }
        
        // Check if we have valid positions as fallback
        // Note: We already checked this at the beginning, but keeping it for code clarity
        const hasExistingPositions = 
          wire.sourcePos && wire.targetPos && 
          typeof wire.sourcePos.x === 'number' && 
          typeof wire.targetPos.x === 'number';
        
        // Try multiple selector strategies to find the pin elements
        
        // 1. Try direct ID lookup
        let sourceElement = document.getElementById(sourceId);
        let targetElement = document.getElementById(targetId);
        
        // 2. Try original IDs if the fixed ones don't work
        if (!sourceElement) sourceElement = document.getElementById(wire.sourceId);
        if (!targetElement) targetElement = document.getElementById(wire.targetId);
        
        // 3. Try formatted data attributes
        if (!sourceElement) sourceElement = document.querySelector(`[data-formatted-id="${sourceId}"]`);
        if (!targetElement) targetElement = document.querySelector(`[data-formatted-id="${targetId}"]`);
        
        // 4. Try pin-id and parent-id attributes
        if (!sourceElement) {
          const sourceParts = sourceId.split('-');
          if (sourceParts.length >= 4) {
            const pinName = sourceParts.slice(3).join('-');
            const parentId = `${sourceParts[1]}-${sourceParts[2]}`;
            sourceElement = document.querySelector(`[data-pin-id="${pinName}"][data-parent-id="${parentId}"]`);
          }
        }
        
        if (!targetElement) {
          const targetParts = targetId.split('-');
          if (targetParts.length >= 4) {
            const pinName = targetParts.slice(3).join('-');
            const parentId = `${targetParts[1]}-${targetParts[2]}`;
            targetElement = document.querySelector(`[data-pin-id="${pinName}"][data-parent-id="${parentId}"]`);
          }
        }
        
        // 5. Final attempt - look for any pin element that contains the component and pin IDs
        if (!sourceElement) {
          const similarElements = document.querySelectorAll(`[id*="${wire.sourceName}"]`);
          if (similarElements.length > 0) sourceElement = similarElements[0];
        }
        
        if (!targetElement) {
          const similarElements = document.querySelectorAll(`[id*="${wire.targetName}"]`);
          if (similarElements.length > 0) targetElement = similarElements[0];
        }
        
        // Check if we have cached positions for this wire
        const cachedPositions = wirePosCache.current[wire.id];
        
        // If we have cached positions and can't find elements, use the cached positions
        if ((!sourceElement || !targetElement) && cachedPositions) {
          console.warn(`Using cached positions for wire ${wire.id}`);
          return {
            ...wire,
            sourcePos: cachedPositions.sourcePos,
            targetPos: cachedPositions.targetPos,
            sourceId,
            targetId,
            id: consistentWireId // Ensure consistent ID
          };
        }
        
        // If we still can't find the elements and have valid positions, use the old ones
        if ((!sourceElement || !targetElement) && hasExistingPositions) {
          console.warn(`Using previous positions for wire ${wire.id}`);
          
          // Cache these positions for future use
          wirePosCache.current[consistentWireId] = {
            sourcePos: { ...wire.sourcePos },
            targetPos: { ...wire.targetPos }
          };
          
          return {
            ...wire,
            id: consistentWireId // Ensure consistent ID
          };
        }
        
        // If we can't find the elements and don't have valid positions, mark as invalid
        if (!sourceElement || !targetElement) {
          console.warn(`Elements not found for wire ${wire.id}: source=${sourceId}, target=${targetId}`);
          return { ...wire, invalid: true };
        }
        
        // Get precise center positions relative to canvas using SVG coordinate transformations
        // This is more accurate than getBoundingClientRect() especially when transforms are involved
        let sourcePos = { x: 0, y: 0 };
        let targetPos = { x: 0, y: 0 };
        
        try {
          // For SVG elements, use getScreenCTM for accuracy with transformations
          if (sourceElement.tagName && (
              sourceElement.tagName.toLowerCase() === 'circle' || 
              sourceElement.tagName.toLowerCase() === 'rect' || 
              sourceElement.tagName.toLowerCase() === 'path')) {
            // Get SVG coordinates - either our wire manager SVG or another in the DOM
            const svgElement = svgRef?.current || document.querySelector('svg');
            if (svgElement) {
              // Get center point of source pin
              const sourceSVGPoint = svgElement.createSVGPoint();
              const sourceBBox = sourceElement.getBBox();
              sourceSVGPoint.x = sourceBBox.x + sourceBBox.width / 2;
              sourceSVGPoint.y = sourceBBox.y + sourceBBox.height / 2;
              
              // Transform to screen coordinates
              const sourceMatrix = sourceElement.getScreenCTM();
              const sourceScreenPoint = sourceSVGPoint.matrixTransform(sourceMatrix);
              
              // Calculate position relative to canvas
              sourcePos = {
                x: sourceScreenPoint.x - canvasRect.left,
                y: sourceScreenPoint.y - canvasRect.top
              };
              
              // Get center point of target pin
              const targetSVGPoint = svgElement.createSVGPoint();
              const targetBBox = targetElement.getBBox();
              targetSVGPoint.x = targetBBox.x + targetBBox.width / 2;
              targetSVGPoint.y = targetBBox.y + targetBBox.height / 2;
              
              // Transform to screen coordinates
              const targetMatrix = targetElement.getScreenCTM();
              const targetScreenPoint = targetSVGPoint.matrixTransform(targetMatrix);
              
              // Calculate position relative to canvas
              targetPos = {
                x: targetScreenPoint.x - canvasRect.left,
                y: targetScreenPoint.y - canvasRect.top
              };
              
              // Only log in debug mode
              if (process.env.NODE_ENV === 'development' && sessionStorage.getItem('debug') === 'true') {
                console.log('Using SVG transformations for wire positions');
              }
            }
          } else {
            // Fallback to getBoundingClientRect for HTML elements
            const sourceRect = sourceElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            
            sourcePos = {
              x: sourceRect.left + (sourceRect.width / 2) - canvasRect.left,
              y: sourceRect.top + (sourceRect.height / 2) - canvasRect.top
            };
            
            targetPos = {
              x: targetRect.left + (targetRect.width / 2) - canvasRect.left,
              y: targetRect.top + (targetRect.height / 2) - canvasRect.top
            };
            
            // Only log in debug mode
            if (process.env.NODE_ENV === 'development' && sessionStorage.getItem('debug') === 'true') {
              console.log('Using getBoundingClientRect for wire positions');
            }
          }
        } catch (error) {
          console.error('Error calculating SVG coordinates:', error);
          
          // Fallback to getBoundingClientRect
          const sourceRect = sourceElement.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          
          sourcePos = {
            x: sourceRect.left + (sourceRect.width / 2) - canvasRect.left,
            y: sourceRect.top + (sourceRect.height / 2) - canvasRect.top
          };
          
          targetPos = {
            x: targetRect.left + (targetRect.width / 2) - canvasRect.left,
            y: targetRect.top + (targetRect.height / 2) - canvasRect.top
          };
        }
        
        // Cache these positions for future reference
        wirePosCache.current[consistentWireId] = {
          sourcePos: { ...sourcePos },
          targetPos: { ...targetPos }
        };
        
        // Return updated wire with new positions
        return { 
          ...wire, 
          sourcePos, 
          targetPos,
          // Store the fixed IDs
          sourceId,
          targetId,
          id: consistentWireId // Ensure consistent ID
        };
      })
      .filter(wire => !wire.invalid);
  };

  // Render SVG with wire connections
  return (
    <div className="absolute inset-0 z-30" style={{ pointerEvents: 'none' }}>
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        {/* No background grid pattern */}
        
        {/* Draw permanent wires */}
        {getUpdatedWirePositions().map(wire => {
          if (!wire.sourcePos || !wire.targetPos) return null;
          
          // Get the color and style for this wire
          const style = getWireStyle(wire.sourceType, wire.targetType, wire.color);
          
          // Generate points for PathLine component
          // PathLine expects an array of points [{ x, y }, { x, y }]
          const sourcePoint = wire.sourcePos;
          const targetPoint = wire.targetPos;
          
          // Get any anchor points for this wire
          const anchors = wireAnchorPoints[wire.id] || [];
          
          // Calculate total wire length including anchor points
          let totalLength = 0;
          let lastPoint = sourcePoint;
          
          // Add all anchor points in sequence between source and target
          const points = [sourcePoint];
          
          // Add anchor points in order
          anchors.forEach(anchor => {
            points.push(anchor);
            
            // Add to total length
            const segDx = anchor.x - lastPoint.x;
            const segDy = anchor.y - lastPoint.y;
            totalLength += Math.sqrt(segDx * segDx + segDy * segDy);
            lastPoint = anchor;
          });
          
          // Add target point
          points.push(targetPoint);
          
          // Add final segment length
          const finalDx = targetPoint.x - lastPoint.x;
          const finalDy = targetPoint.y - lastPoint.y;
          totalLength += Math.sqrt(finalDx * finalDx + finalDy * finalDy);
          
          // Store the calculated length for wire properties
          wire.calculatedLength = totalLength;
          
          // Only log in debug mode
          if (process.env.NODE_ENV === 'development' && sessionStorage.getItem('debug') === 'true') {
            console.log('Rendering wire:', wire.id);
          }
          
          return (
            <g 
              key={wire.id} 
              className={`wire-group ${selectedWireId === wire.id ? 'selected' : ''}`}
              onClick={(e) => handleWireClick(wire.id, e)}
              style={{ pointerEvents: 'all' }}
              id={wire.id}
            >
              {/* Background shadow path for wire */}
              <PathLine
                points={points}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={style.strokeWidth + 2.5}
                fill="none"
                r={10}  // Curve radius
                className="wire-path-shadow"
                style={{ filter: 'blur(1.5px)' }}
              />
              
              {/* Main wire path */}
              <PathLine
                points={points}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                fill="none"
                r={10}  // Curve radius
                className="wire-path"
                data-wire-id={wire.id}
              />
              
              {/* Render anchor points when wire is selected */}
              {selectedWireId === wire.id && wireAnchorPoints[wire.id] && wireAnchorPoints[wire.id].map((anchor, index) => (
                <g key={`${wire.id}-anchor-${index}`} className="anchor-point">
                  {/* Anchor point handle */}
                  <circle
                    cx={anchor.x}
                    cy={anchor.y}
                    r={5}
                    fill="#ffcc00"
                    stroke="#333"
                    strokeWidth={1}
                    className="anchor-handle"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Remove this anchor point when clicked with Alt key
                      if (e.altKey) {
                        removeAnchorPoint(wire.id, index);
                      }
                    }}
                  />
                  {/* Display index to help understand routing order */}
                  <text
                    x={anchor.x}
                    y={anchor.y - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#333"
                    pointerEvents="none"
                  >
                    {index + 1}
                  </text>
                </g>
              ))}
              
              {/* Transparent wider path for easier selection */}
              <PathLine
                points={points}
                stroke="transparent"
                strokeWidth={12}
                fill="none"
                r={10}  // Curve radius
                style={{ pointerEvents: "stroke" }}
              />
              
              {/* Delete button that appears when wire is selected */}
              {selectedWireId === wire.id && (
                <g 
                  className="wire-delete-button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteWire();
                  }}
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  transform={`translate(${(wire.sourcePos.x + wire.targetPos.x) / 2}, ${(wire.sourcePos.y + wire.targetPos.y) / 2})`}
                >
                  <circle 
                    cx="0" 
                    cy="0" 
                    r="12" 
                    fill="white" 
                    stroke="red" 
                    strokeWidth="2"
                  />
                  <text 
                    x="0" 
                    y="1" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fill="red" 
                    fontWeight="bold"
                    fontSize="16px"
                  >
                    ×
                  </text>
                </g>
              )}
            </g>
          );
        })}
        
        {/* Draw pending wire */}
        {pendingWire && pendingWire.sourcePos && (
          <g className="pending-wire-group">
            {/* Check if there are waypoints */}
            {pendingWire.waypoints && pendingWire.waypoints.length > 0 ? (
              // Draw wire with waypoints
              <>
                {/* First segment: source to first waypoint */}
                <path
                  d={`M ${pendingWire.sourcePos.x} ${pendingWire.sourcePos.y} L ${pendingWire.waypoints[0].x} ${pendingWire.waypoints[0].y}`}
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="none"
                  strokeDasharray="6,4"
                  className="pending-wire"
                />
                
                {/* Middle segments: between waypoints */}
                {pendingWire.waypoints.map((waypoint, index) => {
                  // If this is the last waypoint, connect to mouse position
                  if (index === pendingWire.waypoints.length - 1) {
                    return (
                      <path
                        key={`pending-segment-${index}`}
                        d={`M ${waypoint.x} ${waypoint.y} L ${mousePosition.x} ${mousePosition.y}`}
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fill="none"
                        strokeDasharray="6,4"
                        className="pending-wire"
                      />
                    );
                  }
                  
                  // Otherwise connect to next waypoint
                  const nextWaypoint = pendingWire.waypoints[index + 1];
                  return (
                    <path
                      key={`pending-segment-${index}`}
                      d={`M ${waypoint.x} ${waypoint.y} L ${nextWaypoint.x} ${nextWaypoint.y}`}
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="none"
                      strokeDasharray="6,4"
                      className="pending-wire"
                    />
                  );
                })}
                
                {/* Draw waypoint markers */}
                {pendingWire.waypoints.map((waypoint, index) => (
                  <circle
                    key={`waypoint-marker-${index}`}
                    cx={waypoint.x}
                    cy={waypoint.y}
                    r={4}
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                ))}
              </>
            ) : (
              // Draw direct line if no waypoints
              <>
                {/* Shadow for pending wire */}
                <path
                  d={`M ${pendingWire.sourcePos.x} ${pendingWire.sourcePos.y} L ${mousePosition.x} ${mousePosition.y}`}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth={4.5}
                  fill="none"
                  className="pending-wire-shadow"
                  style={{ filter: 'blur(1.5px)' }}
                />
                {/* Animated dashed line */}
                <path
                  d={`M ${pendingWire.sourcePos.x} ${pendingWire.sourcePos.y} L ${mousePosition.x} ${mousePosition.y}`}
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="none"
                  strokeDasharray="6,4"
                  className="pending-wire"
                />
              </>
            )}
          </g>
        )}
      </svg>
      
      {/* Wire controls moved to bottom toolbar */}
      
      {/* Wire Controls Toolbar */}
      {selectedWireId && (
        <div 
          className="wire-controls-toolbar bg-white/95 shadow-lg rounded-full py-2 px-3" 
          style={{ 
            pointerEvents: 'all', 
            position: 'absolute', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 40,
            border: '1px solid #ddd',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="flex items-center space-x-3">
            {/* Info button */}
            <button
              className={`wire-control-btn tooltip-trigger p-2 rounded-full ${showWireProperties ? 'bg-blue-500 text-white' : 'bg-blue-100 hover:bg-blue-200'} text-xl transition-all transform hover:scale-110`}
              onClick={() => setShowWireProperties(!showWireProperties)}
              title="Wire Info"
            >
              ℹ️
            </button>
            
            {/* Color picker */}
            <div className="flex items-center">
              <input 
                type="color" 
                value={wireProperties?.id ? (selectedWireColor || '#0000ff') : '#0000ff'}
                onChange={(e) => {
                  if (wireProperties?.id) {
                    setSelectedWireColor(e.target.value);
                    applyWireColor(wireProperties.id, e.target.value);
                  }
                }}
                className="wire-color-picker w-8 h-8 rounded-full cursor-pointer border-2 border-gray-200 hover:border-blue-300 transition-all transform hover:scale-110"
                title="Change wire color"
              />
            </div>

            {/* Add anchor points */}
            <button 
              className={`wire-control-btn p-2 rounded-full ${showAnchorMode ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'} text-xl transition-all transform hover:scale-110`}
              onClick={() => toggleAnchorMode(wireProperties?.id)}
              title={showAnchorMode ? "Finish adding points" : "Add anchor points"}
              disabled={!wireProperties?.id}
            >
              📍
            </button>
            
            {/* Clear anchor points */}
            <button 
              className={`wire-control-btn p-2 rounded-full ${(!wireProperties?.id || !wireAnchorPoints[wireProperties?.id] || wireAnchorPoints[wireProperties?.id]?.length === 0) ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-yellow-100 hover:bg-yellow-200'} text-xl transition-all transform hover:scale-110`}
              onClick={() => wireProperties?.id && clearAnchorPoints(wireProperties.id)}
              disabled={!wireProperties?.id || !wireAnchorPoints[wireProperties?.id] || wireAnchorPoints[wireProperties?.id]?.length === 0}
              title="Clear all anchor points"
            >
              🧹
            </button>
            
            {/* Delete wire */}
            <button 
              className="wire-control-btn p-2 rounded-full bg-red-100 hover:bg-red-200 text-xl transition-all transform hover:scale-110"
              onClick={handleDeleteWire}
              title="Delete selected wire"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
      
      {/* Wire Properties Tooltip */}
      {showWireProperties && wireProperties && (
        <div 
          className="wire-info-tooltip bg-white/95 shadow-lg rounded-md p-3" 
          style={{ 
            pointerEvents: 'all', 
            position: 'absolute', 
            bottom: '80px', 
            right: '20px', 
            maxWidth: '210px',
            zIndex: 40,
            border: '1px solid #c8d3e5',
            fontSize: '10px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div className="text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-blue-100 pb-1 mb-1">
              <div className="text-sm font-semibold text-blue-600">Wire Properties</div>
              <button 
                className="text-gray-400 hover:text-gray-600 text-sm" 
                onClick={() => setShowWireProperties(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Source:</span> 
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">{wireProperties.source}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Target:</span> 
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">{wireProperties.target}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Length:</span> 
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">{wireProperties.length}px</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Points:</span> 
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">{wireProperties.anchorCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-600">Color:</span> 
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-1" 
                  style={{ backgroundColor: selectedWireColor }}
                ></div>
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedWireColor}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleWireManager;