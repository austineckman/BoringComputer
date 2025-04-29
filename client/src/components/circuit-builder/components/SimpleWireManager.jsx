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
    event.stopPropagation();
    
    // Extract pin data
    const pinElement = event.target;
    const pinId = event.detail.id;
    const pinType = pinElement.dataset.pinType || 'bidirectional';
    const parentId = pinElement.dataset.parentId;
    
    // Get position of pin from the event
    const position = getPinPosition(event);
    
    if (!pendingWire) {
      // Start a new wire
      setPendingWire({
        sourceId: pinId,
        sourceType: pinType,
        sourceParentId: parentId,
        sourcePos: position
      });
      
      // Add visual indication
      pinElement.classList.add('wire-source-active');
    } else {
      // Finish a wire
      const { sourceId, sourceType, sourceParentId, sourcePos } = pendingWire;
      
      // Prevent connecting a pin to itself
      if (sourceId === pinId) {
        console.log('Cannot connect a pin to itself');
        setPendingWire(null);
        return;
      }
      
      // Prevent connecting pins on the same component
      if (sourceParentId === parentId) {
        console.log('Cannot connect pins on the same component');
        setPendingWire(null);
        return;
      }
      
      // Add the new wire
      const newWire = {
        id: `wire-${Date.now()}`,
        sourceId,
        targetId: pinId,
        sourceType,
        targetType: pinType,
        sourcePos,
        targetPos: position
      };
      
      setWires(prev => [...prev, newWire]);
      setPendingWire(null);
      
      // Clean up visual indication
      document.querySelectorAll('.wire-source-active').forEach(el => {
        el.classList.remove('wire-source-active');
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