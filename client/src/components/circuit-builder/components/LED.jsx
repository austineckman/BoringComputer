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
    
    // Check if this LED component has state from the simulator
    const myComponentState = componentStates[id];
    if (myComponentState && typeof myComponentState.isOn !== 'undefined') {
      setIsLit(myComponentState.isOn);
      return;
    }
    
    // Also check brightness for analog-controlled LEDs
    if (myComponentState && typeof myComponentState.brightness !== 'undefined') {
      setIsLit(myComponentState.brightness > 0);
      return;
    }
    
    // Fallback: trace connections to find pin states
    let connectedToPin = false;
    let pinValue = false;
    
    // Find all wires directly connected to this LED
    const connectedWires = Array.isArray(connectionWires) ? 
      connectionWires.filter(wire => 
        wire.sourceComponent === id || wire.targetComponent === id
      ) : [];
    
    if (connectedWires.length > 0) {
      // Check each connected wire for pin 13 connection
      connectedWires.forEach(wire => {
        const isLedSource = wire.sourceComponent === id;
        const otherComponentId = isLedSource ? wire.targetComponent : wire.sourceComponent;
        const otherPinName = isLedSource ? wire.targetName : wire.sourceName;
        
        // Check if connected to pin 13 of any Arduino/HeroBoard
        if (otherComponentId && (otherComponentId.includes('heroboard') || otherComponentId.includes('arduino')) && 
            otherPinName === '13') {
          
          // Find the board component state
          const boardState = componentStates[otherComponentId];
          if (boardState && boardState.pins && typeof boardState.pins['13'] !== 'undefined') {
            const pin13State = boardState.pins['13'];
            setIsLit(!!pin13State);
            connectedToPin = true;
            pinValue = !!pin13State;
          }
        }
      });
    }
    
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
        
        {/* LED visual state is handled by the ReactLEDElement itself through the value prop */}
      </div>
    </>
  );
};

export default LED;