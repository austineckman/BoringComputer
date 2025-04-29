import React, { useState, useEffect, useRef } from 'react';

/**
 * Very simple implementation of wire management using DOM-based approach
 */
const WireManager = ({ canvasRef }) => {
  // Active wire state
  const [activeWire, setActiveWire] = useState(null);
  const [wires, setWires] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Refs
  const svgRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!canvasRef?.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Direct pin click event handler
    const handlePinClick = (e) => {
      if (!e.target.matches('.pin-connection-point')) return;
      
      e.stopPropagation();
      const pin = e.target;
      const pinId = pin.dataset.pinId;
      const componentId = pin.dataset.parentId;
      
      console.log('Direct DOM pin click:', pinId, 'component:', componentId);
      
      const rect = pin.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const pinPos = {
        x: rect.left + rect.width/2 - canvasRect.left,
        y: rect.top + rect.height/2 - canvasRect.top
      };
      
      // If no active wire, start one
      if (!activeWire) {
        setActiveWire({
          startPin: {
            id: pinId,
            componentId,
            position: pinPos
          }
        });
      } else {
        // Complete existing wire
        const newWire = {
          id: `wire-${Date.now()}`,
          source: activeWire.startPin,
          target: {
            id: pinId,
            componentId,
            position: pinPos
          }
        };
        
        // Add wire to the list
        setWires(prev => [...prev, newWire]);
        
        // Reset active wire
        setActiveWire(null);
      }
    };
    
    // Add event listener to the document (event delegation)
    document.addEventListener('click', handlePinClick, true);
    
    // Background click to cancel wire
    const handleCanvasClick = (e) => {
      if (e.target === canvasRef.current && activeWire) {
        console.log('Canceling wire - canvas click');
        setActiveWire(null);
      }
    };
    
    if (canvasRef?.current) {
      canvasRef.current.addEventListener('click', handleCanvasClick);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handlePinClick, true);
      
      if (canvasRef?.current) {
        canvasRef.current.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [canvasRef, activeWire]);
  
  // Delete wire handler
  const handleDeleteWire = (wireId, e) => {
    e.stopPropagation();
    setWires(prev => prev.filter(wire => wire.id !== wireId));
  };
  
  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 overflow-visible"
      style={{
        width: '100%',
        height: '100%',
        zIndex: 50,
        pointerEvents: 'none'
      }}
    >
      {/* Debug info */}
      <g className="debug-info">
        <rect x="10" y="10" width="200" height="60" fill="rgba(0,0,0,0.5)" rx="5" />
        <text x="15" y="30" fill="white" fontSize="12px">
          Wire Manager: DOM Edition
        </text>
        <text x="15" y="50" fill="white" fontSize="12px">
          Status: {activeWire ? 'Wiring in progress' : 'Idle'}
        </text>
        <text x="15" y="70" fill="white" fontSize="12px">
          Wires: {wires.length}
        </text>
      </g>
      
      {/* Complete wires */}
      {wires.map(wire => (
        <g key={wire.id} className="wire-group">
          <line
            x1={wire.source.position.x}
            y1={wire.source.position.y}
            x2={wire.target.position.x}
            y2={wire.target.position.y}
            strokeWidth={3}
            stroke="#ff0000"
            strokeLinecap="round"
            style={{ pointerEvents: 'auto', cursor: 'crosshair' }}
            onDoubleClick={(e) => handleDeleteWire(wire.id, e)}
          />
          
          {/* Wire endpoints */}
          <circle
            cx={wire.source.position.x}
            cy={wire.source.position.y}
            r={4}
            fill="#ff0000"
            pointerEvents="none"
          />
          <circle
            cx={wire.target.position.x}
            cy={wire.target.position.y}
            r={4}
            fill="#ff0000"
            pointerEvents="none"
          />
        </g>
      ))}
      
      {/* Active wire being created */}
      {activeWire && (
        <g className="active-wire">
          <line
            x1={activeWire.startPin.position.x}
            y1={activeWire.startPin.position.y}
            x2={mousePos.x}
            y2={mousePos.y}
            strokeWidth={3}
            stroke="#ff0000"
            strokeDasharray="5,3"
            pointerEvents="none"
          />
          
          <circle
            cx={activeWire.startPin.position.x}
            cy={activeWire.startPin.position.y}
            r={4}
            fill="#ff0000"
            pointerEvents="none"
          />
          
          <circle
            cx={mousePos.x}
            cy={mousePos.y}
            r={4}
            fill="#ff0000"
            opacity={0.5}
            pointerEvents="none"
          />
        </g>
      )}
    </svg>
  );
};

export default WireManager;