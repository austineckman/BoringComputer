import React, { useEffect, useRef, useState } from 'react';
import { ReactLEDElement } from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import { useSimulator } from "../simulator/SimpleSimulatorContext";

const MOVE_SETTINGS = {
  DRAGGABLE: true,
  SNAPPABLE: true,
  THROTTLE_DRAG: 0,
  ROTATABLE: true
};

/**
 * SIMPLE LED Component - responds only to real pin states
 */
const SimpleLED = ({
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
  
  // Get simple simulator context
  const { isRunning, pinStates, wires } = useSimulator();
  
  // Component state
  const [ledColor, setLedColor] = useState(color);
  const [rotationAngle, setRotationAngle] = useState(initialRotation);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [isLit, setIsLit] = useState(false);
  
  // SIMPLE: Check if LED should be lit based on connected pin
  useEffect(() => {
    if (!isRunning) {
      setIsLit(false);
      return;
    }
    
    // Find which Arduino pin this LED is connected to
    const connectedPin = findConnectedArduinoPin();
    
    if (connectedPin !== null) {
      // SIMPLE: Just check the pin state directly!
      const pinIsHigh = pinStates[connectedPin];
      setIsLit(!!pinIsHigh);
    } else {
      setIsLit(false);
    }
    
  }, [isRunning, pinStates, wires, id]);
  
  // SIMPLE: Find connected Arduino pin by tracing wires
  const findConnectedArduinoPin = () => {
    if (!Array.isArray(wires)) return null;
    
    // Find wire connected to this LED
    const ledWire = wires.find(wire => 
      wire.sourceComponent === id || wire.targetComponent === id
    );
    
    if (!ledWire) return null;
    
    // Check if other end connects to Arduino/HERO board
    const isLedSource = ledWire.sourceComponent === id;
    const otherComponent = isLedSource ? ledWire.targetComponent : ledWire.sourceComponent;
    const otherPin = isLedSource ? ledWire.targetName : ledWire.sourceName;
    
    if (otherComponent && otherComponent.includes('heroboard')) {
      const pinNumber = parseInt(otherPin);
      return isNaN(pinNumber) ? null : pinNumber;
    }
    
    return null;
  };
  
  // Component data for rendering
  const componentData = {
    id,
    type: 'led',
    attrs: {
      rotate: rotationAngle,
      top: posTop,
      left: posLeft,
      zIndex: 10,
      value: isLit ? 1 : 0, // Simple: 1 = on, 0 = off
      color: ledColor,
      brightness: isLit ? 80 : 0
    }
  };
  
  // Handle drag/rotate (same as before)
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
  
  // Rest of component rendering logic...
  const triggerRedraw = () => {
    if (targetRef.current) {
      const element = targetRef.current.querySelector('wokwi-led');
      if (element && element.requestUpdate) {
        element.requestUpdate();
      }
    }
  };
  
  useEffect(() => {
    if (moveableRef.current) {
      moveableRef.current.request("rotatable", { rotate: rotationAngle }, true);
      triggerRedraw();
    }
  }, [rotationAngle]);
  
  useEffect(() => {
    if (moveableRef.current) {
      moveableRef.current.request("draggable", { translate: [posLeft, posTop] }, true);
      triggerRedraw();
    }
  }, [posTop, posLeft]);
  
  return (
    <div>
      <div
        ref={targetRef}
        onClick={() => onSelect && onSelect(id)}
        style={{
          position: 'absolute',
          left: posLeft,
          top: posTop,
          transform: `rotate(${rotationAngle}deg)`,
          zIndex: 10,
          width: '30px',
          height: '75px',
          cursor: 'pointer',
          border: isSelected ? '2px solid #00ff00' : 'none',
          background: isSelected ? 'rgba(0, 255, 0, 0.1)' : 'transparent',
          borderRadius: '4px'
        }}
      >
        <ReactLEDElement
          component={componentData}
          onPinConnect={onPinConnect}
        />
      </div>
      
      {isSelected && (
        <Moveable
          ref={moveableRef}
          target={targetRef}
          draggable={MOVE_SETTINGS.DRAGGABLE}
          rotatable={MOVE_SETTINGS.ROTATABLE}
          throttleDrag={MOVE_SETTINGS.THROTTLE_DRAG}
          onDrag={onDragOrRotate}
          onRotate={onDragOrRotate}
        />
      )}
    </div>
  );
};

export default SimpleLED;