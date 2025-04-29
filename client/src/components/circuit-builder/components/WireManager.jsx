import { useState, useEffect, useRef } from 'react';
import * as PathlineModule from 'react-svg-pathline';

// Correctly extract Pathline component based on module structure
const Pathline = PathlineModule.Pathline || PathlineModule.default || PathlineModule;

/**
 * WireManager handles all wire connections between components
 * Features:
 * - Drawing wires between pins using SVG paths
 * - Managing wire connections
 * - Updating wire positions when components move
 * - Creating new connections via UI
 */
const WireManager = ({ canvasRef }) => {
  // State for tracking pins and connections
  const [pins, setPins] = useState({});
  const [connections, setConnections] = useState([]);
  const [tempWire, setTempWire] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Track which pins are currently connected
  const [connectedPins, setConnectedPins] = useState(new Set());
  
  // Reference to SVG element for wire drawing
  const svgRef = useRef(null);
  
  // Register pin positions
  useEffect(() => {
    const handleRegisterPin = (e) => {
      const { id, parentId, pinType, element } = e.detail;
      
      setPins(prev => ({
        ...prev,
        [id]: { id, parentId, pinType, element }
      }));
    };
    
    const handleUnregisterPin = (e) => {
      const { id } = e.detail;
      
      setPins(prev => {
        const newPins = { ...prev };
        delete newPins[id];
        return newPins;
      });
      
      // Remove any connections to this pin
      setConnections(prev => prev.filter(conn => 
        conn.from !== id && conn.to !== id
      ));
    };
    
    // Listen for pin registration events
    document.addEventListener('registerPin', handleRegisterPin);
    document.addEventListener('unregisterPin', handleUnregisterPin);
    
    return () => {
      document.removeEventListener('registerPin', handleRegisterPin);
      document.removeEventListener('unregisterPin', handleUnregisterPin);
    };
  }, []);
  
  // Handle redrawing wires when components move
  useEffect(() => {
    const handleRedraw = () => {
      // Force a re-render by updating state
      setConnections(prev => [...prev]);
    };
    
    document.addEventListener('redrawWires', handleRedraw);
    
    return () => {
      document.removeEventListener('redrawWires', handleRedraw);
    };
  }, []);
  
  // Track mouse position for drawing temporary wires
  useEffect(() => {
    if (!canvasRef?.current || !tempWire) return;
    
    const handleMouseMove = (e) => {
      if (!canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePos({ x, y });
    };
    
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      canvasRef.current?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvasRef, tempWire]);
  
  // Start drawing a wire from a pin
  const startWireFromPin = (pinId) => {
    if (!pins[pinId]) return;
    
    setTempWire({
      fromId: pinId,
      fromType: pins[pinId].pinType
    });
  };
  
  // Complete a wire connection to another pin
  const completeWireToPin = (pinId) => {
    if (!tempWire || !pins[pinId] || tempWire.fromId === pinId) {
      setTempWire(null);
      return;
    }
    
    // Check if the connection makes sense (output -> input)
    const fromPin = pins[tempWire.fromId];
    const toPin = pins[pinId];
    
    if (
      (fromPin.pinType === 'output' && toPin.pinType === 'input') ||
      (fromPin.pinType === 'input' && toPin.pinType === 'output') ||
      fromPin.pinType === 'bidirectional' || 
      toPin.pinType === 'bidirectional'
    ) {
      // Determine which is input and which is output
      let from, to;
      
      if (fromPin.pinType === 'output' || toPin.pinType === 'input') {
        from = tempWire.fromId;
        to = pinId;
      } else {
        from = pinId;
        to = tempWire.fromId;
      }
      
      // Check if connection already exists
      const connectionExists = connections.some(
        conn => conn.from === from && conn.to === to
      );
      
      if (!connectionExists) {
        setConnections(prev => [
          ...prev,
          { id: `${from}-${to}`, from, to }
        ]);
        
        // Update connected pins set
        setConnectedPins(prev => {
          const newSet = new Set(prev);
          newSet.add(from);
          newSet.add(to);
          return newSet;
        });
      }
    }
    
    setTempWire(null);
  };
  
  // Remove a wire connection
  const removeConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    
    // Update connected pins
    const [fromId, toId] = connectionId.split('-');
    setConnectedPins(prev => {
      const newSet = new Set(prev);
      
      // Only remove if pin is not used in any other connection
      const fromIsStillConnected = connections.some(conn => 
        (conn.id !== connectionId) && (conn.from === fromId || conn.to === fromId)
      );
      
      const toIsStillConnected = connections.some(conn => 
        (conn.id !== connectionId) && (conn.from === toId || conn.to === toId)
      );
      
      if (!fromIsStillConnected) newSet.delete(fromId);
      if (!toIsStillConnected) newSet.delete(toId);
      
      return newSet;
    });
  };
  
  // Get position of a pin relative to the canvas
  const getPinPosition = (pinId) => {
    if (!pins[pinId]?.element || !canvasRef?.current) return { x: 0, y: 0 };
    
    const pin = pins[pinId].element;
    const canvas = canvasRef.current;
    
    const rect = pin.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    return {
      x: rect.left + rect.width / 2 - canvasRect.left,
      y: rect.top + rect.height / 2 - canvasRect.top
    };
  };
  
  // Generate path points for a wire
  const generateWirePath = (fromPos, toPos) => {
    const midX = (fromPos.x + toPos.x) / 2;
    
    return [
      [fromPos.x, fromPos.y],
      [midX, fromPos.y],
      [midX, toPos.y],
      [toPos.x, toPos.y]
    ];
  };
  
  // Handle pin click events
  const handlePinClick = (pinId, pinType, parentId) => {
    if (tempWire) {
      completeWireToPin(pinId);
    } else {
      startWireFromPin(pinId);
    }
  };
  
  // Cancel wire drawing on canvas click
  const handleCanvasClick = () => {
    if (tempWire) {
      setTempWire(null);
    }
  };
  
  return (
    <>
      {/* SVG layer for wire drawing */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 2 }}
      >
        {/* Draw permanent connections */}
        {connections.map(({ id, from, to }) => {
          const fromPos = getPinPosition(from);
          const toPos = getPinPosition(to);
          
          // Determine wire color based on pin IDs
          let wireColor = '#4a5568'; // Default gray
          
          // Check pin IDs to determine the type of connection
          if (from.includes('5v') || from.includes('3v3') || to.includes('5v') || to.includes('3v3')) {
            wireColor = '#f56565'; // Red for power
          } else if (from.includes('gnd') || to.includes('gnd')) {
            wireColor = '#718096'; // Dark gray for ground
          } else if (from.includes('d') || to.includes('d')) {
            wireColor = '#4299e1'; // Blue for digital pins
          } else if (from.includes('a') || to.includes('a')) {
            wireColor = '#ed8936'; // Orange for analog pins
          }
          
          return (
            <g key={id} className="wire-connection">
              <Pathline
                points={generateWirePath(fromPos, toPos)}
                stroke={wireColor}
                strokeWidth={2}
                fill="none"
                r={10}
                className="wire-path"
              />
            </g>
          );
        })}
        
        {/* Draw temporary wire being created */}
        {tempWire && (
          <Pathline
            points={generateWirePath(
              getPinPosition(tempWire.fromId),
              mousePos
            )}
            stroke="#90cdf4"
            strokeWidth={2}
            strokeDasharray="5,5"
            fill="none"
            r={10}
          />
        )}
      </svg>
      
      {/* Invisible div to catch clicks for canceling wire drawing */}
      {tempWire && (
        <div
          className="fixed inset-0 cursor-crosshair"
          onClick={handleCanvasClick}
          style={{ zIndex: 1 }}
        />
      )}
    </>
  );
};

export default WireManager;