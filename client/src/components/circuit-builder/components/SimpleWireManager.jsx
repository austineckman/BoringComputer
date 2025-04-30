import React, { useState, useRef, useEffect } from 'react';

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

  // Get path for wire with enhanced TinkerCad-style routing
  const getWirePath = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // For short wires, use a simple arc
    if (distance < 50) {
      // Arc path with small curvature
      return `M ${start.x} ${start.y} 
              Q ${(start.x + end.x) / 2} ${(start.y + end.y) / 2 - 10}, 
                ${end.x} ${end.y}`;
    }
    
    // For diagonal wires, determine if we should route horizontally first or vertically first
    const isHorizontalFirst = Math.abs(dx) > Math.abs(dy);
    
    if (isHorizontalFirst) {
      // Route horizontally first, then vertically (Manhattan routing)
      const midX = start.x + dx * 0.7; // Go 70% of the way horizontally
      const bendRadius = Math.min(Math.abs(dy) * 0.3, 20); // Size of the curve at the bend
      
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
      // Route vertically first, then horizontally
      const midY = start.y + dy * 0.7; // Go 70% of the way vertically
      const bendRadius = Math.min(Math.abs(dx) * 0.3, 20); // Size of the curve at the bend
      
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
    if (pinId.includes('-heroboard-heroboard-') || pinId.includes('-led-led-')) {
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
    const pinData = event.detail.pinData ? JSON.parse(event.detail.pinData) : null;
    
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
    
    // If we still couldn't find the pin, try to get position from the event details
    let position;
    if (!pinElement && event.detail.clientX && event.detail.clientY) {
      console.warn('Pin element not found in DOM, using event coordinates');
      const canvasRect = canvasRef.current.getBoundingClientRect();
      position = {
        x: event.detail.clientX - canvasRect.left,
        y: event.detail.clientY - canvasRect.top
      };
      console.log(`Using event coordinates for pin ${pinName}:`, position);
    } else if (pinElement) {
      // Get accurate pin position relative to canvas
      const pinRect = pinElement.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      position = {
        x: pinRect.left + (pinRect.width / 2) - canvasRect.left,
        y: pinRect.top + (pinRect.height / 2) - canvasRect.top
      };
      
      console.log(`Pin position calculated from element:`, position);
    } else {
      console.error('Could not determine pin position accurately');
      return;
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
      const newWire = {
        id: `wire-${Date.now()}`,
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

  // Handle mouse movement for the pending wire
  const handleMouseMove = (e) => {
    if (pendingWire && canvasRef?.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
      });
    }
  };

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

  // Enhanced Wokwi-style component movement handler
  useEffect(() => {
    // Events that should trigger wire position updates
    const events = ['componentMoved', 'componentMovedFinal', 'redrawWires'];
    
    // Enhanced function to update wire positions when components move
    const handleComponentMove = (event) => {
      // Get the component ID from the event if available
      const componentId = event?.detail?.componentId;
      
      // Get the new position from the event if available
      const newPosition = event?.detail?.newPosition;
      
      // Log the component movement event to help with debugging
      if (componentId) {
        console.log(`Component ${componentId} moved`, newPosition ? `to (${newPosition.x}, ${newPosition.y})` : '');
      }
      
      // Force immediate pin position recalculation for all wires
      // This directly reads from the DOM to get current pin positions
      const updatedWirePositions = getUpdatedWirePositions();
      
      // Only update if we got valid positions
      if (updatedWirePositions.length > 0) {
        // Use a function that ensures that we're not just spreading the same wires
        // But actually creating a new array with updated positions
        setWires(prevWires => {
          // Map each wire to its updated version or keep it if no update found
          return prevWires.map(wire => {
            // Find the matching updated wire by ID
            const updatedWire = updatedWirePositions.find(w => w.id === wire.id);
            return updatedWire && !updatedWire.invalid ? updatedWire : wire;
          });
        });
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
    
    // Process all dynamic wires and update positions
    return wires
      .map(wire => {
        // Fix for duplicated component type in source ID
        let sourceId = wire.sourceId;
        let targetId = wire.targetId;
        
        // Handle duplicated component types in IDs
        if (sourceId.includes('-heroboard-heroboard-') || sourceId.includes('-led-led-')) {
          sourceId = sourceId.replace(/-(\w+)-\1-/, '-$1-');
        }
        if (targetId.includes('-heroboard-heroboard-') || targetId.includes('-led-led-')) {
          targetId = targetId.replace(/-(\w+)-\1-/, '-$1-');
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
        
        // If we still can't find the elements but have valid positions
        if ((!sourceElement || !targetElement) && hasValidPositions) {
          // This approach stores the delta between component position and pin position
          // so we can update wire endpoints even if we can't find the pin elements directly
          
          // Extract component IDs from pin IDs
          const sourceCompId = sourceId.split('-').slice(1, 3).join('-');
          const targetCompId = targetId.split('-').slice(1, 3).join('-');
          
          // Try to find component elements
          const sourceCompElement = document.getElementById(sourceCompId);
          const targetCompElement = document.getElementById(targetCompId);
          
          // If we found at least one component, try to update the wire position relative to it
          if (sourceCompElement || targetCompElement) {
            // Get current positions
            const updatedWire = { ...wire };
            
            // If source component found, update source pin position relative to component
            if (sourceCompElement) {
              const sourceCompRect = sourceCompElement.getBoundingClientRect();
              const sourceCompPos = {
                x: sourceCompRect.left + (sourceCompRect.width / 2) - canvasRect.left,
                y: sourceCompRect.top + (sourceCompRect.height / 2) - canvasRect.top
              };
              
              // Update wire source position based on component movement
              if (wire.sourceCompPos) {
                // Calculate the pin's offset from the component center
                const offsetX = wire.sourcePos.x - wire.sourceCompPos.x;
                const offsetY = wire.sourcePos.y - wire.sourceCompPos.y;
                
                // Apply the same offset to the new component position
                updatedWire.sourcePos = {
                  x: sourceCompPos.x + offsetX,
                  y: sourceCompPos.y + offsetY
                };
                
                // Store the new component position for future updates
                updatedWire.sourceCompPos = sourceCompPos;
              } else {
                // First time calculation - store component position for future reference
                updatedWire.sourceCompPos = sourceCompPos;
              }
            }
            
            // If target component found, update target pin position relative to component
            if (targetCompElement) {
              const targetCompRect = targetCompElement.getBoundingClientRect();
              const targetCompPos = {
                x: targetCompRect.left + (targetCompRect.width / 2) - canvasRect.left,
                y: targetCompRect.top + (targetCompRect.height / 2) - canvasRect.top
              };
              
              // Update wire target position based on component movement
              if (wire.targetCompPos) {
                // Calculate the pin's offset from the component center
                const offsetX = wire.targetPos.x - wire.targetCompPos.x;
                const offsetY = wire.targetPos.y - wire.targetCompPos.y;
                
                // Apply the same offset to the new component position
                updatedWire.targetPos = {
                  x: targetCompPos.x + offsetX,
                  y: targetCompPos.y + offsetY
                };
                
                // Store the new component position for future updates
                updatedWire.targetCompPos = targetCompPos;
              } else {
                // First time calculation - store component position for future reference
                updatedWire.targetCompPos = targetCompPos;
              }
            }
            
            console.info(`Updated wire ${wire.id} positions based on component movement`);
            return updatedWire;
          }
          
          // If we couldn't find components either, use the previous wire positions as fallback
          console.warn(`Using previous positions for wire ${wire.id} as no components found`);
          return wire;
        }
        
        // If we can't find the elements and don't have valid positions, mark as invalid but don't remove
        if (!sourceElement || !targetElement) {
          console.warn(`Elements not found for wire ${wire.id}: source=${sourceId}, target=${targetId}`);
          // Include more debug info
          return { 
            ...wire, 
            invalid: true,
            _debug: { sourceId, targetId, sourceName: wire.sourceName, targetName: wire.targetName }
          };
        }
        
        // Get precise center positions relative to canvas
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        const sourcePos = {
          x: sourceRect.left + (sourceRect.width / 2) - canvasRect.left,
          y: sourceRect.top + (sourceRect.height / 2) - canvasRect.top
        };
        
        const targetPos = {
          x: targetRect.left + (targetRect.width / 2) - canvasRect.left,
          y: targetRect.top + (targetRect.height / 2) - canvasRect.top
        };
        
        // Now also save component positions for relative movement tracking
        
        // Get component IDs from pin IDs
        const sourceCompId = sourceId.split('-').slice(1, 3).join('-');
        const targetCompId = targetId.split('-').slice(1, 3).join('-');
        
        // Find component elements
        const sourceCompElement = document.getElementById(sourceCompId);
        const targetCompElement = document.getElementById(targetCompId);
        
        // Calculate component center positions for relative offset calculation
        const sourceCompPos = sourceCompElement ? {
          x: sourceCompElement.getBoundingClientRect().left + (sourceCompElement.getBoundingClientRect().width / 2) - canvasRect.left,
          y: sourceCompElement.getBoundingClientRect().top + (sourceCompElement.getBoundingClientRect().height / 2) - canvasRect.top
        } : null;
        
        const targetCompPos = targetCompElement ? {
          x: targetCompElement.getBoundingClientRect().left + (targetCompElement.getBoundingClientRect().width / 2) - canvasRect.left,
          y: targetCompElement.getBoundingClientRect().top + (targetCompElement.getBoundingClientRect().height / 2) - canvasRect.top
        } : null;
        
        // Return updated wire with new positions and component reference positions
        return { 
          ...wire, 
          sourcePos, 
          targetPos,
          // Store the fixed IDs and component positions
          sourceId,
          targetId,
          sourceCompPos,
          targetCompPos
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
        
        {/* Draw permanent wires with guaranteed unique keys */}
        {getUpdatedWirePositions().map((wire, index) => {
          if (!wire.sourcePos || !wire.targetPos) return null;
          
          const path = getWirePath(wire.sourcePos, wire.targetPos);
          const style = getWireStyle(wire.sourceType, wire.targetType, wire.color);
          
          // Use a combination of wire ID and index to ensure key uniqueness
          const wireKey = `${wire.id}-${index}`;
          
          return (
            <g 
              key={wireKey}
              className={`wire-group ${selectedWireId === wire.id ? 'selected' : ''}`}
              onClick={(e) => handleWireClick(wire.id, e)}
              style={{ pointerEvents: 'all' }}
            >
              {/* Background shadow path for TinkerCad-like wire appearance */}
              <path
                d={path}
                style={{
                  ...style,
                  stroke: 'rgba(0,0,0,0.2)',
                  strokeWidth: style.strokeWidth + 2.5,
                  filter: 'blur(1.5px)',
                }}
                className="wire-path-shadow"
              />
              {/* Main wire path */}
              <path
                d={path}
                style={style}
                className="wire-path"
                data-wire-id={wire.id}
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
            <path
              d={getWirePath(pendingWire.sourcePos, mousePosition)}
              style={{
                stroke: 'rgba(0,0,0,0.15)',
                strokeWidth: 4.5,
                fill: 'none',
                strokeLinecap: 'round',
                filter: 'blur(1.5px)'
              }}
              className="pending-wire-shadow"
            />
            {/* Animated dashed line */}
            <path
              d={getWirePath(pendingWire.sourcePos, mousePosition)}
              style={{
                stroke: '#3b82f6',
                strokeWidth: 2.5,
                fill: 'none',
                strokeDasharray: '6,4',
                strokeLinecap: 'round'
              }}
              className="pending-wire"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export default SimpleWireManager;