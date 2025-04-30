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
  const { isSimulationRunning, componentStates } = useSimulator();
  
  const [ledColor, setLedColor] = useState(color);
  const [rotationAngle, setRotationAngle] = useState(initialRotation);
  const [pinInfo, setPinInfo] = useState();
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);
  const [isLit, setIsLit] = useState(false); // Track LED state for simulation
  
  // Enhanced Wokwi-style LED state management from simulation
  useEffect(() => {
    // Check if this LED has been updated by the simulation via context
    if (componentStates && componentStates[id]) {
      const ledState = componentStates[id];
      // Update LED state based on simulation results
      setIsLit(ledState.isLit || false);
      console.log(`LED ${id} state updated from simulation context: isLit=${ledState.isLit}`);
    }
    
    // Set up event listeners for simulation events
    const handlePinStateChange = (e) => {
      if (e.detail && e.detail.componentId === id) {
        console.log(`LED ${id} receiving pin state change:`, e.detail);
        setIsLit(e.detail.isHigh || false);
      }
    };
    
    const handleComponentStateChange = (e) => {
      if (e.detail && e.detail.componentId === id) {
        console.log(`LED ${id} receiving component state change:`, e.detail);
        setIsLit(e.detail.isLit || false);
      }
    };
    
    const handleArduinoPinChange = (e) => {
      // Check if this is pin 13 (typical LED pin on Arduino boards)
      // This is a special case for the built-in LED on Arduino boards
      if (e.detail && e.detail.pin === 13 && id.includes('led-')) {
        console.log(`Arduino pin 13 changed to ${e.detail.isHigh ? 'HIGH' : 'LOW'}`);
        setIsLit(e.detail.isHigh || false);
      }
    };
    
    // Add all the event listeners - Wokwi style
    document.addEventListener('pinStateChanged', handlePinStateChange);
    document.addEventListener('componentStateChanged', handleComponentStateChange);
    document.addEventListener('arduinoPinChanged', handleArduinoPinChange);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('pinStateChanged', handlePinStateChange);
      document.removeEventListener('componentStateChanged', handleComponentStateChange);
      document.removeEventListener('arduinoPinChanged', handleArduinoPinChange);
    };
  }, [componentStates, id, isSimulationRunning]);
  
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
  
  // Debug help for LED state 
  useEffect(() => {
    console.log(`LED ${id} state updated: isLit=${isLit}, isSimulationRunning=${isSimulationRunning}, rendered value=${componentData.attrs.value}`);
  }, [isLit, isSimulationRunning]);

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
    </>
  );
};

export default LED;