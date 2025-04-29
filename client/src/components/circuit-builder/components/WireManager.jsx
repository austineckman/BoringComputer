import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PathLine } from 'react-svg-pathline';
import { createPortal } from 'react-dom';

// Utility functions to match Wokwi implementation
const makeId = (length) => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const randomColor = () => {
  // Default to red for testing as requested
  return '#ff3333';  // Solid red wires for testing
};

const wireColorOptions = () => [
  { 'value': '#000000' },
  { 'value': '#563831' },
  { 'value': '#26b297' },
  { 'value': '#00ff00' },
  { 'value': '#1f5e1f' },
  { 'value': '#852583' },
  { 'value': '#3c61e3' },
  { 'value': '#ff6600' },
  { 'value': '#ff3333' },
  { 'value': '#dada32' },
  { 'value': '#b925c9' }
];

// MoveableConnection component for individual wires
const MoveableConnection = ({ 
  connectionData, 
  path, 
  handleMouseDown, 
  handleDelete, 
  showMenu, 
  handleColorChange, 
  isActive, 
  zIndex 
}) => {
  const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
  const [conColor, setConColor] = useState(connectionData.color); // Wire color
  const colorOptions = wireColorOptions();
  const [isDragged, setIsDragged] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsComponentMenuShowing(showMenu);
    }, 100);
  }, [showMenu]);

  return (
    <>
      <g id={connectionData.id}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={(isHovered || isActive) && !isDragged ? {filter: `drop-shadow(0 0 3px ${conColor})`} : {}}
        className={`${(isActive && !isDragged) ? 'active' : ''} mPath cursor-pointer relative`}>
        <PathLine
          points={path}
          stroke={conColor}
          strokeWidth="3"
          fill="none"
          r={4}
        />
        <PathLine
          style={{
            pointerEvents: "visibleStroke"  // Ensures this element will receive mouse events
          }}
          onMouseDown={(e) => {
            console.log('connection clicked');
            e.nativeEvent.stopImmediatePropagation();
            handleMouseDown(connectionData.id, true, true);
          }}
          points={path}
          stroke="transparent"
          strokeWidth="12"
          fill="none"
          r={4}
        />
      </g>
      {isComponentMenuShowing && isActive && createPortal(
        <>
          <div className="flex-row">
            <label className="block text-sm font-medium text-gray-700">Select color</label>
            {colorOptions.map((color, index) => {
              return <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newColor = e.target.dataset.value;
                  setConColor(newColor);
                  handleColorChange(newColor); // Update the color in the context
                }}
                data-value={color.value}
                className="inline-flex m-1 w-6 h-6 rounded border justify-center border-white hover:border-2"
                style={{
                  backgroundColor: color.value,
                  border: conColor === color.value ? '3px solid white' : '1px solid white'
                }}
                key={`led-col-opt-${index}`}></button>
            })}
          </div>
          <div className="flex items-center h-full">
            <div className="p-2 cursor-pointer ml-1 mt-2" onClick={(e) => handleDelete(connectionData.id)}>
              <svg xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 448 512">
                <path
                  d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
              </svg>
            </div>
          </div>
        </>,
        document.querySelector('#component-context-menu') || document.body
      )}
    </>
  );
};

/**
 * WireManager component using the Wokwi/Inventr implementation
 * 
 * @param {Object} props
 * @param {RefObject} props.canvasRef - Reference to the canvas element
 */
