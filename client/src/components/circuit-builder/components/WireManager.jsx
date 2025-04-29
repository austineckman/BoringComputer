import React, { useState, useEffect } from 'react';
import WireState from '../utils/WireState';

/**
 * WireManager component
 * Renders wires between pins using the WireState for state management
 */
const WireManager = ({ canvasRef }) => {
  // Local component state (pulled from the WireState)
  const [wireState, setWireState] = useState(WireState.getState());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Subscribe to WireState changes
  useEffect(() => {
    console.log('WireManager: Setting up subscription to WireState');
    
    // Subscribe to state changes
    const unsubscribe = WireState.subscribe((newState) => {
      console.log('WireManager: State updated', newState);
      setWireState({ ...newState });
    });
    
    // Setup mouse tracking
    const handleMouseMove = (e) => {
      if (!canvasRef?.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      setMousePos(position);
      WireState.updateMousePosition(position);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Handle canvas background clicks to cancel wiring
    const handleCanvasClick = (e) => {
      // Only if it's the background (canvas itself)
      if (
        e.target === canvasRef.current && 
        wireState.pendingWireStart
      ) {
        console.log('WireManager: Canvas clicked, canceling wire');
        WireState.cancelWire();
      }
    };
    
    if (canvasRef?.current) {
      canvasRef.current.addEventListener('click', handleCanvasClick);
    }
    
    // Cleanup
    return () => {
      unsubscribe();
      document.removeEventListener('mousemove', handleMouseMove);
      
      if (canvasRef?.current) {
        canvasRef.current.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [canvasRef]);
  
  // Handle wire deletion
  const handleDeleteWire = (wireId, e) => {
    if (e) e.stopPropagation();
    WireState.deleteWire(wireId);
  };
  
  // Render debug info for development
  const renderDebugInfo = () => {
    return (
      <g className="debug-info">
        <rect x="10" y="10" width="150" height="45" fill="rgba(0,0,0,0.5)" rx="5" />
        <text x="15" y="25" fill="white" fontSize="10px">
          {'WireManager Debug'}
        </text>
        <text x="15" y="40" fill="white" fontSize="10px">
          {wireState.pendingWireStart ? 'Wiring in progress' : 'No active wire'}
        </text>
        <text x="15" y="55" fill="white" fontSize="10px">
          {`Wires: ${wireState.wires.length}`}
        </text>
      </g>
    );
  };
  
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        zIndex: 50
      }}
    >
      {/* Render debug info */}
      {renderDebugInfo()}
      
      {/* Render existing wires */}
      {wireState.wires.map(wire => (
        <g key={wire.id} className="wire-group">
          <line
            x1={wire.sourcePosition.x}
            y1={wire.sourcePosition.y}
            x2={wire.targetPosition.x}
            y2={wire.targetPosition.y}
            strokeWidth={2.8}
            stroke="#ff0000"
            strokeLinecap="round"
            style={{ pointerEvents: 'auto', cursor: 'crosshair' }}
            onDoubleClick={(e) => handleDeleteWire(wire.id, e)}
          />
          
          {/* Wire endpoints */}
          <circle
            cx={wire.sourcePosition.x}
            cy={wire.sourcePosition.y}
            r={4}
            fill="#ff0000"
            pointerEvents="none"
          />
          <circle
            cx={wire.targetPosition.x}
            cy={wire.targetPosition.y}
            r={4}
            fill="#ff0000"
            pointerEvents="none"
          />
        </g>
      ))}
      
      {/* Render pending wire while dragging */}
      {wireState.pendingWireStart && (
        <g className="pending-wire-group">
          <line
            className="pending-wire"
            x1={wireState.pendingWireStart.position.x}
            y1={wireState.pendingWireStart.position.y}
            x2={mousePos.x}
            y2={mousePos.y}
            strokeWidth={2.8}
            stroke="#ff0000"
            strokeLinecap="round"
            strokeDasharray="5,3"
            pointerEvents="none"
          />
          <circle
            cx={wireState.pendingWireStart.position.x}
            cy={wireState.pendingWireStart.position.y}
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