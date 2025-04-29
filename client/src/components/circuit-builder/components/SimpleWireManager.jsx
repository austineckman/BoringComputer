import React, { useState, useEffect, useRef } from 'react';

/**
 * Ultra simple wire manager - no fancy abstractions at all
 */
const SimpleWireManager = ({ canvasRef }) => {
  // Active wire state
  const [startPin, setStartPin] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [wires, setWires] = useState([]);
  
  useEffect(() => {
    if (!canvasRef?.current) return;
    
    const canvas = canvasRef.current;
    
    // Track mouse movement for wire drawing
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    // Handle pin click
    const handlePinClick = (e) => {
      // Only proceed if we clicked on a pin
      if (!e.target.matches('.pin-connection-point')) return;
      
      // Get pin info from data attributes
      const pinId = e.target.dataset.pinId;
      const pinType = e.target.dataset.pinType;
      const parentId = e.target.dataset.parentId;
      
      console.log(`WIRE SYSTEM: Pin clicked`, { pinId, pinType, parentId });
      
      // Get pin position
      const rect = e.target.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const pos = {
        x: rect.left + rect.width/2 - canvasRect.left,
        y: rect.top + rect.height/2 - canvasRect.top
      };
      
      if (!startPin) {
        // Start new wire
        setStartPin({
          id: pinId,
          type: pinType,
          parentId,
          pos
        });
        console.log('WIRE SYSTEM: Starting wire from', pinId);
      } else {
        // Complete wire
        const newWire = {
          id: `wire-${Date.now()}`,
          start: startPin,
          end: {
            id: pinId,
            type: pinType,
            parentId,
            pos
          }
        };
        
        console.log('WIRE SYSTEM: Completing wire to', pinId);
        setWires(prev => [...prev, newWire]);
        setStartPin(null);
      }
    };
    
    // Handle background click to cancel wire
    const handleCanvasClick = (e) => {
      if (startPin && e.target === canvas) {
        console.log('WIRE SYSTEM: Canceling wire');
        setStartPin(null);
      }
    };
    
    // Set up event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handlePinClick, true);
    canvas.addEventListener('click', handleCanvasClick);
    
    return () => {
      // Clean up
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handlePinClick, true);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [canvasRef, startPin]);
  
  // Handle wire deletion
  const handleDeleteWire = (wireId) => {
    setWires(wires.filter(w => w.id !== wireId));
  };
  
  return (
    <svg 
      className="absolute inset-0 pointer-events-none" 
      style={{ zIndex: 50 }}
    >
      {/* Debug info */}
      <rect x="10" y="10" width="250" height="70" fill="rgba(0,0,0,0.7)" rx="5" />
      <text x="15" y="30" fill="#fff" fontSize="12px">
        ULTRA SIMPLE WIRE SYSTEM
      </text>
      <text x="15" y="50" fill="#fff" fontSize="12px">
        Status: {startPin ? 'Drawing wire...' : 'Ready'}
      </text>
      <text x="15" y="70" fill="#fff" fontSize="12px">
        Wires: {wires.length}
      </text>
      
      {/* Completed wires */}
      {wires.map(wire => (
        <g key={wire.id}>
          <line
            x1={wire.start.pos.x}
            y1={wire.start.pos.y}
            x2={wire.end.pos.x}
            y2={wire.end.pos.y}
            stroke="red"
            strokeWidth="2"
            style={{ pointerEvents: 'all', cursor: 'pointer' }}
            onDoubleClick={() => handleDeleteWire(wire.id)}
          />
          <circle cx={wire.start.pos.x} cy={wire.start.pos.y} r="3" fill="red" />
          <circle cx={wire.end.pos.x} cy={wire.end.pos.y} r="3" fill="red" />
        </g>
      ))}
      
      {/* Active wire being drawn */}
      {startPin && (
        <g>
          <line
            x1={startPin.pos.x}
            y1={startPin.pos.y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="red"
            strokeWidth="2"
            strokeDasharray="5,3"
          />
          <circle cx={startPin.pos.x} cy={startPin.pos.y} r="3" fill="red" />
          <circle cx={mousePos.x} cy={mousePos.y} r="3" fill="red" opacity="0.5" />
        </g>
      )}
    </svg>
  );
};

export default SimpleWireManager;