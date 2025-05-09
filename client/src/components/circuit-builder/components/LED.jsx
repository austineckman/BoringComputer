import React, { useEffect, useRef, useState } from 'react';
import {
  ReactLEDElement
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";

// Import simulator context if needed for simulation integration
import { useSimulator } from "../simulator/SimulatorContext";
// Import the registry initialization to ensure handlers are registered
import "../registry/RegistryInitializer";

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
  const { 
    isRunning: isSimulationRunning, 
    componentStates, 
    updateComponentWithRegistry,
    checkComponentWiring
  } = useSimulator();
  
  const [ledColor, setLedColor] = useState(color);
  const [rotationAngle, setRotationAngle] = useState(initialRotation);
  const [pinInfo, setPinInfo] = useState();
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);
  const [isLit, setIsLit] = useState(false); // Track LED state for simulation
  
  // Check for proper wiring using the registry system
  const [isProperlyWired, setIsProperlyWired] = useState(false);
  
  // Check wiring status when component or wires change
  useEffect(() => {
    if (!isSimulationRunning) return;
    
    // Use the registry system to check wiring
    try {
      if (checkComponentWiring) {
        const isWired = checkComponentWiring(id);
        console.log(`LED ${id} wiring check: ${isWired ? 'PROPERLY WIRED' : 'NOT PROPERLY WIRED'}`);
        setIsProperlyWired(isWired);
      }
    } catch (err) {
      console.error(`Error checking LED wiring via registry:`, err);
    }
  }, [id, isSimulationRunning, checkComponentWiring]);
  
  // Check if this LED has been updated by the simulation
  useEffect(() => {
    // Only process updates when simulation is running
    if (!isSimulationRunning) {
      setIsLit(false);
      return;
    }
    
    console.log(`LED ${id} checking for state updates via registry`);
    
    // Try using the registry system first
    try {
      if (updateComponentWithRegistry) {
        // Update this LED using the registry handlers
        // The pinValues contain Arduino pin states that the LED might be connected to
        const pinValues = window.simulatorContext?.pinValues || {};
        const updatedState = updateComponentWithRegistry(id, pinValues);
        
        if (updatedState) {
          console.log(`LED ${id} updated via registry:`, updatedState);
          setIsLit(updatedState.isLit || false);
          return;
        }
      }
    } catch (err) {
      console.warn(`Error updating LED via registry:`, err);
    }
    
    // Fallback to direct component state access if registry update failed
    console.log(`Falling back to direct component state for LED ${id}`);
    
    // Check if there's a direct state update for this component ID
    if (componentStates && componentStates[id]) {
      const ledState = componentStates[id];
      // Update LED state based on simulation results
      const newLitState = ledState.isLit || false;
      console.log(`LED ${id} updated from simulation: isLit=${newLitState}`);
      setIsLit(newLitState);
    } 
    // Fallback: try alternative ID formats
    else if (componentStates) {
      // Try finding this LED's state using any key that contains this ID
      const matchingStateKey = Object.keys(componentStates).find(key => 
        key.includes(id) || (typeof id === 'string' && id.includes(key))
      );
      
      if (matchingStateKey) {
        const ledState = componentStates[matchingStateKey];
        const newLitState = ledState.isLit || false;
        console.log(`LED ${id} updated from simulation via alternative key ${matchingStateKey}: isLit=${newLitState}`);
        setIsLit(newLitState);
      }
    }
  }, [componentStates, id, isSimulationRunning, updateComponentWithRegistry]);
  
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
            transform: `translate(${initPosLeft}px, ${initPosTop}px)`,
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
            {/* Wiring status indicator */}
            <div 
              className={`absolute rounded-full w-3 h-3 ${isProperlyWired ? 'bg-blue-500' : 'bg-orange-500'}`}
              style={{
                transform: `translate(${initPosLeft + 35}px, ${initPosTop - 5}px)`,
                boxShadow: isProperlyWired ? '0 0 5px 1px #3b82f6' : 'none',
                transition: 'background-color 0.2s, box-shadow 0.2s',
                zIndex: 100
              }}
              title={isProperlyWired ? "LED is properly wired" : "LED is not properly wired"}
            ></div>
            
            {/* Power status indicator dot */}
            <div 
              className={`absolute rounded-full w-3 h-3 ${isLit ? 'bg-green-500' : 'bg-red-500'}`}
              style={{
                transform: `translate(${initPosLeft + 35}px, ${initPosTop + 5}px)`,
                boxShadow: isLit ? '0 0 8px 2px #4ade80' : 'none',
                transition: 'background-color 0.2s, box-shadow 0.2s',
                zIndex: 100
              }}
              title={isLit ? "LED is lit" : "LED is off"}
            ></div>
            
            {/* Glow effect when LED is on */}
            {isLit && isProperlyWired && (
              <div 
                className="absolute rounded-full w-10 h-10 opacity-50"
                style={{
                  backgroundColor: ledColor === 'red' ? '#ff0000' : 
                                   ledColor === 'green' ? '#00ff00' : 
                                   ledColor === 'blue' ? '#0000ff' : '#ff0000',
                  transform: `translate(${initPosLeft + 10}px, ${initPosTop + 10}px)`,
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