import React, { useEffect, useRef, useState } from 'react';
import {
  ReactResistorComponent
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";
import { createPortal } from "react-dom";

// Define MOVE_SETTINGS to match what the original code expects
const MOVE_SETTINGS = {
  DRAGGABLE: true,
  SNAPPABLE: true,
  THROTTLE_DRAG: 0,
  ROTATABLE: true
};

// Introduced constants for resistor units
const RESISTOR_UNITS = {
  OHM: 'ohm',
  KILOHM: 'kilohm',
  MEGAOHM: 'megaohm'
};

/**
 * Resistor Component
 * Using the Wokwi implementation from invent-share-master
 */
const Resistor = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  value = '220Ω' // Default resistance value
}) => {
  const targetRef = useRef();
  const moveableRef = useRef();
  const oldDataRef = useRef();

  // Parse the initial value
  const initialValueNum = parseInt(value.replace(/[^\d]/g, ''));

  const [isComponentMenuShowing, setIsComponentMenuShowing] = useState(false);
  const [resistorValue, setResistorValue] = useState(initialValueNum / 1000); // In ohms for the component
  const [inputResistorValue, setInputResistorValue] = useState(initialValueNum); // For display/input
  const [resistorValueUnit, setResistorValueUnit] = useState(RESISTOR_UNITS.KILOHM);
  const [rotationAngle, setRotationAngle] = useState(initialRotation);
  const [pinInfo, setPinInfo] = useState();
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);
  const [r1PinValue, setR1PinValue] = useState(false);
  const [r2PinValue, setR2PinValue] = useState(false);
  
  // Shared simulation state
  const isSimulationRunning = window.isSimulationRunning;

  // Track connected wires and propagate signal changes
  useEffect(() => {
    if (!isSimulationRunning) return;
    
    // Check if the simulator context is available
    if (!window.simulatorContext) return;
    
    // Get all wires in the circuit from the simulator context
    const { wires, componentStates } = window.simulatorContext;
    if (!wires || !Array.isArray(wires) || wires.length === 0) return;
    
    // Find wires connected to this resistor
    const connectedWires = wires.filter(wire => 
      (wire.sourceComponent === id || wire.targetComponent === id)
    );
    
    if (connectedWires.length < 2) return; // Resistor needs at least 2 connections to work
    
    // For each pin, check what's connected to it and the state
    const r1Connections = connectedWires.filter(wire => 
      (wire.sourceComponent === id && wire.sourceName === 'r1') || 
      (wire.targetComponent === id && wire.targetName === 'r1')
    );
    
    const r2Connections = connectedWires.filter(wire => 
      (wire.sourceComponent === id && wire.sourceName === 'r2') || 
      (wire.targetComponent === id && wire.targetName === 'r2')
    );
    
    console.log(`Resistor ${id} has ${r1Connections.length} r1 connections and ${r2Connections.length} r2 connections`);
    
    // Variables to track connected components and their states
    let r1PinStateFound = false;
    let r2PinStateFound = false;
    let r1ConnectedLEDs = [];
    let r2ConnectedLEDs = [];
    let r1ConnectedToHeroboard = false;
    let r2ConnectedToHeroboard = false;
    let heroboardR1Pin = null;
    let heroboardR2Pin = null;
    let heroboardR1Id = null;
    let heroboardR2Id = null;
    let heroboardR1PinState = false;
    let heroboardR2PinState = false;
    
    // Check r1 connections
    r1Connections.forEach(wire => {
      const otherComponentId = wire.sourceComponent === id ? wire.targetComponent : wire.sourceComponent;
      const otherPinName = wire.sourceComponent === id ? wire.targetName : wire.sourceName;
      
      // If r1 is connected to a heroboard
      if (otherComponentId && otherComponentId.includes('heroboard')) {
        heroboardR1Id = otherComponentId;
        heroboardR1Pin = otherPinName;
        r1ConnectedToHeroboard = true;
        
        // Check if pin has a known state
        if (componentStates[otherComponentId]?.pins?.[otherPinName] !== undefined) {
          heroboardR1PinState = componentStates[otherComponentId].pins[otherPinName];
          r1PinStateFound = true;
          setR1PinValue(heroboardR1PinState);
          console.log(`Resistor ${id} r1 connected to heroboard ${otherComponentId} pin ${otherPinName} with state ${heroboardR1PinState}`);
        } else if (componentStates.heroboard?.pins?.[otherPinName] !== undefined) {
          heroboardR1PinState = componentStates.heroboard.pins[otherPinName];
          r1PinStateFound = true;
          setR1PinValue(heroboardR1PinState);
          console.log(`Resistor ${id} r1 connected to generic heroboard pin ${otherPinName} with state ${heroboardR1PinState}`);
        }
      }
      // If r1 is connected to an LED
      else if (otherComponentId && otherComponentId.includes('led')) {
        r1ConnectedLEDs.push(otherComponentId);
        console.log(`Resistor ${id} r1 connected to LED ${otherComponentId}`);
      }
    });
    
    // Check r2 connections
    r2Connections.forEach(wire => {
      const otherComponentId = wire.sourceComponent === id ? wire.targetComponent : wire.sourceComponent;
      const otherPinName = wire.sourceComponent === id ? wire.targetName : wire.sourceName;
      
      // If r2 is connected to a heroboard
      if (otherComponentId && otherComponentId.includes('heroboard')) {
        heroboardR2Id = otherComponentId;
        heroboardR2Pin = otherPinName;
        r2ConnectedToHeroboard = true;
        
        // Check if pin has a known state
        if (componentStates[otherComponentId]?.pins?.[otherPinName] !== undefined) {
          heroboardR2PinState = componentStates[otherComponentId].pins[otherPinName];
          r2PinStateFound = true;
          setR2PinValue(heroboardR2PinState);
          console.log(`Resistor ${id} r2 connected to heroboard ${otherComponentId} pin ${otherPinName} with state ${heroboardR2PinState}`);
        } else if (componentStates.heroboard?.pins?.[otherPinName] !== undefined) {
          heroboardR2PinState = componentStates.heroboard.pins[otherPinName];
          r2PinStateFound = true;
          setR2PinValue(heroboardR2PinState);
          console.log(`Resistor ${id} r2 connected to generic heroboard pin ${otherPinName} with state ${heroboardR2PinState}`);
        }
      }
      // If r2 is connected to an LED
      else if (otherComponentId && otherComponentId.includes('led')) {
        r2ConnectedLEDs.push(otherComponentId);
        console.log(`Resistor ${id} r2 connected to LED ${otherComponentId}`);
      }
    });
    
    // Update resistor's own state for LED trace algorithm
    if (window.simulatorContext && window.simulatorContext.updateComponentState) {
      window.simulatorContext.updateComponentState(id, {
        r1PinValue: r1PinStateFound ? heroboardR1PinState : false,
        r2PinValue: r2PinStateFound ? heroboardR2PinState : false
      });
    }
    
    // Propagate pin state through the resistor to connected LEDs
    // If r1 is connected to heroboard, propagate its state to LEDs connected to r2
    if (r1ConnectedToHeroboard && r1PinStateFound && r2ConnectedLEDs.length > 0) {
      r2ConnectedLEDs.forEach(ledId => {
        console.log(`Resistor ${id} propagating state ${heroboardR1PinState} from r1 (pin ${heroboardR1Pin}) to LED ${ledId} through r2`);
        
        if (window.simulatorContext && window.simulatorContext.updateComponentState) {
          window.simulatorContext.updateComponentState(ledId, { 
            connectedPinState: heroboardR1PinState,
            isConnectedToHeroboard: true,
            connectedThroughResistor: true,
            connectedHeroboardPin: heroboardR1Pin,
            connectedHeroboardId: heroboardR1Id
          });
        }
      });
    }
    
    // If r2 is connected to heroboard, propagate its state to LEDs connected to r1
    if (r2ConnectedToHeroboard && r2PinStateFound && r1ConnectedLEDs.length > 0) {
      r1ConnectedLEDs.forEach(ledId => {
        console.log(`Resistor ${id} propagating state ${heroboardR2PinState} from r2 (pin ${heroboardR2Pin}) to LED ${ledId} through r1`);
        
        if (window.simulatorContext && window.simulatorContext.updateComponentState) {
          window.simulatorContext.updateComponentState(ledId, { 
            connectedPinState: heroboardR2PinState,
            isConnectedToHeroboard: true,
            connectedThroughResistor: true,
            connectedHeroboardPin: heroboardR2Pin,
            connectedHeroboardId: heroboardR2Id
          });
        }
      });
    }
    
  }, [id, isSimulationRunning, componentStates]);

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

  // Show menu when selected
  useEffect(() => {
    setIsComponentMenuShowing(isSelected);
  }, [isSelected]);

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

  // Update resistance value when input or units change
  useEffect(() => {
    calculateResistorValue(inputResistorValue, resistorValueUnit);
  }, [inputResistorValue, resistorValueUnit]);

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

  // Calculate and set resistor value based on value and unit
  const calculateResistorValue = (newValue, unitType) => {
    switch (unitType) {
      case RESISTOR_UNITS.OHM:
        setResistorValue(newValue);
        break;
      case RESISTOR_UNITS.KILOHM:
        setResistorValue(newValue / 1000);
        break;
      case RESISTOR_UNITS.MEGAOHM:
        setResistorValue(newValue / 1000000);
        break;
    }
  };

  // Rotate the handle by 90 degrees
  const handleRotate = () => {
    setRotationAngle((rotationAngle + 90) % 360);
  };

  // Handle pin click
  const handlePinClicked = (e) => {
    if (onPinConnect) {
      const pinId = e.detail.pinId;
      const pinType = e.detail.pinType;
      onPinConnect(pinId, pinType, id);
    }
  };

  // Sets the resistor value unit
  const onResistorUnitsChange = (newVal) => {
    setResistorValueUnit(newVal);
  };

  // Create context menu portal target if it doesn't exist
  useEffect(() => {
    if (!document.querySelector('#component-context-menu')) {
      const menuDiv = document.createElement('div');
      menuDiv.id = 'component-context-menu';
      menuDiv.style.position = 'absolute';
      menuDiv.style.zIndex = '9999';
      document.body.appendChild(menuDiv);
    }
  }, []);

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
      
      <ReactResistorComponent
        id={id}
        className="min-w-min cursor-pointer absolute"
        ref={targetRef}
        isActive={isSelected}
        isDragged={isDragged}
        onPinClicked={handlePinClicked}
        onPininfoChange={(e) => onPinInfoChange(e)}
        rotationTransform={rotationAngle}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(id);
        }}
        style={{
          transform: `translate(${initPosLeft}px, ${initPosTop}px)`,
          zIndex: isDragged ? 99999 : 10
        }}
        value={resistorValue}
      ></ReactResistorComponent>

      {/* Visual indicator for pin states in simulation mode */}
      {isSimulationRunning && (
        <>
          <div 
            className={`absolute rounded-full w-2 h-2 ${r1PinValue ? 'bg-green-500' : 'bg-gray-500'}`}
            style={{
              transform: `translate(${initPosLeft + 10}px, ${initPosTop + 25}px)`,
              transition: 'background-color 0.2s',
              zIndex: 100
            }}
          ></div>
          <div 
            className={`absolute rounded-full w-2 h-2 ${r2PinValue ? 'bg-green-500' : 'bg-gray-500'}`}
            style={{
              transform: `translate(${initPosLeft + 40}px, ${initPosTop + 25}px)`,
              transition: 'background-color 0.2s',
              zIndex: 100
            }}
          ></div>
        </>
      )}
    </>
  );
};

export default Resistor;