import React, { useState, useRef, useEffect } from 'react';
import { PathLine } from 'react-svg-pathline';

/**
 * SimpleWireManager component for:
 * 1. Managing wire connections between components
 * 2. Drawing wires between pins
 * 3. Tracking connected pins
 */
const SimpleWireManager = ({ canvasRef }) => {
  // State for wire connections
  const [wires, setWires] = useState([]);
  const [pendingWire, setPendingWire] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedWireId, setSelectedWireId] = useState(null);
  const svgRef = useRef(null);

  // Function to get pin position from event
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

  // Use a ref to store wire position cache to avoid unnecessary recalculations
  const wirePosCache = useRef({});
  
  // Get path for wire with enhanced TinkerCad-style routing
  const getWirePath = (start, end) => {
    // Validate input coordinates
    if (!start || !end || start.x === undefined || end.x === undefined) {
      console.warn('Invalid wire coordinates:', start, end);
      return ''; // Return empty path if coordinates are invalid
    }
    
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // For short wires, use a simple arc
    if (distance < 30) {
      // Arc path with small curvature
      return `M ${start.x} ${start.y} 
              Q ${(start.x + end.x) / 2} ${(start.y + end.y) / 2 - 5}, 
                ${end.x} ${end.y}`;
    }
    
    // For diagonal wires, determine routing approach based on angle and distance
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const isHorizontalFirst = Math.abs(angle) < 45 || Math.abs(angle) > 135;
    
    if (isHorizontalFirst) {
      // Route horizontally first with smoother bend
      const midX = start.x + dx * 0.6; // Go 60% of the way horizontally for better balance
      const bendRadius = Math.min(Math.abs(dy) * 0.25, 15); // Smoother bend radius
      
      return `M ${start.x} ${start.y}
              L ${midX - bendRadius * Math.sign(dx)} ${start.y}
              C ${midX} ${start.y}, 
                ${midX} ${start.y}, 
                ${midX} ${start.y + bendRadius * Math.sign(dy)}
              L ${midX} ${end.y - bendRadius * Math.sign(dy)}
              C ${midX} ${end.y}, 
                ${midX} ${end.y}, 
                ${midX + bendRadius * Math.sign(dx)} ${end.y}
              L ${end.x} ${end.y}`;
    } else {
      // Route vertically first with smoother bend
      const midY = start.y + dy * 0.6; // Go 60% of the way vertically for better balance
      const bendRadius = Math.min(Math.abs(dx) * 0.25, 15); // Smoother bend radius
      
      return `M ${start.x} ${start.y}
              L ${start.x} ${midY - bendRadius * Math.sign(dy)}
              C ${start.x} ${midY}, 
                ${start.x} ${midY}, 
                ${start.x + bendRadius * Math.sign(dx)} ${midY}
              L ${end.x - bendRadius * Math.sign(dx)} ${midY}
              C ${end.x} ${midY}, 
                ${end.x} ${midY}, 
                ${end.x} ${midY + bendRadius * Math.sign(dy)}
              L ${end.x} ${end.y}`;
    }
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
        sourceName: pinName
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
      
      setWires(prev => [...prev, newWire]);
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
    if (pendingWire && canvasRef?.current) {
      // Don't process every mouse move event - this improves performance
      // especially during component dragging
      if (throttlingActive) return;
      
      throttlingActive = true;
      setTimeout(() => { throttlingActive = false; }, 20); // 50fps is plenty smooth
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
      });
    }
  };
  
  // Control variable for throttling
  let throttlingActive = false;

  // Handle clicks on wires for selection
  const handleWireClick = (wireId, e) => {
    e.stopPropagation(); // Prevent canvas click handler from firing
    console.log('Wire clicked:', wireId);
    
    // Toggle wire selection
    if (selectedWireId === wireId) {
      setSelectedWireId(null);
    } else {
      // Deselect any previously selected wire
      if (selectedWireId) {
        document.querySelectorAll('.selected-wire-highlight').forEach(el => {
          el.classList.remove('selected-wire-highlight');
        });
      }
      
      // Select the new wire
      setSelectedWireId(wireId);
      
      // Add visual highlight to help user see the selected wire
      const wirePath = document.querySelector(`path[data-wire-id="${wireId}"]`);
      if (wirePath) {
        wirePath.classList.add('selected-wire-highlight');
      }
    }
    
    // Add a user message about how to delete the wire
    if (selectedWireId !== wireId) {
      console.log('Wire selected. Press DELETE key or click the red X button to remove it.');
    }
  };
  
  // Handle clicks on canvas to cancel pending wire and deselect wires
  const handleCanvasClick = (e) => {
    // Ignore if click was on a pin
    if (e.target.classList.contains('pin-connection-point')) {
      return;
    }
    
    // Deselect any selected wire
    if (selectedWireId) {
      setSelectedWireId(null);
    }
    
    // Cancel pending wire
    if (pendingWire) {
      setPendingWire(null);
      document.querySelectorAll('.wire-source-active').forEach(el => {
        el.classList.remove('wire-source-active');
        el.style.animation = '';
      });
    }
  };

  // Handle delete key for wire removal
  const handleDeleteWire = () => {
    if (selectedWireId) {
      setWires(prev => prev.filter(wire => wire.id !== selectedWireId));
      setSelectedWireId(null);
      
      // Dispatch event to notify simulation of deleted connection
      document.dispatchEvent(new CustomEvent('pinConnectionRemoved', {
        detail: { wireId: selectedWireId }
      }));
      
      console.log(`Deleted wire: ${selectedWireId}`);
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
    const throttleInterval = 500; // Only update every 500ms during dragging
    
    // Simple function to force a redraw of all wires - with throttling for performance
    const handleComponentMove = (event) => {
      const currentTime = performance.now();
      
      // Always process 'componentMovedFinal' immediately for responsive UI when dragging stops
      // But throttle frequent 'componentMoved' events during dragging
      const shouldUpdate = 
        event.type === 'componentMovedFinal' || 
        event.type === 'redrawWires' || 
        currentTime - lastUpdateTime > throttleInterval;
      
      if (shouldUpdate) {
        // This approach simply triggers a re-render that will call getUpdatedWirePositions()
        // which directly reads pin positions from the DOM
        setWires(prevWires => [...prevWires]);
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

  // Get current wire positions - enhanced for accurate pin tracking with duplicate ID handling
  const getUpdatedWirePositions = () => {
    if (!canvasRef?.current) return [];
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // First, deduplicate wires by ID to prevent duplicate keys in React
    const wireMap = new Map();
    wires.forEach(wire => {
      // Use normalized IDs to prevent duplicates
      const endpoints = [(wire.sourceId || '').split('-').pop(), (wire.targetId || '').split('-').pop()].sort().join('-');
      const wireKey = `wire-${endpoints}`;
      
      // Only keep the most recent wire for each unique connection
      wireMap.set(wireKey, wire);
    });
    
    // Process all dynamic wires and update positions with the deduplicated list
    return Array.from(wireMap.values())
      .map(wire => {
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
        
        // Check if this wire already has valid positions (used for fallback)
        const hasValidPositions = 
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
        if ((!sourceElement || !targetElement) && hasValidPositions) {
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
          // For curved wires, we'll use the midpoint between source and target with an offset
          const sourcePoint = wire.sourcePos;
          const targetPoint = wire.targetPos;
          
          // Calculate midpoint with curve offset
          const dx = targetPoint.x - sourcePoint.x;
          const dy = targetPoint.y - sourcePoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Use the simple curved path
          const points = [
            sourcePoint,
            targetPoint
          ];
          
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
            {/* Shadow for pending wire */}
            <PathLine
              points={[pendingWire.sourcePos, mousePosition]}
              stroke="rgba(0,0,0,0.15)"
              strokeWidth={4.5}
              fill="none"
              r={10}  // Curve radius
              className="pending-wire-shadow"
              style={{ filter: 'blur(1.5px)' }}
            />
            {/* Animated dashed line */}
            <PathLine
              points={[pendingWire.sourcePos, mousePosition]}
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="none"
              r={10}  // Curve radius
              style={{ strokeDasharray: '6,4' }}
              className="pending-wire"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export default SimpleWireManager;