const WireManager = ({ canvasRef }) => {
  // State for pin and wire management
  const [registeredPins, setRegisteredPins] = useState({});
  const [connections, setConnections] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPin, setStartPin] = useState(null);
  const [focusedConnectionId, setFocusedConnectionId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  
  // SVG reference
  const svgRef = useRef(null);
  
  // Calculate path for connections
  const drawConnection = (start, end) => {
    const path = [];
    const midPoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    
    path.push(start);
    
    if (start.y === end.y || start.x === end.x) {
      // If start-end points are collinear vertically or horizontally
      path.push(end);
    } else {
      // If start-end points are not collinear
      if (Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
        // If distance in x direction is more than in y direction
        const midHorizontal = { x: midPoint.x, y: start.y };
        path.push(midHorizontal);
        const midVertical = { x: midPoint.x, y: end.y };
        path.push(midVertical);
      } else {
        // If distance in y direction is more than in x direction
        const midVertical = { x: start.x, y: midPoint.y };
        path.push(midVertical);
        const midHorizontal = { x: end.x, y: midPoint.y };
        path.push(midHorizontal);
      }
    }
    
    path.push(end);
    return path;
  };
  
  // Redraw connections when component positions change
  const handleRedrawConnections = useCallback(() => {
    setConnections(prevConnections => {
      return prevConnections.map(connection => {
        // Get the start and end pin elements
        const startPinEl = registeredPins[connection.startPin.id]?.element;
        const endPinEl = registeredPins[connection.endPin.id]?.element;
        
        if (!startPinEl || !endPinEl) {
          return connection;
        }
        
        // Calculate new positions
        const startPos = getElementPosition(startPinEl);
        const endPos = getElementPosition(endPinEl);
        
        // Update connection with new positions
        return {
          ...connection,
          startPin: {
            ...connection.startPin,
            x: startPos.x,
            y: startPos.y
          },
          endPin: {
            ...connection.endPin,
            x: endPos.x,
            y: endPos.y
          }
        };
      });
    });
  }, [registeredPins]);
  
  // Get element position relative to the canvas
  const getElementPosition = (element) => {
    if (!element || !canvasRef?.current) return { x: 0, y: 0 };
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    return {
      x: elementRect.left - canvasRect.left + elementRect.width / 2,
      y: elementRect.top - canvasRect.top + elementRect.height / 2
    };
  };
  
  // Handle pins being clicked to start/end connections
  const handlePinClick = useCallback((pinId) => {
    console.log(`Pin ${pinId} clicked in WireManager handlePinClick`);
    
    // Get the pin information
    const pin = registeredPins[pinId];
    if (!pin) {
      console.warn(`Pin ${pinId} not found in registered pins`);
      return;
    }
    
    // Get position of the pin
    const position = getElementPosition(pin.element);
    
    if (!isDrawing) {
      // Start a new wire from this pin
      console.log(`Starting wire from pin ${pinId} at position:`, position);
      setStartPin({ x: position.x, y: position.y, id: pinId });
      setIsDrawing(true);
    } else {
      // Finish the wire if not connecting to self
      if (startPin && startPin.id !== pinId) {
        console.log(`Connecting wire from pin ${startPin.id} to pin ${pinId}`);
        const newConnection = {
          id: `connection-${makeId(8)}`,
          startPin: startPin,
          endPin: { x: position.x, y: position.y, id: pinId },
          color: randomColor()
        };
        
        setConnections(prev => [...prev, newConnection]);
        setStartPin(null);
      } else {
        console.log(`Cancelling wire from pin ${startPin?.id || 'unknown'}`);
        // Cancel the wire if clicking the same pin
        setStartPin(null);
      }
      setIsDrawing(false);
    }
  }, [isDrawing, registeredPins, startPin, getElementPosition]);
  
  // Special method for direct DOM click handling from pins
  const handleDirectPinClick = useCallback((e) => {
    // Check if this is a pin
    const pinElement = e.target.closest('.pin-connection-point');
    if (pinElement) {
      const pinId = pinElement.dataset.pinId;
      const pinType = pinElement.dataset.pinType;
      const parentId = pinElement.dataset.parentId;
      
      console.log(`Direct pin click detected on ${pinId}, type ${pinType}`);
      
      if (pinId) {
        handlePinClick(pinId);
      }
      
      // Stop event to prevent other handlers
      e.stopPropagation();
    }
  }, [handlePinClick]);
  
  // Add direct DOM click handler
  useEffect(() => {
    if (canvasRef?.current) {
      canvasRef.current.addEventListener('click', handleDirectPinClick);
      
      return () => {
        if (canvasRef?.current) {
          canvasRef.current.removeEventListener('click', handleDirectPinClick);
        }
      };
    }
  }, [canvasRef, handleDirectPinClick]);
  
  // Handle wire selection and context menu
  const handleWireMouseDown = (connectionId, showMenu = true, isConnection = false) => {
    if (showMenu) {
      setShowMenu(true);
    } else {
      setShowMenu(false);
    }
    
    if (isConnection) {
      setFocusedConnectionId(connectionId);
    } else {
      setFocusedConnectionId(null);
    }
  };
  
  // Handle wire deletion
  const handleDeleteConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    setFocusedConnectionId(null);
    setShowMenu(false);
  };
  
  // Handle wire color change
  const handleColorChange = (newColor) => {
    setConnections(prev => prev.map(conn => 
      conn.id === focusedConnectionId 
        ? { ...conn, color: newColor } 
        : conn
    ));
  };
  
  // Register event listeners for pin registration and wire drawing
  useEffect(() => {
    // Handler for pin registration
    const handleRegisterPin = (e) => {
      const { id, parentId, pinType, label, element } = e.detail;
      
      setRegisteredPins(prev => ({
        ...prev,
        [id]: { id, parentId, type: pinType, label, element }
      }));
    };
    
    // Handler for pin unregistration
    const handleUnregisterPin = (e) => {
      const { id } = e.detail;
      
      setRegisteredPins(prev => {
        const newPins = { ...prev };
        delete newPins[id];
        return newPins;
      });
      
      // Remove any wires connected to this pin
      setConnections(prev => prev.filter(conn => 
        conn.startPin.id !== id && conn.endPin.id !== id
      ));
    };
    
    // Handler for direct pin click events
    const handlePinClickEvent = (e) => {
      const { id, pinType, parentId } = e.detail;
      console.log(`Received pinClicked event for pin ${id}, type: ${pinType}, parent: ${parentId}`);
      
      if (!id) {
        console.warn('Received pinClicked event with missing id');
        return;
      }
      handlePinClick(id);
    };
    
    // Handler for wire redrawing
    const handleRedrawEvent = () => {
      handleRedrawConnections();
    };
    
    // Handler for clicks outside wires to clear selection
    const handleDocumentClick = (e) => {
      const isWireClick = e.target.closest('.mPath');
      const isMenuClick = e.target.closest('#component-context-menu');
      
      if (!isWireClick && !isMenuClick) {
        setFocusedConnectionId(null);
        setShowMenu(false);
      }
    };
    
    // Register event listeners
    document.addEventListener('registerPin', handleRegisterPin);
    document.addEventListener('unregisterPin', handleUnregisterPin);
    document.addEventListener('pinClicked', handlePinClickEvent);
    document.addEventListener('redrawWires', handleRedrawEvent);
    document.addEventListener('click', handleDocumentClick);
    
    // Create context menu container if it doesn't exist
    if (!document.querySelector('#component-context-menu')) {
      const menuDiv = document.createElement('div');
      menuDiv.id = 'component-context-menu';
      menuDiv.className = 'absolute z-50 bg-gray-800 p-3 rounded-md shadow-lg';
      menuDiv.style.position = 'fixed';
      menuDiv.style.top = '50%';
      menuDiv.style.left = '50%';
      menuDiv.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(menuDiv);
    }
    
    // Cleanup function to remove all event listeners
    return () => {
      document.removeEventListener('registerPin', handleRegisterPin);
      document.removeEventListener('unregisterPin', handleUnregisterPin);
      document.removeEventListener('pinClicked', handlePinClickEvent);
      document.removeEventListener('redrawWires', handleRedrawEvent);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [handlePinClick, handleRedrawConnections]);
  
  // Add mouse move handler for pending wire visualization
  useEffect(() => {
    if (!isDrawing || !startPin || !canvasRef?.current) return;
    
    console.log('Setting up mouse move for wire drawing...', { startPin });
    
    const handleMouseMove = (e) => {
      // This is handled by the MouseTracker component
      const event = new CustomEvent('wire-drawing', {
        detail: {
          startPin,
          mouseX: e.clientX,
          mouseY: e.clientY
        }
      });
      document.dispatchEvent(event);
    };
    
    const canvasEl = canvasRef.current;
    canvasEl.addEventListener('mousemove', handleMouseMove);
    
    // Make the wire layer receive pointer events while drawing
    if (svgRef.current) {
      svgRef.current.style.pointerEvents = 'auto';
    }
    
    return () => {
      canvasEl.removeEventListener('mousemove', handleMouseMove);
      // Reset pointer events when done drawing
      if (svgRef.current) {
        svgRef.current.style.pointerEvents = 'none';
      }
    };
  }, [isDrawing, startPin, canvasRef]);
  
  // MouseTracker component for drawing the pending wire
  const MouseTracker = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
      const handleWireDrawing = (e) => {
        if (!canvasRef?.current) return;
        
        const canvasRect = canvasRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.detail.mouseX - canvasRect.left,
          y: e.detail.mouseY - canvasRect.top
        });
      };
      
      document.addEventListener('wire-drawing', handleWireDrawing);
      
      return () => {
        document.removeEventListener('wire-drawing', handleWireDrawing);
      };
    }, []);
    
    if (!isDrawing || !startPin) return null;
    
    const path = drawConnection(
      { x: startPin.x, y: startPin.y },
      { x: mousePosition.x, y: mousePosition.y }
    );
    
    return (
      <g className="pending-wire">
        <PathLine
          points={path}
          stroke="#ff3333" // Solid red for testing wires
          strokeWidth="3"
          strokeDasharray="6,3"
          fill="none"
          r={4}
        />
      </g>
    );
  };
  
  return (
    <svg 
      ref={svgRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Draw existing wires using MoveableConnection */}
      {connections.map(connection => {
        const path = drawConnection(
          { x: connection.startPin.x, y: connection.startPin.y },
          { x: connection.endPin.x, y: connection.endPin.y }
        );
        
        return (
          <MoveableConnection
            key={connection.id}
            connectionData={connection}
            path={path}
            handleMouseDown={handleWireMouseDown}
            handleDelete={handleDeleteConnection}
            handleColorChange={handleColorChange}
            showMenu={showMenu && focusedConnectionId === connection.id}
            isActive={focusedConnectionId === connection.id}
            zIndex={10}
          />
        );
      })}
      
      {/* Draw pending wire */}
      <MouseTracker />
    </svg>
  );
};

export default WireManager;