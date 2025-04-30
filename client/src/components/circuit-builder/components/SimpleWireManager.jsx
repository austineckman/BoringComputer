import React, { useState, useEffect, useRef } from 'react';

/**
 * SimpleWireManager - A stripped-down wire manager that works with
 * inventr-component-lib pin events
 * 
 * This component handles:
 * 1. Listening for pin clicks from components
 * 2. Drawing wires between pins
 * 3. Tracking connected pins
 */
const SimpleWireManager = ({ canvasRef }) => {
  // State for wire connections
  const [wires, setWires] = useState([]);
  const [pendingWire, setPendingWire] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

  // Get path for wire
  const getWirePath = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Calculate a nice curve using a cubic bezier
    const controlPointDist = Math.min(Math.abs(dx), 50);
    
    return `M ${start.x} ${start.y} 
            C ${start.x + controlPointDist} ${start.y}, 
              ${end.x - controlPointDist} ${end.y}, 
              ${end.x} ${end.y}`;
  };

  // Get style for wire based on source type
  const getWireStyle = (sourceType, targetType) => {
    let color = '#3b82f6'; // Default blue
    
    // Power connections are red
    if (sourceType === 'output' && targetType === 'input' || 
        sourceType === 'input' && targetType === 'output') {
      color = '#ef4444';
    }
    
    return {
      stroke: color,
      strokeWidth: 2,
      fill: 'none',
      strokeLinecap: 'round',
      filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3))'
    };
  };

  // Handle pin clicks from components
  const handlePinClick = (event) => {
    // Extract pin data
    console.log('Pin clicked on component:', event.detail);
    
    // The event now includes the pin ID
    const pinId = event.detail.id;
    if (!pinId) {
      console.error('No pin ID found in click event');
      return;
    }
    
    // Extract component ID and pin name from the pin ID format "pt-componentType-componentId-pinName"
    const parts = pinId.split('-');
    if (parts.length < 4) {
      console.error('Invalid pin ID format:', pinId);
      return;
    }
    
    const [prefix, componentType, componentId, pinName] = parts;
    const parentId = `${componentType}-${componentId}`;
    
    // Get pin type from data if available or default to bidirectional
    const pinType = event.detail.pinType || 'bidirectional';
    
    // Get position from event
    const position = getPinPosition(event);
    
    // Find the actual pin element by ID after identifying the pin
    const pinElement = document.getElementById(pinId);
    
    console.log(`Pin ${pinName} (${pinType}) of component ${parentId} clicked`);
    
    // Log mouseleave events
    document.addEventListener('mouseleave', () => console.log('mouseleave'), { once: true });
    document.addEventListener('mouseup', () => console.log('mouseup'), { once: true });
    
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

  // Handle clicks on canvas to cancel pending wire
  const handleCanvasClick = (e) => {
    // Ignore if click was on a pin
    if (e.target.classList.contains('pin-connection-point')) {
      return;
    }
    
    // Cancel pending wire
    if (pendingWire) {
      setPendingWire(null);
      document.querySelectorAll('.wire-source-active').forEach(el => {
        el.classList.remove('wire-source-active');
      });
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
    
    // Clean up
    return () => {
      document.removeEventListener('pinClicked', handlePinClick);
      
      if (canvasElement) {
        canvasElement.removeEventListener('mousemove', handleMouseMove);
        canvasElement.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [canvasRef, pendingWire]);

  // After pins move, redraw wires
  useEffect(() => {
    // Listen for component movement
    const handleComponentMove = () => {
      // Update wire positions
      setWires(prevWires => {
        // Force re-render by creating a new array
        return [...prevWires];
      });
    };

    document.addEventListener('componentMoved', handleComponentMove);
    
    return () => {
      document.removeEventListener('componentMoved', handleComponentMove);
    };
  }, []);

  // Get current wire positions
  const getUpdatedWirePositions = () => {
    return wires.map(wire => {
      // Find source and target elements
      const sourceElement = document.getElementById(wire.sourceId);
      const targetElement = document.getElementById(wire.targetId);
      
      if (!sourceElement || !targetElement) {
        return { ...wire, invalid: true };
      }
      
      // Get positions
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const sourceRect = sourceElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      
      const sourcePos = {
        x: sourceRect.left + sourceRect.width/2 - canvasRect.left,
        y: sourceRect.top + sourceRect.height/2 - canvasRect.top
      };
      
      const targetPos = {
        x: targetRect.left + targetRect.width/2 - canvasRect.left,
        y: targetRect.top + targetRect.height/2 - canvasRect.top
      };
      
      return { ...wire, sourcePos, targetPos };
    }).filter(wire => !wire.invalid);
  };

  return (
    <svg 
      ref={svgRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Draw permanent wires */}
      {getUpdatedWirePositions().map(wire => {
        if (!wire.sourcePos || !wire.targetPos) return null;
        
        const path = getWirePath(wire.sourcePos, wire.targetPos);
        const style = getWireStyle(wire.sourceType, wire.targetType);
        
        return (
          <g key={wire.id} className="wire-group">
            <path
              d={path}
              style={style}
              className="wire-path"
            />
          </g>
        );
      })}
      
      {/* Draw pending wire */}
      {pendingWire && pendingWire.sourcePos && (
        <path
          d={getWirePath(pendingWire.sourcePos, mousePosition)}
          style={{
            stroke: '#3b82f6',
            strokeWidth: 2,
            fill: 'none',
            strokeDasharray: '5,3',
            strokeLinecap: 'round'
          }}
          className="pending-wire"
        />
      )}
    </svg>
  );
};

export default SimpleWireManager;