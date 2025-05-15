import React, { useEffect, useRef, useState } from 'react';
import {
  ReactLEDElement
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";

// Import simulator context if needed for simulation integration
import { useSimulator } from "../simulator/SimulatorContext";

// Define MOVE_SETTINGS to match what the original code expects
const MOVE_SETTINGS = {
  DRAGGABLE: true,
  SNAPPABLE: true,
  THROTTLE_DRAG: 0,
  ROTATABLE: true
};

/**
 * LED Component
 * Using the Wokwi implementation from invent-share-master
 */
const LED = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  color = 'red'
}) => {
  const targetRef = useRef();
  const moveableRef = useRef();
  const oldDataRef = useRef();

  // Access simulator context for simulation state
  const { isRunning: isSimulationRunning, componentStates } = useSimulator();
  
  const [ledColor, setLedColor] = useState(color);
  const [rotationAngle, setRotationAngle] = useState(initialRotation);
  const [pinInfo, setPinInfo] = useState();
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);
  const [isLit, setIsLit] = useState(false); // Track LED state for simulation
  
  // Access the wires from the simulator context
  const { wires: connectionWires } = useSimulator();
  
  // Check if this LED has been updated by the simulation
  useEffect(() => {
    // Turn off LED when simulation stops
    if (!isSimulationRunning) {
      setIsLit(false);
      return;
    }
    
    // This implementation ensures the LED only responds to actual pin signals from
    // the emulator, not shortcuts or keyword detection.
    
    // Track pin connections and values from emulator
    let connectedToPin = false;
    let pinValue = false;
    let analogValue = 0;
    
    // Trace LED connections through wires to find emulator signal sources
    const traceConnections = () => {
      // Find all wires directly connected to this LED
      const connectedWires = Array.isArray(connectionWires) ? 
        connectionWires.filter(wire => 
          wire.sourceComponent === id || wire.targetComponent === id
        ) : [];
      
      if (connectedWires.length === 0) {
        return;
      }
      
      // Process each wire connection
      connectedWires.forEach(wire => {
        // Determine if this LED is the source or target of the wire
        const isLedSource = wire.sourceComponent === id;
        
        // Find the other component this wire connects to
        const otherComponentId = isLedSource ? wire.targetComponent : wire.sourceComponent;
        const otherPinName = isLedSource ? wire.targetName : wire.sourceName;
        
        if (!otherComponentId) return;
        
        // If directly connected to a pin source (heroboard/Arduino)
        if (otherComponentId.includes('heroboard') || otherComponentId.includes('arduino')) {
          const pinNumber = otherPinName;
          traceEmulatorPinSource(otherComponentId, pinNumber);
        }
        // If connected to a resistor or other passive component, follow the connection through
        else if (otherComponentId.includes('resistor')) {
          traceConnectionThroughComponent(wire, otherComponentId);
        }
      });
    };
    
    // Trace emulator pin source (Arduino pins or board pins)
    const traceEmulatorPinSource = (boardId, pinNumber) => {
      // First try the specific board's pin state
      if (componentStates[boardId]?.pins?.[pinNumber] !== undefined) {
        updatePinState(boardId, pinNumber, componentStates[boardId].pins[pinNumber]);
        return true;
      }
      
      // Then try generic 'heroboard' as fallback
      if (componentStates.heroboard?.pins?.[pinNumber] !== undefined) {
        updatePinState('heroboard', pinNumber, componentStates.heroboard.pins[pinNumber]);
        return true;
      }
      
      // Last resort - search all component states
      const boardKeys = Object.keys(componentStates).filter(key => 
        (key.includes('heroboard') || key.includes('arduino')) && 
        componentStates[key]?.pins?.[pinNumber] !== undefined
      );
      
      if (boardKeys.length > 0) {
        const firstBoard = boardKeys[0];
        updatePinState(firstBoard, pinNumber, componentStates[firstBoard].pins[pinNumber]);
        return true;
      }
      
      return false;
    };
    
    // Trace connection through a component (like a resistor)
    const traceConnectionThroughComponent = (originalWire, componentId) => {
      // Find all wires connected to this component (except the one to this LED)
      const componentWires = Array.isArray(connectionWires) ?
        connectionWires.filter(w => 
          (w.sourceComponent === componentId || w.targetComponent === componentId) &&
          w.id !== originalWire.id
        ) : [];
      
      // Follow each wire from the component
      componentWires.forEach(componentWire => {
        const isComponentSource = componentWire.sourceComponent === componentId;
        const nextComponentId = isComponentSource ? componentWire.targetComponent : componentWire.sourceComponent;
        const nextPinName = isComponentSource ? componentWire.targetName : componentWire.sourceName;
        
        if (!nextComponentId) return;
        
        // If this component connects to a pin source
        if (nextComponentId.includes('heroboard') || nextComponentId.includes('arduino')) {
          const pinNumber = nextPinName;
          traceEmulatorPinSource(nextComponentId, pinNumber);
        }
      });
    };
    
    // Update pin state with proper analog value handling
    const updatePinState = (boardId, pinNumber, pinState) => {
      connectedToPin = true;
      
      // Handle different pin state formats
      if (typeof pinState === 'object' && pinState !== null) {
        // Object format with isHigh and analogValue properties
        const isHigh = !!pinState.isHigh;
        const pinAnalogValue = pinState.analogValue || 0;
        
        // For LEDs, any non-zero analog value will light them
        // For RGB LEDs we would use the actual analogValue to control brightness
        pinValue = pinValue || isHigh || (pinAnalogValue > 0);
        analogValue = Math.max(analogValue, pinAnalogValue);
      } else {
        // Boolean format (standard digital pin)
        pinValue = pinValue || !!pinState;
        
        // Use full brightness for digital HIGH
        if (!!pinState) {
          analogValue = 255;
        }
      }
    };
    
    // Execute the connection tracing to find pin signals
    traceConnections();
    
    // Update LED state based on connection and pin value
    setIsLit(connectedToPin && pinValue);
    
  }, [componentStates, id, isSimulationRunning, connectionWires]);
  
  // Create a component data structure that matches what the original code expects
  const componentData = {
    id,
    type: 'led',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      // LED is lit if simulation is running and the LED state is ON
      // OR if not simulating and the component is selected (for visual feedback)
      value: isSimulationRunning ? (isLit ? 1 : 0) : (isSelected ? 1 : 0),
      color: ledColor,
      brightness: 80
    }
  };

  // Handle drag or rotate
  const onDragOrRotate = ({ target, beforeTranslate, beforeRotate }) => {
    if (beforeTranslate) {
      const [x, y] = beforeTranslate;
      setPosTop(y);
      setPosLeft(x);
    }
    
    if (beforeRotate !== undefined) {
      setRotationAngle(beforeRotate);
    }
  };

  // Rotate component when rotation angle is changed
  useEffect(() => {
    if (moveableRef.current) {
      moveableRef.current.request("rotatable", { rotate: rotationAngle }, true);
      triggerRedraw();
    }
  }, [moveableRef.current, rotationAngle]);

  // Update position when dragged
  useEffect(() => {
    triggerRedraw();
  }, [pinInfo, posTop, posLeft]);

  // Update color when changed (e.g., from parent component)
  useEffect(() => {
    setLedColor(color);
  }, [color]);

  const onPinInfoChange = (e) => {
    setPinInfo(e.detail);
  }

  // Trigger redraw function similar to the original
  const triggerRedraw = () => {
    // This simulates the original triggerRedraw function
    if (targetRef.current) {
      const newTransform = `translate(${posLeft}px, ${posTop}px)`;
      targetRef.current.style.transform = newTransform;
    }
  };

  // Rotate the handle by 90 degrees
  const handleRotate = () => {
    setRotationAngle((rotationAngle + 90) % 360);
  };

  // Handle pin click
  const handlePinClicked = (e) => {
    console.log("Pin clicked on LED:", e.detail);
    
    // Extract pin information from the event
    if (onPinConnect) {
      try {
        // The data is a JSON string inside the detail object
        const pinDataJson = e.detail.data;
        const pinData = JSON.parse(pinDataJson);
        
        // Get pin ID and type from the parsed data
        const pinId = pinData.name;
        // Determine pin type based on signals if available
        let pinType = 'bidirectional';
        if (pinData.signals && pinData.signals.length > 0) {
          const signal = pinData.signals[0];
          if (signal.type === 'power') {
            pinType = 'power';
          } else if (signal.type === 'digital') {
            pinType = 'digital';
          }
        }
        
        // Get position information
        const clientX = e.detail.clientX || 0;
        const clientY = e.detail.clientY || 0;
        
        console.log(`Pin clicked: ${pinId} (${pinType})`);
        
        // Call the parent's onPinConnect handler
        onPinConnect(pinId, pinType, id);
        
        // Send another event with the formatted pin ID to match our wire manager
        const formattedPinId = `pt-${id.toLowerCase().split('-')[0]}-${id}-${pinId}`;
        
        // Create a custom pin click event to trigger the wire manager
        const pinClickEvent = new CustomEvent('pinClicked', {
          detail: {
            id: formattedPinId,
            pinData: pinDataJson,
            pinType: pinType,
            parentId: id,
            clientX,
            clientY
          }
        });
        
        // Dispatch the event to be captured by the SimpleWireManager
        document.dispatchEvent(pinClickEvent);
      } catch (err) {
        console.error("Error parsing pin data:", err);
      }
    }
  };

  // No longer need the component context menu

  return (
    <>
      {isSelected && (
        <Moveable
          ref={moveableRef}
          target={targetRef}
          draggable={MOVE_SETTINGS.DRAGGABLE}
          snappable={MOVE_SETTINGS.SNAPPABLE}
          throttleDrag={MOVE_SETTINGS.THROTTLE_DRAG}
          rotatable={MOVE_SETTINGS.ROTATABLE}
          onDrag={onDragOrRotate}
          onRotate={onDragOrRotate}
          onDragStart={() => setIsDragged(true)}
          onDragEnd={() => setIsDragged(false)}
        ></Moveable>
      )}
      
      <div className="relative">
        <ReactLEDElement
          id={id}
          className="min-w-min cursor-pointer absolute"
          ref={targetRef}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(id);
          }}
          onPinClicked={handlePinClicked}
          onPininfoChange={(e) => onPinInfoChange(e)}
          style={{
            transform: `translate(${posLeft}px, ${posTop}px)`,
            zIndex: isDragged ? 99999 : 10
          }}
          color={ledColor}
          flip={false}
          isActive={isSelected}
          isDragged={isDragged}
          rotationTransform={rotationAngle}
          brightness={componentData.attrs.brightness}
          value={componentData.attrs.value}
        ></ReactLEDElement>
        
        {/* Simulation state indicator */}
        {isSimulationRunning && (
          <>
            {/* Glow effect when LED is on */}
            {isLit && (
              <div 
                className="absolute rounded-full w-10 h-10 opacity-50"
                style={{
                  backgroundColor: ledColor === 'red' ? '#ff0000' : 
                                   ledColor === 'green' ? '#00ff00' : 
                                   ledColor === 'blue' ? '#0000ff' : '#ff0000',
                  // Positioning relative to the current LED position
                  transform: `translate(${posLeft + 10}px, ${posTop + 10}px)`,
                  boxShadow: `0 0 15px 5px ${
                    ledColor === 'red' ? '#ff0000' : 
                    ledColor === 'green' ? '#00ff00' : 
                    ledColor === 'blue' ? '#0000ff' : '#ff0000'
                  }`,
                  filter: 'blur(5px)',
                  animation: 'pulse 1s infinite alternate',
                  zIndex: 99
                }}
              ></div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default LED;