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
    
    // Function to trace circuit path through multiple components (like resistors)
    const traceCircuitPath = (startComponentId, visitedComponents = new Set()) => {
      if (visitedComponents.has(startComponentId)) {
        return null; // Avoid infinite loops
      }
      visitedComponents.add(startComponentId);
      
      // Find all wires connected to this component
      const connectedWires = Array.isArray(connectionWires) ? 
        connectionWires.filter(wire => 
          wire.sourceComponent === startComponentId || wire.targetComponent === startComponentId
        ) : [];
      
      // Check each connected wire
      for (const wire of connectedWires) {
        const isStartSource = wire.sourceComponent === startComponentId;
        const otherComponentId = isStartSource ? wire.targetComponent : wire.sourceComponent;
        const otherPinName = isStartSource ? wire.targetName : wire.sourceName;
        
        // Skip if no other component (broken wire)
        if (!otherComponentId) continue;
        
        // Check if we've reached an Arduino/HeroBoard with pin 13
        if ((otherComponentId.includes('heroboard') || otherComponentId.includes('arduino')) && 
            otherPinName === '13') {
          // Found pin 13! Get its state
          const boardState = componentStates[otherComponentId];
          if (boardState && boardState.pins && typeof boardState.pins['13'] !== 'undefined') {
            return boardState.pins['13'];
          }
        }
        
        // If this is an intermediate component (like resistor), continue tracing
        if (otherComponentId.includes('resistor') || otherComponentId.includes('capacitor') || 
            otherComponentId.includes('inductor')) {
          const result = traceCircuitPath(otherComponentId, visitedComponents);
          if (result !== null) {
            return result;
          }
        }
      }
      
      return null; // No path to pin 13 found
    };
    
    // Start tracing from this LED
    const pin13State = traceCircuitPath(id);
    if (pin13State !== null) {
      setIsLit(!!pin13State);
      connectedToPin = true;
      pinValue = !!pin13State;
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
    console.log(`[LED ${id}] onDragOrRotate called`, { beforeTranslate, beforeRotate });
    
    if (beforeTranslate) {
      const [x, y] = beforeTranslate;
      setPosTop(y);
      setPosLeft(x);
      
      // CONTINUOUS UPDATE: Dispatch move event during drag (not just at end)
      // Get all pin elements for this component
      const ledPins = [...document.querySelectorAll(`[id^="pt-led-${id}-"]`)];
      console.log(`[LED ${id}] Found ${ledPins.length} pins with selector: [id^="pt-led-${id}-"]`);
      const pinPositions = {};
      
      // Calculate updated pin positions
      ledPins.forEach(pinElement => {
        if (pinElement && pinElement.id) {
          const rect = pinElement.getBoundingClientRect();
          const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          
          // Store pin position relative to canvas
          pinPositions[pinElement.id] = {
            x: rect.left + rect.width/2 - canvasRect.left,
            y: rect.top + rect.height/2 - canvasRect.top
          };
          console.log(`[LED ${id}] Pin ${pinElement.id} position:`, pinPositions[pinElement.id]);
        }
      });
      
      // Dispatch component moved event to update wire positions DURING drag
      if (Object.keys(pinPositions).length > 0) {
        console.log(`[LED ${id}] Dispatching componentMoved event with ${Object.keys(pinPositions).length} pins`, pinPositions);
        const event = new CustomEvent('componentMoved', {
          detail: {
            componentId: id,
            x: x,
            y: y,
            pinPositions: pinPositions,
          }
        });
        document.dispatchEvent(event);
      } else {
        console.log(`[LED ${id}] NO PINS FOUND - not dispatching event`);
      }
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

  // Update position when dragged AND notify wire manager
  useEffect(() => {
    triggerRedraw();
    
    // Dispatch component moved event whenever position changes
    if (posLeft !== undefined && posTop !== undefined) {
      const event = new CustomEvent('componentMoved', {
        detail: {
          componentId: id,
          x: posLeft,
          y: posTop
        }
      });
      document.dispatchEvent(event);
    }
  }, [pinInfo, posTop, posLeft, id]);

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